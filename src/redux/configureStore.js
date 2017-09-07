import {compose, applyMiddleware, createStore, combineReducers } from 'redux'
import {persistStore, autoRehydrate} from 'redux-persist'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'remote-redux-devtools'
import createSensitiveStorage from 'redux-persist-sensitive-storage'
import * as ducks from './ducks'

const rootReducer = combineReducers(ducks)

// add `autoRehydrate` as an enhancer to your store (note: `autoRehydrate` is not a middleware)
export const store = createStore(
  rootReducer,
  undefined,
  composeWithDevTools(
    applyMiddleware(thunk),
    autoRehydrate()
  )
)

// begin periodically persisting the store
persistStore(store,
  {storage: createSensitiveStorage({
    keychainService: "ChronoMintRNWebView",
    sharedPreferencesName: "ChronoMintRNWebView"
  })}
)
