define(['jqueryp!'], function ($) {
  var $body = $('body');

  function Tooltip(item) {
    var $item = $(item),
        that = this,
        timeout,
        mouseHasNotLeft = false;
    this.$item = item;

    // Generate a hover item
    var $tooltipHover = $('<div/>');
    $tooltipHover.addClass('tooltipHover');
    $tooltipHover.text($item.text());
    $tooltipHover.css('cursor', $item.css('cursor'));
    this.$tooltipHover = $tooltipHover;

    // When the mouse enters the item
    $item.on('mouseenter', function () {
      // If the mouse has not left, don't do anything
      if (mouseHasNotLeft) {
        return;
      }

      // Wait a few milliseconds (for intent) and show the hover
      timeout = setTimeout(function () {
        that.show();
      }, 600);
    });

    // When the mouse leaves the item, clear out the timeout if it exists
    $item.on('mouseleave', function () {
      // If there is a timeout, clear it
      if (timeout) {
        clearTimeout(timeout);
      }

      // Update mousehasNotLeft
      mouseHasNotLeft = false;
    });

    // When the mouse leaves the tooltip, remove it from the dom
    $tooltipHover.on('mouseleave', function () {
      that.hide();
    });

    // // When the hover is clicked on, hide it and pass through the event
    $tooltipHover.on('click', function (e) {
      mouseHasNotLeft = true;
      that.hide();
      $item.click();
    });
  }
  Tooltip.prototype = {
    'show': function () {
      // Grab the item, hover, and its offset
      var $item = this.$item,
          $tooltipHover = this.$tooltipHover,
          offset = $item.offset(),
          fontSize = $item.css('fontSize'),
          fontWeight = $item.css('fontWeight');

      // Set position absolute and the offset properties (should be faster than jQuery.offset)
      $tooltipHover.css({
        'position': 'absolute',
        'top': offset.top - 3, /* 2 for padding, 1 for border */
        'left': offset.left - 4, /* 3 for padding, 1 for border */
        'fontSize': fontSize,
        'fontWeight': fontWeight
      });
      $body.append($tooltipHover);

      // Trigger an event
      $item.trigger('tooltipshow');
    },
    'hide': function () {
      // Remove the tooltipHover from the DOM (but not jQuery -- fucking remove)
      this.$tooltipHover.detach();

      // Trigger an event
      this.$item.trigger('tooltiphide');
    }
  };

  $.exportModule('tooltip', Tooltip);

  return Tooltip;
});