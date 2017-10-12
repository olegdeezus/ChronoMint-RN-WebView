import React, { Component } from 'react'
import { store } from './redux/configureStore'
import { Provider } from 'react-redux'
import WebViewWrapper from './WebViewWrapper'

export default class ChronoMintRNWebView extends Component {
  render () {
    return (
      <Provider store={store}>
        <WebViewWrapper />
      </Provider>
    )
  }
}
