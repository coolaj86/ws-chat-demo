'use strict';

var UUID = require('node-uuid')
  ;

exports.create = function (app, config, ws, server) {
  var states = []
    ;

  function getSid(req) {
    if (!req.session.id) { req.session.id = UUID.v4(); }

    return req.session.id;
  }

  var wss = ws.create(server, { states: states })
    ;

  function route(rest) {
    rest.post('/api/data/join', function (req, res) {
      var host = req.headers.host
        //, since = req.query.since && new Date(req.query.since) || new Date(0)
        ;

      res.send({
        streamUrl: 'ws://' + host + '/?channel=' + 'awesomech'
      , postUrl: 'http://' + host + '/api/data/new'
      , pollUrl: 'http://' + host + '/api/data'
      , states: states
      });
    });

    // all clients must POST new data
    rest.post('/api/data/new', function (req, res) {
      wss.broadcast(getSid(req), 'awesomech', req.body).then(function (state) {
        res.send(state);
      });
    });

    // degraded long-poll clients
    rest.get('/api/data', function (req, res) {
      var statenum = parseInt(req.query.state, 10)
        ;

      wss.addPoller(getSid(req), 'awesomech', statenum, res);
    });
  }

  return {
    route: route
  };
};
