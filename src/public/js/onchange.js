define(['jqueryp!'], function ($) {
  // Onchange checks uses an asynchronous setTimeout loop to fire a function whenever an input changes without overloading the browser
  function onchange(fn) {
    var that = this,
        $that = $(that),
        timeoutId,
        lastVal = that.value,
        timeoutFn = function () {
          // Every 100ms, check for a change again
          checkForChange();
          timeoutId = setTimeout(timeoutFn, 100);
        },
        checkForChange = function () {
          // Get the value of the current input
          var val = that.value;

          // If it has changed, update the last val and trigger our function
          if (lastVal !== val) {
            lastVal = val;
            fn.call(that, val);
          }
        },
        unblurFn = function () {
          // Clear the timeout
          clearTimeout(timeoutId);
          
          // Unsubscribe from the blur watching
          $that.off('blur', blurFn);
        },
        blurFn = function () {
          // Check for change one last time
          checkForChange();

          // Unsubscribe the blur and timeout
          unblurFn();
        };
        
    // Save the focus function for unbinding
    function focusFn() {
      timeoutId = setTimeout(timeoutFn, 100);
      $that.on('blur', blurFn);
    }
    $that.data('_focusFn', focusFn);
    $that.data('_unblurFn', unblurFn);

    // When the item is focused, begin watching for changes
    $that.on('focus', focusFn);

    // Return this for a fluent interface
    return this;
  }
  
  // NOTE: This does not unbind all offchange functions -- only the most recent one
  function offchange() {
    var $this = $(this),
        focusFn = $this.data('_focusFn'),
        unblurFn = $this.data('_unblurFn');
    
    // Attempt to unbind the functions
    if (focusFn) { $this.off('focus', focusFn); }
    if (unblurFn) { unblurFn(); }
    
    // Remove the focusFn and unblurFn
    $this.data('_focusFn', null);
    $this.data('_unblurFn', null);
  }

  function onchangeEach(fn) {
    // Bind onchange to each item
    this.each(function () {
      onchange.call(this, fn);
    });

    // Return this for a fluent interface
    return this;
  }
  
  function offchangeEach() {
    this.each(offchange);
  }
  
  // Expose on onchangeEach to jQuery
  $.fn.onchange = onchangeEach;
  $.fn.offchange = offchangeEach;

  // Return onchangeEach
  return onchangeEach;
});