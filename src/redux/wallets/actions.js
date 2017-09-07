export const WALLETS_ADD_NEW = 'wallets/ADD'
export const WALLETS_DELETE_PASSWORDS = 'wallets/DELETE_PASSWORDS'
import { AES, SHA256, enc } from 'crypto-js'
import { getEncryptedWallets } from './selectors'
import { verifyPinCode } from '../pincode/actions'

const salt = 'hahaha'

export const addWallet = ({ wallet, password, provider, network }) => async (dispatch, getState) => {
  const { pinCodeHash } = getState().pincode

  const payload = {
    address: wallet.address,
    provider,
    network,
    wallet: AES.encrypt(JSON.stringify(wallet), pinCodeHash).toString(),
    password: AES.encrypt(password, pinCodeHash).toString()
  }
  
  dispatch({ type: WALLETS_ADD_NEW, payload })

  return {}
}

export const deletePasswords = () => ({ type: WALLETS_DELETE_PASSWORDS })

export const getWallet = ({ provider, network, pinCode }) =>
  async (dispatch, getState) => {
    const encryptedWallet = getEncryptedWallets(getState(), provider, network)[0]

    if (!encryptedWallet) {
      return { error: 'No stored wallets available'}
    }

    const { address, password, wallet } = encryptedWallet

    const isPinCodeCorrect = await dispatch(verifyPinCode(pinCode)) 

    if (!isPinCodeCorrect) {
      return { error: 'Incorrect pin-code' }
    }

    if (!address) {
      return { error: 'Stored wallet is broken'}
    }

    const pinCodeHash = SHA256(`${pinCode}${salt}`).toString()

    const decrypt = item => AES.decrypt(item, pinCodeHash).toString(enc.Utf8)

    return {
      address,
      wallet: decrypt(wallet),
      password: password && decrypt(password)
    }
  }
