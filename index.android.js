import React, { Component } from 'react';
import {
  AppRegistry,
  WebView,
  Platform
} from 'react-native';
import StaticServer from 'react-native-static-server'
import RNFS from 'react-native-fs';

let server

export default class ChronoMintRNWebView extends Component {
  state = {
    url: ''
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
        console.log(await RNFS.readdir(serverPath))
      
      server = new StaticServer(0, serverPath, { localOnly: true });

      server.start().then(url => {
        console.log(serverPath, url)
        this.setState({ url })
      })
    })()
  }
  render() {
    return this.state.url ?
      <WebView
        source={{ uri: this.state.url }}
        javaScriptEnabled={true}
        startInLoadingState={true}
        bounces={false}
        style={[
          Platform.OS === 'ios' && { marginTop: 18 }
        ]}
      /> :
      null
  }
}

AppRegistry.registerComponent('ChronoMintRNWebView', () => ChronoMintRNWebView);