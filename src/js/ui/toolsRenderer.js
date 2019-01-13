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
import { isHash } from '@iota/validators'
import { asciiToTrytes, trytesToAscii } from '@iota/converter'
import { getProperty } from './../settingsManager'
import { confirmTransaction } from './../iotaClient'

const $page = $('section[data-page="tools"]')
const $confirm = $page.find('[data-section="confirm"]')
const $convertTrytes = $page.find('[data-section="convert-trytes"]')


/* CONFIRM TRANSACTION */
$confirm.find('.btn-confirm-transaction').click(function() {
  const $tx = $confirm.find('[name="transaction"]')
  const transaction = $tx.val()

  // Validate transaction hash
  if (!isHash(transaction)) {
    $tx.addClass('is-invalid')
    return
  }

  // Show sending modal
  const $sendingModal = $('.modal-sending-transaction').modal('show')

  // Confirm transaction
  confirmTransaction(transaction).then(function(res) {
    const {promotable, bundle} = res
    const $modal = $('.modal-transaction-confirmed')
    $modal.find('.promoted-msg').toggleClass('d-none', !promotable)
    $modal.find('.reattached-msg').toggleClass('d-none', promotable)
    $modal.find('.input-hash').val(bundle[0].bundle)
    $modal.find('.btn-view').attr('href', getProperty('explorer') +
      'bundle/' + bundle[0].bundle)
    $modal.modal('show')
  }).catch(function(err) {
    $('.modal-transaction-error').modal('show')
    console.error('Failed to send transaction', err)
  }).finally(function() {
    $sendingModal.modal('hide')
  })
})


/* CONVERT TRYTES */
$convertTrytes.find('textarea').keyup(function(e) {
  const value = this.value
  const target = e.target.getAttribute('name')
  if (target == 'ascii') {
    $convertTrytes.find('[name="trytes"]').val(asciiToTrytes(value))
  } else {
    $convertTrytes.find('[name="ascii"]').val(trytesToAscii(value))
  }
})


/* INITIALIZE */
$page.on('pagination:load', function(e, section, transaction) {
  $(this).find('input').removeClass('is-invalid')
  if (section == 'confirm') {
    $confirm.find('[name="transaction"]').val(transaction)
  }
})
