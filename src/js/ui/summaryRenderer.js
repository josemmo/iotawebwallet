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
import dayjs from 'dayjs'
import Chartist from 'chartist'
import { TX_STATUS, attachAccountDataListener } from './../iotaClient'
import { getProperty } from './../settingsManager'
import { formatIotas, formatPrice, formatDate } from './../utils'

const $page = $('section[data-page="summary"]')

let totalConfirmed = 0
let totalUnconfirmed = 0
let chartPrice = 0
let chartLabels = []
let chartData = []


/**
 * Update exchange data
 */
function updateExchangeData() {
  const currency = getProperty('currency')
  const chartUrl = 'https://min-api.cryptocompare.com/data/histohour' +
    `?fsym=MIOTA&tsym=${currency}&limit=60&aggregate=3&e=CCCAGG`

  $.get(chartUrl).done(function(res) {
    // Parse response
    chartLabels = []
    chartData = []
    for (const row of res.Data) {
      chartLabels.push(dayjs.unix(row.time))
      chartData.push(row.close)
    }

    // Update chart info
    chartPrice = chartData[chartData.length-1]
    $page.find('.iota-price').html(formatPrice(chartPrice, currency))
    let diff = Math.round((chartPrice - chartData[0]) * 1000) / 1000
    $page.find('.iota-diff').html(
      ((diff < 0) ? '' : '+') + formatPrice(diff, currency)
    )
    diff = Math.round((diff / chartPrice) * 10000) / 100
    $page.find('.iota-diff-percent').html(
      ((diff < 0) ? '' : '+') + formatPrice(diff)
    )

    // Update price chart
    renderChart()
  })
}


/**
 * Render chart
 */
function renderChart() {
  const currency = getProperty('currency')
  const $chart = $page.find('.price-chart-container').empty()

  // Update wallet rate in secondary currency
  const rate = (totalConfirmed / 1000000) * chartPrice
  $page.find('.wallet-rate').html('&asymp; ' + formatPrice(rate, currency))

  // Render chart canvas
  const chart = new Chartist.Line($chart.get(0), {
    labels: chartLabels,
    series: [chartData]
  }, {
    showPoint: false,
    showLine: true,
    showArea: true,
    fullWidth: true,
    showLabel: false,
    axisX: {
      showGrid: false,
      showLabel: false,
      offset: 0
    },
    axisY: {
      showGrid: false,
      showLabel: false,
      offset: 0
    },
    chartPadding: 0
  })

  // Animate on load
  chart.on('draw', function(data) {
    if (data.type === 'line' || data.type === 'area') {
      data.element.animate({
        d: {
          begin: 0,
          dur: 800,
          from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
          to: data.path.clone().stringify(),
          easing: Chartist.Svg.Easing.easeOutQuint
        }
      })
    }
  })
}


/* ATTACH EVENT LISTENERS */
$page.find('.btn-refresh').click(updateExchangeData)
$page.on('pagination:load', renderChart)


/* INITIALIZE */
updateExchangeData()
attachAccountDataListener(function(data) {
  const explorer = getProperty('explorer')
  const $list = $page.find('.addresses-container')
  totalConfirmed = data.balance
  totalUnconfirmed = 0

  if (data.addresses.length > 0) {
    // Get balance per address
    let balances = {}
    for (const input of data.inputs) {
      balances[input.address] = {confirmed: input.balance, unconfirmed: 0}
    }
    for (const tx of data.transactions) {
      if (tx.value <= 0 || tx.status !== TX_STATUS.PENDING) continue
      if (typeof balances[tx.address] == 'undefined') {
        balances[tx.address] = {confirmed: 0, unconfirmed: 0}
      }
      balances[tx.address].unconfirmed += tx.value
    }

    // Render addresses table
    let aHTML = '<table class="table table-striped">'
    aHTML += '<thead><tr>'
    aHTML += '<th>Address</th>'
    aHTML += '<th>Balance</th>'
    aHTML += '</tr></thead>'
    aHTML += '<tbody>'
    for (const addr of data.addresses) {
      const balance = balances[addr] || {confirmed: 0, unconfirmed: 0}
      totalUnconfirmed += balance.unconfirmed

      aHTML += '<tr>'
      aHTML += `<td><a href="${explorer}address/${addr}" target="_blank">${addr}</a></td>`
      aHTML += '<td>'
      aHTML += formatIotas(balance.confirmed)
      if (balance.unconfirmed > 0) {
        aHTML += ` <span class="text-muted">(+${formatIotas(balance.unconfirmed)})</span>`
      }
      aHTML += '</td>'
      aHTML += '</tr>'
    }
    aHTML += '</tbody></table>'
    $list.html(aHTML)
  } else {
    $list.html('<p class="my-5 text-center text-muted">No addresses found</p>')
  }

  // Render total wallet balances
  $page.find('.max-iotas').html(formatIotas(totalConfirmed))
  $page.find('.unconfirmed-iotas').html(formatIotas(totalUnconfirmed))

  // Render chart
  renderChart()
})
