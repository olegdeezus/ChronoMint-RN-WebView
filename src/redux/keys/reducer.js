import * as actions from './actions.js'
const initialState = []

export const keys = (state = initialState, { type, payload }) => {
  switch (type) {
    case actions.KEYS_ADD_NEW:
      return [
        // ...state, // Enable when multiple wallets management will be implemented 
        payload
      ]
    default:
      return state
  }
}
