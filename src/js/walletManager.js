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

import $ from 'jquery'
import CryptoJS from 'crypto-js'
import { isTrytes } from '@iota/validators'
import { setClientSeed } from './iotaClient'

const LS_WALLETS_KEY = 'wallets'
const $walletDropdown = $('.navbar .navbar-wallet-dropdown')

let currentWallet = null


/**
 * Is valid seed
 * @param  {string}  seed Seed
 * @return {boolean}      Is valid
 */
export function isValidSeed(seed) {
  return isTrytes(seed, 81)
}


/**
 * Sort wallets array
 * @param {object[]} wallets Wallets array
 */
function sortWallets(wallets) {
  wallets.sort((a, b) => {
    return (a.name == b.name) ? 0 : +(a.name > b.name) || -1
  })
}


/**
 * Encrypt
 * @param  {string} payload Text to encrypt
 * @param  {string} pass    Passphrase
 * @return {string}         Encrypted Base64 string
 */
function encrypt(payload, pass) {
  return CryptoJS.AES.encrypt(payload, pass).toString()
}


/**
 * Decrypt
 * @param  {string} encrypted Text to decrypt
 * @param  {string} pass      Passphrase
 * @return {string}           Decrypted text
 */
export function decrypt(encrypted, pass) {
  try {
    let res = CryptoJS.AES.decrypt(encrypted, pass).toString(CryptoJS.enc.Utf8)
    return isValidSeed(res) ? res : null
  } catch (e) {
    return null
  }
}


/**
 * Save list of wallets
 * @param {object[]} wallets Wallets list, as output by `getWallets()`
 */
function saveWallets(wallets) {
  // Prepare data to be saved to browser storage
  let dataToSave = [[], []]
  for (let wallet of wallets) {
    let index = wallet.isSessionOnly ? 1 : 0
    dataToSave[index].push({
      name: wallet.name,
      seed: wallet.seed
    })
  }

  // Persist data
  let storages = [localStorage, sessionStorage]
  for (let i=0; i<storages.length; i++) {
    storages[i].setItem(LS_WALLETS_KEY, JSON.stringify(dataToSave[i]))
  }
}


/**
 * Get wallet index
 * @param  {string|object} target Wallet object or name
 * @return {number|null}          Wallet index
 */
function getWalletIndex(target) {
  if (target === null) return null
  if (typeof target == 'object') target = target.name

  let wallets = getWallets()
  for (let i=0; i<wallets.length; i++) {
    if (wallets[i].name === target) return i
  }
  return null
}


/**
 * Notify UI of changes in wallet data
 */
function notifyUi() {
  $walletDropdown.trigger('refreshUi')
}


/**
 * Get list of wallets
 * @return {object[]} Encrypted seeds
 */
export function getWallets() {
  let res = []

  // Fetch data from browser storage
  let storages = [localStorage, sessionStorage]
  for (let i=0; i<storages.length; i++) {
    let data = storages[i].getItem(LS_WALLETS_KEY)
    data = (data === null) ? [] : JSON.parse(data)
    for (let wallet of data) {
      res.push({
        name: wallet.name,
        seed: wallet.seed,
        isSessionOnly: (i == 1)
      })
    }
  }

  // Sort by name and return
  sortWallets(res)
  return res
}


/**
 * Add wallet
 * @param {string}  name          Wallet name
 * @param {string}  seed          Wallet seed
 * @param {string}  pass          Passphrase
 * @param {boolean} isSessionOnly Is session only
 */
export function addWallet(name, seed, pass, isSessionOnly) {
  const currentWalletData = getCurrentWallet()

  // Append wallet to existing ones
  let wallets = getWallets()
  wallets.push({
    name: name,
    seed: encrypt(seed, pass),
    isSessionOnly: isSessionOnly
  })
  saveWallets(wallets)

  // Update current wallet index in case it has changed
  currentWallet = getWalletIndex(currentWalletData)
  notifyUi()
}


/**
 * Delete wallet
 * @param {number} index Wallet index
 */
export function deleteWallet(index) {
  const currentWalletData = getCurrentWallet()

  // Delete target from array of wallets
  let wallets = getWallets()
  wallets.splice(index, 1)
  saveWallets(wallets)

  // Update current wallet index in case it has changed
  currentWallet = getWalletIndex(currentWalletData)
  if (currentWalletData.index === index) setClientSeed(null)
  notifyUi()
}


/**
 * Update wallet
 * @param {number} index   Wallet index
 * @param {string} newName New wallet name
 */
export function updateWallet(index, newName) {
  const currentWalletData = getCurrentWallet()

  // Update name for target wallet
  let wallets = getWallets()
  wallets[index].name = newName
  saveWallets(wallets)

  // Update current wallet index in case it has changed
  if (index === currentWallet) currentWalletData.name = newName
  currentWallet = getWalletIndex(currentWalletData)
  notifyUi()
}


/**
 * Check wallet with name already exists
 * @param  {string} name Wallet name
 * @return {boolean}     Exists
 */
export function walletExists(name) {
  return (getWalletIndex(name) !== null)
}


/**
 * Delete all wallets from browser storage
 */
export function clearWallets() {
  localStorage.removeItem(LS_WALLETS_KEY)
  sessionStorage.removeItem(LS_WALLETS_KEY)
}


/**
 * Change current wallet
 * @param  {number|null} index Wallet index
 * @param  {string}      pass  Wallet passphrase
 * @return {boolean}           Success
 */
export function changeWallet(index, pass) {
  let seed = null
  if (index !== null) {
    const wallets = getWallets()
    seed = decrypt(wallets[index].seed, pass)
    if (seed === null) return false
  }

  currentWallet = index
  setClientSeed(seed)
  return true
}


/**
 * Unload current wallet
 */
export function unloadWallet() {
  changeWallet(null)
  notifyUi()
}


/**
 * Get current wallet
 * @return {object|null} Wallet information
 */
export function getCurrentWallet() {
  if (currentWallet === null) return null

  let wallet = getWallets()[currentWallet]
  wallet.index = currentWallet
  return wallet
}
