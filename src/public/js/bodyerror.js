define(['jqueryp!', 'msg'], function ($, msg) {
  // Move jQuery error to visual error
  function bodyerr(evt, msgStr) {
    msg.message({type: 'error', text: msgStr});
  }

  // Add a body listener
  var $body = $('body');
  $body.on('error', bodyerr);

  // Return bodyerr
  return bodyerr;
});