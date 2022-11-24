module.exports = function(RED) {
  var bodyParser = require('body-parser');
  var multer = require('multer');
  var cookieParser = require('cookie-parser');
  var getBody = require('raw-body');
  var cors = require('cors');
  var onHeaders = require('on-headers');
  var typer = require('media-typer');
  var isUtf8 = require('is-utf8');
  var hashSum = require('hash-sum');

  function rawBodyParser(req, res, next) {
    if (req.skipRawBodyParser) { next(); } // don't parse this if told to skip
    if (req._body) { return next(); }
    req.body = '';
    req._body = true;

    var isText = true;
    var checkUTF = false;

    if (req.headers['content-type']) {
      var parsedType = typer.parse(req.headers['content-type']);
      if (parsedType.type === 'text') {
        isText = true;
      } else if (parsedType.subtype === 'xml' || parsedType.suffix === 'xml') {
        isText = true;
      } else if (parsedType.type !== 'application') {
        isText = false;
      } else if (parsedType.subtype !== 'octet-stream') {
        checkUTF = true;
      } else {
        // application/octet-stream
        isText = false;
      }
    }

    getBody(req, {
      length: req.headers['content-length'],
      encoding: isText ? 'utf8' : null
    }, function(err, buf) {
      if (err) { return next(err); }
      if (!isText && checkUTF && isUtf8(buf)) {
        buf = buf.toString();
      }
      req.body = buf;
      next();
    });
  }
  function createResponseWrapper(node, res) {
    var wrapper = {_res: res};
    var toWrap = [
      'append',
      'attachment',
      'cookie',
      'clearCookie',
      'download',
      'end',
      'format',
      'get',
      'json',
      'jsonp',
      'links',
      'location',
      'redirect',
      'render',
      'send',
      'sendfile',
      'sendFile',
      'sendStatus',
      'set',
      'status',
      'type',
      'vary'
    ];
    toWrap.forEach(function(f) {
      wrapper[f] = function() {
        node.warn(RED._('httpin.errors.deprecated-call', {method: `msg.res.${f}`}));
        var result = res[f].apply(res, arguments);
        if (result === res) {
          return wrapper;
        } else {
          return result;
        }
      };
    });
    return wrapper;
  }

  var corsHandler = function(req, res, next) { next(); };

  if (RED.settings.httpNodeCors) {
    corsHandler = cors(RED.settings.httpNodeCors);
    RED.httpNode.options('*', corsHandler);
  }

  function jbwebhook(n) {
    RED.nodes.createNode(this, n);
    if (RED.settings.httpNodeRoot !== false) {

      if (!n.url) {
        this.warn(RED._('httpin.errors.missing-path'));
        return;
      }
      this.url = n.url;
      if (this.url[0] !== '/') {
        this.url = '/' + this.url;
      }
      this.method = n.method;

      var node = this;

      this.errorHandler = function(err, req, res, next) {
        node.warn(err);
        res.sendStatus(500);
      };

      this.callback = function(req, res) {
        var msgid = RED.util.generateId();
        res._msgid = msgid;
        if (node.method == 'post') {
          extend(req.body, req.query);
          if (req.body.method) {
            node.send({_msgid:msgid, req:req, res:createResponseWrapper(node, res), authRequest: req.body});
          }
          else if (req.body.provider) {
            node.send({_msgid:msgid, req:req, res:createResponseWrapper(node, res), sms: req.body});
          }
          else {
            node.send({_msgid:msgid, req:req, res:createResponseWrapper(node, res), call: req.body});
          }
        } else if (node.method == 'get') {
          if (req.body.method) {
            node.send({_msgid:msgid, req:req, res:createResponseWrapper(node, res), authRequest: req.query});
          }
          else if (req.body.provider) {
            node.send({_msgid:msgid, req:req, res:createResponseWrapper(node, res), sms:req.query});
          }
          else {
            node.send({_msgid:msgid, req:req, res:createResponseWrapper(node, res), call:req.query});
          }
        } else {
          node.send({_msgid:msgid, req:req, res:createResponseWrapper(node, res)});
        }
      };

      var httpMiddleware = function(req, res, next) { next(); };

      if (RED.settings.httpNodeMiddleware) {
        if (typeof RED.settings.httpNodeMiddleware === 'function') {
          httpMiddleware = RED.settings.httpNodeMiddleware;
        }
      }

      var maxApiRequestSize = RED.settings.apiMaxLength || '5mb';
      var jsonParser = bodyParser.json({limit:maxApiRequestSize});
      var urlencParser = bodyParser.urlencoded({limit:maxApiRequestSize, extended:true});

      var metricsHandler = function(req, res, next) { next(); };
      if (this.metric()) {
        metricsHandler = function(req, res, next) {
          var startAt = process.hrtime();
          onHeaders(res, function() {
            if (res._msgid) {
              var diff = process.hrtime(startAt);
              var ms = diff[0] * 1e3 + diff[1] * 1e-6;
              var metricResponseTime = ms.toFixed(3);
              var metricContentLength = res._headers['content-length'];
              //assuming that _id has been set for res._metrics in HttpOut node!
              node.metric('response.time.millis', {_msgid:res._msgid}, metricResponseTime);
              node.metric('response.content-length.bytes', {_msgid:res._msgid}, metricContentLength);
            }
          });
          next();
        };
      }

      var multipartParser = function(req, res, next) { next(); };
      if (this.upload) {
        var mp = multer({ storage: multer.memoryStorage() }).any();
        multipartParser = function(req, res, next) {
          mp(req, res, function(err) {
            req._body = true;
            next(err);
          });
        };
      }

      if (this.method == 'get') {
        RED.httpNode.get(this.url, cookieParser(), httpMiddleware, corsHandler,
          metricsHandler, this.callback, this.errorHandler);
      } else if (this.method == 'post') {
        RED.httpNode.post(this.url, cookieParser(), httpMiddleware, corsHandler,
          metricsHandler, jsonParser, urlencParser, multipartParser, rawBodyParser, this.callback, this.errorHandler);
      }

      this.on('close', function() {
        var node = this;
        RED.httpNode._router.stack.forEach(function(route, i, routes) {
          if (route.route && route.route.path === node.url && route.route.methods[node.method]) {
            routes.splice(i, 1);
          }
        });
      });
    } else {
      this.warn(RED._('httpin.errors.not-created'));
    }
  }

  function extend(obj, src) {
    if (src) {
      Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
    }
    return obj;
  }

  RED.nodes.registerType('webhook in', jbwebhook);

  function returnjb(n) {
    RED.nodes.createNode(this, n);
    var node = this;
    this.headers = {};
    this.statusCode = 200;
    this.on('input', function(msg) {
      if (msg.res) {
        var headers = RED.util.cloneMessage(node.headers);
        if (msg.headers) {
          if (msg.headers.hasOwnProperty('x-node-red-request-node')) {
            var headerHash = msg.headers['x-node-red-request-node'];
            delete msg.headers['x-node-red-request-node'];
            var hash = hashSum(msg.headers);
            if (hash === headerHash) {
              delete msg.headers;
            }
          }
          if (msg.headers) {
            for (var h in msg.headers) {
              if (msg.headers.hasOwnProperty(h) && !headers.hasOwnProperty(h)) {
                headers[h] = msg.headers[h];
              }
            }
          }
        }
        if (Object.keys(headers).length > 0) {
          msg.res._res.set(headers);
        }
        var statusCode = node.statusCode || msg.statusCode || 200;
        if (typeof msg.jambonz === 'object' && !Buffer.isBuffer(msg.jambonz)) {
          msg.res._res.status(statusCode).jsonp(msg.jambonz);
        } else if (typeof msg.authResponse === 'object') {
          msg.res._res.status(statusCode).jsonp(msg.authResponse);
        }
        else {
          if (msg.res._res.get('content-length') == null) {
            var len;
            if (msg.jambonz == null) {
              len = 0;
            } else if (Buffer.isBuffer(msg.payload)) {
              len = msg.jambonz.length;
            } else {
              len = Buffer.byteLength(msg.jambonz);
            }
            msg.res._res.set('content-length', len);
          }
          msg.res._res.status(statusCode).send(msg.jambonz);
        }
      } else {
        node.warn(RED._('httpin.errors.no-response'));
      }
    });
  }
  RED.nodes.registerType('webhook out', returnjb);
};
