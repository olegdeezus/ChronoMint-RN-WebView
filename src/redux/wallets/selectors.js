const isThatWallet = (selectedProvider, selectedNetwork) =>
  ({ provider, network }) =>
    provider === selectedProvider && network === selectedNetwork

export const hasWallet = (state, provider, network) =>
  state.wallets.some(isThatWallet(provider, network))

export const getEncryptedWallets = (state, provider, network) =>
  state.wallets.filter(isThatWallet(provider, network))


