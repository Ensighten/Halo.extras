define(['jqueryp!'], function ($) {
  var TOGGLE_CLASS = 'isChecked';
  function Toggle(item) {
    var $item = $(item),
        that = this;

    this.$item = $item;

    // When the item is clicked, toggle it
    $item.on('click', function () {
      that.toggle();
    });
  }
  Toggle.prototype = {
    'toggle': function () {
      // If we are toggled, uncheck
      if (this.$item.hasClass(TOGGLE_CLASS)) {
        this.uncheck();
      } else {
      // Otherwise, check
        this.check();
      }
    },
    'check': function () {
      var $item = this.$item;

      // Add the toggle class
      $item.addClass(TOGGLE_CLASS);

      // Fire an event
      $item.trigger('toggle');
      $item.trigger('check');
    },
    'uncheck': function () {
      var $item = this.$item;

      // Remove the toggle class
      $item.removeClass(TOGGLE_CLASS);

      // Fire an event
      $item.trigger('toggle');
      $item.trigger('uncheck');
    }
  };

  // Expose the module
  $.exportModule('toggle', Toggle);

  return Toggle;
});