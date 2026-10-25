/* ==========================================================================
   INOVIQ — AuthService (services/auth.service.js)
   AngularJS 1.x Authentication State Management
   Stores logged-in state & user in localStorage. Default state is guest.
   ========================================================================== */

(function () {
  'use strict';

  var app;
  try {
    app = angular.module('digiCardApp');
  } catch (e) {
    app = angular.module('digiCardApp', []);
  }

  app.factory('AuthService', ['$window', '$q', function ($window, $q) {
    var LOGGED_IN_KEY = 'inoviq_logged_in';
    var USER_KEY = 'inoviq_user';
    var TOKEN_KEY = 'inoviq_token';
    var REDIRECT_KEY = 'inoviq_redirect_target';

    /**
     * Generate a lightweight mock JWT-like token for interop with existing services
     */
    function createMockToken(user) {
      try {
        var header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        var payload = btoa(JSON.stringify({
          id: user.id || 'usr_mock_123',
          email: user.email || 'member@inoviq.io',
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
        }));
        return header + '.' + payload + '.mockSignature';
      } catch (e) {
        return 'mock-token-' + Date.now();
      }
    }

    return {
      /**
       * Check if the current user is logged in
       * Default state is guest (false)
       */
      isLoggedIn: function () {
        var flag = $window.localStorage.getItem(LOGGED_IN_KEY);
        if (flag === 'true') {
          return true;
        }
        // Fallback: check valid token if present
        var token = $window.localStorage.getItem(TOKEN_KEY);
        if (token) {
          try {
            var parts = token.split('.');
            if (parts.length === 3) {
              var payload = JSON.parse(atob(parts[1]));
              if (payload.exp && payload.exp * 1000 > Date.now()) {
                return true;
              }
            }
          } catch (e) {
            // invalid token
          }
        }
        return false;
      },

      /**
       * Log in with a user object or credentials
       * Persists state to localStorage so it survives page reloads
       */
      login: function (user) {
        var userData = user || {};
        if (typeof userData === 'string') {
          userData = { email: userData, firstName: userData.split('@')[0] || 'Member' };
        }
        if (!userData.firstName && userData.email) {
          userData.firstName = userData.email.split('@')[0];
        }
        if (!userData.firstName) {
          userData.firstName = 'Elena';
          userData.lastName = 'Rostova';
        }

        var token = createMockToken(userData);

        $window.localStorage.setItem(LOGGED_IN_KEY, 'true');
        $window.localStorage.setItem(USER_KEY, JSON.stringify(userData));
        $window.localStorage.setItem(TOKEN_KEY, token);

        return $q.resolve({
          success: true,
          token: token,
          user: userData
        });
      },

      /**
       * Log out: clears authentication state and returns to guest mode
       */
      logout: function () {
        $window.localStorage.removeItem(LOGGED_IN_KEY);
        $window.localStorage.removeItem(USER_KEY);
        $window.localStorage.removeItem(TOKEN_KEY);
        $window.sessionStorage.removeItem(REDIRECT_KEY);

        // Redirect to dashboard as guest
        if ($window.location.pathname.indexOf('dashboard') === -1) {
          $window.location.href = 'dashboard.html';
        } else {
          $window.location.reload();
        }
      },

      /**
       * Get currently logged-in user object from localStorage
       */
      getUser: function () {
        try {
          var raw = $window.localStorage.getItem(USER_KEY);
          return raw ? JSON.parse(raw) : null;
        } catch (e) {
          return null;
        }
      },

      /**
       * Alias for compatibility with existing controllers
       */
      getCurrentUser: function () {
        return this.getUser();
      },

      /**
       * Get token for API requests
       */
      getToken: function () {
        return $window.localStorage.getItem(TOKEN_KEY) || '';
      },

      /**
       * Remember the destination the user attempted to reach before being gated
       */
      setRedirectTarget: function (target) {
        if (!target) return;
        var serialized = (typeof target === 'object') ? JSON.stringify(target) : target;
        $window.sessionStorage.setItem(REDIRECT_KEY, serialized);
        $window.localStorage.setItem(REDIRECT_KEY, serialized);
      },

      /**
       * Retrieve the saved redirect destination
       */
      getRedirectTarget: function () {
        var val = $window.sessionStorage.getItem(REDIRECT_KEY) || $window.localStorage.getItem(REDIRECT_KEY);
        if (!val) return null;
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      },

      /**
       * Clear saved redirect destination
       */
      clearRedirectTarget: function () {
        $window.sessionStorage.removeItem(REDIRECT_KEY);
        $window.localStorage.removeItem(REDIRECT_KEY);
      },

      /**
       * Profile fetch mock helper for profile views
       */
      fetchProfile: function () {
        var user = this.getUser() || {
          firstName: 'Elena',
          lastName: 'Rostova',
          username: 'elena',
          email: 'elena@vanguardcap.io',
          phone: '+1 (555) 234-5678'
        };
        return $q.resolve({ success: true, user: user });
      },

      /**
       * Profile update mock helper
       */
      updateProfile: function (profileData) {
        var currentUser = this.getUser() || {};
        var updated = angular.extend({}, currentUser, profileData);
        $window.localStorage.setItem(USER_KEY, JSON.stringify(updated));
        return $q.resolve({ success: true, user: updated, token: this.getToken() });
      }
    };
  }]);

})();
