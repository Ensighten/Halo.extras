define(['jqueryp!'], function ($) {
  // Switcher is similar tabRow except it has the optional button and has an immutable collection
  function Switcher(switcher) {
    var $switcher = $(switcher),
        that = this;
    this.$swticher = switcher;

    // Find all of the switcherRows
    var $switcherRows = $switcher.find('.switcherRow');
    this.$switcherRows = $switcherRows;
    this.length = $switcherRows.length;

    // Get the selected row's index
    var selectedIndex = $switcherRows.index('.isSelected');

    // If there is no elements found, fallback to the first one
    if (selectedIndex === -1) {
      selectedIndex = 0;
    }

    // Select the row at the selectedIndex
    this.select(selectedIndex);

    // If there is a button, configure it to toggle next
    var $switcherBtn = $switcher.find('.switcherBtn');
    if ($switcherBtn.length > 0) {
      $switcherBtn.on('click', function () {
        that.next();
      });
    }
  }
  Switcher.prototype = {
    '$selectedRow': $(),
    'selectedIndex': 0,
    'next': function () {
      // Get the currently selected row, its index, and modulo next index
      var index = this.selectedIndex,
          nextIndex = (index + 1) % this.length;

      this.select(nextIndex);
    },
    'select': function (index) {
      var $selectedRow = this.$selectedRow,
          $switcherRows = this.$switcherRows,
          $nextRow = $switcherRows.eq(index);

      // TODO: Accept other formats for index

      // Deselect the current row
      $selectedRow.removeClass('isSelected');

      // Select the next row
      $nextRow.addClass('isSelected');

      // Save the selected row and index
      this.$selectedRow = $nextRow;
      this.selectedIndex = index;

      // Trigger a deselect, select, and change event
      $selectedRow.trigger('deselect');
      $nextRow.trigger('select');
      $switcherRows.trigger('change');

    }
  };

  $.exportModule('switcher', Switcher);
  
  return Switcher;
});