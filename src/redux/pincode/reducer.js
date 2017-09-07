import * as actions from './actions'

const initialState = {
  pinCodeHash: '',
  attemptsCount: 0
}

export const pincode = (state = initialState, { type, payload }) => {
  switch (type) {
    case actions.PINCODE_SET:
      return {
        ...state,
        pinCodeHash: payload,
        attemptsCount: 0
      }
    case actions.PINCODE_VERIFY:
      return {
        ...state,
        attemptsCount: payload ? ++state.attemptsCount : 0,
        // pinCodeHash: (payload && state.attemptsNumber >= 2) ? '' : state.pinCodeHash
      }
    default:
      return state
  }
}
