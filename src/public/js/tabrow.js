define(['jqueryp!'], function ($) {
  var $empty = $();

  function _internal(fn) {
    var args = [].slice.call(arguments);
    this.internal = (this.internal || 0) + 1;
    fn.call(this, args);
    this.internal -= 1;
  }

  function _ifNotInternal(fn) {
    if (!!this.internal) {
      var args = [].slice.call(arguments);
      fn.call(this, args);
    }
  }

  function TabRow(row) {
    var $row = $(row),
        $tabs = $row.find('.tab'),
        that = this;

    this.$row = $row;
    this.$tabs = $tabs;
    this.$selectedTab = $empty;

    // Select the first tab
    this.select(0);

    // Set up binding for the tab select
    $row.on('click', '.tab', function () {
      that.select(this);
    });
  }
  TabRow.prototype = {
    '_internal': _internal,
    '_ifNotInternal': _ifNotInternal,
    'addTab': function (tab) {
      var $row = this.$row,
          $tab = $(tab);

      // Add the class to the tab
      $tab.addClass('tab');

      // Attach it to the row
      this.$row.append($tab);

      // Requery the tabs (.add was giving me shit)
      this.$tabs = $row.find('.tab');
    },
    'select': function (index) {
      // If the index is a number, select the tab at that index
      var $tabs = this.$tabs,
          $selectedTab;

      if (typeof index === 'number') {
        $selectedTab = $tabs.eq(index);
      } else {
        // Otherwise, select that tab explicitly
        $selectedTab = $tabs.filter($(index));
      }

      // If the $selectedTab is the currently selected tab, do nothing
      if ($selectedTab.is(this.$selectedTab)) {
        return;
      }

      // Save the index as a property of the row
      this.$row.prop('selectedIndex', this.$row.index($selectedTab));

      // Deselect the last tab
      this._internal(this.deselect);

      // Select the new tab
      this.$selectedTab = $selectedTab;

      // Add a selected class and property to the current tab
      $selectedTab.addClass(/*'isSelected'*/'active');
      $selectedTab.prop('selected', true);

      // Fire onselect event on the selected tab
      $selectedTab.trigger('select');

      // Fire onchange event on the row
      this._ifNotInternal(function () {
        this.$row.trigger('change');
      });
    },
    'deselect': function () {
      // Take the currently selected tab
      var $deselectedTab = this.$selectedTab;

      // Replace it with an empty slot
      this._ifNotInternal(function () {
        this.$selectedTab = $empty;
      });

      // Remove the class and property
      $deselectedTab.removeClass(/*'isSelected'*/'active');
      $deselectedTab.removeProp('selected');

      // Fire a deselect event
      $deselectedTab.trigger('deselect');

      // Fire an onchange event on the row
      this._ifNotInternal(function () {
        this.$row.trigger('change');
      });
    }
  };

  // Expose the module
  $.exportModule('tabrow', TabRow);

  return TabRow;
});