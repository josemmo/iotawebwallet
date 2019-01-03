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

import { composeAPI } from '@iota/core'
import { getProperty } from './settingsManager'

let iota = null
let seed = null
let busy = false
let busyListeners = []


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
  setBusy(true)
  iota.getAccountData(seed, {security: 2}).then(function(accountData) {
    console.log('IOTA account data', accountData)
  }).catch(function(err) {
    console.error('IOTA client error', err) // TODO: implement fallback
  }).finally(function() {
    setBusy(false)
  })
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
