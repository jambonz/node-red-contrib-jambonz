const {fetch} = require('undici');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};

// helper functions

/**
 * Parse a canonical speech object (synthesizer/recognizer) stored by the reusable speech
 * editor component. The value may be a JSON string (from the editor) or already an object.
 * Returns the object when it has content, else undefined.
 */
exports.parseSpeechObject = (val) => {
  if (!val) return undefined;
  let obj = val;
  if (typeof val === 'string') {
    try { obj = JSON.parse(val); } catch (e) { return undefined; }
  }
  if (obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length) return obj;
  return undefined;
};

/**
 * A "ref" leaf produced by the speech editor component for a field whose typedInput type is
 * dynamic (msg/flow/global/env/jsonata): {'#': <value>, t: <type>}. Static fields are stored
 * as their final JS value (string/number/boolean/array/object).
 */
const isSpeechRef = (v) =>
  v && typeof v === 'object' && !Array.isArray(v) &&
  Object.prototype.hasOwnProperty.call(v, '#') && Object.prototype.hasOwnProperty.call(v, 't');

const resolveSpeechTree = async (RED, val, node, msg) => {
  if (isSpeechRef(val)) {
    if (val['#'] === '' || val['#'] == null) return undefined;
    return await exports.new_resolve(RED, val['#'], val.t, node, msg);
  }
  if (Array.isArray(val)) return val;
  if (val && typeof val === 'object') {
    const out = {};
    for (const k of Object.keys(val)) {
      const r = await resolveSpeechTree(RED, val[k], node, msg);
      if (r === undefined || r === null) continue;
      if (typeof r === 'string' && r === '') continue;
      if (Array.isArray(r) && r.length === 0) continue;
      if (typeof r === 'object' && !Array.isArray(r) && Object.keys(r).length === 0) continue;
      out[k] = r;
    }
    return out;
  }
  return val;
};

/**
 * Resolve a canonical speech object (synthesizer/recognizer) stored by the reusable speech
 * editor component into a plain object, resolving any msg/flow/global/env/jsonata references.
 * Accepts a JSON string (from the editor) or an object (e.g. a legacy migration). Returns the
 * object when it has content, else undefined.
 */
exports.resolveSpeechObject = async (RED, stored, node, msg) => {
  let tree = stored;
  if (typeof stored === 'string') {
    if (!stored) return undefined;
    try { tree = JSON.parse(stored); } catch (e) { return undefined; }
  }
  if (!tree || typeof tree !== 'object') return undefined;
  const out = await resolveSpeechTree(RED, tree, node, msg);
  return (out && Object.keys(out).length) ? out : undefined;
};

