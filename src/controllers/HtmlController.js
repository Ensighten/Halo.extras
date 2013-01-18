define(['Sauron', 'jquery', 'mvc!c/BaseController', 'arrayTree', 'nimble'], function (Sauron, $, BaseController, ArrayTree, nimble) {
  var _ = nimble;
  function noop() {}
  function trueFn() { return true; }
  function autoCallback(callback) {
    callback();
  }

  /**
   * Constructor function for HTML controller
   * @param {Object} params Parameters to load into controller
   * @param {String} params.name Name of controller (used for pub/sub)
   * @param {Function} [params.start] Pub/sub method for starting controller
   * @param {Function} [params.stop] Pub/sub method for stopping controller
   * @param {String|String[]} [params.mixin] Items to mixin to start and stop methods (currently none available)
   */
  function HtmlController(params, callback) {
    // If there are mixins specified
    var mixinKey = params.mixin,
        mixinKeys = mixinKey,
        mixin,
        i,
        len;
    if (mixinKeys !== undefined) {
      // If the mixinKeys are a string, upcast to an array
      if (typeof mixinKeys === 'string') {
        mixinKeys = [mixinKey];
      }

      // Iterate the mixinKeys and attach them to params
      for (i = 0, len = mixinKeys.length; i < len; i++) {
        mixinKey = mixinKeys[i];
        mixin = MIXINS[mixinKey];

        // If the mixin exists
        if (mixin !== undefined) {
          // Attach it to params
          params = mixin(params);
        }
      }
    }

    var start = params.start || autoCallback,
        stop  = params.stop || autoCallback,
        $html;

    // Overwrite start method
    params.start = function (container) {
      // Collect all other arguments
      var args = [].slice.call(arguments, 1),
          argsLen = args.length,
          insertIndex = argsLen - 1,
          lastArg = args[argsLen - 1],
          callback = lastArg,
          $container = $(container);

      // If the last argument is not a callback
      if (typeof lastArg !== 'function') {
        // Overwrite the callback with noop and change the insertIndex
        callback = noop;
        insertIndex = argsLen;
      }

      // Inject our custom callback
      args[insertIndex] = function (html) {
        // Memoize arguments for callback
        var args = [].slice.call(arguments, 1);

        // Memoize $html for destruction
        $html = $(html);

        // Empty the previous container and callback when done
        $container.empty().append($html);

        // Announce that an insertion has occurred
        Sauron.voice('dom/insert', $html);

        // Callback with the arguments
        callback.apply(this, args);
      };

      // Invoke the original start method with our custom args
      start.apply(this, args);
    };

    // Overwrite stop method
    params.stop = function () {
      // Collect all arguments
      var args = [].slice.call(arguments),
          argsLen = args.length,
          insertIndex = argsLen - 1,
          lastArg = args[argsLen - 1],
          callback = lastArg;

      // If the last argument is not a callback
      if (typeof lastArg !== 'function') {
        // Overwrite the callback with noop and change the insertIndex
        callback = noop;
        insertIndex = argsLen;
      }

      // Inject callback
      args[insertIndex] = function () {
        // TODO: This uncomment this when we have free time to test
        // // Remove $html from its container
        // $html.remove();
        // Announce completion of destruction
        callback();
      };

      // Invoke the original stop method with our custom args
      stop.apply(this, args);
    };

    // TODO: Switch back
    // // Call BaseController with new start/stop methods
    // Sauron.createController('BaseController', params, function () {
      // var args = [].slice.call(arguments);
      // (callback || noop).apply(this, args);
    // });

    return BaseController(params);
  }

  var MIXINS = {
    'nav': function (params) {
      // Create a container for all mixin provided functions/data
      var nav = {},
          data = new ArrayTree();

      // Define event names for announcing updates and retrieving nav data
      var navKey = params.navKey || params.name,
          updateEvent = navKey + '/update',
          getDataEvent = navKey + '/get';

      // A Helper function for creating a focus event handler for filters
      function getToggleFn(key) {
        return function () {
          // Determine this checked status and the method to follow
          var $this = $(this),
              checked = $this.hasClass('isChecked'),
              method = checked ? 'add' : 'remove';

          // Update the data
          data[method](key, $this.data('id'));

          // Announce the update
          Sauron.voice(updateEvent, data);
        };
      }

      // Provide a bindFilter function that binds to the filter's
      // toggle event and updates the underlying data and fires an update
      // event
      nav.bindFilter = function (key, $filters) {
        $filters.on('toggle', getToggleFn(key));
      };

      // Provide a bindSearch function that binds to the search input's
      // onchange event and fires an update event
      nav.bindSearch = function ($search) {
        $search.onchange(function () {
          // Grab the fancyDefault val
          var val = $search.fancyDefault('value');

          // Delete the past search item
          data['delete']('search');

          // If the value is non-empty, save the search
          if (val) {
            data.add('search', val);
          }

          // Announce the update
          Sauron.voice(updateEvent);
        });
      };

      // When a get request is submitted, echo the data
      Sauron.on(getDataEvent, function (cb) {
        cb(data);
      });

      // Save the data to nav
      nav.data = data;

      // Attach our nav object to the params
      params.nav = nav;

      // When the controller is started
      var start = params.start || autoCallback;
      params.start = function () {
        // Clear out the data
        data.clear();

        // Continue as normal
        var args = [].slice.call(arguments);
        return start.apply(this, args);
      };

      return params;
    },

    // TODO: Complete me
    'autoFilter': function (params) {
      var filterKey = params.filterKey,
          navKey = filterKey + '/get';

      // If filterKey is undefined, throw an error
      if (filterKey === undefined) {
        throw new Error('params.filterKey is required for using the filter mixin (controllers/' + params.name + ')');
      }

      // TODO: Create params.autoFilter

        // // Grab the navData
        // Sauron.voice(navKey, function (navData) {
          // // NOTE: navData is designed to be an ArrayTree that holds the currently selected
          // // filters that we need to run our data against.

      // Return params now that we are all done
      return params;
    },

    'filter': function (params) {
      var filters = params.filters;

      // If there are no filters, throw an error
      if (filters === undefined) {
        throw new Error('params.filters is required for using the filter mixin (controllers/' + params.name + ')');
      }

      // Helper function to determine if filters exist at all
      function filtersExists(filterData) {
        var filtersFound = false,
            filterKeys = _.keys(filters);

        _.each(filterKeys, function (filterKey) {
          // Get the filter values
          var filterValues = filterData.get(filterKey);

          // If this is a search, access the first item
          if (filterKey === 'search') {
            filterValues = filterValues[0] || '';
          }

          // If there are filterValues, update filtersFound
          filtersFound = filtersFound || !!filterValues.length;
        });

        // Return filtersFound
        return filtersFound;
      }

      // Create our filter function
      function filter(dataArray, filterData, cb) {
        // By default, set retArr to dataArray
        var retArr = dataArray;

        // Handles generic filter logic and seperates the simple filter
        // case from the directive-based filter case
        function getFilter(filterName, itemKey) {
          // Get the filterValues from the filterData and by default, match everything
          var filterValues = filterData.get(filterName),
              filterFn = trueFn;

          // If there are filterValues to filter by
          if (filterValues.length) {
            // If there is a custom comparator, use it
            if (typeof itemKey === 'function') {
              // TODO: Revisit me for improvements (function flags don't fit here, neither does this.async())
              // The only other idea is params.nav.getFilters() but that is putting weight on the dev and not here
              // If the function has 3 parameters, it is async
              if (itemKey.length >= 3) {
                filterFn = function (item, cb) {
                  return itemKey.call(this, filterValues, item, cb);
                };
              } else {
              // Otherwise, assume not
                filterFn = function (item) {
                  return itemKey.call(this, filterValues, item);
                };
              }
            } else if (filterName === 'search') {
            // Otherwise, if this is a search filter, use a search function
              var searchNeedle = filterValues[0];

              // If there is no search, use trueFn
              if (searchNeedle.length === 0) {
                filterFn = trueFn;
              } else {
                // Otherwise, filter by the search
                filterFn = function (item) {
                  // If the needle is in the haystack, return true
                  // TODO: Use fancyFilter
                  var searchHaystack = item[itemKey];
                  if (searchHaystack.match(searchNeedle, 'i')) {
                    return true;
                  }

                  // Otherwise, return false (no match was found)
                  return false;
                };
              }
            } else {
            // Otherwise, use a single/many-to-many comparator
              filterFn = function (item) {
                // Get the property of the data
                var props = item[itemKey];

                // If props is not an array, promote it as one
                if (!$.isArray(props)) {
                  props = [props];
                }

                // Iterate the filterValues and the props, if a match is found, return early
                var i = filterValues.length,
                    filterValue,
                    j;
                while (i--) {
                  filterValue = filterValues[i];
                  j = props.length;
                  while (j--) {
                    if (filterValue === props[j]) {
                      return true;
                    }
                  }
                }

                // No matches have been found so return false
                return false;
              };
            }
          }

          // Return the filterFn
          return filterFn;
        }

        // If no filters exist, callback early
        if (filtersExists(filterData) === false) {
          cb(null, retArr);
        } else {
          // Otherwise, iterate the filters in series
          _.eachSeries(filters, function (itemKey, filterName, filters, cb) {
            // Get the filterFn for this filterName
            var _filterFn = getFilter(filterName, itemKey),
                filterFn = _filterFn;

            // If the filterFn is not async
            if (filterFn.length < 2) {
              filterFn = function (item, cb) {
                // Get the match
                var matches = _filterFn(item);

                // and callback with our match data
                cb(null, matches);
              };
            }

            // Run the filter on our retArr
            _.filter(retArr, filterFn, function (err, _retArr) {
              // If there is an error, callback with it
              if (err) { return cb(err); }

              // Otherwise, save the new _retArr and continue
              retArr = _retArr;
              cb(null);
            });
          }, function (err) {
            // If there is an error, callback with it
            if (err) { return cb(err); }

            // Otherwise, callback with retArr
            cb(null, retArr);
          });
        }
      }

      // Save filtersExist to filter
      filter.exists = filtersExists;

      // Save filter to params
      params.filter = filter;

      // Return params
      return params;
    }
  };

  // Subscribe to creation channel
  Sauron.on().createController('HtmlController', HtmlController);

  // TODO: Return to async only
  return HtmlController;
});
