/* ==========================================================================
   INOVIQ — Route Configuration & Protection (routes.config.js)
   ui-router State Definitions & Navigation Gatekeeping
   STEP 2 & STEP 5 Implementation
   ========================================================================== */

(function () {
  'use strict';

  var app;
  try {
    app = angular.module('digiCardApp');
  } catch (e) {
    app = angular.module('digiCardApp', ['ui.router']);
  }

  app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    // Fallback if ui-router is not present
    if (!$stateProvider || !$urlRouterProvider) return;

    // Public Routes (no flag)
    $stateProvider
      .state('dashboard', {
        url: '/dashboard',
        templateUrl: 'Pages/dashboard.html',
        controller: 'DashboardController as vm'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'Pages/login.html',
        controller: 'AuthController as auth'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'Pages/signup.html',
        controller: 'AuthController as auth'
      })

      // Protected Routes (requiresAuth: true)
      .state('templates', {
        url: '/templates',
        templateUrl: 'Pages/dashboard.html',
        controller: 'DashboardController as vm',
        data: { requiresAuth: true }
      })
      .state('savedCards', {
        url: '/saved-cards',
        templateUrl: 'Pages/saved-cards.html',
        controller: 'CatalogController as catalog',
        data: { requiresAuth: true }
      })
      .state('cardBuilder', {
        url: '/create-card',
        templateUrl: 'Pages/create-card.html',
        data: { requiresAuth: true }
      })
      .state('contacts', {
        url: '/contacts',
        templateUrl: 'Pages/saved-cards.html',
        controller: 'CatalogController as catalog',
        data: { requiresAuth: true }
      })
      .state('scanner', {
        url: '/scan',
        templateUrl: 'Pages/scan.html',
        controller: 'ScanController as scanner',
        data: { requiresAuth: true }
      })
      .state('profile', {
        url: '/profile',
        templateUrl: 'Pages/profile.html',
        controller: 'ProfileController as vm',
        data: { requiresAuth: true }
      });

    // Default route
    $urlRouterProvider.otherwise('/dashboard');
  }]);

  app.run([
    '$rootScope',
    '$window',
    '$injector',
    'AuthService',
    'AuthModalService',
    function ($rootScope, $window, $injector, AuthService, AuthModalService) {

      // ui-router 1.x transitions API
      if ($injector.has('$transitions')) {
        try {
          var $transitions = $injector.get('$transitions');
          $transitions.onStart({}, function (trans) {
            var toState = trans.to();
            var requiresAuth = toState.data && toState.data.requiresAuth;
            var isLoggedIn = AuthService.isLoggedIn();

            // Edge Case: Logged-in users who open login/signup should be redirected to dashboard
            if (isLoggedIn && (toState.name === 'login' || toState.name === 'signup')) {
              return trans.router.stateService.target('dashboard');
            }

            // Route Protection: Block guests from protected routes
            if (requiresAuth && !isLoggedIn) {
              // 1. Remember blocked destination
              AuthService.setRedirectTarget({
                name: toState.name,
                params: trans.params()
              });

              // 2. Open auth popup
              AuthModalService.open({
                target: toState.name,
                title: 'Join Inoviq to continue',
                description: 'Log in or create a free account to use templates, saved cards, and more'
              });

              // 3. Cancel navigation
              return false;
            }
          });
        } catch (e) {
          // ignore if $transitions not available
        }
      }

      // Legacy ui-router ($stateChangeStart) support
      $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        var requiresAuth = toState.data && toState.data.requiresAuth;
        var isLoggedIn = AuthService.isLoggedIn();

        // Edge case: Logged-in user opening login/signup
        if (isLoggedIn && (toState.name === 'login' || toState.name === 'signup')) {
          event.preventDefault();
          if ($injector.has('$state')) {
            $injector.get('$state').go('dashboard');
          }
          return;
        }

        // Route Protection
        if (requiresAuth && !isLoggedIn) {
          event.preventDefault();

          AuthService.setRedirectTarget({
            name: toState.name,
            params: toParams
          });

          AuthModalService.open({
            target: toState.name,
            title: 'Join Inoviq to continue',
            description: 'Log in or create a free account to use templates, saved cards, and more'
          });
        }
      });
    }
  ]);

})();
