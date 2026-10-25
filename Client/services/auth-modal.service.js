/* ==========================================================================
   INOVIQ — AuthModalService (services/auth-modal.service.js)
   Service to open/close the authGate popup from anywhere in the app
   ========================================================================== */

(function () {
  'use strict';

  var app;
  try {
    app = angular.module('digiCardApp');
  } catch (e) {
    app = angular.module('digiCardApp', []);
  }

  app.factory('AuthModalService', ['$rootScope', function ($rootScope) {
    var state = {
      isOpen: false,
      title: 'Join Inoviq to continue',
      description: 'Log in or create a free account to use templates, saved cards, and more',
      target: null,
      action: ''
    };

    return {
      /**
       * Open the auth popup
       * @param {Object|string} options Optional config or target state/url
       */
      open: function (options) {
        state.isOpen = true;
        if (typeof options === 'string') {
          state.target = options;
        } else if (options && typeof options === 'object') {
          if (options.title) state.title = options.title;
          if (options.description) state.description = options.description;
          if (options.target) state.target = options.target;
          if (options.action) state.action = options.action;
        }
        $rootScope.$broadcast('authGate:open', state);
      },

      /**
       * Close the auth popup
       */
      close: function () {
        state.isOpen = false;
        $rootScope.$broadcast('authGate:close', state);
      },

      /**
       * Check if popup is currently open
       */
      isOpen: function () {
        return state.isOpen;
      },

      /**
       * Get current state
       */
      getState: function () {
        return state;
      }
    };
  }]);

})();
