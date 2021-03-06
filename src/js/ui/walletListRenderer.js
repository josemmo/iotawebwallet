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
import { attachBusyListener } from './../iotaClient'
import {
  decrypt,
  getWallets,
  walletExists,
  isValidSeed,
  addWallet,
  updateWallet,
  deleteWallet
} from './../walletManager'

const $page = $('section[data-page="settings"]')
const $newWalletModal = $('.modal-new-wallet')
const $importWalletModal = $('.modal-import-wallet')
const $editWalletModal = $('.modal-edit-wallet')
const $exportWalletModal = $('.modal-export-wallet')
const $deleteWalletModal = $('.modal-delete-wallet')
const $viewSeedModal = $('.modal-view-seed')


/**
 * Render wallet list
 */
function renderWalletList() {
  const wallets = getWallets()
  let colRight = '<div class="col-auto align-self-center">'
  colRight += '<button type="button" class="btn btn-outline-primary btn-sm mr-1 btn-edit-wallet">Edit</button>'
  colRight += '<button type="button" class="btn btn-outline-secondary btn-sm mr-1 btn-export-wallet">Export</button>'
  colRight += '<button type="button" class="btn btn-outline-danger btn-sm btn-delete-wallet">Delete</button>'
  colRight += '</div>'

  let wHTML = ''
  if (wallets.length > 0) {
    for (let i=0; i<wallets.length; i++) {
      // Render left column
      let $colLeft = $('<div/>')
        .addClass('col align-self-center text-truncate wallet-name')
        .text(wallets[i].name)
      if (wallets[i].isSessionOnly) $colLeft.addClass('session-only')

      // Render and append row
      let $wallet = $('<div />')
        .addClass('row mt-2')
        .attr('data-session', wallets[i].isSessionOnly ? 'true' : 'false')
        .attr('data-index', i)
        .append($colLeft)
        .append(colRight)
      wHTML += $wallet.get(0).outerHTML
    }
  } else {
    wHTML += '<p class="text-center text-muted"><em>No wallets found</em></p>'
  }
  $page.find('.wallet-list').html(wHTML)
}


/**
 * Show import wallet modal
 */
function showImportWalletModal() {
  $importWalletModal.find('[name]').removeClass('is-invalid').val('')
  $importWalletModal.modal('show')
  setTimeout(function() {
    $importWalletModal.find('[name]:first').focus()
  }, 150)
}


/**
 * Regenerate seed table
 */
function regenerateSeedTable() {
  // Generate seed
  let seed = ''
  const dict = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let numbers = new Uint32Array(81)
  window.crypto.getRandomValues(numbers)
  for (let i in numbers) seed += dict[numbers[i] % dict.length]

  // Generate table HTML
  const tHTML = getSeedTableHTML(seed)
  $newWalletModal.find('.seed-table').html(tHTML).data('seed', seed)
}


/**
 * Get seed table HTML
 * @param  {string} seed Decrypted seed
 * @return {string}      Seed table HTML
 */
function getSeedTableHTML(seed) {
  let tHTML = ''
  const dim = 9
  for (let col=0; col<dim; col++) {
    tHTML += '<tr>'
    for (let row=0; row<dim; row++) tHTML += '<td>' + seed[col*dim+row] + '</td>'
    tHTML += '</tr>'
  }
  return tHTML
}


/**
 * Show seed dialog
 * @param {string} seed Decrypted seed
 */
function showSeedDialog(seed) {
  const tHTML = getSeedTableHTML(seed)
  $viewSeedModal.find('.seed-table').html(tHTML)
  $viewSeedModal.find('.seed-input').val(seed)
  $viewSeedModal.modal('show')
}


/* IMPORT AND CREATE WALLET LISTENERS */
$page.find('.btn-import-wallet').click(function() {
  showImportWalletModal()
})

$page.find('.btn-new-wallet').click(function(e) {
  e.preventDefault()
  regenerateSeedTable()
  $newWalletModal.modal('show')
})
$newWalletModal.find('.btn-regenerate').click(function() {
  regenerateSeedTable()
})
$newWalletModal.find('.btn-continue').click(function() {
  const seed = $newWalletModal.find('.seed-table').data('seed')
  regenerateSeedTable() // As a security measure
  $newWalletModal.modal('hide')
  showImportWalletModal()
  $('.modal-import-wallet [name="seed"]').val(seed)
})
$newWalletModal.on('hidden.bs.modal', function() {
  $newWalletModal.find('.seed-table').data('seed', '').html('')
})

