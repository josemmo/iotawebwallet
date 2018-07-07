$(function() {

  /**
   * Load page
   *
   * Refreshes the UI to display current page
   */
  function loadPage() {
    // Get path
    var localPath = window.location.hash.replace(/^#!\//, '').split('/');
    for (var i in localPath) {
      if (localPath[i].length == 0) localPath.splice(i, 1);
    }

    // Redirect to main page (in case of empty path)
    if (localPath.length == 0) {
      document.location.href = '#!/summary/';
      return;
    }

    // Update selected item in sidebar
    $('.sidebar .nav-link.active').removeClass('active');
    $('.sidebar .nav-link[href="#!/' + localPath[0] + '/"]').addClass('active');

    // Block certain pages in case wallet is unloaded
    var blocklist = ['summary', 'send', 'receive', 'history'];
    if (blocklist.indexOf(localPath[0]) > -1 && !window.isWalletLoaded()) {
      localPath[0] = 'unloaded';
    }

    // Switch renderer contents
    var $prevPage = $('.renderer section:visible');
    var $nextPage = $('.renderer section[data-page="' + localPath[0] + '"]');
    if ($prevPage.data('page') !== localPath[0]) {
      $prevPage.css('display', '');
      $nextPage.show();
    }

    // Trigger load event
    var params = localPath.slice(1);
    $nextPage.trigger('pagination:load', params);

    // Focus page section
    $nextPage.find('[data-section]').removeClass('swatch-700');
    if (params.length > 0) {
      var $section = $nextPage.find('[data-section="' + params[0] + '"]');
      if ($section.length > 0) {
        $section.addClass('swatch-700');
        setTimeout(function() {
          $section.removeClass('swatch-700');
        }, 300);
        $('html, body').animate({
          scrollTop: $section.offset().top - 100
        }, 300);
      }
    }
  }


  /* CATCH URL HASH CHANGES */
  $(window).on('hashchange', function() {
    loadPage();
  });


  /* PREVENT FORM SUBMIT */
  $('body').on('submit', 'form', function(e) {
    e.preventDefault();
  });


  /* INITIALIZE */
  loadPage();

});
