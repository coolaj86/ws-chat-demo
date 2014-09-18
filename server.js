'use strict';

var connect = require('connect')
  , path = require('path')
  , PromiseA = require('bluebird').Promise
  , urlrouter = require('urlrouter')
  ;

module.exports.create = function (server) {
  var app = connect()
    , config = require('./config')
    , ws = require('./lib/ws')
    , routes
    , apirouter
    ;

  return new PromiseA(function (resolve/*, reject*/) {
    app
      .use(require('./lib/connect-shims/query')())
      .use(require('body-parser').json({
        strict: true // only objects and arrays
      , inflate: true
      , limit: 100 * 1024
      , reviver: undefined
      , type: 'json'
      , verify: undefined
      }))
      .use(require('body-parser').urlencoded({
        extended: true
      , inflate: true
      , limit: 100 * 1024
      , type: 'urlencoded'
      , verify: undefined
      }))
      .use(require('compression')())
      .use(require('./lib/connect-shims/redirect'))
      .use(require('cookie-parser')())
      .use(require('express-session')({
        secret: config.sessionSecret
      , saveUninitialized: true // see https://github.com/expressjs/session
      , resave: true // see https://github.com/expressjs/session
        }
      ))
      .use(require('connect-send-error').error())
      .use(require('connect-send-json').json())
      ;

    //
    // App-Specific WebSocket Server
    //
    apirouter = require('./lib/apirouter').create(app, config, ws, server).route;
    app.use(urlrouter(apirouter));

    //
    // Generic Template API
    //
    app
      //.use(connect.static(path.join(__dirname, 'data')))
      //.use(connect.static(path.join(__dirname, 'dist')))
      //.use(connect.static(path.join(__dirname, '.tmp', 'concat')))
      .use(require('serve-static')(path.join(__dirname, 'app')))
      //.use(connect.static(path.join(__dirname, '.tmp')))
      ;

    resolve(app);
  });
};
