define(['jqueryp!'], function ($) {
  var EMPTY_MESSAGE = '&nbsp;';
  function validateField(item) {
    // Wrap and save the item
    var $item = $(item),
        $error = $item.find('.validateFieldError'),
        that = this;
    this.$item = $item;
    this.$error = $error;

    // If we have an error
    if ($error.length > 0) {
      // When we receive an error, stop it in its tracks
      $item.on('error', function (e) {
        e.stopPropagation();
      });

      // By default, assume we are passing and clear out the message
      this.isPassing = true;
      this.clear();

      // When we are passing, update isPassing and clear out the message
      $item.on('pass', function (evt) {
        that.clear();
      });

      // When we are failing, display the error as the status
      $item.on('fail', function (evt, err) {
        that.status(err);
      });
    }
  }
  validateField.prototype = {
    'status': function (msg) {
      this.$error.html(msg);
    },
    'clear': function () {
      this.status(EMPTY_MESSAGE);
    }
  };

  // Export validateField as a jQuery module
  $.exportModule('validateField', validateField);

  // Return validateField
  return validateField;
});