import React from 'react'
import { useWalletKit, useSolana, useConnectedWallet } from '@gokiprotocol/walletkit'
import { Button, Col, Layout, Row, Space, Typography } from 'antd'
import CreateCandidate from 'view/createCandidate'
import ListCandidates from 'view/listCandidates'

function App() {
  const walet = useConnectedWallet()
  const { connect } = useWalletKit()
  const { disconnect } = useSolana()

  return (
    <Layout style={{ height: '100vh' }}>
      <Layout.Header>
        {walet ? (
          <Space>
            <Button type='dashed' onClick={disconnect}>
              Disconnect
            </Button>
            <Typography.Text style={{ color: 'white' }}>{walet.publicKey.toBase58()}</Typography.Text>
          </Space>
        ) : (
          <Col span={24}>
            <Button type='primary' onClick={connect}>
              Connect Wallet
            </Button>
          </Col>
        )}
      </Layout.Header>

      <Layout.Content style={{ padding: 40 }}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Row gutter={[24, 24]}>
              <Col flex='auto'>
                <Typography.Text>List of candidates</Typography.Text>
              </Col>

              <Col>
                <CreateCandidate />
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <ListCandidates />
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  )
}

export default App
