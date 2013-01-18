define(['Sauron', 'mvc!v/modal', 'jquery', 'modal'], function (Sauron, modalHtml, $, modal) {
  function noop() {}
  var $body = $('body');

  Sauron.on().createController('ModalFactory', function (controllerName, data, callback) {
    // If there was only a controllerName, fallback data and callback
    if (arguments.length === 1) {
      data = {};
      callback = noop;
    } else if (callback === undefined && typeof data === 'function') {
    // Otherwise, if there is no callback, promote data as callback
      callback = data;
      data = {};
    } else {
    // Otherwise, fallback data
      data = data || {};
    }

    require(['mvc!c/' + controllerName], function () {
      // Create a modal for the controller
      var $modalWrapper = $('<div class="modalWrapper" />'),
          $modal = modal(modalHtml),
          $contentContainer = $modal.find('.modalContent'),
          $modalTitle = $modal.find('.modalTitle'),
          $modalCloseButton = $modal.find('.modalCloseButton'),
          modalBig = function (callback) {
            $modal.addClass('modalBig');
            (callback || noop)();
          },
          modalSmall = function (callback) {
            $modal.removeClass('modalBig');
            (callback || noop)();
          },
          modalTitle = function (title) {
            // If there is a title
            if (title) {
              // Update the title and remove the unused class
              $modalTitle.text(title);
              $modalTitle.removeClass('isUnused');
            } else {
              // Otherwise, gut the title
              $modalTitle.text('');

              // and add the unused class
              $modalTitle.addClass('isUnused');
            }
          },
          modalCloseButton = function (hasCloseButton) {
            // If we are using a close button
            if (hasCloseButton) {
              // Update the button class and remove the unused class
              $modalCloseButton.removeClass('isUnused');
            } else {
              // Otherwise, add the unused class
              $modalCloseButton.addClass('isUnused');
            }
          },
          modalUpdate = function (options) {
            var title = options.title,
                closeButton = options.closeButton,
                size = options.size;

            // If there is a title, apply it
            if (title !== undefined) {
              modalTitle(title);
            }

            // If there is a closeButton, apply it
            if (closeButton !== undefined) {
              modalCloseButton(closeButton);
            }

            // If there is a size, apply it
            if (size !== undefined) {
              if (size === 'big') {
                modalBig();
              } else {
                modalSmall();
              }
            }
          },
          modalClose = function (e) {
            // If the event exists, stop the default action
            if (e) {
              e.preventDefault();
            }

            // Unsubscribe Sauron events
            Sauron.off('modal/big', modalBig);
            Sauron.off('modal/small', modalSmall);
            Sauron.off('modal/close', modalClose);
            Sauron.off('modal/closeButton', modalCloseButton);
            Sauron.off('modal/title', modalTitle);
            Sauron.off('modal/update', modalUpdate);

            // Hide and destroy the modal
            $modal.modalHide().remove();
            $modalWrapper.remove();
            $modal = null;

            // Stop the current controller
            Sauron.stop().controller(controllerName, noop);
          };

      // Wrap the modal
      $modalWrapper.append($modal);

      // When the modal's close button is clicked, trigger the close event
      $modalCloseButton.on('click', function () {
        // Show the close confirmation modal
        // Sauron.voice('blockingmodal');
        // TODO: Move actuallycancel to its own channel & change it's name to something semantic
        // TODO: Fix close bug on modals that do not require close confirmation
        modalClose(); // TODO: For now, this will be left in place, remove after ^ is fixed.
      });

      // When cancel is voiced, close the modal
      // Sauron.on('deploy/edit/actuallycancel', modalClose);

      // Make the modal a modal
      $modal.modal();

      // Bind modal to the DOM [in a sense]
      $body.append($modalWrapper);

      // Listen to the Sauron channel for these items
      Sauron.on('modal/big', modalBig);
      Sauron.on('modal/small', modalSmall);
      Sauron.on('modal/close', modalClose);
      Sauron.on('modal/closeButton', modalCloseButton);
      Sauron.on('modal/title', modalTitle);
      Sauron.on('modal/update', modalUpdate);

      Sauron.controller(controllerName).start($contentContainer, data, function (options) {
        // If there are options, apply them
        if (options) {
          modalUpdate(options);
        }

        // Show the modal
        $modal.modalShow();

        // Callback completion with ModalFactory
        (callback || noop)();
      });
    });
  });
});