(function() {

  var _ls_settings_key = 'settings';
  var $page = $('section[data-page="settings"]');

  /* INITIALIZE APP SETTINGS */
  var DEFAULT_NODES = {
    main: 'https://nodes.iota.fm:443',
    fallback: 'https://pool.iota.dance:443'
  }
  window.SETTINGS = {
    decimals: '.',
    thousands: ',',
    currency: 'USD',
    date: 'YYYY-MM-DD',
    time: 'H:mm',
    explorer: 'https://thetangle.org/',
    auto_nodes: true
  };
  var savedSettings = localStorage.getItem(_ls_settings_key);
  if (savedSettings !== null) {
    savedSettings = JSON.parse(savedSettings);
    for (var property in savedSettings) {
      window.SETTINGS[property] = savedSettings[property];
    }
  }

  // Force nodes in auto mode
  if (window.SETTINGS.auto_nodes) {
    window.SETTINGS.main_node = DEFAULT_NODES.main;
    window.SETTINGS.fallback_node = DEFAULT_NODES.fallback;
  }


  /* WRITE SETTINGS TO DOM */
  $page.find('[name="number_formatting"]').val(window.SETTINGS.decimals + '|' +
    window.SETTINGS.thousands);
  $page.find('[name="date"]').val(window.SETTINGS.date);
  $page.find('[name="time"]').val(window.SETTINGS.time);
  $page.find('[name="currency"]').val(window.SETTINGS.currency);
  $page.find('[name="main_node"]').val(window.SETTINGS.main_node);
  $page.find('[name="fallback_node"]').val(window.SETTINGS.fallback_node);


  /* SAVE EVENT */
  $page.find('.btn-save').click(function() {
    var formatting = $page.find('[name="number_formatting"]').val().split('|');
    window.SETTINGS.decimals = formatting[0];
    window.SETTINGS.thousands = formatting[1];
    window.SETTINGS.date = $page.find('[name="date"]').val();
    window.SETTINGS.time = $page.find('[name="time"]').val();
    window.SETTINGS.currency = $page.find('[name="currency"]').val();
    var mainNode = $page.find('[name="main_node"]').val().trim();
    if (mainNode.length == 0) {
      $page.find('[name="main_node"]').addClass('is-invalid');
      return;
    }
    window.SETTINGS.main_node = mainNode;
    window.SETTINGS.fallback_node = $page.find('[name="fallback_node"]').val().trim();
    localStorage.setItem(_ls_settings_key, JSON.stringify(window.SETTINGS));
    window.location.reload();
  });


  /* NODE SETTINGS */
  var $nodes = $page.find('[data-section="nodes"]');
  var $nodesBtn = $nodes.find('.btn-nodes-switch');

  /**
   * Toggle auto mode
   * @param {boolean} enabled Enable or disable auto mode
   */
  function toggleAutoMode(enabled) {
    var $msg = $nodes.find('.auto-mode-msg');
    if (enabled) {
      $msg.show();
    } else {
      $msg.hide();
    }
    var btnText = $nodesBtn.data(enabled ? 'txtDisable' : 'txtEnable');
    $nodesBtn.text(btnText);
    $nodes.find('input[type="text"]').prop('readonly', enabled);
    window.SETTINGS.auto_nodes = enabled;
  }

  // Listen to switch button click
  $nodesBtn.click(function() {
    toggleAutoMode(!window.SETTINGS.auto_nodes);
  });

  // Load current type of settings
  toggleAutoMode(window.SETTINGS.auto_nodes);


  /* DELETE ALL EVENT */
  $('.modal-delete-all .btn-continue').click(function() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  });


  /* ON PAGE LOAD */
  $page.on('pagination:load', function(e, section) {
    $(this).find('[data-section]').removeClass('swatch-700');
    if (typeof section !== 'undefined') {
      var $section = $(this).find('[data-section="' + section + '"]');
      $section.addClass('swatch-700');
      setTimeout(function() {
        $section.removeClass('swatch-700');
      }, 300);
      $('html, body').animate({
        scrollTop: $section.offset().top - 100
      }, 300);
    }
  });

})();
