define(function () {
  var Helper = {
    // Attribution to underscore.js
    'escape': function (string) {
      return (''+string).replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
    },
    'isSecure': location.protocol === 'https:',
    'fancyFilter': function (searchStr, filterStr) {
      var i,
          wordsArr = filterStr.split(/\s+/g),
          word,
          regexpArr = [],
          regex,
          matchedAllRegexp = true,
          hasUpperCase,
          regexpFlags;

      // Create filters on an 'and' basis (for 'or' use .join('|'))
      for (i = wordsArr.length; i--;) {
        word = wordsArr[i];

        // If the item uses upper case, be case sensitive. Otherwise, don't.
        hasUpperCase = !!word.match(/[A-Z]/),
        regexpFlags = hasUpperCase ? '' : 'i';

        // Generate the filter and push it onto the array
        regexpArr.push( new RegExp(word, regexpFlags) );
      }

      for (i = regexpArr.length; i--;) {
        // If the unused option matches the regexp
        if (!searchStr.match(regexpArr[i])) {
          matchedAllRegexp = false;
          break;
        }
      }

      return matchedAllRegexp;
    },
    'isArray': function (item) {
      return (Object.prototype.toString.call(item) === "[object Array]");
    },
    'deepCopy': function (item) {
      var itemType = typeof item,
          retItem,
          val;

      // If the item is not an object
      if (itemType !== 'object') {
        // If the item is a function
        if (itemType === 'function') {
          val = item + '';
          retItem = (new Function('return ' + val + ';'))();
        } else {
        // Otherwise, it is basic and already immutable (string, num, bool)
          retItem = item;
        }
      } else {
      // Otherwise
        // If the item is an array
        if (Helper.isArray(item)) {
          // Use slice of 0
          retItem = item.slice(0);
        } else {
        // Otherwise, iterate the keys
          retItem = {};
          for (val in item) {
            if (item.hasOwnProperty(val)) {
              // And deep clone those too
              retItem[val] = Helper.deepCopy(item[val]);
            }
          }
        }
      }

      return retItem;
    }
  };

  // Expose Helper to window for template
  window.Helper = Helper;

  return Helper;
});