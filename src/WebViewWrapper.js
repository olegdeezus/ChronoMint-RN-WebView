import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  WebView,
  Platform,
  Linking
} from 'react-native'
import StaticServer from 'react-native-static-server'
import RNFS from 'react-native-fs'
import { connect } from 'react-redux'
import { addWallet, getWallet } from './redux/wallets/actions'
import { hasWallet } from './redux/wallets/selectors'
import { setPinCode } from './redux/pincode/actions'

let server

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
export default class WebViewWrapper extends Component {
  static propTypes = {
    addWallet: PropTypes.func,
    getWallet: PropTypes.func
  }

  state = {
    uri: '',
    injectedVariables: {
      isMobile: true
    }
  }

  componentDidMount () {
    (async () => {
      let serverPath
      if (Platform.OS === 'android') {
        serverPath = RNFS.DocumentDirectoryPath + '/www'

        if (await RNFS.exists(serverPath)) {
          await RNFS.unlink(serverPath)
        }

        await RNFS.mkdir(serverPath)

        const files = await RNFS.readDirAssets('www')

        await Promise.all(files.map(({ path, name }) => {
          RNFS.copyFileAssets(path, `${serverPath}/${name}`)
        }))
      } else {
        serverPath = RNFS.MainBundlePath + '/www'
      }
      
      server = new StaticServer(0, serverPath, { localOnly: true })

      server.start().then(uri => {
        this.setState({ uri })
      })
    })()
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
    const { injectedVariables, uri } = this.state

    const injectedJS = `Object.assign(window, ${JSON.stringify(injectedVariables)});`

    return uri ?
      <WebView
        source={{ uri }}
        injectedJavaScript={injectedJS}
        bounces={false}
        ref={ref => this.webview = ref}
        style={[
          Platform.OS === 'ios' && { marginTop: 18 }
        ]}
        onMessage={this.handleMessage}
        onNavigationStateChange={(event) => {
          if (!event.url.startsWith('http')) {
            this.webview.stopLoading()
            Linking.openURL(event.url)
          }
        }}
      /> :
      null
  }
}
