import React from 'react'
import { useWalletKit, useSolana, useConnectedWallet } from '@gokiprotocol/walletkit'
import { Button, Col, Layout, Space, Typography } from 'antd'

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

      <Layout.Content></Layout.Content>
    </Layout>
  )
}

export default App
