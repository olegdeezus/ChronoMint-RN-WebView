import React from 'react'
import PropTypes from 'prop-types'
import {
  WebView,
  Platform
} from 'react-native'
import { connect } from 'react-redux'
import { addKey, getKey } from './redux/keys/actions'
import { hasKey } from './redux/keys/selectors'
import { setPinCode } from './redux/pincode/actions'

const mapStateToProps = (state) => ({
  hasKey: async ({ provider, network }) => ({
    hasKey: hasKey(state, provider, network)
  })
})

const mapDispatchToProps = {
  addKey,
  setPinCode,
  getKey,
}

@connect(mapStateToProps, mapDispatchToProps)
export default class WebViewWrapper extends React.Component {
  static propTypes = {
    addKey: PropTypes.func,
    getKey: PropTypes.func,
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

      const action = this.props[message]

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
      source={Platform.OS === 'android' ?
        { uri: 'file:///android_asset/build/index.html' } :
        require('../ChronoMint/build/index.html')
      }
      injectedJavaScript={injectedJS}
      bounces={false}
      ref={ref => this.webview = ref}
      style={[
        Platform.OS === 'ios' && { marginTop: 18 }
      ]}
      onMessage={this.handleMessage}
    />
  }
}
