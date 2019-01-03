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
import { refreshUi } from './pagination'

const $page = $('section[data-page="unloaded"]')


/* ATTACH IOTA CLIENT LISTENER */
attachBusyListener(function(isBusy) {
  $page.find('.section-idle').toggleClass('d-none', isBusy)
  $page.find('.section-busy').toggleClass('d-none', !isBusy)
  refreshUi()
})
