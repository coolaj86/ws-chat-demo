'use strict';
var WebSocketServer = require('ws').Server
  , UUID = require('node-uuid')
  , PromiseA = require('bluebird').Promise
  ;

module.exports.create = function (server, opts) {
  var channelsMap = { awesomech: { clientsMap: {} } }
    , states = opts.states
    , wss
    ;

  wss = new WebSocketServer({ server: server });

  wss.on('connection', function (c) {
    // TODO find a way to pass upgradeReq through middleware like query() and passport() and such
    var ch = 'awesomech' //c.upgradeReq.url.replace(/.*([&\?]channel=([^&]*)(&|$))?.*/, '$1')
      , channel
      ;

    c.id = c.id || UUID.v4();
    channelsMap[ch] = channelsMap[ch] || { clientsMap: {} };
    channel = channelsMap[ch];
    channel.clientsMap[c.id] = c;

    /*
    c.on('message', function (msg) {
      broadcast(c, ch, msg);
    });

    c.on('message', function (message) {
      console.log('received ws: %s', message);
    });
    */

    c.on('close', function () {
      console.log('close/delete ws');
      delete channel.clientsMap[c.id];
    });
    c.on('end', function () {
      console.log('end/delete ws');
      delete channel.clientsMap[c.id];
    });
    c.on('error', function (err) {
      console.error(err);
      console.log('error ws');
      delete channel.clientsMap[c.id];
    });
  });

  function broadcast(fromId, ch, msg) {
    var clientsMap = channelsMap[ch].clientsMap
      , uuid = UUID.v4()
      , state = { uuid: uuid, ts: new Date(), msg: msg, state: states.length + 1 }
      ;
      
    console.log('clientsMap');
    console.log(clientsMap);
    states.push(state);

    Object.keys(clientsMap).forEach(function (k) {
      var c = clientsMap[k]
        ;

      //console.log('c.id='+c.id, 'fromId='+fromId);
      if (c.id === fromId) { return; }

      c.send(JSON.stringify(state, null, '  '));
    });

    return PromiseA.resolve(state);
  }

  function addPoller(sid, ch, statenum, res) {
    var c
      , newStates
      , timeout
      , channel = channelsMap[ch]
      ;
    
    if (!channel.clientsMap[sid]) {
      channel.clientsMap[sid] = { id: sid };
    }
    c = channel.clientsMap[sid];

    c.res = res;
    c.send = function (str) {
      clearTimeout(timeout);

      if (!c.res) {
        return;
      }

      c.res.setHeader('content-type', 'application/json');
      // always an array
      c.res.end('[' + str + ']');
      c.res = null;
    };

    // TODO setTimeout to destroy this instance if it isn't heard from in a while
    channel.clientsMap[c.id] = c;

    function setT() {
      timeout = setTimeout(function () {
        // TODO catch error if the client disconnected and socket is not writeable
        c.res = null;
        res.send([]);
      }, 90 * 1000);
    }

    if (!statenum) {
      setT();
      return;
    }

    states.some(function (state, i) {
      if (state.state >= statenum) {
        newStates = states.slice(i);
        return true;
      }
    });

    if (newStates) {
      res.send(newStates);
      c.res = null;
    } else {
      setT();
    }
  }

  return {
    broadcast: broadcast
  , addPoller: addPoller
  };
};
