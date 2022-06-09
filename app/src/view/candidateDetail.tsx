import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { AppState } from 'store'
import { useConnectedWallet } from '@gokiprotocol/walletkit'
import { getProgram } from 'config'
import { utils, web3 } from '@project-serum/anchor'
import { Button, Card, Col, notification, Row, Space, Typography } from 'antd'
import moment from 'moment'
import VoteCandidate from './voteCandidate'

const DATE_FORMAT = 'DD/MM/YYYY hh:mm:ss'

function CandidateDetail({ candidateAddress }: { candidateAddress: string }) {
  const {
    candidates: { [candidateAddress]: candidateData },
  } = useSelector((state: AppState) => state)
  const walet = useConnectedWallet()

  const [loading, setLoading] = useState<boolean>(false)

  const onClose = async () => {
    if (!walet) return
    const program = getProgram(walet)
    const candidatePublicKey = new web3.PublicKey(candidateAddress)
    const mintPublicKey = new web3.PublicKey(candidateData.mint)

    const [treasurer] = await web3.PublicKey.findProgramAddress(
      [Buffer.from('treasurer'), candidatePublicKey.toBuffer()],
      program.programId
    )

    const [ballot] = await web3.PublicKey.findProgramAddress(
      [Buffer.from('ballot'), candidatePublicKey.toBuffer(), walet.publicKey.toBuffer()],
      program.programId
    )

    // derive token account
    let walletTokenAccount = await utils.token.associatedAddress({
      mint: mintPublicKey,
      owner: walet.publicKey,
    })

    let candidateTokenAccount = await utils.token.associatedAddress({
      mint: mintPublicKey,
      owner: treasurer,
    })

    try {
      setLoading(true)
      await program.rpc.close({
        accounts: {
          authority: walet.publicKey,
          candidate: candidatePublicKey,
          treasurer,
          mint: candidateData.mint,
          candidateAccountToken: candidateTokenAccount,
          ballot,
          voterTokenAccount: walletTokenAccount,
          tokenProgram: utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [],
      })
      return notification.success({ message: 'Closed the vote' })
    } catch (error: any) {
      return notification.error({ message: error.message })
    } finally {
      return setLoading(false)
    }
  }

  return (
    <Card>
      <Row gutter={[12, 12]}>
        <Col span={24}>
          <Space>
            <Typography.Text type='secondary'>Candidate Address:</Typography.Text>
            <Typography.Text type='secondary'>{candidateAddress.substring(0.6) + '...'}</Typography.Text>
          </Space>
        </Col>
        <Col span={24}>
          <Space>
            <Typography.Text type='secondary'>Vote amount:</Typography.Text>
            <Typography.Text>{candidateData.amount}</Typography.Text>
          </Space>
        </Col>
        <Col span={24}>
          <Space direction='vertical'>
            <Space>
              <Typography.Text type='secondary'>Start date:</Typography.Text>
              <Typography.Text>{moment(candidateData.startTime * 1000).format(DATE_FORMAT)}</Typography.Text>
            </Space>
            <Space>
              <Typography.Text type='secondary'>End date:</Typography.Text>
              <Typography.Text>{moment(candidateData.endTime * 1000).format(DATE_FORMAT)}</Typography.Text>
            </Space>
          </Space>
        </Col>
        <Col span={12}>
          <Button onClick={onClose} loading={loading} block>
            Close
          </Button>
        </Col>
        <Col span={12}>
          <VoteCandidate candidateAddress={candidateAddress} />{' '}
        </Col>
      </Row>
    </Card>
  )
}

export default CandidateDetail
