var {createHash} = require('crypto');
const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
var {appendVerb, v_resolve, v_text_resolve, doLCC, doCreateCall, doCreateMessage} = require('./libs')

module.exports = function(RED) {

}