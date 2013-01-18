var baseDir = __dirname + '/../public/js/',
    config = require(baseDir + 'all.json'),
    outFile = __dirname + '/../dist/js/all.js';

var fs = require('fs'),
    jsmin = require('jsmin').jsmin,
    glob = require('glob');

module.exports = function () {
  // TODO: Use 'include' and 'exclude'
  var excludeFiles = (config.exclude || []).concat(['all.js', 'all.json']),
      excludeRegexp = new RegExp(excludeFiles.join('|')),
      outFiles = [],
      fileNameMatch = '**/*.js',
      options = {
        cwd: baseDir,
        root: baseDir
      };

  glob(fileNameMatch, options, function (err, fileNames) {
    // Exit on error
    if(err) {
      return console.log(err);
    }

    // Filter out all.js and all.json
    fileNames = fileNames.filter(function (fileName) {
      return !excludeRegexp.test(fileName);
    });

    // Read in each file
    var paths = config.paths || {},
        skipDefine = config.skipDefine || [],
        moduleNames = {};

    Object.getOwnPropertyNames(paths).forEach(function (path) {
      moduleNames[ paths[path] ] = path;
    });

    fileNames.forEach(function (fileName) {
      var file = fs.readFileSync(baseDir + fileName, 'utf8'),
          fileTrim = fileName.replace(/\.js$/, ''),
          moduleName = moduleNames[fileTrim] || fileTrim;

      // DON'T USE FULLY QUALIFIED PATH

      // If we can define the module, do as such
      if (skipDefine.indexOf(fileName) === -1) {
        var notReplaced = true;
        file = file.replace('define(', function (word, index, full) {
          // Sanity check
          // console.log(full.slice(index, index + 20), fileName);
          var nextChar = full.charAt(index + 'define('.length);
          if (/'|"/.test(nextChar)) {
            console.log('Module already has a name ', fileName);
            return 'define(';
          }

          notReplaced = false;
          return 'define("' + moduleName + '",';
        });

        // If there was no replacement, note it
        if (notReplaced) {
          console.log('We could not define ', fileName);
        }
      }

      // Append the file to the outFiles
      outFiles.push(file);
    });

    // Create the out string
    var outStr = outFiles.join(';\n;');

    // Minify the JS
    outStr = jsmin(outStr);

    // Write out the out string
    fs.writeFileSync(outFile, outStr);

    // Notify that the rendering is complete
    console.log('All js files rendered');
  });
};