define(['jqueryp!onchange!bodyerror', 'templatez', 'nimble'], function ($, templatez, nimble) {
  var regexpRule = function (regexp, msg) {
        function regexpFn(str) {
          var matches = regexp.test(str);
          return matches || msg;
        }
        return regexpFn;
      },
      rules = {
        // Errors are read: {{name}} ... (can only, must contain, does not)
        'alpha': regexpRule(/^[A-Za-z]*$/, 'can only contain alphabetic characters'),
        'numeric': regexpRule(/^[0-9]*$/, 'can only contain numeric characters'),
        'alphanum': regexpRule(/^[A-Za-z0-9]*$/, 'can only contain alphanumeric characters'),
        'special': regexpRule(/[^A-Za-z0-9]/, 'must contain a special character'),
        'hasNumber': regexpRule(/[0-9]/, 'must contain a number'),
        'uppercase': regexpRule(/[A-Z]/, 'must contain an uppercase character'),
        'lowercase': regexpRule(/[a-z]/, 'must contain a lowercase character'),
        'noSpaces': regexpRule(/^[^ ]*$/, 'cannot contain a space'),
        'len8': function (str) {
          var len = str.length,
              isValid = len > 8;
          return isValid || 'must be at least 8 characters in length';
        },
        'nonempty': regexpRule(/./, 'must be non-empty')
      },
      _ = nimble;
  function validate(input) {
    // Wrap and save the input
    var $input = $(input),
        that = this;
    this.$input = $input;

    // Create a rules array
    this.rules = [];

    // If there are validation rules (e.g. data-validate-rules="alphanum len8"), use them
    var ruleStr = $input.data('validate-rules') || '',
        rules = ruleStr.split(/\s+/g);
    _.each(rules, function (rule) {
      if (rule) {
        that.addRule(rule);
      }
    });

    // When validation fails, track by onchange to validate
    var isFailing = false;
    $input.on('fail', function () {
      // If we are already failing, don't do anything
      if (isFailing) { return; }

      // Update failing status
      isFailing = true;

      $input.onchange(function () {
        that.validate();
      });

      // When the input loses focus
      $input.on('blur', function () {
        // If the input is passing, stop listening to our onchange
        var isPassing = that.passes();
        if (isPassing) {
          $input.offchange();
          isFailing = false;
        }
      });
    });

    // When the input is blurred, run validation
    $input.on('blur', function () {
      that.validate();
    });

    // Validate now
    this.validate();
  }
  validate.prototype = {
    'addRulePreset': function (preset) {
      // Look up a rule preset
      var preset = rules[preset];

      // If the preset does not exist, throw an error
      if (preset === undefined) {
        throw new Error('Validate preset does not exist: ' + preset);
      }

      // Otherwise, add it to the rules
      this.addRuleFn(preset);
    },
    'addRuleFn': function (fn) {
      // Add the function to our rule set
      this.rules.push(fn);
    },
    'addRule': function (rule) {
      // If the rule is function, pass it as such
      if (typeof rule === 'function') {
        return this.addRuleFn(rule);
      } else {
      // Otherwise, add it from the map
        return this.addRulePreset(rule);
      }
    },
    'getErrors': function (str) {
      // Go over the rules
      var rules = this.rules,
          i = 0,
          len = rules.length,
          errors = [],
          result;

      for (; i < len; i++) {
        result = rules[i](str);
        // If the result is not true, add it to the errors
        if (result !== true) {
          errors.push(result);
        }
      }

      // Return the errors
      return errors;
    },
    'getValue': function () {
      return this.$input.val();
    },
    'passes': function () {
      // Collect the errors
      var val = this.getValue(),
          errors = this.getErrors(val),
          hasErrors = errors.length > 0,
          passes = !hasErrors;

      // Return the passes result
      return passes;
    },
    'fails': function () {
      return !this.passes();
    },
    'validate': function () {
      // Grab all of the errors
      var that = this,
          $input = this.$input,
          val = this.getValue(),
          errors = this.getErrors(val),
          renderErrors = _.map(errors, function (err) {
            return that.renderError(err);
          }),
          errorStr = '&nbsp;',
          errorCount = errors.length,
          isFailing = errorCount > 0;

      // If there is more than one error, make it and'd statement
      if (errorCount > 1) {
        renderErrors[errorCount - 1] = 'and ' + renderErrors[errorCount - 1];
      }
      errorStr = '{{name}} ' + renderErrors.join(', ') + '.';
      errorStr = this.renderError(errorStr);

      // Update failing status
      this.isPassing = !isFailing;
      this.isFailing = isFailing;

      // If we are now failing, announce a fail with the message
      if (isFailing) {
        $input.trigger('fail', errorStr);
        $input.trigger('error', errorStr);
      } else {
      // Otherwise, announce a pass
        $input.trigger('pass');
      }
    },
    'renderError': function (str) {
      // Get the keys from the str
      var keys = templatez.keys(str),
          $input = this.$input,
          data = {};

      // Save the corresponding value to data
      _.each(keys, function (key) {
        var val = $input.data(key) || $input.attr(key) || $input.prop(key);
        data[key] = val;
      });

      // Render the error
      var retVal = templatez(str, data);
      return retVal;
    }
  };

  // Export validate as a jQuery module
  $.exportModule('validate', validate);

  // Return validate
  return validate;
});