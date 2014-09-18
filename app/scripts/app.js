'use strict';

angular.module('yololiumApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap'
])
  .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider) {
    var nav
      , footer
      ;

    nav = {
      templateUrl: '/views/nav.html'
    };

    footer = {
      templateUrl: '/views/footer.html'
    };

    $stateProvider
      .state('root', {
        url: '/'
      , views: {
          nav: nav
        , body: {
            templateUrl: 'views/main.html'
          , controller: 'MainCtrl as M'
          }
        , footer: footer
        }
      })
      ;

  }])
  ;
