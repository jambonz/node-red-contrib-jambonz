var {createHash} = require('crypto');
const {fetch} = require('undici')
var mustache = require('mustache');
mustache.escape = function(text) {return text;};
var {appendVerb, v_resolve, v_text_resolve, doLCC, doCreateCall, doCreateMessage, new_resolve} = require('./libs')

module.exports = function(RED) {

}