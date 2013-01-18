// TODO: Get off of jquery dependancy
define(['jquery'], function ($) {
  return {
    'load': function (name, req, onLoad, config) {
      var type = name[0],
          dir = '',
          paths = config.paths,
          file = name.substring(2),
          prefix = '',
          finalPath,
          callback = onLoad;

      // Load models and controllers as JS and views via the text plugin
      switch (type) {
        case 'm':
          dir = paths._modelDir;
          break;
        case 'v':
          prefix = 'text!';
          dir = paths._viewDir;
          break;
        case 'c':
          dir = paths._controllerDir;
          break;
        case 'g':
          prefix = 'text!';
          dir = paths._groupDir;
          callback = function (group) {
            var $group = $(group),
                $scripts = $group.filter('script'),
                $views = $scripts.filter(function () {
                  return $(this).data('mvc-type') === 'view';
                });

            // Load the views first
            $views.each(function () {
              var $this = $(this),
                  mvcName = $this.data('mvc-name'),
                  content = $this.text();

              // Define them and their content
              define('text!' + mvcName, content);
            });

            // Load the models and controllers second
            var evalStr = $scripts.not($views).text();

            // TODO: Undo this browser-sniff once Firebug is back to having functional sourceURL's
            var isFirefox = false;
            try {
              isFirefox = window.navigator.userAgent.indexOf('Firefox') > -1;
            } catch (e) {
            }

            if (isFirefox) {
              try {
                  window.eval(evalStr);
              } catch (e) {
                var err = new Error();
                if (console && console.error) {
                  console.error('Error thrown by file ' + finalPath + ' on line: ' + (e.lineNumber - err.lineNumber + 3), e);
                }
              }
            } else {
              window.eval(evalStr + '\n//@ sourceURL=' + finalPath + '\n');
            }

            // Callback
            onLoad('');
          };
      }

      finalPath = prefix + dir + file;

      // Load up the module and return it
      require([finalPath], callback);
    }
  };
});