const bent = require('bent');
var mustache = require('mustache');
mustache.escape = function(text) {return text;};

// helper functions

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
  

  exports.doLCC = (node, baseUrl, accountSid, apiToken, callSid, opts) => {
    const post = bent(`${baseUrl}/v1/`, 'POST', 'string', 202, {
      'Authorization': `Bearer ${apiToken}`
    });
    const url = `Accounts/${accountSid}/Calls/${callSid}`;
    node.log(`invoking LCC with payload ${JSON.stringify(opts)} at ${baseUrl}/v1/${url}`);
    return post(url, opts);
  }

  exports.doCreateCall = (baseUrl, accountSid, apiToken, opts) => {
    const post = bent(`${baseUrl}/v1/`, 'POST', 'json', 201, {
      'Authorization': `Bearer ${apiToken}`
    });
    return post(`Accounts/${accountSid}/Calls`, opts);
  }

  exports.doCreateMessage = (baseUrl, accountSid, apiToken, opts) => {
    const post = bent(`${baseUrl}/v1/`, 'POST', 'json', 201, {
      'Authorization': `Bearer ${apiToken}`
    });
    return post(`Accounts/${accountSid}/Messages`, opts);
  }
