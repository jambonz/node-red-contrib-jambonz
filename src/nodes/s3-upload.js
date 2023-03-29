module.exports = function(RED) {
  var WebSocket = require('ws');
  var url = require('url');
  var AWS = require('aws-sdk') ;
  var S3Stream = require('s3-upload-stream');

  var serverUpgradeAdded = false;
  function handleServerUpgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname;
    if (listenerNodes.hasOwnProperty(pathname)) {
      listenerNodes[pathname].server.handleUpgrade(request, socket, head, function done(ws) {
        listenerNodes[pathname].server.emit('connection', ws, request);
      });
    } else {
      // Don't destroy the socket as other listeners may want to handle the
      // event.
    }
  }
  var listenerNodes = {};

  // A node red node that sets up a local websocket server
  function WebSocketListenerNode(n) {
    // Create a RED node
    RED.nodes.createNode(this, n);
    var node = this;

    // Get AWS Creds
    const awsCreds = RED.nodes.getNode(n.aws);
    if (awsCreds && awsCreds.credentials) {
        AWS.Credentials({
          accessKeyId: awsCreds.credentials.accessKey, 
          secretAccessKey: awsCreds.credentials.secretAccessKey
        });
    }

    // Store local copies of the node configuration (as defined in the .html)
    [
      'path',
      'bucket'
    ].forEach(function(attr) { node[attr] = n[attr];});

    node._clients = {};
    node.closing = false;

    function handleConnection(/*socket*/socket) {
      var id = (1 + Math.random() * 4294967295).toString(16);
      node._clients[id] = socket;
      node.emit('opened', {count: Object.keys(node._clients).length, id:id});
      socket.on('open', function() {
        node.emit('opened', {count:'', id:id});
      });
      socket.on('close', function() {
        delete node._clients[id];
        node.emit('closed', {count:Object.keys(node._clients).length,id:id});
      });
      socket.on('message', function(data) {
        // first message is a JSON object containing metadata
        try {
          socket.removeAllListeners('message');
          node.metadata = JSON.parse(data);
          var msg = {payload : node.metadata}
          msg.event = 'newSession'
          node.send(msg)
          const md = {
            callSid: node.metadata.callSid,
            accountSid: node.metadata.accountSid,
            applicationSid: node.metadata.applicationSid,
            from: node.metadata.from,
            to: node.metadata.to,
            callId: node.metadata.callId
          };
          if (node.metadata.parentCallSid) md.parentCallSid = node.metadata.parentCallSid;
          const s3Stream = new S3Stream(new AWS.S3());
          const upload = s3Stream.upload({
            Bucket: node.bucket,
            Key: `${node.metadata.callSid}.L16`,
            ACL: 'public-read',
            ContentType: `audio/L16;rate=${node.metadata.sampleRate};channels=${node.metadata.mixType === 'stereo' ? 2 : 1}`,
            Metadata: md
          });
          upload.on('error', function(err) {
            node.error(`Error uploading: ${JSON.stringify(err)}`);
          });
          upload.on('part', function(details) {
            var msg = {payload : details}
            msg.event = 'partUploaded'
            node.send(msg)
          });
          upload.on('uploaded', function(details) {
            var msg = {payload : details}
            msg.event = 'finishedUpload'
            node.send(msg)
          });
          const duplex = WebSocket.createWebSocketStream(socket);
          duplex.pipe(upload);
        } catch (err) {
          node.error(`Error starting upload: ${err.message}`);
        }
      });
      socket.on('error', function(err) {
        node.emit('error', {err:err, id:id});
      });
    }

    if (!serverUpgradeAdded) {
      RED.server.on('upgrade', handleServerUpgrade);
      serverUpgradeAdded = true;
    }

    var path = RED.settings.httpNodeRoot || '/';
    path = path + (path.slice(-1) == '/' ? '' : '/') + (node.path.charAt(0) == '/' ?
      node.path.substring(1) :
      node.path);
    node.fullPath = path;

    if (listenerNodes.hasOwnProperty(path)) {
      node.error(RED._('websocket.errors.duplicate-path', {path: node.path}));
      return;
    }
    listenerNodes[node.fullPath] = node;
    var serverOptions = {
      noServer: true
    }
    if (RED.settings.webSocketNodeVerifyClient) {
      serverOptions.verifyClient = RED.settings.webSocketNodeVerifyClient;
    }
    // Create a WebSocket Server
    node.server = new WebSocket.Server(serverOptions);
    node.server.setMaxListeners(0);
    node.server.on('connection', handleConnection);

    node.on('close', function() {
      delete listenerNodes[node.fullPath];
      node.server.close();
    });
  }
  RED.nodes.registerType('audio in', WebSocketListenerNode);
}
