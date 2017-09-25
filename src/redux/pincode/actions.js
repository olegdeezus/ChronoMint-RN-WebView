import { SHA256 } from 'crypto-js'
export const PINCODE_SET = 'pincode/SET'
export const PINCODE_VERIFY = 'pincode/VERIFY'

const salt = 'hahaha'

export const setPinCode = ({ pinCode }) => ({
  type: PINCODE_SET,
  payload: SHA256(`${pinCode}${salt}`).toString()
})

export const verifyPinCode = (pinCode) => async (dispatch, getState) => {
  let { pinCodeHash: original } = getState().pincode

  const sample = SHA256(`${pinCode}${salt}`).toString()

  const isWrongPinCode = sample !== original

  dispatch({ type: PINCODE_VERIFY, payload: isWrongPinCode })

  return !isWrongPinCode
}