$importWalletModal.find('.btn-import').click(function() {
  const $form = $importWalletModal.find('form')
  $form.find('[name]').removeClass('is-invalid')

  // Get values
  const name = $form.find('[name="name"]').val().trim()
  const seed = $form.find('[name="seed"]').val()
  const pass = $form.find('[name="passphrase"]').val()
  const isSessionOnly = $form.find('[name="session"]').prop('checked')

  // Validate values
  let isValid = true
  if ((name.length === 0) || walletExists(name)) {
   $form.find('[name="name"]').addClass('is-invalid')
   isValid = false
  }
  if (!isValidSeed(seed)) {
   $form.find('[name="seed"]').addClass('is-invalid')
   isValid = false
  }

  // Create wallet
  if (isValid) {
   addWallet(name, seed, pass, isSessionOnly)
   renderWalletList()
   $importWalletModal.modal('hide')
  }
})
$importWalletModal.find('.btn-new-wallet').click(function(e) {
  e.preventDefault()
  regenerateSeedTable()
  $importWalletModal.modal('hide')
  $newWalletModal.modal('show')
})


/* EDIT AND DELETE WALLET LISTENERS */
$page.find('.wallet-list').on('click', '.btn-edit-wallet', function() {
  const $row = $(this).closest('.row')
  $editWalletModal.find('input[name="name"]')
    .removeClass('is-invalid')
    .val($row.find('.wallet-name').text())
    .data('index', $row.data('index'))
  $editWalletModal.modal('show')
}).on('click', '.btn-export-wallet', function() {
  const $row = $(this).closest('.row')
  const wallet = getWallets()[$row.data('index')]
  const seed = decrypt(wallet.seed, '')
  if (seed === null) {
    $exportWalletModal.find('.wallet-name').text($row.find('.wallet-name').text())
    $exportWalletModal.data('index', $row.data('index'))
    $exportWalletModal.modal('show')
  } else {
    showSeedDialog(seed)
  }
}).on('click', '.btn-delete-wallet', function() {
  const $row = $(this).closest('.row')
  $deleteWalletModal.find('.wallet-name')
    .text($row.find('.wallet-name').text())
    .data('index', $row.data('index'))
  $deleteWalletModal.find('.session-alert').toggle($row.data('session'))
  $deleteWalletModal.modal('show')
})

$editWalletModal.find('.btn-continue').click(function() {
  var $walletName = $editWalletModal.find('input[name="name"]')
  var newName = $walletName.val().trim()

  // Check wallet name is valid
  if ((newName.length === 0) || walletExists(newName)) {
    $walletName.addClass('is-invalid')
    return
  }

  // Update wallet
  updateWallet($walletName.data('index'), newName)
  renderWalletList()
  $editWalletModal.modal('hide')
})

$exportWalletModal.find('.btn-continue').click(function() {
  const $pass = $exportWalletModal.find('input[name="passphrase"]')
  const index = $exportWalletModal.data('index')

  // Try to decrypt seed
  const wallet = getWallets()[index]
  const seed = decrypt(wallet.seed, $pass.val())
  if (seed === null) {
    $pass.addClass('is-invalid')
    return
  }

  // Show wallet seed
  $exportWalletModal.modal('hide')
  showSeedDialog(seed)
})
$exportWalletModal.on('hidden.bs.modal', function() {
  $exportWalletModal.find('input[name="passphrase"]').val('')
})

$deleteWalletModal.find('.btn-continue').click(function() {
  deleteWallet($deleteWalletModal.find('.wallet-name').data('index'))
  renderWalletList()
  $deleteWalletModal.modal('hide')
})

$viewSeedModal.on('hidden.bs.modal', function() {
  $viewSeedModal.find('.seed-table').html('')
  $viewSeedModal.find('.seed-input').val('')
})


/* BUSY LISTENER */
attachBusyListener(function(isBusy) {
  $page.find('[data-section="wallets"]').toggleClass('disabled', isBusy)
})


/* INITIALIZE */
renderWalletList()
