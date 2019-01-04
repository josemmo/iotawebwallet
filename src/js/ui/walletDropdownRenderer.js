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
import { attachBusyListener, loadWalletData } from './../iotaClient'
import { getWallets, getCurrentWallet, changeWallet } from './../walletManager'

const $dropdown = $('.navbar .navbar-wallet-dropdown')
const $refreshBtn = $('.navbar .navbar-refresh')


/**
 * Get wallet dropdown contents
 * @return {string} HTML contents
 */
function getDropdownContents() {
  const isDisabled = $dropdown.hasClass('disabled')
  let $elem = $('<div/>').addClass('list-group list-group-flush')

  // Add wallets
  const wallets = getWallets()
  if (wallets.length > 0) {
    wallets.forEach((wallet, index) => {
      let $wallet = $('<a/>').addClass('list-group-item').text(wallet.name)
      if (wallet.isSessionOnly) $wallet.addClass('session-only')
      if (isDisabled) {
        $wallet.addClass('text-muted')
      } else {
        $wallet.addClass('list-group-item-action').attr('data-index', index)
      }
      $elem.append($wallet)
    })
  } else {
    $elem.html('<a class="list-group-item text-muted">No wallets found</a>')
  }

  // Add manage button
  let $manageBtn = $('<a/>')
    .addClass('list-group-item list-group-item-action')
    .attr('href', '#!/settings/wallets')
    .html('<strong>Manage wallets</strong>')
  $elem.append($manageBtn)

  return $elem.get(0).outerHTML
}


/**
 * Request change wallet
 * @param {number} index Wallet index
 */
function requestChangeWallet(index) {
  // Try to decrypt with empty password
  if (changeWallet(index, '')) {
    renderDropdownStatus()
    return
  }

  // Prompt user to unlock wallet
  const walletName = getWallets()[index].name
  const $modal = $('.modal-enter-password')
  const $pass = $modal.find('input[name="passphrase"]')
  $modal.find('.wallet-name').text(walletName)
  $pass.data('index', index).val('').removeClass('is-invalid')
  $modal.modal('show')
  $pass.focus()
}


/**
 * Render dropdown status
 */
function renderDropdownStatus() {
  const wallet = getCurrentWallet()
  if (wallet === null) {
    $dropdown.find('.subtitle').text('No wallet selected')
    $refreshBtn.addClass('disabled')
  } else {
    $dropdown.find('.subtitle').text(wallet.name)
    $refreshBtn.removeClass('disabled')
  }
}


// Attach dropdown renderer
$dropdown.popover({
  content: getDropdownContents,
  html: true,
  template: '<div class="popover wallet-dropdown-popover" role="tooltip">' +
    '<div class="arrow"></div>' +
    '<div class="popover-body p-0"></div>' +
    '</div>',
  placement: 'bottom',
  trigger: 'focus'
})

// Attach dropdown listeners
$('body').on('click', '.wallet-dropdown-popover a[data-index]', function() {
  const index = $(this).data('index')
  requestChangeWallet(index)
}).on('refreshUi', $dropdown, function() {
  renderDropdownStatus()
})
$refreshBtn.click(function() {
  if (!$(this).hasClass('loading')) loadWalletData()
})
attachBusyListener(function(isBusy) {
  $dropdown.toggleClass('disabled', isBusy)
  $refreshBtn.toggleClass('loading', isBusy)
})

// Attach password modal listeners
$('.modal-enter-password .btn-continue').click(function() {
  const $modal = $(this).closest('.modal')
  const $pass = $modal.find('input[name="passphrase"]')
  const index = $pass.data('index')

  if (changeWallet(index, $pass.val())) {
    renderDropdownStatus()
    $modal.modal('hide')
  } else {
    $pass.addClass('is-invalid')
  }
})

// Initialize UI component
renderDropdownStatus()
