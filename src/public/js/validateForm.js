define(['jqueryp!', 'validateField', 'nimble'], function ($, validateField, nimble) {
  // TODO: validateFormError is UNTESTED
  var _ = nimble;
  function validateForm(item) {
    // Wrap and save the item and its fields
    var $item = $(item),
        $inputs = $item.find('.validateInput'),
        $fields = $item.find('.validateField'),
        $error = $item.find('.validateFormError'),
        that = this;
    this.$item = $item;
    this.$fields = $fields;
    this.$inputs = $inputs;

    // If we have an error
    if ($error.length > 0) {
      // When we receive an error, stop it and show the error
      $item.on('error', function (e, err) {
        e.stopPropagation();
        that.status(err);
      });
    }
  }
  validateForm.prototype = _.extend({
    'validate': function () {
      // Run validation on every input
      var $inputs = this.$inputs,
          $fields = this.$fields,
          isPassing = true;
      $inputs.validate('validate');

      // Check that every input is passing
      $inputs.each(function () {
        isPassing = isPassing && $(this).validate('isPassing');
      });

      // Check that every field is passing
      $fields.each(function () {
        isPassing = isPassing && $(this).validateField('isPassing');
      });

      // Return the result
      return isPassing;
    }
  }, validateField.prototype);

  // Export validateForm as a jQuery module
  $.exportModule('validateForm', validateForm);

  // Return validateForm
  return validateForm;
});