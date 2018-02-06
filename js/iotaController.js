(function() {

  var iota = null;
  var useFallbackNode = false;
  var SEED = null;

  var tzOffset = (new Date()).getTimezoneOffset() * 60;
  var chartLabels = [];
  var chartData = [];
  var $summaryPage = $('section[data-page="summary"]');

  /**
   * Set IOTA seed
   * @param {string} seed Seed
   */
  window.setIotaSeed = function(seed) {
    SEED = seed;
    reloadWallet();
  };


  /**
   * Is wallet loaded
   * @return {Boolean} Is loaded
   */
  window.isWalletLoaded = function() {
    return (SEED !== null) && !$('.navbar .navbar-refresh').hasClass('loading');
  };


  /**
   * Send transaction
   * @param    {object} tx       Transaction
   * @callback          callback Callback
   */
  window.sendTransaction = function(tx, callback) {
    var depth = 3;
    var minWeightMagnitude = 14;
    iota.api.sendTransfer(SEED, depth, minWeightMagnitude, [tx], callback);
  };


  /**
   * Format price
   * @param  {Number} number   Number
   * @param  {string} currency Currency
   * @return {string}          Pretty-print string
   */
  function formatPrice(number, currency) {
    var res = number.toString().split('.');
    res[0] = res[0].replace(/\B(?=(\d{3})+(?!\d))/g, window.SETTINGS.thousands);
    res = res.join(window.SETTINGS.decimals);
    if (currency == 'USD') {
      res = '$ ' + res;
    } else if (typeof currency !== 'undefined') {
      var symbols = {'EUR':'€', 'BTC':'₿'};
      res += ' ' + symbols[currency];
    }
    return res;
  }


  /**
   * Format IOTAs
   * @param  {Number} iotas IOTAs
   * @return {string}       Pretty-print string
   */
  function formatIotas(iotas) {
    var i, units = ['i', 'Ki', 'Mi', 'Gi', 'Ti'];
    for (i in units) {
      if (Math.abs(iotas) < 1000 || iotas == 0) break;
      iotas /= 1000;
    }
    iotas = Math.round(iotas * 1000000) / 1000000;
    return formatPrice(iotas) + ' ' + units[i];
  }
  window.formatIotas = formatIotas;


  /**
   * Format date
   * @param  {Number} timestamp UTC Timestamp
   * @return {string}           Date string
   */
  window.formatDate = function(timestamp) {
    var m = (typeof timestamp == 'object') ?
      timestamp :
      moment.unix(timestamp/1000 + tzOffset);
    return m.format(window.SETTINGS.date + ' ' + window.SETTINGS.time);
  };


  /**
   * Get node URL
   * @return {string} Node URL
   */
  function getNodeURL() {
    return useFallbackNode ?
      window.SETTINGS.fallback_node :
      window.SETTINGS.main_node;
  }


  /**
   * Wallet die
   */
  function walletDie() {
    $('.modal-wallet-die').modal('show');
    document.location.href = '#!/settings/nodes/';
  }


  /**
   * Reload wallet
   */
  function reloadWallet() {
    if (SEED === null) {
      $(window).trigger('hashchange');
      return;
    }

    // Disable certain controls
    var $dropdown = $('.navbar .navbar-wallet-dropdown');
    var $btn = $('.navbar .navbar-refresh');
    var $listBtns = $('section[data-page="settings"] .wallet-list button');
    $btn.addClass('loading');
    $dropdown.addClass('disabled');
    $listBtns.prop('disabled', true);

    // Define function for enabling controls later on
    var enableControls = function() {
      $btn.removeClass('loading');
      $dropdown.removeClass('disabled');
      $listBtns.prop('disabled', false);
      $(window).trigger('hashchange');
    };

    // Get wallet data
    var nodeURL = getNodeURL();
    if (nodeURL.length == 0) {
      enableControls();
      walletDie();
      return;
    }
    iota = new IOTA({provider: nodeURL});
    iota.api.getAccountData(SEED, function(error, accountData) {
      if (error) {
        if (useFallbackNode) {
          enableControls();
          walletDie();
        } else {
          useFallbackNode = true;
          reloadWallet();
        }
      } else {
        parseAccountData(accountData);
        renderReceivePage(accountData.latestAddress, accountData.addresses.length);
        enableControls();
      }
    });
  }


  /**
   * Parse account data
   * @param {object} data Account data
   */
  function parseAccountData(data) {
    // Update balance
    $('.max-iotas').html(formatIotas(data.balance)).data('value', data.balance);

    // Update unconfirmed balance
    var unconfirmed = 0;
    data.transfers.forEach(function(bundle) {
      bundle.forEach(function(tx) {
        if ((data.addresses.indexOf(tx.address) > -1) && !tx.persistence) {
          unconfirmed += tx.value;
        }
      });
    });
    var $unconfirmed = $('.unconfirmed-iotas');
    if (unconfirmed == 0) {
      $unconfirmed.hide();
    } else {
      $unconfirmed.html(
        (unconfirmed < 0 ? '-' : '+') +
        ' <strong>' + formatIotas(unconfirmed) + '</strong> unconfirmed'
      ).show();
    }

    // Get exchange values
    updateExchangeData();

    // Render addresses list
    var $list = $summaryPage.find('.addresses-container');
    if (data.addresses.length > 0) {
      var aHTML = '<table class="table table-striped">' +
        '<thead><tr><th>Address</th><th>Balance</th></tr></thead>' +
        '<tbody>';
      data.addresses.forEach(function(addr) {
        var balance = 0;
        for (var i in data.inputs) {
          if (data.inputs[i].address == addr) {
            balance = data.inputs[i].balance;
            break;
          }
        }
        aHTML += '<tr>' +
            '<td><a href="' + window.SETTINGS.explorer + 'address/' + addr + '" target="_blank">' + addr + '</a></td>' +
            '<td>' + formatIotas(balance) + '</td>' +
          '</tr>';
      });
      aHTML += '</tbody></table>';
      $list.html(aHTML);
    } else {
      $list.html('<p class="my-5 text-center text-muted">No addresses found</p>');
    }

    // Render history table
    var $container = $('section[data-page="history"] .container');
    if (data.transfers.length > 0) {
      var dataSet = [];
      var transfers = iota.utils.categorizeTransfers(data.transfers, data.addresses);
      for (var type in transfers) {
        transfers[type].forEach(function(bundle) {
          bundle.forEach(function(tx) {
            // Check transaction belongs to user
            if ((type == 'received') && (data.addresses.indexOf(tx.address) < 0)) return;

            // Add transaction to table
            var typeHTML = (type == 'sent') ?
              '<h>O</h><img width="15" src="images/outgoing.svg" alt="🔺" title="Outgoing">' :
              '<h>I</h><img width="15" src="images/incoming.svg" alt="🔻" title="Incoming">';
            var confirmedHTML = tx.persistence ?
              '<h>C</h><img width="15" src="images/confirmed.svg" alt="✔️" title="Confirmed">' :
              '<h>P</h><img width="15" src="images/pending.svg" alt="💬" title="Pending">';
            dataSet.push([
              typeHTML,
              confirmedHTML,
              '<h>' + tx.attachmentTimestamp + '</h>' + window.formatDate(tx.attachmentTimestamp),
              '<a href="' + window.SETTINGS.explorer + 'bundle/' + tx.bundle + '" target="_blank">' + tx.bundle + '</a>',
              '<a href="' + window.SETTINGS.explorer + 'address/' + tx.address + '" target="_blank">' + tx.address + '</a>',
              '<a href="' + window.SETTINGS.explorer + 'transaction/' + tx.hash + '" target="_blank">' + tx.hash + '</a>',
              '<a href="' + window.SETTINGS.explorer + 'tag/' + tx.tag + '" target="_blank">' + tx.tag.replace(/9+$/g, '') + '</a>',
              '<h>' + tx.value + '</h>' + formatIotas(tx.value)
            ]);
          });
        });
      }
      $container.html('<table class="table table-striped"></table>');
      $container.find('table').DataTable({
        scrollX: true,
        data: dataSet,
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
      });

      // Hot-Fix for DataTable `thead`
      setTimeout(function() {
        $container.closest('section').trigger('pagination:load');
      }, 100);
    } else {
      $container.html(
        '<h4 class="my-4 text-center">No transactions found</h4>' +
        '<p class="text-center text-muted">' +
          'Create a new one by <a href="#!/send/">sending a transaction</a> ' +
          'or by <a href="#!/receive/">attaching an address</a> to The Tangle' +
        '</p>'
      );
    }
  }


  /**
   * Update exchange data
   */
  function updateExchangeData() {
    // Get chart data
    $.get('https://min-api.cryptocompare.com/data/histohour?fsym=IOT&tsym=' +
    window.SETTINGS.currency + '&limit=60&aggregate=3&e=CCCAGG').done(function(res) {
      // Parse response
      chartLabels = [];
      chartData = [];
      res.Data.forEach(function(row) {
        chartLabels.push(moment.unix(row.time));
        chartData.push(row.close);
      });

      // Update chart info
      var $summaryPage = $('section[data-page="summary"]');
      var price = chartData[chartData.length-1];
      $summaryPage.find('.iota-price').html(formatPrice(price, window.SETTINGS.currency));
      var diff = Math.round((price - chartData[0]) * 1000) / 1000;
      $summaryPage.find('.iota-diff').html(
        ((diff < 0) ? '' : '+') + formatPrice(diff, window.SETTINGS.currency)
      );
      diff = Math.round((diff / price) * 10000) / 100;
      $summaryPage.find('.iota-diff-percent').html(
        ((diff < 0) ? '' : '+') + formatPrice(diff)
      );

      // Update wallet rate in secondary currency
      var iotas = $summaryPage.find('.max-iotas').data('value');
      var rate = (iotas / 1000000) * price;
      $summaryPage.find('.wallet-rate').html('&asymp; ' + formatPrice(rate, window.SETTINGS.currency));

      // Update price chart
      renderChart();
    });
  }


  /**
   * Render chart
   */
  function renderChart() {
    var $chart = $summaryPage.find('.price-chart-container').html('<canvas/>');
    var chartCtx = $chart.find('canvas').get(0).getContext('2d');
    var chartColor = $('.navbar').css('background-color');
    var chartGradient = chartCtx.createLinearGradient(0, 0, 0, 150);
    chartGradient.addColorStop(0, chartColor);
    chartGradient.addColorStop(1, '#FFF');
    new Chart(chartCtx, {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [{
          data: chartData,
          fill: 'start',
          borderWidth: 3,
          pointRadius: 0,
          pointHitRadius: 16,
          borderColor: chartColor,
          pointBackgroundColor: chartColor,
          backgroundColor: chartGradient
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {display: false},
        tooltips: {
          callbacks: {
            title: function(tooltipItem, data) {
              return formatDate(tooltipItem[0].xLabel);
            },
            label: function(tooltipItem, data) {
              return formatPrice(tooltipItem.yLabel, window.SETTINGS.currency);
            }
          }
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          xAxes: [{
            display: false,
            type: 'time',
            ticks: {source: 'labels'},
            gridLines: {display: false}
          }],
          yAxes: [{
            display: false,
            gridLines: {display: false}
          }]
        }
      }
    });
  }


  /* UPDATE CHART EVENT */
  $summaryPage.find('.btn-refresh').click(function() {
    updateExchangeData();
  });
  $summaryPage.on('pagination:load', function() {
    renderChart();
  });

  /* ON HISTORY PAGE LOAD */
  $('section[data-page="history"]').on('pagination:load', function() {
    $(this).find('table').DataTable().draw();
  });


  /* REFRESH BUTTON EVENT */
  $('.navbar .navbar-refresh').click(function() {
    if ($(this).hasClass('loading')) return;
    reloadWallet();
  });


  /****************************************************************************/


  /**
   * Render receive page
   * @param {string} addr  Latest unused address
   * @param {Number} index Address index
   */
  function renderReceivePage(addr, index) {
    var $receivePage = $('section[data-page="receive"]');
    var checksum = iota.utils.addChecksum(addr).slice(-9);

    // Render address and QR code
    $receivePage.find('.address-index').html(index);
    $receivePage.find('.address-text').html(addr + '<span class="text-muted">' +
      checksum + '</span>').data('value', addr);
    var $qr = $receivePage.find('.address-qr').empty();
    new QRCode($qr.get(0), {
      text: addr + checksum,
      correctLevel : QRCode.CorrectLevel.M
    });
    $qr.removeAttr('title');

    // Update button
    $receivePage.find('.address-btn').addClass('btn-outline-primary')
      .removeClass('btn-outline-secondary')
      .html('Attach to The Tangle');

    // Get latest transactions for this address
    updateReceiveTransactions();
  }


  /**
   * Update receive transactions
   */
  function updateReceiveTransactions() {
    var $receivePage = $('section[data-page="receive"]');
    var index = Number($receivePage.find('.address-index').text());
    var addr = $receivePage.find('.address-text').data('value');
    var $list = $receivePage.find('.transactions-list');

    // Get latest transfers
    $list.html('<p class="text-muted text-center my-5">Getting transactions...</p>');
    iota.api.getTransfers(SEED, {start: index, end: index}, function(error, res) {
      if (res.length > 0) {
        var tHTML = '<table class="table table-striped table-receive">' +
          '<thead>' +
            '<tr><th>Hash</th><th>Amount</th></tr>' +
          '</thead>' +
          '<tbody>';
        res.forEach(function(bundle) {
          bundle.forEach(function(tx) {
            if (tx.address !== addr) return;
            tHTML +=
              '<tr>' +
                '<td><a href="' + window.SETTINGS.explorer + 'transaction/' + tx.hash + '" target="_blank">' + tx.hash + '</a></td>' +
                '<td>' + formatIotas(tx.value) + '</td>' +
              '</tr>';
          });
        });
        tHTML += '</tbody></table>';
        $list.html(tHTML);
      } else {
        $list.html('<p class="text-muted text-center my-5">No transactions yet</p>');
      }
    });
  }


  /* REFRESH BUTTON EVENT */
  $('section[data-page="receive"] .refresh-btn').click(function() {
    updateReceiveTransactions();
  });


  /* RECEIVE BUTTON EVENT */
  $('section[data-page="receive"] .address-btn').click(function() {
    var $this = $(this);
    if ($this.hasClass('btn-outline-primary')) { // Attach to The Tangle
      var $modal = $('.modal-attaching').modal('show');
      var addr = $this.closest('section').find('.address-text').data('value');
      window.sendTransaction({
        address: addr,
        value: 0,
        tag: ''
      }, function(error, bundle) {
        $modal.modal('hide');
        if (error) {
          $('.modal-attach-error').modal('show');
        } else {
          $this.removeClass('btn-outline-primary').addClass('btn-outline-secondary')
            .html('Generate a new address');
          updateReceiveTransactions();
        }
      });
    } else { // Get next address
      var nextIndex = $this.closest('section').find('.address-index').text();
      nextIndex = Number(nextIndex) + 1;
      iota.api.getNewAddress(SEED, {
        index: nextIndex,
        checksum: false
      }, function(error, nextAddr) {
        renderReceivePage(nextAddr, nextIndex);
      });
    }
  });

})();
