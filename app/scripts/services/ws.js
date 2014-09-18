'use strict';

/**
 * @ngdoc service
 * @name yololiumApp.ws
 * @description
 * # ws
 * Service in the yololiumApp.
 */
angular.module('yololiumApp')
  .service('ws', ['$rootScope', '$q', '$window', function ws($rootScope, $q, $window) {
    // AngularJS will instantiate a singleton by calling "new" on this function
  
    function WS() {
    }

    WS.create = function (url, $scope) {
      WS._ws = new $window.WebSocket(url);
      WS.$scope = $scope || $rootScope;

      return WS;
    };

    WS.on = function (eventname, fn) {
      WS._ws.addEventListener(eventname, function () {
        var args = arguments
          ;

        WS.$scope.$apply(function () {
          fn.apply(null, args);
        });
      });
    };

    WS.addEventListener = WS.on;

    return WS;
  }]);
