(function() {

  var _ls_wallet_key = 'wallets';

  /**
   * Is valid seed
   * @param  {string}  seed Seed
   * @return {Boolean}      Is valid
   */
  function isValidSeed(seed) {
    return (new IOTA()).valid.isTrytes(seed, 81);
  }


  /**
   * Encrypt
   * @param  {string} payload Text to encrypt
   * @param  {string} pass    Passphrase
   * @return {string}         Encrypted Base64 string
   */
  function encrypt(payload, pass) {
    return CryptoJS.AES.encrypt(payload, pass).toString();
  }


  /**
   * Decrypt
   * @param  {string} encryptedPayload Text to decrypt
   * @param  {string} pass             Passphrase
   * @return {string}                  Decrypted text
   */
  function decrypt(encryptedPayload, pass) {
    try {
      var res = CryptoJS.AES.decrypt(encryptedPayload, pass).toString(CryptoJS.enc.Utf8);
      return isValidSeed(res) ? res : null;
    } catch (e) {
      return null;
    }
  }


  /**
   * Get encrypted seeds
   * @param  {Boolean} isSessionOnly Is session only
   * @return {object}                Encrypted seeds
   */
  function getEncryptedSeeds(isSessionOnly) {
    if (typeof isSessionOnly == 'undefined') {
      return getEncryptedSeeds(true).concat(getEncryptedSeeds(false));
    } else {
      var storage = isSessionOnly ? sessionStorage : localStorage;
      var wallets = storage.getItem(_ls_wallet_key);
      return (wallets === null) ? [] : JSON.parse(wallets);
    }
  }


  /**
   * Sort wallets array
   * @param  {object} wallets Wallets array
   */
  function sortWalletsArray(wallets) {
    wallets.sort(function(a, b) {
      return (a.name == b.name) ? 0 : +(a.name > b.name) || -1;
    });
  }


  /**
   * Add wallet
   * @param {string}  name          Wallet name
   * @param {string}  seed          Wallet seed
   * @param {string}  pass          Passphrase
   * @param {Boolean} isSessionOnly Is session only
   */
  function addWallet(name, seed, pass, isSessionOnly) {
    // Add wallet to existing array
    var wallets = getEncryptedSeeds(isSessionOnly);
    wallets.push({
      name: name,
      seed: encrypt(seed, pass),
      isSessionOnly: isSessionOnly
    });
    sortWalletsArray(wallets);

    // Save new array
    var storage = isSessionOnly ? sessionStorage : localStorage;
    storage.setItem(_ls_wallet_key, JSON.stringify(wallets));
  }


  /**
   * Delete wallet
   * @param {Boolean} isSessionOnly Is session only
   * @param {Number}  index         Wallet index
   */
  function deleteWallet(isSessionOnly, index) {
    // Update wallets array
    var wallets = getEncryptedSeeds(isSessionOnly);
    wallets.splice(index, 1);

    // Save new array
    var storage = isSessionOnly ? sessionStorage : localStorage;
    if (wallets.length > 0) {
      storage.setItem(_ls_wallet_key, JSON.stringify(wallets));
    } else {
      storage.removeItem(_ls_wallet_key);
    }
  }


  /**
   * Update wallet
   * @param {Boolean} isSessionOnly Is session only
   * @param {Number}  index         Wallet index
   * @param {string}  name          New wallet name
   */
  function updateWallet(isSessionOnly, index, name) {
    // Update wallets array
    var wallets = getEncryptedSeeds(isSessionOnly);
    wallets[index].name = name;
    sortWalletsArray(wallets);

    // Save new array
    var storage = isSessionOnly ? sessionStorage : localStorage;
    storage.setItem(_ls_wallet_key, JSON.stringify(wallets));
  }


  /**
   * Render Wallet Dropdown
   * @return {string} Wallet Dropdown HTML
   */
  function renderWalletDropdown() {
    var wHTML = '<div class="list-group list-group-flush">';
    var isDisabled = $(this).hasClass('disabled');

    // Add wallets
    var wallets = getEncryptedSeeds();
    if (wallets.length > 0) {
      wallets.forEach(function(wallet, index) {
        if (isDisabled) {
          wHTML += '<a class="list-group-item text-muted">' + wallet.name + '</a>';
        } else {
          wHTML += '<a href="#" data-index="' + index + '" class="list-group-item list-group-item-action">' +
            wallet.name + '</a>';
        }
      });
    } else {
      wHTML += '<a class="list-group-item text-muted">No wallets found</a>';
    }

    // Add manage options
    wHTML += '<a href="#!/settings/wallets/" class="list-group-item list-group-item-action"><strong>Manage wallets</strong></a>';
    wHTML += '</div>';
    return wHTML;
  }


  /**
   * Render Wallet List
   *
   * Same as `renderWalletDropdown`, but for settings page
   */
  function renderWalletList() {
    var wHTML = '';
    var wallets = getEncryptedSeeds();
    if (wallets.length > 0) {
      wallets.forEach(function(wallet, index) {
        wHTML +=
          '<div class="row mt-2" data-session="' + (wallet.isSessionOnly ? 'true' : 'false') + '" data-index="' + index + '">' +
            '<div class="col align-self-center' + (wallet.isSessionOnly ? ' text-muted' : '') + ' text-truncate wallet-name">' +
              wallet.name.toHTML() +
            '</div>' +
            '<div class="col-auto align-self-center">' +
              '<button type="button" class="btn btn-outline-primary btn-sm mr-1 btn-edit-wallet">Edit</button>' +
              '<button type="button" class="btn btn-outline-danger btn-sm btn-delete-wallet">Delete</button>' +
            '</div>' +
          '</div>';
      });
    } else {
      wHTML += '<p class="text-center text-muted"><em>No wallets found</em></p>';
    }
    $('section[data-page="settings"] .wallet-list').html(wHTML);
  }


  /* DROPDOWN EVENTS */
  $('.navbar .navbar-wallet-dropdown').popover({
    content: renderWalletDropdown,
    html: true,
    template: '<div class="popover wallet-dropdown-popover" role="tooltip">' +
                '<div class="arrow"></div>' +
                '<div class="popover-body p-0"></div>' +
              '</div>',
    placement: 'bottom',
    trigger: 'focus'
  });

  $('body').on('click', '.wallet-dropdown-popover a[data-index]', function(e) {
    e.preventDefault();
    requestChangeWallet($(this).data('index'));
  });


  /* CHANGE WALLET */
  $('.modal-enter-password .btn-continue').click(function() {
    var $modal = $(this).closest('.modal');
    var $pass = $modal.find('input[name="passphrase"]');
    var index = $pass.data('index');
    var wallet = getEncryptedSeeds()[index];
    var seed = decrypt(wallet.seed, $pass.val());
    if (seed === null) {
      $pass.addClass('is-invalid');
    } else {
      changeWallet(index, seed);
      $modal.modal('hide');
    }
  });

  /**
   * Request change wallet
   * @param {Number} index Wallet index
   */
  function requestChangeWallet(index) {
    var wallet = getEncryptedSeeds()[index];
    var seed = decrypt(wallet.seed, '');
    if (seed === null) {
      var $modal = $('.modal-enter-password');
      $modal.find('.wallet-name').text(wallet.name);
      $modal.find('input[name="passphrase"]').data('index', index).val('')
        .removeClass('is-invalid');
      $modal.modal('show');
    } else {
      changeWallet(index, seed);
    }
  }

  /**
   * Change wallet
   * @param {Number} index Wallet index
   * @param {string} seed  Wallet seed
   */
  function changeWallet(index, seed) {
    var $subtitle = $('.navbar-wallet-dropdown .subtitle');
    var $refresh = $('.navbar .navbar-refresh');
    if (index < 0) {
      $subtitle.text('No wallet selected');
      $refresh.addClass('disabled');
      seed = null;
    } else {
      var wallet = getEncryptedSeeds()[index];
      $subtitle.text(wallet.name);
      $refresh.removeClass('disabled');
    }
    window.setIotaSeed(seed);
  }


  /* IMPORT WALLET */
  $('section[data-page="settings"] .btn-import-wallet').click(function() {
    openImportWalletModal();
  });

  /**
   * Open import wallet modal
   */
  function openImportWalletModal() {
    var $modal = $('.modal-import-wallet');
    $modal.find('[name]').removeClass('is-invalid').val('');
    $modal.modal('show');
  }


  /* CREATE NEW WALLET */
  $('.btn-new-wallet').click(function(e) {
    e.preventDefault();
    regenerateSeedTable();
    $('.modal-import-wallet').modal('hide');
    $('.modal-new-wallet').modal('show');
  });
  $('.modal-new-wallet .btn-regenerate').click(function() {
    regenerateSeedTable();
  });
  $('.modal-new-wallet .btn-continue').click(function() {
    var seed = $(this).closest('.modal').find('.seed-table').data('seed');
    regenerateSeedTable(); // As a security measure
    $('.modal-new-wallet').modal('hide');
    openImportWalletModal();
    $('.modal-import-wallet [name="seed"]').val(seed);
  });

  /**
   * Regenerate seed table
   */
  function regenerateSeedTable() {
    // Generate seed
    var seed = '';
    var dict = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var numbers = new Uint32Array(81);
    window.crypto.getRandomValues(numbers);
    for (var i in numbers) seed += dict[numbers[i] % dict.length];

    // Generate table HTML
    var tHTML = '', dim = 9;
    for (var col=0; col<dim; col++) {
      tHTML += '<tr>';
      for (var row=0; row<dim; row++) tHTML += '<td>' + seed[col*dim+row] + '</td>';
      tHTML += '</tr>';
    }
    $('.modal-new-wallet .seed-table').html(tHTML).data('seed', seed);
  }


  /* IMPORT WALLET */
  $('.modal-import-wallet .btn-import').click(function() {
    var $form = $(this).closest('.modal').find('form');
    $form.find('[name]').removeClass('is-invalid');

    // Get values
    var name = $form.find('[name="name"]').val().trim();
    var seed = $form.find('[name="seed"]').val();
    var pass = $form.find('[name="passphrase"]').val();
    var isSessionOnly = $form.find('[name="session"]').prop('checked');

    // Validate values
    var isValid = true;
    if (name.length == 0) {
      $form.find('[name="name"]').addClass('is-invalid');
      isValid = false;
    }
    var wallets = getEncryptedSeeds();
    for (var i in wallets) {
      if (wallets[i].name == name) {
        $form.find('[name="name"]').addClass('is-invalid');
        isValid = false;
        break;
      }
    }
    if (!isValidSeed(seed)) {
      $form.find('[name="seed"]').addClass('is-invalid');
      isValid = false;
    }

    // Create wallet
    if (isValid) {
      addWallet(name, seed, pass, isSessionOnly);
      renderWalletList();
      $(this).closest('.modal').modal('hide');
    }
  });


  /* EDIT/DELETE WALLET LIST */
  $('section[data-page="settings"] .wallet-list').on('click', '.btn-edit-wallet', function() {
    var $row = $(this).closest('.row');
    var $modal = $('.modal-edit-wallet');
    $modal.find('input[name="name"]').removeClass('is-invalid')
      .val($row.find('.wallet-name').text())
      .data('session', $row.data('session'))
      .data('index', $row.data('index'));
    $modal.modal('show');
  }).on('click', '.btn-delete-wallet', function() {
    var $row = $(this).closest('.row');
    var $modal = $('.modal-delete-wallet');
    $modal.find('.wallet-name').text($row.find('.wallet-name').text())
      .data('session', $row.data('session'))
      .data('index', $row.data('index'));
    $modal.modal('show');
  });

  $('.modal-edit-wallet .btn-continue').click(function() {
    var $modal = $(this).closest('.modal');
    var $walletName = $modal.find('input[name="name"]');
    var walletName = $walletName.val().trim();

    // Check wallet name is valid
    if (walletName.length == 0) {
      $walletName.addClass('is-invalid');
      return;
    }

    // Check wallet name is already in use
    var wallets = getEncryptedSeeds();
    for (var i in wallets) {
      if (wallets[i].name == walletName) {
        $walletName.addClass('is-invalid');
        return;
      }
    }

    // Update wallet
    updateWallet($walletName.data('session'), $walletName.data('index'),
      walletName);
    renderWalletList();
    $modal.modal('hide');
  });

  $('.modal-delete-wallet .btn-continue').click(function() {
    var $modal = $(this).closest('.modal');
    var $walletName = $modal.find('.wallet-name');
    deleteWallet($walletName.data('session'), $walletName.data('index'));

    // Change selected wallet in case of deleted one
    if ($walletName.text() == $('.navbar-wallet-dropdown .subtitle').text()) {
      changeWallet(-1);
    }

    renderWalletList();
    $modal.modal('hide');
  });


  /* INITIALIZE */
  renderWalletList();
  changeWallet(-1);

})();
