/* ==========================================================================
   INOVIQ — authGate Reusable Modal Directive / Component
   (components/auth-gate.component.js)
   Mounted once in the main app shell (index.html) or dashboard
   Content:
   - Title: "Join Inoviq to continue"
   - Text: "Log in or create a free account to use templates, saved cards, and more"
   - Two buttons: "Sign up" (brass) and "Log in" (outlined)
   - Close (X) button
   - Closes on backdrop click or Esc key
   - Supports both ui-router transitions and multi-page URL routing
   ========================================================================== */

(function () {
  'use strict';

  var app;
  try {
    app = angular.module('digiCardApp');
  } catch (e) {
    app = angular.module('digiCardApp', []);
  }

  app.directive('authGate', [
    '$rootScope',
    '$window',
    '$injector',
    'AuthService',
    'AuthModalService',
    function ($rootScope, $window, $injector, AuthService, AuthModalService) {
      return {
        restrict: 'EA',
        replace: true,
        scope: {},
        template:
          '<div class="auth-gate-backdrop" ' +
               'ng-class="{\'is-active\': vm.isOpen}" ' +
               'aria-hidden="{{ !vm.isOpen }}" ' +
               'ng-click="vm.onBackdropClick($event)">' +
            '<div class="auth-gate-card" ng-click="$event.stopPropagation()">' +
              '<button type="button" class="auth-gate-close" aria-label="Close" ng-click="vm.close()">&times;</button>' +
              '<div class="auth-gate-badge">MEMBER ACCESS</div>' +
              '<h3 class="auth-gate-title">{{ vm.title }}</h3>' +
              '<p class="auth-gate-text">{{ vm.description }}</p>' +
              '<div class="auth-gate-actions">' +
                '<button type="button" class="btn-auth-signup" ng-click="vm.goToSignup()">Sign up</button>' +
                '<button type="button" class="btn-auth-login" ng-click="vm.goToLogin()">Log in</button>' +
              '</div>' +
              '<div class="auth-gate-footer">' +
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
                  '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>' +
                  '<path d="M7 11V7a5 5 0 0 1 10 0v4"/>' +
                '</svg>' +
                '<span>Encrypted · Issued digitally · Free account</span>' +
              '</div>' +
            '</div>' +
          '</div>',
        controllerAs: 'vm',
        controller: ['$scope', function ($scope) {
          var vm = this;

          vm.isOpen = false;
          vm.title = 'Join Inoviq to continue';
          vm.description = 'Log in or create a free account to use templates, saved cards, and more';
          vm.target = null;

          // Helper to check if ui-router $state is active
          function getStateService() {
            if ($injector.has('$state')) {
              try {
                return $injector.get('$state');
              } catch (e) {
                return null;
              }
            }
            return null;
          }

          // Sync with AuthModalService events
          $scope.$on('authGate:open', function (event, data) {
            vm.isOpen = true;
            if (data) {
              vm.title = data.title || 'Join Inoviq to continue';
              vm.description = data.description || 'Log in or create a free account to use templates, saved cards, and more';
              vm.target = data.target || null;
              if (data.target) {
                AuthService.setRedirectTarget(data.target);
              }
            }
            $scope.$evalAsync();
          });

          $scope.$on('authGate:close', function () {
            vm.isOpen = false;
            $scope.$evalAsync();
          });

          vm.close = function () {
            vm.isOpen = false;
            AuthModalService.close();
          };

          vm.onBackdropClick = function ($event) {
            if ($event.target === $event.currentTarget) {
              vm.close();
            }
          };

          // Esc key to close
          function onKeyDown(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
              if (vm.isOpen) {
                $scope.$apply(function () {
                  vm.close();
                });
              }
            }
          }
          $window.addEventListener('keydown', onKeyDown);
          $scope.$on('$destroy', function () {
            $window.removeEventListener('keydown', onKeyDown);
          });

          vm.goToLogin = function () {
            vm.close();
            var $state = getStateService();
            if ($state && $state.get && $state.get('login')) {
              $state.go('login');
            } else {
              var targetParam = vm.target ? ('?redirect=' + encodeURIComponent(typeof vm.target === 'string' ? vm.target : (vm.target.name || 'dashboard'))) : '';
              $window.location.href = 'login.html' + targetParam;
            }
          };

          vm.goToSignup = function () {
            vm.close();
            var $state = getStateService();
            if ($state && $state.get && $state.get('signup')) {
              $state.go('signup');
            } else {
              var targetParam = vm.target ? ('?redirect=' + encodeURIComponent(typeof vm.target === 'string' ? vm.target : (vm.target.name || 'dashboard'))) : '';
              $window.location.href = 'signup.html' + targetParam;
            }
          };
        }]
      };
    }
  ]);

})();
