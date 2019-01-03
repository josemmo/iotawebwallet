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
import { getCurrentWallet } from './../walletManager'
import { isBusy } from './../iotaClient'


/**
 * On page change
 */
function onPageChange() {
  // Get current path
  let path = window.location.hash.replace(/^#!\//, '')
  path = path.split('/').filter(item => item.length > 0)

  // Redirect to main page (in case of empty path)
  if (path.length == 0) {
    document.location.href = '#!/summary'
    return
  }

  // Update selected item in sidebar
  $('.sidebar .nav-link.active').removeClass('active')
  $('.sidebar .nav-link[href^="#!/' + path[0] + '"]').addClass('active')

  // Block certain pages in case wallet is unloaded
  const blocklist = ['summary', 'send', 'receive', 'history']
  const isUnloaded = (getCurrentWallet() === null) || isBusy()
  if ((blocklist.indexOf(path[0]) > -1) && isUnloaded) path[0] = 'unloaded'

  // Switch renderer contents
  const $prevPage = $('.renderer section:visible')
  const $nextPage = $('.renderer section[data-page="' + path[0] + '"]')
  if ($prevPage.data('page') !== path[0]) {
    $prevPage.css('display', '')
    $nextPage.show()
  }

  // Trigger load event
  const params = path.slice(1)
  $nextPage.trigger('pagination:load', params)

  // Focus page section
  $nextPage.find('[data-section]').removeClass('focused')
  if (params.length > 0) {
    const $section = $nextPage.find('[data-section="' + params[0] + '"]')
    if ($section.length > 0) {
      $section.addClass('focused')
      setTimeout(function() {
        $section.removeClass('focused')
      }, 300)
      $('html, body').animate({
        scrollTop: $section.offset().top - 100
      }, 300)
    }
  }
}


/**
 * Refresh UI
 */
export function refreshUi() {
  onPageChange()
}


/**
 * Show feedback
 * @param {jQuery} $elem   Target element
 * @param {object} options Options
 */
export function showFeedback($elem, options) {
  const originalValues = {
    content: $elem.html(),
    classes: $elem.attr('class')
  }

  $elem.prop('disabled', true)
  if (options.text) $elem.text(options.text)
  if (options.addClass) $elem.addClass(options.addClass)
  if (options.removeClass) $elem.removeClass(options.removeClass)

  setTimeout(function() {
    $elem.html(originalValues.content)
      .attr('class', originalValues.classes)
      .prop('disabled', false)
  }, 2000)
}


/* CATCH URL HASH CHANGES */
$(window).on('hashchange', onPageChange)


/* PREVENT FORM SUBMIT */
$('body').on('submit', 'form', function(e) {
  e.preventDefault()
})


/* INITIALIZE */
onPageChange()
