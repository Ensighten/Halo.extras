define(['Sauron', 'jqueryp!'], function (Sauron, $) {
  function requiredom(fn) {
    // Save a reference to this
    var that = this,
        $that = $(that),
        body = document.body,
        SauronChannel = 'dom/insert',
        timeoutId;

    // Set up a helper to determine if the element is in the DOM or not
    function inDOM() {
      var closestBody = $that.closest(body),
          isInDOM = !!closestBody.length;
      return isInDOM;
    }

    // Create a Sauron function
    function SauronListener() {
      var isInDOM = inDOM();

      // If we are in the DOM, fire the fn
      if (isInDOM) {
        fn.call(that);
        unbindListeners();
      }
    }

    // Set up an unbind helper
    function unbindListeners() {
      if (timeoutId) {
        clearTimeout(timeoutId);
        Sauron.off(SauronChannel, SauronListener);
      }
    }

    // Check that the item is in the DOM
    function checkInDOM() {
      var isInDOM = inDOM();

      // If we are in the DOM, fire the fn
      if (isInDOM) {
        fn.call(that);
      } else {
      // Otherwise, check again in 100ms
        timeoutId = setTimeout(checkInDOM, 100);
      }
    }

    // Set up a Sauron listener for DOM insertions
    Sauron.on(SauronChannel, SauronListener);

    // Run checkInDOM
    checkInDOM();

    // Return this for a fluent interface
    return this;
  }

  function requiredomEach(fn) {
    // Bind requiredom to each item
    this.each(function () {
      requiredom.call(this, fn);
    });

    // Return this for a fluent interface
    return this;
  }

  // Expose requiredomEach as a jQuery plugin
  $.fn.requiredom = requiredomEach;

  // Return requiredomEach
  return requiredomEach;
});