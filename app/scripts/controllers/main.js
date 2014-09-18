'use strict';

angular.module('yololiumApp')
  .controller('MainCtrl', ['$scope', '$window', '$http', 'ws', function ($scope, $window, $http, ws) {
    var scope = this
      , wsc
      , msgUrl = '/api/data/new'
      , rxd = {}
      , states
      ;

    scope.statenum = null;
    scope.message = { user: null, body: '' };
    scope.states = null;

    // Send message from the form to the web server
    scope.send = function () {
      $http.post(msgUrl, scope.message).then(function (resp) {
        console.log('send: resp.data');
        console.log(resp.data);
        if (!scope.states.some(function (state) {
          if (state.state === resp.data.state) {
            return true;
          }
        })) {
          scope.states.unshift(resp.data);
        }
      });
    };

    // Authentication could happen at this endpoint
    $http.post('/api/data/join').then(function (resp) {
      scope.meta = resp.data;
      // Give the user the latest data that they need
      states = resp.data.states.reverse();
    });

    scope.joinPoll = function () {
      if (null !== scope.statenum) {
        return;
      }
      states.forEach(function (s) {
        scope.statenum = Math.max(s.state, scope.statenum);
      });

      function getNext() {
        var q = ''
          ;

        if (scope.statenum) {
          q = '?state=' + (scope.statenum + 1);
        }

        $http.get(scope.meta.pollUrl + q).then(function (resp) {
          console.log('got resp');
          console.log(resp);

          resp.data.forEach(function (s) {
            scope.statenum = Math.max(s.state, scope.statenum);
            scope.states.unshift(s);
          });

          getNext();
        });
      }

      scope.statenum = 0;
      scope.states = states;
      getNext();
    };

    scope.joinWs = function () {
      if (wsc) {
        return;
      }

      // And a specially-crafted url could be handed back at this point
      wsc = wsc || ws.create(scope.meta.streamUrl);
      scope.states = states;

      wsc.on('message', function (ev) {
        console.log('message', ev);

        var data = JSON.parse(ev.data)
          ;

        if (rxd[data.uuid]) {
          return;
        }

        rxd[data.uuid] = data;
        scope.states.unshift(data);
      });

      // TODO reconnect on disconnect
    };
  }]);
