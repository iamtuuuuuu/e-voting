import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type WalletState = {
  address: string
  balance: number
}

const initialState: WalletState = {
  address: '',
  balance: 0,
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletInfo: (state, action: PayloadAction<WalletState>) => {
      state.address = action.payload.address
      state.balance = action.payload.balance
    },
  },
})

export const { setWalletInfo } = walletSlice.actions
export default walletSlice.reducer