exports.appendVerb = (msg, obj) => {
    const data = {};
    Object.keys(obj).forEach((key) => {
      const v = obj[key];
      if (null === v || typeof v === 'undefined' ||
        (typeof v === 'string' && !v.length) ||
        (typeof v === 'object' && Object.keys(v).length === 0)) return;
      data[key] = v;
    });
    msg.jambonz = msg.jambonz || [];
    msg.jambonz.push(data);
  }
  
  /**
   * resolve a value that may be either a string or a property of the msg, flow, or global context
   * Redundant code now replaced with new_resolve, leaving for now just in case
   */
  exports.v_resolve= (val, valType, context, msg, asJson) => {
    if (!val || !valType) return val;
    switch (valType) {
      case 'str':
      case 'num':
        return val;
      case 'json':
        return JSON.parse(val);
  
      case 'msg': return asJson === true ? msg[val] : mustache.render('{{' + val + '}}', msg);
    }
  
    var data = {};
    var dataobject = 'flow' === valType ? context.flow : context.global;
  
    if (asJson === true) return dataobject.get(val);
  
    var keys = dataobject.keys();
    for (var k in keys) {
      data[keys[k]] = dataobject.get(keys[k]);
    }
    return mustache.render('{{' + val + '}}', data);
  }
  
  exports.new_resolve = async (RED, val, valtype, node, msg) => {
    if (!val || !valtype) return val;
    switch (valtype) {
      case 'str': 
      case 'bool':
      case 'num': 
      case 'env':  
      case 'msg': 
      case 'flow': 
      case 'global':
      case 'jsonata':
        try {
          return await asyncEvaluateNodeProperty(RED, val, valtype, node, msg);
        } catch (e) { 
          node.error(`Error evaluating ${valtype} property: ${e.message}`);
          return null;
        }
      case 'mustache': 
        let data = dataobject(node.context(), msg);
        return mustache.render(val, data);
      case 'json':
        return JSON.parse(val);
    }
  }

  function asyncEvaluateNodeProperty(RED, value, type, node, msg) {
    return new Promise(function (resolve, reject) {
      RED.util.evaluateNodeProperty(value, type, node, msg, function (e, r) {
        if (e) {
          reject(e);
        } else {
          resolve(r);
        }
      });
    });
  }

  function dataobject(context, msg){
    let data = Object.assign({}, msg);
    data.global = {};
    data.flow = {};
    g_keys = context.global.keys();
    f_keys = context.flow.keys();
    for (k in g_keys){
      data.global[g_keys[k]] = context.global.get(g_keys[k]);
    };
    for (k in f_keys){
      data.flow[f_keys[k]] = context.flow.get(f_keys[k]);
    };
    return data
  }


  exports.v_text_resolve = (node, val, context, msg) => {
    const flow = {};
    const glob = {};
    let keys = context.flow.keys();
    for (const k in keys) {
      flow[keys[k]] = context.flow.get(keys[k]);
    }
    keys = context.global.keys();
    for (const k in keys) {
      glob[keys[k]] = context.global.get(keys[k]);
    }
  
    const newString = val.trim().replace(/\${([^{}]*)}/g, (a, b) => {
      if (b.startsWith('msg.')) {
        const prop = b.slice(4);
        return msg[prop];
      }
      else if (b.startsWith('flow.')) {
        const prop = b.slice(5);
        return flow[prop];
      }
      else if (b.startsWith('global.')) {
        const prop = b.slice(7);
        return glob[prop];
      }
      return '${' + b + '}';
    });
    data = {'global' : glob, 'flow' : flow, 'msg' : msg}
    return mustache.render(newString, data);
  }
  
  exports.doLCC = async (node, baseUrl, accountSid, apiToken, callSid, opts) => {
    const url = `${baseUrl}/v1/Accounts/${accountSid}/Calls/${callSid}`;
    node.log(`invoking LCC with payload ${JSON.stringify(opts)} at ${url}`);
    const response = await fetch(url, {
      method: 'POST', // TODO Should move this to PUT in next major update but will need regression testing
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      body: JSON.stringify(opts)
    });
    if (!response.ok) {
      const error = new Error('Bad response');
      error.statusCode = response.status;
      error.statusText = response.statusText;
      throw error;
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return response.json();
    }
    return response.text();
  }

  exports.doCreateCall = async (node, baseUrl, accountSid, apiToken, opts) => {
    node.log(`invoking create call with payload ${JSON.stringify(opts)}`);
    const response = await fetch(`${baseUrl}/v1/Accounts/${accountSid}/Calls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      body: JSON.stringify(opts)
    });
    if (!response.ok) {
      const error = new Error('Bad response');
      error.statusCode = response.status;
      error.statusText = response.statusText;
      throw error;
    }
    return response.json();
  }

  exports.doCreateMessage = async (node, baseUrl, accountSid, apiToken, opts) => {
    node.log(`invoking create message with payload ${JSON.stringify(opts)}`);
    const response = await fetch(`${baseUrl}/v1/Accounts/${accountSid}/Messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      body: JSON.stringify(opts)
    });
    if (!response.ok) {
      const error = new Error('Bad response');
      error.statusCode = response.status;
      error.statusText = response.statusText;
      throw error;
    }
    return response.json();
  }

