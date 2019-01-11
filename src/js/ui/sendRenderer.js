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
import { isAddress, isTag, isTrytesOfMaxLength } from '@iota/validators'
import { asciiToTrytes } from '@iota/converter'
import { getProperty } from './../settingsManager'
import { formatIotas } from './../utils'
import { attachAccountDataListener, sendTransfers } from './../iotaClient'

const $page = $('section[data-page="send"]')
const MAX_MESSAGE_TRYTES = 2187

let balance


/**
 * Reset tag input field
 */
function resetTagInput() {
  $page.find('[name="tag"]').val(getProperty('defaultTag'))
}


/* SEND BUTTON EVENT */
$page.find('.btn-send').click(function() {
  const $form = $page.find('form')
  $form.find('input, textarea').removeClass('is-invalid')

  // Get values
  const address = $form.find('[name="address"]').val()
  const amount = $form.find('[name="amount"]').val()
  const unit = $form.find('[name="unit"]').val()
  const value = amount * unit
  const tag = $form.find('[name="tag"]').val()
  let message = $form.find('[name="message"]').val()

  // Validate fields
  let canSend = true
  if (!isAddress(address)) {
    $form.find('[name="address"]').addClass('is-invalid')
    canSend = false
  }
  if ((amount.length === 0) || (value < 0) || (value > balance)) {
    $form.find('[name="amount"]').addClass('is-invalid')
    canSend = false
  }
  if ((tag.length > 0) && !isTag(tag)) {
    $form.find('[name="tag"]').addClass('is-invalid')
    canSend = false
  }
  if (message.length > 0) {
    let isValidMessage = false
    for (let i=0; i<2; i++) {
      if (isTrytesOfMaxLength(message, MAX_MESSAGE_TRYTES)) {
        isValidMessage = true
        break
      }
      if (i == 0) message = asciiToTrytes(message)
    }
    if (!isValidMessage) {
      $form.find('[name="message"]').addClass('is-invalid')
      canSend = false
    }
  }
  if (!canSend) return

  // Detect confirmation
  const $sendBtn = $(this)
  if (!$sendBtn.hasClass('btn-secondary')) {
    $sendBtn
      .addClass('btn-secondary')
      .removeClass('btn-outline-primary')
      .html('Click again to confirm')
    return
  }
  $page.trigger('pagination:load')

  // Show loading modal
  const $loadingModal = $('.modal-sending-transaction').modal('show')

  // Send transaction
  const tx = {
    address: address,
    value: value,
    tag: tag,
    message: message
  }
  sendTransfers([tx]).then(function(bundle) {
    // Show sent modal
    const $modal = $('.modal-transaction-sent')
    $modal.find('.amount').html(formatIotas(value))
    $modal.find('.input-hash').val(bundle[0].bundle)
    $modal.find('.btn-view').attr('href', getProperty('explorer') +
      'bundle/' + bundle[0].bundle)
    $modal.modal('show')

    // Restore page to its default state
    $form.find('input, textarea').val('')
    resetTagInput()
  }).catch(function(err) {
    $('.modal-transaction-error').modal('show')
    console.error('Failed to send transaction', err)
  }).finally(function() {
    $loadingModal.modal('hide')
  })
})


/* CONVERT UNITS */
let prevUnit = 1
$page.find('select[name="unit"]').focus(function() {
  prevUnit = $(this).val()
}).change(function() {
  const $amount = $page.find('[name="amount"]')
  const amount = $amount.val()
  if (amount.length === 0) return

  // Convert value from previous unit to new unit
  const newUnit = $(this).val()
  let newValue = amount * prevUnit
  newValue /= newUnit
  prevUnit = newUnit

  // Update value
  var step = Math.round(1 / $amount.attr('step'))
  newValue = Math.round(newValue * step) / step
  $amount.val(newValue)
})


/* INITIALIZE */
resetTagInput()


/* ON PAGE LOAD */
$page.on('pagination:load', function(e, section) {
  $page.find('.btn-send')
    .addClass('btn-outline-primary')
    .removeClass('btn-secondary')
    .html('Send it!')
  $page.find('input, select, textarea').removeClass('is-invalid')
})


/* ON WALLET LOAD */
attachAccountDataListener(function(data) {
  balance = data.balance
  $page.find('.max-iotas').html(formatIotas(balance))
})
