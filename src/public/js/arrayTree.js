define(function () {
  // Array tree constructor -- tree structure for maintaining similar structured arrays
  function ArrayTree() {
    this.memory = {};
  }

  ArrayTree.prototype = {
    // Getter method which creates an array if it does not exist
    'get': function (key) {
      var memory = this.memory,
          arr = memory[key];

      // If there is no item, create it
      if (arr === undefined) {
        arr = [];
        memory[key] = arr;
      }

      // Return the item
      return arr;
    },
    // Adder method to push items onto arrays
    'add': function (key, val) {
      var arr = this.get(key);
      arr.push(val);
    },
    // Removal method for take items out of arrays
    'remove': function (key, val) {
      var arr = this.get(key),
          i = arr.length;

      // Loop through the array
      while (i--) {
        if (arr[i] === val) {
          arr.splice(i, 1);
        }
      }
    },
    // Deletion method for an entire item
    'delete': function (key) {
      delete this.memory[key];
    },
    // Clear out the memory
    'clear': function () {
      this.memory = {};
    }
  };

  return ArrayTree;
});