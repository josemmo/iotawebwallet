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
import QRCode from 'qrcode'
import { addChecksum } from '@iota/checksum'
import { getProperty } from './../settingsManager'
import { formatIotas } from './../utils'
import {
  attachAccountDataListener,
  findTransactions,
  sendTransfers,
  getNewAddress
} from './../iotaClient'

const $page = $('section[data-page="receive"]')

let latestAddress
let latestIndex


/**
 * Render receive page
 */
function renderReceivePage() {
  // Update latest address information
  const checksum = addChecksum(latestAddress).slice(-9)
  $page.find('.address-index').html(latestIndex)
  $page.find('.address-text')
    .html(`${latestAddress}<span class="text-muted">${checksum}</span>`)

  // Render QR code
  QRCode.toString(latestAddress + checksum).then(function(svg) {
    $page.find('.address-qr').html(svg)
  })

  // Update button
  $page.find('.address-btn').addClass('btn-outline-primary')
    .removeClass('btn-outline-secondary')
    .html('Attach to The Tangle')

  // Update transactions for this address
  updateReceiveTransactions()
}


/**
 * Update receive transactions
 */
function updateReceiveTransactions() {
  const $list = $page.find('.transactions-list')
  const explorer = getProperty('explorer')

  $list.html('<p class="text-muted text-center my-5">Getting transactions...</p>')
  findTransactions({addresses: [latestAddress]}).then(function(transactions) {
    if (transactions.length > 0) {
      let tHTML = '<table class="table table-striped table-receive">' +
        '<thead>' +
        '<tr><th>Hash</th><th>Amount</th></tr>' +
        '</thead>' +
        '<tbody>'
      for (const tx of transactions) {
        tHTML += '<tr>' +
          `<td><a href="${explorer}transaction/${tx.hash}" target="_blank">${tx.hash}</a></td>` +
          `<td>${formatIotas(tx.value)}</td>` +
          '</tr>'
      }
      tHTML += '</tbody></table>'
      $list.html(tHTML)
    } else {
      $list.html('<p class="text-muted text-center my-5">No transactions yet</p>')
    }
  })
}


/* REFRESH BUTTON LISTENER */
$page.find('.refresh-btn').click(updateReceiveTransactions)


/* ATTACH BUTTON LISTENER */
$page.find('.address-btn').click(function() {
  const $this = $(this)
  if ($this.hasClass('btn-outline-primary')) { // Attach to The Tangle
    const $modal = $('.modal-attaching').modal('show')
    const tx = {
      address: latestAddress,
      value: 0,
      tag: getProperty('defaultTag')
    }
    sendTransfers([tx]).then(function(bundle) {
      $this.removeClass('btn-outline-primary')
        .addClass('btn-outline-secondary')
        .html('Generate a new address')
      updateReceiveTransactions()
    }).catch(function(error) {
      $('.modal-attach-error').modal('show')
    }).finally(function() {
      $modal.modal('hide')
    })
  } else { // Get next address
    $this.prop('disabled', true)
    getNewAddress(latestIndex+1).then(function(newAddress) {
      latestAddress = newAddress
      latestIndex++
      renderReceivePage()
      $this.prop('disabled', false)
    })
  }
})


/* INITIALIZE */
attachAccountDataListener(function(data) {
  latestAddress = data.latestAddress
  latestIndex = data.addresses.length - 1
  renderReceivePage()
})
