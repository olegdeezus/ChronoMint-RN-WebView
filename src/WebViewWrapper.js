import React from 'react'
import PropTypes from 'prop-types'
import {
  WebView,
  Platform,
  Linking
} from 'react-native'
import { connect } from 'react-redux'
import { addWallet, getWallet } from './redux/wallets/actions'
import { hasWallet } from './redux/wallets/selectors'
import { setPinCode } from './redux/pincode/actions'

const mapStateToProps = (state) => ({
  hasWallet: async ({ provider, network }) => ({
    hasWallet: hasWallet(state, provider, network)
  })
})

const mapDispatchToProps = {
  addWallet,
  setPinCode,
  getWallet,
}

@connect(mapStateToProps, mapDispatchToProps)
export default class WebViewWrapper extends React.Component {
  static propTypes = {
    addWallet: PropTypes.func,
    getWallet: PropTypes.func,
    setPinCode: PropTypes.func
  }

  state = {
    injectedVariables: {
      isMobile: true
    }
  }

  handleMessage = async (event) => {
    try {
      const { message, ...payload } = JSON.parse(event.nativeEvent.data)

      const action = {
        'ADD_WALLET': this.props.addWallet,
        'GET_WALLET': this.props.getWallet,
        'HAS_WALLET': this.props.hasWallet,
        'SET_PINCODE': this.props.setPinCode
      }[message]

      const result = action && await action(payload)

      result && this.webview.postMessage(JSON.stringify({
        message,
        ...result
      }))
    }
    catch (e) {
      return
    }
  }

  render () {
    const { injectedVariables } = this.state

    const injectedJS = `Object.assign(window, ${JSON.stringify(injectedVariables)});`

    return <WebView
      source={require('../ChronoMint/build/index.html')}
      injectedJavaScript={injectedJS}
      bounces={false}
      ref={ref => this.webview = ref}
      style={[
        Platform.OS === 'ios' && { marginTop: 18 }
      ]}
      onMessage={this.handleMessage}
      onNavigationStateChange={({ url }) => {
        if (url.startsWith('react') || !url.startsWith('http://localhost')) {
          this.webview.stopLoading()
        }
        if (!url.startsWith('http://localhost') && !url.startsWith('react')) {
          Linking.openURL(url)
        }
      }}
    />
  }
}
