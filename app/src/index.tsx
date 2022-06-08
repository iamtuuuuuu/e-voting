import React from 'react'
import ReactDOM from 'react-dom/client'

import { Provider } from 'react-redux'
import { WalletKitProvider } from '@gokiprotocol/walletkit'

import reportWebVitals from './reportWebVitals'

import App from './view/app'
import { store } from './store'

import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <WalletKitProvider defaultNetwork='devnet' app={{ name: 'My App' }}>
        <App />
      </WalletKitProvider>
    </Provider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
