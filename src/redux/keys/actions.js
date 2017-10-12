export const KEYS_ADD_NEW = 'keys/ADD'
import { AES, SHA256, enc } from 'crypto-js'
import { getEncryptedKeys } from './selectors'
import { verifyPinCode } from '../pincode/actions'

const salt = 'hahaha'

export const addKey = ({ key, provider, network }) => async (dispatch, getState) => {
  const { pinCodeHash } = getState().pincode

  const payload = {
    provider,
    network,
    key: AES.encrypt(key, pinCodeHash).toString(),
  }
  
  dispatch({ type: KEYS_ADD_NEW, payload })

  return {}
}

export const getKey = ({ provider, network, pinCode, isFingerprintCorrect }) =>
  async (dispatch, getState) => {
    const { key } = getEncryptedKeys(getState(), provider, network)[0]

    if (!key) {
      return { error: 'No stored keys available'}
    }

    if (!isFingerprintCorrect) { 
      const isPinCodeCorrect = await dispatch(verifyPinCode(pinCode)) 
      
      if (!isPinCodeCorrect) {
        return { error: 'Incorrect pin-code' }
      }

    }
    
    const { pinCodeHash } = getState().pincode

    return {
      key: AES.decrypt(key, pinCodeHash).toString(enc.Utf8),
    }
  }
