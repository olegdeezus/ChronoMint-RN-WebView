import React, { Component } from 'react';
import {
  AppRegistry,
  WebView,
  Platform,
  Linking
} from 'react-native';
import StaticServer from 'react-native-static-server'
import RNFS from 'react-native-fs';

let server

export default class ChronoMintRNWebView extends Component {
  state = {
    uri: '',
    injectedVariables: {
      isMobile: true,
      storedWallets: [
        [ "9eb1d9b4-ac6b-4343-b77c-f89ed613a789", {
          "password": "U2FsdGVkX1+dxEjh3lbFN4LfUvyFZs8uvIiZNTJB8VQjUGbSJHq2XMdPrghLPwEc",
          "wallet": {
            "address": "ab55e1abed7933ef9526689b5c8aba2272e0a267",
            "crypto": {
              "cipher": "aes-128-ctr",
              "ciphertext": "18e69cbca9ca29f52fd932e31041a2bf9c84f49621d570d57b27caa4a7a9c887",
              "cipherparams": {
                "iv": "7d4eb71653c47bf0016202c5b33ac398"
              },
              "mac": "79e4ecf0022ae72d56df7893015199761ed858ffdb45db8ae66c50cefe54ea17",
              "kdf": "pbkdf2",
              "kdfparams": {
                "c": 262144,
                "dklen": 32,
                "prf": "hmac-sha256",
                "salt": "9bf7f2dea06ad77dc0c72289a280ca91af6d3e2ce59ed9011efa9a2fa9847092"
              }
            },
            "id": "3111ec87-f180-49b1-a07a-638e1c98170d",
            "version": 3
          }
        }]
      ]
    }
  }

  componentDidMount()
  {
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
      
      server = new StaticServer(0, serverPath, { localOnly: true });

      server.start().then(uri => {
        this.setState({ uri })
      })
    })()
  }

  render() {
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
        onNavigationStateChange={(event) => {
          if (!event.url.startsWith(uri)) {
            this.webview.stopLoading();
            Linking.openURL(event.url);
          }
        }}
      /> :
      null
  }
}

AppRegistry.registerComponent('ChronoMintRNWebView', () => ChronoMintRNWebView);