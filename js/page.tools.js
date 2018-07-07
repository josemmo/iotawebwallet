(function() {

  var $page = $('section[data-page="tools"]');

  /**
   * Is valid transaction
   * @param  {string}  hash Transaction hash
   * @return {Boolean}      Is valid
   */
  function isValidTransaction(hash) {
    return (new IOTA()).valid.isHash(hash);
  }


  /* CONFIRM TRANSACTION */
  var $confirm = $page.find('[data-section="confirm"]');
  $confirm.find('.btn-confirm-transaction').click(function() {
    var $tx = $confirm.find('[name="transaction"]');
    var transaction = $tx.val();

    // Validate transaction hash
    if (!isValidTransaction(transaction)) {
      $tx.addClass('is-invalid');
      return;
    }

    // Show loading modal
    var $loadingModal = $('.modal-sending-transaction').modal('show');

    // Confirm transaction
    window.confirmTransaction(transaction, function(error, bundle) {
      $loadingModal.modal('hide');
      if (error) {
        $('.modal-transaction-error').modal('show');
        console.error('Failed to send transaction', error);
      } else {
        var $modal = $('.modal-transaction-confirmed');
        $modal.find('.input-hash').val(bundle[0].bundle);
        $modal.find('.btn-view').attr('href', window.SETTINGS.explorer +
          'bundle/' + bundle[0].bundle);
        $modal.modal('show');

        // Restore page to its default state
        $tx.val('');
      }
    });
  });


  /* ON PAGE LOAD */
  $page.on('pagination:load', function(e, section, transaction) {
    $(this).find('input').removeClass('is-invalid');
    if (section == 'confirm') {
      $confirm.find('[name="transaction"]').val(transaction);
    }
  });

})();
