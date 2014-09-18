#!/usr/bin/env node
'use strict';

var http = require('http')
  , App = require('../server')
    // TODO what about clustering?
  , server = http.createServer()
  , port = process.argv[2] || 1100
  ;

function onListen() {
  console.log('Listening on http://' + server.address().address + ':' + server.address().port);
  console.log('Listening on http://127.0.0.1:' + server.address().port);
  console.log('Listening on http://localhost:' + server.address().port);
}

console.log('Initializing server...');
App.create(server).then(function (app) {
  server.on('request', app);
  server.listen(port, onListen);
});
