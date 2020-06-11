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

import { createClient } from './iotaClient'

const LS_SETTINGS_KEY = 'settings'
const DEFAULT_NODES = {
  main: 'https://nodes.thetangle.org:443',
  fallback: 'https://iota.chain.garden:443'
}

let settingsLoaded = false
let settings = {
  decimals: '.',
  thousands: ',',
  currency: 'USD',
  date: 'YYYY-MM-DD',
  time: 'H:mm',
  explorer: 'https://thetangle.org/',
  defaultTag: 'IOTAWEBWALLETDOTCOM',
  mainNode: null,
  fallbackNode: null,
  autoNodes: true
}


/**
 * Load settings from browser storage
 */
function loadSettings() {
  // Fetch and parse properties
  let data = localStorage.getItem(LS_SETTINGS_KEY)
  if (data !== null) {
    data = JSON.parse(data)
    for (let key in settings) {
      if (typeof data[key] !== 'undefined') settings[key] = data[key]
    }
  }
  fillAutoNodes()

  // Update flag
  settingsLoaded = true
}


/**
 * Save settings to browser storage
 */
function saveSettings() {
  let data = JSON.stringify(settings)
  localStorage.setItem(LS_SETTINGS_KEY, data)
}


/**
 * Fill node values in case of auto-nodes mode
 */
function fillAutoNodes() {
  if (settings.autoNodes) {
    settings.mainNode = DEFAULT_NODES.main
    settings.fallbackNode = DEFAULT_NODES.fallback
  }
}


/**
 * Get property
 * @param  {string} key Property name
 * @return {mixed}      Property value
 */
export function getProperty(key) {
  return settings[key]
}


/**
 * Set property
 * @param {string} key   Property name
 * @param {mixed}  value Property value
 */
export function setProperty(key, value) {
  if (settings[key] !== value) {
    settings[key] = value
    saveSettings()
  }
  if (key == 'autoNodes') fillAutoNodes()
  if (['autoNodes', 'mainNode', 'fallbackNode'].includes(key)) createClient()
}


/**
 * Clear all settings from browser storage
 */
export function clearSettings() {
  localStorage.removeItem(LS_SETTINGS_KEY)
}


/* INITIALIZE */
if (!settingsLoaded) loadSettings()
