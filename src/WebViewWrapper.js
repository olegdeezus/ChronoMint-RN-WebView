import React from 'react'
import PropTypes from 'prop-types'
import {
  WebView,
  View,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  Platform
} from 'react-native'
import { connect } from 'react-redux'
import { addKey, getKey } from './redux/keys/actions'
import { hasKey } from './redux/keys/selectors'
import { setPinCode } from './redux/pincode/actions'
import FingerprintScanner from 'react-native-fingerprint-scanner'

const { width, height } = Dimensions.get('window')

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
    isSplashVisible: true
  }

  handleMessage = async (event) => {
    const { addKey, setPinCode, getKey, hasKey } = this.props

    try {
      const { message, ...payload } = JSON.parse(event.nativeEvent.data)

      const init = async () => {
        this.setState({ isSplashVisible: false })
      }

      const scanFingerprint = async ({ description, provider, network }) => {
        await FingerprintScanner.authenticate({ description, fallbackEnabled: false })
        return await this.props.getKey({ provider, network, isFingerprintCorrect: true })
      }


      const action = {
        addKey,
        setPinCode,
        getKey,
        hasKey,
        scanFingerprint,
        init
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

  renderSplash = () => <ImageBackground
    source={require('./assets/chronomint.2208x2208.png')}
    resizeMode='cover'
    style={{
      position: 'absolute',
      width,
      height,
      justifyContent: 'center',
      alignItems: 'center'
    }}
  >
    <ActivityIndicator
      color='white'
      size='large'
      style={{
        top: 150
      }}
    />
  </ImageBackground>

  render () {
    const { isSplashVisible } = this.state

    const injectedJS = `setTimeout(function(){window.postMessage(JSON.stringify({ message: 'init' }));}, 50);`

    return <View
      style={{flex: 1}}
    >
      <WebView
        source={{ uri: Platform.OS === 'android' ?
          'file:///android_asset/build/index.html' :
          'web/index.html'
        }}
        scalesPageToFit={false}
        injectedJavaScript={injectedJS}
        bounces={false}
        ref={ref => this.webview = ref}
        style={[
          { flex: 1 },
          Platform.OS === 'ios' && { marginTop: 18 }
        ]}
        onMessage={this.handleMessage}
      />
      { isSplashVisible && this.renderSplash() }
    </View>
  }
}
