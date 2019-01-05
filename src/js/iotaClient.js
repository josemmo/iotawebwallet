/*
 * IOTA Web Wallet - An easy-to-use yet powerful web wallet for IOTA.
 * Copyright (C) 2018-present José M. Moreno <josemmo@pm.me>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import '@babel/polyfill'
import { composeAPI } from '@iota/core'
import { getProperty } from './settingsManager'
import { unloadWallet } from './walletManager'

export const TX_STATUS = {
  CONFIRMED: Symbol('Confirmed'),
  PENDING: Symbol('Pending'),
  REATTACHED: Symbol('Reattached')
}
export const TX_TYPE = {
  SENT: Symbol('Sent'),
  RECEIVED: Symbol('Received')
}

let iota = null
let seed = null
let busy = false
let busyListeners = []
let accountDataListeners = []


/**
 * Create IOTA client
 */
export function createClient() {
  iota = composeAPI({
    provider: getProperty('mainNode')
  })
}


/**
 * Attach busy listener
 * @param {function} listener Listener
 */
export function attachBusyListener(listener) {
  busyListeners.push(listener)
}


/**
 * Attach account data listener
 * @param {function} listener Listener
 */
export function attachAccountDataListener(listener) {
  accountDataListeners.push(listener)
}


/**
 * Set busy status
 * @param {boolean} isBusy Is client busy
 */
function setBusy(isBusy) {
  busy = isBusy
  for (let listener of busyListeners) listener(isBusy)
}


/**
 * Is client busy
 * @return {boolean} Is busy
 */
export function isBusy() {
  return busy
}


/**
 * Load wallet data
 */
export function loadWalletData() {
  if (seed === null) return

  setBusy(true)
  iota.getAccountData(seed, {security: 2})
  .then(data => parseAccountData(data))
  .then(accountData => {
    for (let listener of accountDataListeners) listener(accountData)
  }).catch(err => {
    console.error('IOTA client error', err)
    unloadWallet()
  }).finally(function() {
    setBusy(false)
  })
}


/**
 * Parse account data
 * @param  {AccountData} data Account data
 * @return {Promise}          Callback
 */
async function parseAccountData(data) {
  const transactions = await iota.getTransactionObjects(data.transactions)
  const states = await iota.getLatestInclusion(data.transactions)

  // Get confirmed bundles
  let confirmedBundles = []
  for (let i=0; i<transactions.length; i++) {
    const bundle = transactions[i].bundle
    if (states[i] && !confirmedBundles.includes(bundle)) {
      confirmedBundles.push(bundle)
    }
  }

  // Categorize transactions
  for (let i=0; i<transactions.length; i++) {
    const tx = transactions[i]
    tx.type = (tx.value < 0) ? TX_TYPE.SENT : TX_TYPE.RECEIVED
    tx.persistent = states[i]
    if (tx.persistent) {
      tx.status = TX_STATUS.CONFIRMED
    } else if (confirmedBundles.includes(tx.bundle)) {
      tx.status = TX_STATUS.REATTACHED
    } else {
      tx.status = TX_STATUS.PENDING
    }
  }

  data.transactions = transactions
  return data
}


/**
 * Set client seed
 * @param {string|null} s IOTA seed
 */
export function setClientSeed(s) {
  seed = s
  loadWalletData()
}


/* INITIALIZE */
if (iota === null) createClient()
