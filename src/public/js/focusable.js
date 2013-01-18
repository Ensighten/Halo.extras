define(['jqueryp!'], function ($) {
  var FOCUSED_CLASS = 'isFocused';
  function Focusable(item) {
    var $item = $(item),
        that = this;

    // Save $item for later
    this.$item = $item;

    // TODO: If the focusable is exclusive, work with a new class called focusableExclusive which listens to the body(?) for focus events and auto-blurs on any other focus.
    // Alternatively, could keep a stack of all other focused items via $().add($item) or... just have each focusable fire a static class function

    // Whenever the item is clicked on, focus it
    $item.on('click', function () {
      that.focus();
    });
  }
  Focusable.prototype = {
    'focus': function () {
      // Add the focused class to the item
      var $item = this.$item;
      $item.addClass(FOCUSED_CLASS);

      // Fire a focused event (because focus is standard)
      $item.trigger('focused');
    },
    'blur': function () {
      // Remove the focused class to the item
      var $item = this.$item;
      $item.removeClass(FOCUSED_CLASS);

      // Fire a blurred event (because blur is standard)
      $item.trigger('blurred');
    }
  };

  // Export the module
  $.exportModule('focusable', Focusable);

  return Focusable;
});