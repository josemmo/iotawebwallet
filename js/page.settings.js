(function() {

  var _ls_settings_key = 'settings';
  var $page = $('section[data-page="settings"]');

  /* INITIALIZE APP SETTINGS */
  window.SETTINGS = {
    decimals: '.',
    thousands: ',',
    currency: 'USD',
    date: 'YYYY-MM-DD',
    time: 'H:mm',
    explorer: 'https://thetangle.org/',
    main_node: 'https://nodes.iota.fm:443',
    fallback_node: 'https://durian.iotasalad.org:14265'
  };
  var savedSettings = localStorage.getItem(_ls_settings_key);
  if (savedSettings !== null) {
    savedSettings = JSON.parse(savedSettings);
    for (var property in savedSettings) {
      window.SETTINGS[property] = savedSettings[property];
    }
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
