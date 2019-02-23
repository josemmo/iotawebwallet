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
import { isTag } from '@iota/validators'
import { attachBusyListener } from './../iotaClient'
import { getProperty, setProperty, clearSettings } from './../settingsManager'
import { clearWallets } from './../walletManager'
import { showFeedback } from './pagination'

const $page = $('section[data-page="settings"]')
const $nodes = $page.find('[data-section="nodes"]')
const $nodesBtn = $nodes.find('.btn-nodes-switch')


/**
 * Render setting values
 */
function renderSettings() {
  $page.find('[name="number_formatting"]').val(getProperty('decimals') + '|' +
    getProperty('thousands'))
  $page.find('[name="date"]').val(getProperty('date'))
  $page.find('[name="time"]').val(getProperty('time'))
  $page.find('[name="currency"]').val(getProperty('currency'))
  $page.find('[name="default_tag"]').val(getProperty('defaultTag'))
  $page.find('[name="explorer"]').val(getProperty('explorer'))
  toggleAutoNodes(getProperty('autoNodes'))
}


/**
 * Toggle auto-nodes mode
 * @param {boolean} enabled Is mode enabled
 */
function toggleAutoNodes(enabled) {
  // Set auto-nodes status
  setProperty('autoNodes', enabled)

  // Update node values
  $page.find('[name="main_node"]').val(getProperty('mainNode'))
  $page.find('[name="fallback_node"]').val(getProperty('fallbackNode'))

  // Update UI buttons
  const btnText = $nodesBtn.data(enabled ? 'txtDisable' : 'txtEnable')
  $nodesBtn.text(btnText)
  $nodes.find('.auto-mode-msg').toggle(enabled)
  $nodes.find('input[type="text"]')
    .prop('readonly', enabled)
    .removeClass('is-invalid')
  $nodes.find('.btn-save').prop('disabled', enabled)
}


/* ATTACH EVENT LISTENERS */
$nodesBtn.click(function() {
  toggleAutoNodes(!getProperty('autoNodes'))
})

$page.find('[data-section="localization"] .btn-save').click(function() {
  const formatting = $page.find('[name="number_formatting"]').val().split('|')
  setProperty('decimals', formatting[0])
  setProperty('thousands', formatting[1])
  setProperty('date', $page.find('[name="date"]').val())
  setProperty('time', $page.find('[name="time"]').val())
  setProperty('currency', $page.find('[name="currency"]').val())
  window.location.reload()
})

$page.find('[data-section="nodes"] .btn-save').click(function() {
  let mainNode = $page.find('[name="main_node"]').val().trim()
  let fallbackNode = $page.find('[name="fallback_node"]').val().trim()
  if (mainNode.length === 0) {
    $page.find('[name="main_node"]').addClass('is-invalid')
    return
  }
  if (fallbackNode.length === 0) fallbackNode = null

  setProperty('mainNode', mainNode)
  setProperty('fallbackNode', fallbackNode)
  showFeedback($(this), {text: 'Saved!'})
})
attachBusyListener(function(isBusy) {
  $page.find('[data-section="nodes"]').toggleClass('disabled', isBusy)
})

$page.find('[data-section="advanced"] .btn-save').click(function() {
  const $defaultTag = $page.find('[name="default_tag"]')
  const defaultTag = $defaultTag.val().trim()
  if ((defaultTag.length > 0) && !isTag(defaultTag)) {
    $defaultTag.addClass('is-invalid')
    return
  }

  const $explorer = $page.find('[name="explorer"]')
  const explorer = $explorer.val().trim()
  if (explorer.length == 0 || !$explorer.is(':valid')) {
    $explorer.addClass('is-invalid')
    return
  }

  setProperty('defaultTag', defaultTag)
  setProperty('explorer', explorer)
  showFeedback($(this), {text: 'Saved!'})
})

$('.modal-delete-all-data .btn-continue').click(function() {
  clearSettings()
  clearWallets()
  window.location.reload()
})


/* INITIALIZE */
renderSettings()
