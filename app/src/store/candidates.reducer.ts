import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Candidate } from 'config'

export type CandidatesState = Record<string, Candidate>

const initialState: CandidatesState = {}

export const candidateSlice = createSlice({
  name: 'camdidate',
  initialState,
  reducers: {
    setCandidate: (state: CandidatesState, action: PayloadAction<Candidate>) => {
      state[action.payload.address] = action.payload
      return state
    },
  },
})

export const { setCandidate } = candidateSlice.actions

export default candidateSlice.reducer
