define(['jqueryp!'], function ($) {
  var COLLAPSED_CLASS = 'isCollapsed';
  function Expand(container) {
    var $container = $(container),
        $content = $container.find('.expandContent'),
        that = this;

    this.$container = $container;
    this.$content = $content;

    // When the head is clicked, toggle this
    $container.find('.expandHead').first().on('click', function () {
      that.toggle();
    });

    // If the container has the collapsed class, collapse the content now
    if ($container.hasClass(COLLAPSED_CLASS)) {
      $content.hide();
    }
  }
  Expand.prototype = {
    'expand': function () {
      var $container = this.$container;
      $container.removeClass(COLLAPSED_CLASS);
      this.$content.slideDown(150);
      $container.trigger('expand');
    },
    'collapse': function () {
      var $container = this.$container;
      $container.addClass(COLLAPSED_CLASS);
      this.$content.slideUp(150);
      $container.trigger('collapse');
    },
    'toggle': function () {
      if (this.$container.hasClass(COLLAPSED_CLASS)) {
        this.expand();
      } else {
        this.collapse();
      }
    }
  };

  // Export the module to jQuery
  $.exportModule('expand', Expand);

  return Expand;
});