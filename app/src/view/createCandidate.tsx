import React, { Fragment, useState } from 'react'
import moment from 'moment'
import { useConnectedWallet } from '@gokiprotocol/walletkit'
import { useDispatch } from 'react-redux'
import { getProgram } from 'config'
import { utils, web3, BN, Provider } from '@project-serum/anchor'
import { setCandidate } from 'store/candidates.reducer'
import { Button, Col, DatePicker, Input, Modal, notification, Row, Space, Typography } from 'antd'
import { UserAddOutlined } from '@ant-design/icons'

function CreateCandidate() {
  const [visible, setVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [startDate, setStartDate] = useState<moment.Moment>()
  const [endDate, setEndDate] = useState<moment.Moment>()
  const [mintAddress, setMintAddress] = useState<string>('')
  const dispatch = useDispatch()
  const wallet = useConnectedWallet()

  const onCreatedCandidate = async () => {
    if (!wallet || !startDate || !endDate) return

    const program = getProgram(wallet)
    const startTime = startDate.valueOf() / 1000
    const endTime = endDate.valueOf() / 1000

    const candidate = new web3.Keypair()
    console.log('🚀 ~ file: createCandidate.tsx ~ line 28 ~ onCreatedCandidate ~ candidate', candidate)
    let treasurer: web3.PublicKey

    const [treasurerPublickey] = await web3.PublicKey.findProgramAddress(
      [Buffer.from('treasurer'), candidate.publicKey.toBuffer()],
      program.programId
    )
    treasurer = treasurerPublickey
    console.log('🚀 ~ file: createCandidate.tsx ~ line 36 ~ onCreatedCandidate ~ treasurer', treasurer.toBase58())

    let candidateTokenAccount = await utils.token.associatedAddress({
      mint: new web3.PublicKey(mintAddress),
      owner: treasurerPublickey,
    })
    console.log(
      '🚀 ~ file: createCandidate.tsx ~ line 42 ~ onCreatedCandidate ~ candidateTokenAccount',
      candidateTokenAccount.toBase58()
    )

    try {
      setLoading(true)
      const tx = await program.rpc.initializeCandidate(new BN(startTime), new BN(endTime), {
        accounts: {
          authority: wallet.publicKey,
          candidate: candidate.publicKey,
          treasurer: treasurerPublickey,
          mint: new web3.PublicKey(mintAddress),
          candidateTokenAccount,
          tokenProgram: utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [candidate],
      })

      console.log('🚀 ~ file: createCandidate.tsx ~ line 57 ~ accounts ~ accounts', {
        authority: wallet.publicKey.toBase58(),
        candidate: candidate.publicKey.toBase58(),
        treasurer: treasurerPublickey.toBase58(),
        mint: new web3.PublicKey(mintAddress).toBase58(),
        candidateTokenAccount: candidateTokenAccount.toBase58(),
        tokenProgram: utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      console.log('🚀 ~ file: createCandidate.tsx ~ line 57 ~ tx ~ tx', tx)

      dispatch(
        setCandidate({
          address: candidate.publicKey.toBase58(),
          amount: 0,
          mint: mintAddress,
          startTime,
          endTime,
        })
      )
      setVisible(false)
      return notification.success({ message: 'created a candidate' })
    } catch (error: any) {
      return notification.error({ message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Fragment>
      <Button icon={<UserAddOutlined />} onClick={() => setVisible(true)} block loading={loading}>
        New Candidate
      </Button>

      <Modal
        title={<Typography.Title level={4}>New Candidate</Typography.Title>}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        destroyOnClose={true}
        centered={true}
      >
        <Row gutter={[12, 12]}>
          <Col span={24}>
            <Typography.Text type='secondary'>Voting Token: </Typography.Text>
          </Col>
          <Col span={24}>
            <Input
              onChange={(e) => {
                setMintAddress(e.target.value || '')
              }}
            />
          </Col>

          <Col span={24}>
            <Typography.Text type='secondary'>Voting Duration: </Typography.Text>
          </Col>
          <Col span={24}>
            <Space>
              <DatePicker
                placeholder='Start date'
                value={startDate}
                showTime
                allowClear={false}
                onChange={(date) => setStartDate(moment(date))}
              />
              <DatePicker
                placeholder='End date'
                value={endDate}
                showTime
                allowClear={false}
                onChange={(date) => setEndDate(moment(date))}
              />
            </Space>
          </Col>

          <Col span={24}>
            <Button type='primary' onClick={onCreatedCandidate} block>
              Create Candidate
            </Button>
          </Col>
        </Row>
      </Modal>
    </Fragment>
  )
}

export default CreateCandidate
