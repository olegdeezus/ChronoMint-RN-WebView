import * as actions from './actions.js'
const initialState = []

export const wallets = (state = initialState, { type, payload }) => {
  switch (type) {
    case actions.WALLETS_ADD_NEW:
      return [
        // ...state, // Enable when multiple wallets management will be implemented 
        payload
      ]
    case actions.WALLETS_DELETE_PASSWORDS:
      return [
        ...state.map(({ password, ...storedWallet }) => storedWallet)
      ]
    default:
      return state
  }
}
