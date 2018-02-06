(function() {

  var $page = $('section[data-page="send"]');

  /**
   * Is valid address
   * @param  {string}  address Address
   * @return {Boolean}         Is valid
   */
  function isValidAddress(address) {
    return (new IOTA()).valid.isAddress(address);
  }


  /**
   * Is valid tag
   * @param  {string}  tag Tag
   * @return {Boolean}     Is valid
   */
  function isValidTag(tag) {
    var isTrytes = (new IOTA()).valid.isTrytes(tag);
    return (tag.length <= 27) && isTrytes;
  }


  /**
   * Encode message
   * @param  {string} message Message
   * @return {string}         Tryte-encoded message
   */
  function encodeMessage(message) {
    var rawMessage = (new IOTA()).utils.toTrytes(message);
    return (rawMessage.length <= 2187) ? rawMessage : false;
  }


  /* SEND BUTTON EVENT */
  $page.find('.btn-send').click(function() {
    var $form = $(this).closest('form');
    $form.find('input, select, textarea').removeClass('is-invalid');

    // Get values
    var address = $form.find('[name="address"]').val();
    var amount = $form.find('[name="amount"]').val();
    var unit = $form.find('[name="unit"]').val();
    var value = amount * unit;
    var tag = $form.find('[name="tag"]').val();
    var message = $form.find('[name="message"]').val();

    // Validate fields
    var canSend = true;
    if (!isValidAddress(address)) {
      $form.find('[name="address"]').addClass('is-invalid');
      canSend = false;
    }
    var maxAmount = $form.find('.max-iotas').data('value');
    if ((amount.length == 0) || (value < 0) || (value > maxAmount)) {
      $form.find('[name="amount"], [name="unit"]').addClass('is-invalid');
      canSend = false;
    }
    if ((tag.length > 0) && !isValidTag(tag)) {
      $form.find('[name="tag"]').addClass('is-invalid');
      canSend = false;
    }
    if (message.length > 0) {
      message = encodeMessage(message);
      if (message === false) {
        $form.find('[name="message"]').addClass('is-invalid');
        canSend = false;
      }
    }
    if (!canSend) return;

    // Detect confirmation
    var $btnSend = $(this);
    if (!$btnSend.hasClass('btn-secondary')) {
      $btnSend.addClass('btn-secondary').removeClass('btn-outline-primary')
        .html('Click again to confirm');
      return;
    }

    // Show loading modal
    var $loadingModal = $('.modal-sending-transaction').modal('show');

    // Send transaction
    var tx = {
      address: address,
      value: value,
      tag: tag,
      message: message
    };
    window.sendTransaction(tx, function(error, bundle) {
      // Change modal
      $loadingModal.modal('hide');
      if (error) {
        $('.modal-transaction-error').modal('show');
        console.error('Failed to send transaction', error);
      } else {
        var $modal = $('.modal-transaction-sent');
        $modal.find('.amount').html(window.formatIotas(value));
        $modal.find('.input-hash').val(bundle[0].bundle);
        $modal.find('.btn-view').attr('href', window.SETTINGS.explorer +
          'bundle/' + bundle[0].bundle);
        $modal.modal('show');

        // Restore page to its default state
        $form.find('input, textarea').val('');
        $form.find('input[data-default]').each(function() {
          $(this).val($(this).data('default'));
        });

        // Reload wallet
        $('.navbar .navbar-refresh').trigger('click');
      }

      // Restore send button
      $page.trigger('pagination:load');
    });
  });


  /* CONVERT UNITS */
  var prevUnit = 1;
  $page.find('select[name="unit"]').focus(function() {
    prevUnit = $(this).val();
  }).change(function() {
    var $amount = $(this).closest('form').find('[name="amount"]');
    var amount = $amount.val();
    if (amount.length == 0) return;

    // Convert value from previous unit to new unit
    var value = amount * prevUnit;
    var newUnit = $(this).val();
    value /= newUnit;
    prevUnit = newUnit;

    // Update value
    var step = Math.round(1 / $amount.attr('step'));
    value = Math.round(value * step) / step;
    $amount.val(value);
  });


  /* ON PAGE LOAD */
  $page.on('pagination:load', function(e, section) {
    var $btnSend = $(this).find('.btn-send');
    $btnSend.addClass('btn-outline-primary').removeClass('btn-secondary')
      .html('Send it!');
    $(this).find('form').find('input, select, textarea').removeClass('is-invalid');
  });

})();
