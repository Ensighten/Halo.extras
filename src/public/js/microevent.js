/**
 * MicroEvent - to make any js object an event emitter (server or browser)
 *
 * - pure javascript - server compatible, browser compatible
 * - dont rely on the browser doms
 * - super simple - you get it immediatly, no mistery, no magic involved
 *
 * - create a MicroEventDebug with goodies to debug
 *   - make it safer to use
 * @url https://raw.github.com/twolfson/microevent.js/master/microevent.js
*/
define(function () {
  function MicroEvent() {}
  MicroEvent.prototype = {
    on: function (channel, fn) {
      var events = this._events = this._events || {};
      (events[channel] = events[channel] || []).push(fn);
    },
    off: function (channel, fn) {
      var events = this._events = this._events || {},
          channelFns = events[channel] || [],
          i = channelFns.length;
      while (i--) {
        if (channelFns[i] === fn) {
          channelFns.splice(i, 1);
        }
      }
    },
    emit: function(channel /* , args... */){
      var events = this._events = this._events || {},
          channelFns = (events[channel] || []).slice(),
          fn;
      while (fn = channelFns.pop()) {
        fn.apply(this, [].slice.call(arguments, 1))
      }
    }
  };

  /**
   * mixin will delegate all MicroEvent.js function in the destination object
   *
   * - require('MicroEvent').mixin(Foobar) will make Foobar able to use MicroEvent
   *
   * @param {Object} the object which will support MicroEvent
  */
  MicroEvent.mixin = function (destObject) {
    var props  = ['on', 'off', 'emit'],
        targetObj = destObject.prototype || destObject,
        i = 0;
    for(; i < props.length; i++){
      targetObj[props[i]] = MicroEvent.prototype[props[i]];
    }
  };
  
  return MicroEvent;
});