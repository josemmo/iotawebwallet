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

import dayjs from 'dayjs'
import { getProperty } from './settingsManager'


/**
 * Format date
 * @param  {number|dayjs} timestamp UNIX timestamp or Day.js object
 * @return {string}                 Date string representation
 */
export function formatDate(timestamp) {
  const m = (typeof timestamp == 'object') ?
    timestamp :
    dayjs.unix(timestamp/1000)
  return m.format(getProperty('date') + ' ' + getProperty('time'))
}


/**
* Format price
* @param  {number} number   Number
* @param  {string} currency Currency symbol
* @return {string}          Pretty-print string
*/
export function formatPrice(number, currency) {
  let res = number.toString().split('.')
  res[0] = res[0].replace(/\B(?=(\d{3})+(?!\d))/g, getProperty('thousands'))
  res = res.join(getProperty('decimals'))

  if (currency == 'USD') {
    res = '$ ' + res
  } else if (typeof currency !== 'undefined') {
    const symbols = {'EUR':'€', 'BTC':'₿'}
    res += ' ' + symbols[currency]
  }

  return res
}


/**
 * Format IOTAs
 * @param  {number} iotas IOTAs
 * @return {string}       Pretty-print string
 */
export function formatIotas(iotas) {
  const units = ['i', 'Ki', 'Mi', 'Gi', 'Ti']
  let i
  for (i in units) {
    if (Math.abs(iotas) < 1000 || iotas == 0) break
    iotas /= 1000
  }
  iotas = Math.round(iotas * 1000000) / 1000000
  return formatPrice(iotas) + ' ' + units[i]
}
