var fs = require('fs'),
    path = require('path'),
    mvcGroups = require('./mvc.json'),
    Helper = require('./helper');

// TODO: Build in a config for file extensions and app base paths. We also should export things and provide some smaller methods
module.exports = function (app) {
  Object.getOwnPropertyNames(mvcGroups).forEach(function (groupName) {
    var mvcGroup = mvcGroups[groupName],
        permissionNames = mvcGroup.permissions || [],
        fileNames = mvcGroup.files || [];

    // Get the permission functions
    var permissions = permissionNames.map(function (permissionName) {
      var permission = Helper[permissionName];

      // If the permission name cannot be found, announce it
      if (permission === undefined) {
        throw new Error('Permission function could not be found: ' + permissionName);
      }

      return permission;
    });


    // Clean up the file names (as they may have mvc! comments)
    fileNames = fileNames.map(function (fileName) {
      var nameParts = fileName.split('!');

      // If there is more than one part, remove the first one (i.e. mvc!hello => hello and wasd => wasd)
      if (nameParts.length > 1) {
        nameParts.shift();
      }

      // Join the nameParts back together
      return nameParts.join('!');
    });

    // Loop through the files and attempt to match the file with its directory
    var models = [],
        controllers = [],
        views = [];

    // TODO: Move to the outside somehow
    function bindPermissions(route) {
      // Add the permission functions
      permissions.forEach(function (permission) {
        app.get(route, function (req, res, next) {
          permission(req, res, function (err, pass) {
            // If there was an error, respond with it
            if (err) {
              return res.send(err, 403);
            }

            // Otherwise, continue
            next();
          });
        });
      });
    }

    fileNames.forEach(function (fileName) {
      // Models first
      var modelPath = path.join('models', fileName + '.js');

      // If the model exists
      if (path.existsSync(modelPath)) {
        // Read the file
        var model = fs.readFileSync(modelPath, 'utf8'),
            modelRoute = '/load/models/' + fileName,
            modelDefineIndex = model.indexOf('define(');

        // If there is a 'define(', add the model name
        if (modelDefineIndex > -1) {
          model = model.slice(0, modelDefineIndex + 'define('.length) + '"' + modelRoute + '", ' + model.slice('define('.length + modelDefineIndex);
        }

        // Bind permissions
        bindPermissions(modelRoute);

        // Broadcast the model to the app
        app.get(modelRoute, function (req, res) {
          res.send(model);
        });

        // Add the model to the models
        models.push(model);
      }

      // Views second
      var viewPath = path.join('views', fileName + '.ejs');

      // If the view exists
      if (path.existsSync(viewPath)) {
        // Read the file
        var view = fs.readFileSync(viewPath, 'utf8'),
            viewRoute = '/load/views/' + fileName;

        // Bind permissions
        bindPermissions(viewRoute);

        // Broadcast the model to the app
        app.get(viewRoute, function (req, res) {
          res.send(view);
        });

        // Add the model to the models
        views.push({'name': viewRoute, 'body': view});
      }

      // Controllers last
      var controllerPath = path.join('controllers', fileName + '.js');

      // If the model exists
      if (path.existsSync(controllerPath)) {
        // Read the file
        var controller = fs.readFileSync(controllerPath, 'utf8'),
            controllerRoute = '/load/controllers/' + fileName,
            controllerDefineIndex = controller.indexOf('define(');

        // If there is a 'define(', add the model name
        if (controllerDefineIndex > -1) {
          controller = controller.slice(0, controllerDefineIndex + 'define('.length) + '"' + controllerRoute + '", ' + controller.slice('define('.length + controllerDefineIndex);
        }

        // Bind permissions
        bindPermissions(controllerRoute);

        // Broadcast the model to the app
        app.get(controllerRoute, function (req, res) {
          res.send(controller);
        });

        // Add the model to the models
        controllers.push(controller);
      }
    });

    // Put the models and controllers in a <script> tag
    var mcArr = ['<script>\n', models.join('\n'), controllers.join('\n'), '\n</script>'];
    models = null;
    controllers = null;

    // Put each of the views in its own <script data-mvc-type="view" data-mvc-name="<<NAME>>"> tag
    var outArr = mcArr.concat(views.map(function (view) {
      return '<script data-mvc-type="view" data-mvc-name="' + view.name + '" type="text/ejs">\n' + view.body + '\n</script>';
    }));
    mcArr = null;

    // Join everything together and do some GC
    var outStr = outArr.join('\n');
    outArr = null;

    // Bind permissions for the group route
    var groupRoute = '/load/group/' + groupName;

    // Bind permissions
    bindPermissions(groupRoute);

    // Bind the group route
    app.get(groupRoute, function (req, res) {
      res.send(outStr);
    });
  });
};