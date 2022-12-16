var {createHash} = require('crypto');
const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
var {appendVerb, v_resolve} = require('./libs')


module.exports = function(RED) {
  function play(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.on('input', function(msg) {
      appendVerb(msg,  {
        verb: 'play',
        url: v_resolve(config.url, config.urlType, this.context(), msg),
        earlyMedia: config.early,
        loop: config.loop
      });
      node.send(msg);
    });
  }
  RED.nodes.registerType('play', play);
}