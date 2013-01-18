define(['jqueryp!'], function ($) {
  function Generator(generator) {
    var $generator = $(generator),
      that = this;
    this.$generator = generator;

    // Grab the base row, clone it, and save it into memory
    var $generatorRows = $generator.children('.generatorRow'),
      $baseRow = $generatorRows.filter('.generatorRowBase').first();
    // If there is no baseRow
    if ($baseRow.length === 0) {
      // If there is only one generatorRow, fallback to it
      if ($generatorRows.length === 1) {
        $baseRow = $generatorRows;
      } else {
      // Otherwise, throw an error
        throw new Error('No base row for generator could be found');
      }
    }
    this.$baseRow = $baseRow.clone(true);

    // When a generatorBtnAdd is clicked on
    $generator.on('click', '.generatorBtnAdd', function (e) {
      // Stop the event from propagating
      e.stopPropagation();

      // Generate a new row
      that.add();
    });

    // When a generatorBtnRemove is clicked on
    $generator.on('click', '.generatorBtnRemove', function (e) {
      // Stop the event from propagating
      e.stopPropagation();

      var $removeBtn = $(this),
      // Find the row that is being removed
          $removeRow = $removeBtn.closest('.generatorRow');

      // Remove it
      that.remove($removeRow);
    });

    // Check which rows should have add/remove buttons and which should not
    this.check();
  }
  Generator.prototype = {
    'check': function () {
      var $generator = this.$generator,
          $generatorRows = $generator.children('.generatorRow').not('.hide, .isHidden'),
          $generatorAddBtns = $generatorRows.find('.generatorBtnAdd'),
          $generatorRemoveBtns = $generatorRows.find('.generatorBtnRemove');

      // If there is only one row
      if ($generatorRows.length === 1) {
        // It does not have a remove button
        $generatorRemoveBtns.addClass('isHidden');

        // It does have an add button
        $generatorAddBtns.removeClass('isHidden');
      } else {
      // Otherwise
        // Every row can be removed
        $generatorRemoveBtns.removeClass('isHidden');

        // and the last row has an 'add' button
        var $lastRow = $generatorRows.last(),
          $lastAddBtn = $lastRow.find('.generatorBtnAdd');

        $generatorAddBtns.not($lastAddBtn).addClass('isHidden');
        $lastAddBtn.removeClass('isHidden');
      }
    },
    'add': function () {
      // Generate a new row
      var $baseRow = this.$baseRow,
        $newRow = $baseRow.clone(true),
        $generator = this.$generator;

      //base rows may be hidden, so make sure we're visible
      $newRow.removeClass('isHidden hide');

      // and append it to the collection of rows
      $generator.append($newRow);

      // Run check again
      this.check();

      // Fire an add event for the added row
      $generator.trigger('rowadd', $newRow);
    },
    /**
     * Remove function for generator rows
     * @param {Number|HTMLElement|jQueryCollection} index Element to remove
     */
    'remove': function (index) {
      var $generator = this.$generator,
          $elt = index;

      // If the $elt is a number
      if (typeof $elt === 'number') {
        // Get the row corresponding to the index
        var $generatorRows = $generator.children('.generatorRow');
        $elt = $generatorRows.eq(index);
      }

      // Remove the row
      $elt.remove();

      // Run check again
      this.check();

      // Fire a remove event
      $generator.trigger('rowremove');
    },
    'removeAll': function () {
      var $generator = this.$generator;

      // Get all rows
      var $generatorRows = $generator.children('.generatorRow');

      // Remove the rows
      $generatorRows.remove();

      // Run check again
      this.check();

      // Fire an all remove event
      $generator.trigger('allrowremove');
    }
  };

  // Export the module
  $.exportModule('generator', Generator);

  return Generator;
});