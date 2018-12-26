import $ from 'jquery'
import CryptoJS from 'crypto-js'
import { isTrytes } from '@iota/validators'

const LS_WALLETS_KEY = 'wallets'
const $walletDropdown = $('.navbar .navbar-wallet-dropdown')

let currentWallet = null


/**
 * Is valid seed
 * @param  {string}  seed Seed
 * @return {boolean}      Is valid
 */
function isValidSeed(seed) {
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
function decrypt(encrypted, pass) {
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
 * Change current wallet
 * @param  {number}  index Wallet index
 * @param  {string}  pass  Wallet passphrase
 * @return {boolean}       Success
 */
export function changeWallet(index, pass) {
  let wallets = getWallets()
  let seed = decrypt(wallets[index].seed, pass)
  if (seed === null) return false

  currentWallet = index
  // TODO: save an instance of IOTA with decrypted seed
  return true
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
