define(['message', 'templatez', 'nimble', 'jquery'], function (message, templatez, nimble, $) {
  // Rename _ to nimble and define our set of messages
  var _ = nimble,
      messages = {
        'itemSaved': {// TODO: remove templating system and simply concatenate the name + string
          text: '{{name}} has been saved!',
          type: 'message'
        },
        'requestFailed': {
          text: 'Request failed.<br/>Please try again.',
          type: 'error'
        },
        'sessionExpired': {
          text: 'Your session has expired.<br/>Please log back in.',
          format: 'alert',
          singleton: true
        }
      };

  function MessageFn (template) {
    this.type = template.type || 'message';
    this.format = template.format || 'message';
    this.text = template.text || '';
    this.singleton = template.singleton || false;
    this.wasShown = false;
  }
  MessageFn.prototype = {
    'renderHtml': function (data, cb) {
      // Shift cb if data is ommited
      if(typeof data === 'function' && !cb) {
        cb = data;
        data = {};
      }

      // Fallback data
      data = data || {};

      // Generate the HTML for the message
      var html = templatez(this.text, data),
          msgObj = {type: this.type, text: html, callback: cb},
          format = this.format;

      // If a singleton message that has already been shown
      if(this.singleton && this.wasShown) {
        // Return early
        return;
      }
      this.wasShown = true;
      message[format](msgObj);

      // If callback provided and is a function AND the format type is message
      if(typeof cb === 'function' && format === 'message') {
        // Execute the callback
        cb();
      }
    }
  };

  // Create a useful addition method on message
  function addMessage(template, name) {
    var fn = new MessageFn(template);

    // Add a new function to the message lib
    message[name] = fn.renderHtml.bind(fn);
  }

  // Loop over the messages and bind them
  _.each(messages, addMessage);

  // Return the original message
  return message;
});
