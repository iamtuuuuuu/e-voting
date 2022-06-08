import { configureStore } from '@reduxjs/toolkit'

import walletReducer from './wallet.reducer'
import candidatesReducer from './candidates.reducer'

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  reducer: {
    wallet: walletReducer,
    candidates: candidatesReducer,
  },
})

export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
