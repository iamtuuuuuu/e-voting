import React, { Fragment, useState } from 'react'
import { AppState } from 'store'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'

import { useConnectedWallet } from '@gokiprotocol/walletkit'
import { getProgram } from 'config'
import { BN, utils, web3 } from '@project-serum/anchor'
import { setCandidate } from 'store/candidates.reducer'
import { Button, Col, Input, Modal, notification, Row, Typography } from 'antd'

function VoteCandidate({ candidateAddress }: { candidateAddress: string }) {
  const {
    candidates: { [candidateAddress]: candidateData },
  } = useSelector((state: AppState) => state)
  const dispatch = useDispatch()

  const [visible, setVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [amount, setAmount] = useState<string>('')

  const wallet = useConnectedWallet()

  const onVote = async () => {
    if (!wallet) return
    const program = getProgram(wallet)
    console.log('candidate data:', candidateData)

    const candidatePublicKey = new web3.PublicKey(candidateAddress)
    console.log('🚀 ~ file: voteCandidate.tsx ~ line 28 ~ onVote ~ candidatePublicKey', candidatePublicKey.toBase58())
    const mintPublicKey = new web3.PublicKey(candidateData.mint)
    console.log('🚀 ~ file: voteCandidate.tsx ~ line 30 ~ onVote ~ mintPublicKey', mintPublicKey.toBase58())

    const [treasurer] = await web3.PublicKey.findProgramAddress(
      [Buffer.from('treasurer'), candidatePublicKey.toBuffer()],
      program.programId
    )
    console.log('🚀 ~ file: voteCandidate.tsx ~ line 36 ~ onVote ~ treasurer', treasurer.toBase58())

    const [ballot] = await web3.PublicKey.findProgramAddress(
      [Buffer.from('ballot'), candidatePublicKey.toBuffer(), wallet.publicKey.toBuffer()],
      program.programId
    )
    console.log('🚀 ~ file: voteCandidate.tsx ~ line 42 ~ onVote ~ ballot', ballot.toBase58())

    // derive token account
    let walletTokenAccount = await utils.token.associatedAddress({
      mint: mintPublicKey,
      owner: wallet.publicKey,
    })
    console.log('🚀 ~ file: voteCandidate.tsx ~ line 47 ~ onVote ~ walletTokenAccount', walletTokenAccount.toBase58())

    let candidateAccountToken = await utils.token.associatedAddress({
      mint: mintPublicKey,
      owner: treasurer,
    })
    console.log(
      '🚀 ~ file: voteCandidate.tsx ~ line 53 ~ onVote ~ candidateAccountToken',
      candidateAccountToken.toBase58()
    )

    try {
      setLoading(true)
      await program.rpc.vote(new BN(amount), {
        accounts: {
          authority: wallet.publicKey,
          candidate: candidatePublicKey,
          treasurer,
          mint: candidateData.mint,
          candidateTokenAccount: candidateAccountToken,
          ballot,
          voterTokenAccount: walletTokenAccount,
          tokenProgram: utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [],
      })
      setVisible(false)
      dispatch(
        setCandidate({
          ...candidateData,
          amount: candidateData.amount + Number(amount),
        })
      )
      return notification.success({ message: 'voted for the candidate' })
    } catch (error: any) {
      return notification.error({ message: error.message })
    } finally {
      return setLoading(false)
    }
  }

  return (
    <Fragment>
      <Button type='primary' onClick={() => setVisible(true)} block loading={loading}>
        Vote
      </Button>
      <Modal
        title={<Typography.Title level={4}>Vote Candidate</Typography.Title>}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        destroyOnClose={true}
        centered={true}
      >
        <Row gutter={[24, 12]}>
          <Col span={24}>
            <Typography.Text type='secondary'>Candidate: </Typography.Text>
          </Col>
          <Col span={24}>
            <Typography.Text>{candidateAddress}</Typography.Text>
          </Col>
          <Col span={24}>
            <Typography.Text type='secondary'>Amount: </Typography.Text>
            <Input style={{ width: '100%' }} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Col>
          <Col span={24}>
            <Button type='primary' onClick={() => onVote()} loading={loading} block>
              Vote Candidate
            </Button>
          </Col>
        </Row>
      </Modal>
    </Fragment>
  )
}

export default VoteCandidate
