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
import 'datatables.net'
import 'datatables.net-bs4'
import { TX_TYPE, TX_STATUS, attachAccountDataListener } from './../iotaClient'
import { formatDate, formatIotas } from './../utils'
import { getProperty } from './../settingsManager'
import sentImage from './../../images/sent.svg'
import receivedImage from './../../images/received.svg'
import confirmedImage from './../../images/confirmed.svg'
import pendingImage from './../../images/pending.svg'
import reattachedImage from './../../images/reattached.svg'

const $page = $('section[data-page="history"]')


/* INITIALIZE */
const table = $page.find('.table-container table').DataTable({
  scrollX: true,
  autoWidth: false,
  data: [],
  columns: [
    {title: 'Type'},
    {title: 'Status'},
    {title: 'Timestamp'},
    {title: 'Bundle'},
    {title: 'Address'},
    {title: 'Hash'},
    {title: 'Tag'},
    {title: 'Value'}
  ],
  order: [
    [2, 'desc']
  ]
})

attachAccountDataListener(function(accountData) {
  const explorer = getProperty('explorer')
  const $table = $page.find('.table-container')
  const $noTransactions = $page.find('.no-transactions')

  // Display message in case of no transactions
  if (accountData.transactions.length === 0) {
    $table.hide()
    $noTransactions.show()
    return
  }
  $noTransactions.hide()
  $table.show()

  // Generate transactions table rows
  let tableRows = []
  for (const tx of accountData.transactions) {
    const typeColumn = (tx.type == TX_TYPE.SENT) ?
      `<h>S</h><img width="15" src="${sentImage}" alt="🔺" title="Sent">` :
      `<h>R</h><img width="15" src="${receivedImage}" alt="🔻" title="Received">`

    let statusColumn = ''
    switch (tx.status) {
      case TX_STATUS.CONFIRMED:
        statusColumn = `<h>C</h><img width="15" src="${confirmedImage}" alt="✔️" title="Confirmed">`
        break
      case TX_STATUS.PENDING:
        statusColumn = `<h>P</h><a href="#!/tools/confirm/${tx.hash}">` +
          `<img width="15" src="${pendingImage}" alt="💬" title="Pending"></a>`
        break
      case TX_STATUS.REATTACHED:
        statusColumn = `<h>R</h><img width="15" src="${reattachedImage}" alt="🔁" title="Reattachment confirmed">`
        break
    }

    tableRows.push([
      typeColumn,
      statusColumn,
      `<h>${tx.attachmentTimestamp}</h>${formatDate(tx.attachmentTimestamp)}`,
      `<a href="${explorer}bundle/${tx.bundle}" target="_blank">${tx.bundle}</a>`,
      `<a href="${explorer}address/${tx.address}" target="_blank">${tx.address}</a>`,
      `<a href="${explorer}transaction/${tx.hash}" target="_blank">${tx.hash}</a>`,
      `<a href="${explorer}tag/${tx.tag}" target="_blank">${tx.tag.replace(/9+$/g, '')}</a>`,
      `<h>${tx.value}</h>${formatIotas(tx.value)}`
    ])
  }

  // Re-draw table
  table.clear()
  table.rows.add(tableRows)
  table.draw()
})
