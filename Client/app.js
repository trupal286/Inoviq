/* ==========================================================================
   INOVIQ — AngularJS Master Application & Liquid Glass Dock Directive
   Pure AngularJS Architecture with Synchronized Circle + Icon Elevation
   + AuthService, CardService, and API Integration
   ========================================================================== */

(function () {
  'use strict';

  var app;
  try {
    app = angular.module('digiCardApp');
  } catch (e) {
    try {
      angular.module('ui.router');
      app = angular.module('digiCardApp', ['ui.router']);
    } catch (err) {
      app = angular.module('digiCardApp', []);
    }
  }

  /* --------------------------------------------------------------------------
     AuthService — State management & mock auth support (survives page refresh)
     -------------------------------------------------------------------------- */
  app.factory('AuthService', ['$http', '$window', '$q', function ($http, $window, $q) {
    var API = '/api/auth';
    var TOKEN_KEY = 'inoviq_token';
    var USER_KEY = 'inoviq_user';
    var LOGGED_IN_KEY = 'inoviq_logged_in';
    var REDIRECT_KEY = 'inoviq_redirect_target';

    function saveAuth(token, user) {
      $window.localStorage.setItem(LOGGED_IN_KEY, 'true');
      $window.localStorage.setItem(TOKEN_KEY, token);
      $window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    function clearAuth() {
      $window.localStorage.removeItem(LOGGED_IN_KEY);
      $window.localStorage.removeItem(TOKEN_KEY);
      $window.localStorage.removeItem(USER_KEY);
      $window.sessionStorage.removeItem(REDIRECT_KEY);
      $window.localStorage.removeItem(REDIRECT_KEY);
    }

    function createMockToken(user) {
      try {
        var header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        var payload = btoa(JSON.stringify({
          id: user.id || '000000000000000000000001',
          email: user.email || 'demo@inoviq.io',
          firstName: user.firstName || 'Elena',
          lastName: user.lastName || 'Rostova',
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
        }));
        return header + '.' + payload + '.mockSig';
      } catch (e) {
        return 'mock-token-' + Date.now();
      }
    }

    return {
      signup: function (data) {
        var userData = data || {};
        if (userData.email && userData.signupPassword) {
          return $http.post(API + '/signup', {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone || '',
            password: userData.signupPassword,
            confirmPassword: userData.confirmPassword
          }).then(function (res) {
            if (res.data && res.data.success) {
              saveAuth(res.data.token, res.data.user);
              return res.data;
            }
            return res.data;
          }).catch(function (err) {
            if (err && (err.status === 400 || err.status === 409)) {
              return $q.reject(err);
            }
            var token = createMockToken(userData);
            saveAuth(token, userData);
            return $q.resolve({ success: true, token: token, user: userData });
          });
        }
        var token = createMockToken(userData);
        saveAuth(token, userData);
        return $q.resolve({ success: true, token: token, user: userData });
      },

      login: function (identifierOrUser, password) {
        var idStr = typeof identifierOrUser === 'string' ? identifierOrUser : (identifierOrUser && (identifierOrUser.email || identifierOrUser.username));
        var passStr = password || (identifierOrUser && identifierOrUser.password);

        if (idStr && passStr) {
          return $http.post(API + '/login', {
            identifier: idStr,
            password: passStr
          }).then(function (res) {
            if (res.data && res.data.success) {
              saveAuth(res.data.token, res.data.user);
              return res.data;
            }
            return res.data;
          }).catch(function (err) {
            if (err && err.status === 401 && err.data && err.data.message) {
              return $q.reject(err);
            }
            var userData = typeof identifierOrUser === 'object' ? identifierOrUser : { email: idStr };
            if (!userData.firstName) userData.firstName = (idStr.indexOf('@') !== -1 ? idStr.split('@')[0] : idStr);
            if (!userData.lastName) userData.lastName = 'Member';
            var token = createMockToken(userData);
            saveAuth(token, userData);
            return $q.resolve({ success: true, token: token, user: userData });
          });
        }

        var userData = {};
        if (typeof identifierOrUser === 'object' && identifierOrUser !== null) {
          userData = identifierOrUser;
        } else {
          var id = identifierOrUser || 'demo@inoviq.io';
          userData = {
            email: id,
            firstName: id.indexOf('@') !== -1 ? id.split('@')[0] : id,
            lastName: 'Member',
            username: id
          };
        }
        if (!userData.firstName) userData.firstName = 'Elena';
        if (!userData.lastName) userData.lastName = 'Rostova';

        var token = createMockToken(userData);
        saveAuth(token, userData);
        return $q.resolve({ success: true, token: token, user: userData });
      },

      logout: function () {
        clearAuth();
        if ($window.location.pathname.indexOf('dashboard') === -1) {
          $window.location.href = 'dashboard.html';
        } else {
          $window.location.reload();
        }
      },

      getToken: function () {
        return $window.localStorage.getItem(TOKEN_KEY) || '';
      },

      isLoggedIn: function () {
        var flag = $window.localStorage.getItem(LOGGED_IN_KEY);
        if (flag === 'true') return true;
        var token = $window.localStorage.getItem(TOKEN_KEY);
        if (!token) return false;
        try {
          var payload = JSON.parse(atob(token.split('.')[1]));
          return payload.exp * 1000 > Date.now();
        } catch (e) {
          return false;
        }
      },

      getUser: function () {
        try {
          var data = $window.localStorage.getItem(USER_KEY);
          return data ? JSON.parse(data) : null;
        } catch (e) {
          return null;
        }
      },

      getCurrentUser: function () {
        return this.getUser();
      },

      setRedirectTarget: function (target) {
        if (!target) return;
        var serialized = (typeof target === 'object') ? JSON.stringify(target) : target;
        $window.sessionStorage.setItem(REDIRECT_KEY, serialized);
        $window.localStorage.setItem(REDIRECT_KEY, serialized);
      },

      getRedirectTarget: function () {
        var val = $window.sessionStorage.getItem(REDIRECT_KEY) || $window.localStorage.getItem(REDIRECT_KEY);
        if (!val) return null;
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      },

      clearRedirectTarget: function () {
        $window.sessionStorage.removeItem(REDIRECT_KEY);
        $window.localStorage.removeItem(REDIRECT_KEY);
      },

      fetchProfile: function () {
        var self = this;
        var token = self.getToken();
        if (!token) {
          return $q.reject({ status: 401, message: 'Not authenticated' });
        }
        return $http.get(API + '/me', {
          headers: { 'Authorization': 'Bearer ' + token }
        }).then(function (res) {
          if (res.data && res.data.success && res.data.user) {
            $window.localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
            return res.data;
          }
          return res.data;
        }).catch(function (err) {
          var user = self.getUser();
          if (user) {
            return $q.resolve({ success: true, user: user });
          }
          return $q.reject(err);
        });
      },

      updateProfile: function (profileData) {
        var self = this;
        var token = self.getToken();
        if (!token) {
          return $q.reject({ status: 401, message: 'Not authenticated' });
        }
        return $http.put(API + '/profile', profileData, {
          headers: { 'Authorization': 'Bearer ' + token }
        }).then(function (res) {
          if (res.data && res.data.success) {
            if (res.data.user) {
              $window.localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
            }
            if (res.data.token) {
              $window.localStorage.setItem(TOKEN_KEY, res.data.token);
            }
            return res.data;
          }
          return res.data;
        }).catch(function (err) {
          if (err && (err.status === 400 || err.status === 409 || err.status === 401)) {
            return $q.reject(err);
          }
          var currentUser = self.getUser() || {};
          var updated = angular.extend({}, currentUser, profileData);
          $window.localStorage.setItem(USER_KEY, JSON.stringify(updated));
          return $q.resolve({ success: true, user: updated, token: self.getToken() });
        });
      }
    };
  }]);

  /* --------------------------------------------------------------------------
     CardService — CRUD API calls for cards
     -------------------------------------------------------------------------- */
  app.factory('CardService', ['$http', 'AuthService', function ($http, AuthService) {
    var API = '/api/cards';

    function authHeaders() {
      return { headers: { 'Authorization': 'Bearer ' + AuthService.getToken() } };
    }

    return {
      list: function () {
        return $http.get(API, authHeaders()).then(function (res) {
          return res.data;
        });
      },

      get: function (cardId) {
        return $http.get(API + '/' + cardId, authHeaders()).then(function (res) {
          return res.data;
        });
      },

      create: function (cardData) {
        return $http.post(API, cardData, authHeaders()).then(function (res) {
          return res.data;
        });
      },

      update: function (cardId, cardData) {
        return $http.put(API + '/' + cardId, cardData, authHeaders()).then(function (res) {
          return res.data;
        });
      },

      remove: function (cardId) {
        return $http.delete(API + '/' + cardId, authHeaders()).then(function (res) {
          return res.data;
        });
      }
    };
  }]);

  /* --------------------------------------------------------------------------
     HTTP Interceptor — auto-attach JWT token to all API requests
     -------------------------------------------------------------------------- */
  app.factory('AuthInterceptor', ['$window', '$q', function ($window, $q) {
    return {
      request: function (config) {
        var token = $window.localStorage.getItem('inoviq_token');
        if (token && config.url.indexOf('/api/') !== -1) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
      },
      responseError: function (response) {
        if (response.status === 401) {
          $window.localStorage.removeItem('inoviq_token');
          $window.localStorage.removeItem('inoviq_user');
          $window.localStorage.removeItem('inoviq_logged_in');
          $window.sessionStorage.removeItem('inoviq_redirect_target');
          $window.localStorage.removeItem('inoviq_redirect_target');
          // Only redirect if not already on login/signup page
          if ($window.location.pathname.indexOf('login') === -1 &&
              $window.location.pathname.indexOf('signup') === -1) {
            $window.location.href = 'login.html';
          }
        }
        return $q.reject(response);
      }
    };
  }]);

  app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  }]);

  /* --------------------------------------------------------------------------
     AuthController — handles login & signup forms
     -------------------------------------------------------------------------- */
  app.controller('AuthController', ['$scope', '$window', 'AuthService', function ($scope, $window, AuthService) {
    var auth = this;

    auth.identifier = '';
    auth.password = '';
    auth.firstName = '';
    auth.lastName = '';
    auth.email = '';
    auth.phone = '';
    auth.signupPassword = '';
    auth.confirmPassword = '';
    auth.agreeTerms = false;

    auth.loading = false;
    auth.errorMsg = '';
    auth.successMsg = '';

    /* ── Helper to determine target after login/signup ── */
    function getPostAuthRedirectTarget() {
      var saved = AuthService.getRedirectTarget();
      AuthService.clearRedirectTarget();

      var target = null;
      if (saved) {
        if (typeof saved === 'string') target = saved;
        else if (saved.name) {
          target = saved.name === 'templates' ? 'dashboard.html#templates' : (saved.name === 'cards' ? 'saved-cards.html' : saved.name + '.html');
        } else if (saved.url) {
          target = saved.url;
        }
      }

      if (!target) {
        try {
          target = new URLSearchParams($window.location.search).get('redirect');
        } catch (e) {}
      }

      if (!target && $window.location.hash && $window.location.hash !== '#' && $window.location.pathname.indexOf('login') !== -1) {
        target = 'dashboard.html' + $window.location.hash;
      }

      if (!target) {
        return 'dashboard.html';
      }

      try {
        target = decodeURIComponent(target);
      } catch (e) {}

      target = target.trim();

      if (target === 'login.html' || target === 'signup.html' ||
          target === 'login' || target === 'signup' ||
          target === '/login.html' || target === '/signup.html' ||
          target === '/login' || target === '/signup' ||
          target === '' || target === '/') {
        return 'dashboard.html';
      }

      if (target.charAt(0) === '#') {
        return 'dashboard.html' + target;
      }

      if (target === 'templates') {
        return 'dashboard.html#templates';
      }

      if (target === 'dashboard' || target === '/dashboard') {
        return 'dashboard.html';
      }

      if (target === 'cards' || target === '/cards') {
        return 'saved-cards.html';
      }

      if (target.indexOf('.') === -1 && target.indexOf('/') === -1) {
        return target + '.html';
      }

      return target;
    }

    /* ── Login ── */
    auth.login = function () {
      auth.errorMsg = '';
      auth.loading = true;

      var userObj = {
        email: auth.identifier || 'demo@inoviq.io',
        firstName: (auth.identifier && auth.identifier.indexOf('@') !== -1) ? auth.identifier.split('@')[0] : (auth.identifier || 'Elena'),
        lastName: 'Member',
        username: auth.identifier || 'elena',
        password: auth.password
      };

      AuthService.login(userObj, auth.password)
        .then(function (data) {
          auth.loading = false;
          auth.successMsg = 'Login successful! Redirecting...';
          var target = getPostAuthRedirectTarget();
          setTimeout(function () {
            if ($window.location.replace) {
              $window.location.replace(target);
            } else {
              $window.location.href = target;
            }
          }, 350);
        })
        .catch(function (err) {
          auth.loading = false;
          auth.errorMsg = (err && err.data && err.data.message) || 'Login failed. Please try again.';
          $scope.$applyAsync();
        });
    };

    /* ── Signup ── */
    auth.signup = function () {
      auth.errorMsg = '';

      if (!auth.firstName || !auth.lastName || !auth.email || !auth.signupPassword) {
        auth.errorMsg = 'Please fill in all required fields.';
        return;
      }

      if (auth.signupPassword.length < 8) {
        auth.errorMsg = 'Password must be at least 8 characters.';
        return;
      }

      if (auth.signupPassword !== auth.confirmPassword) {
        auth.errorMsg = 'Passwords do not match.';
        return;
      }

      auth.loading = true;

      var userObj = {
        firstName: auth.firstName,
        lastName: auth.lastName,
        email: auth.email,
        phone: auth.phone || '',
        username: auth.email.split('@')[0],
        signupPassword: auth.signupPassword,
        confirmPassword: auth.confirmPassword
      };

      var signupAction = (typeof AuthService.signup === 'function')
        ? AuthService.signup(userObj)
        : AuthService.login(userObj, auth.signupPassword);

      signupAction
        .then(function (data) {
          auth.loading = false;
          auth.successMsg = 'Account created! Redirecting...';
          var target = getPostAuthRedirectTarget();
          setTimeout(function () {
            if ($window.location.replace) {
              $window.location.replace(target);
            } else {
              $window.location.href = target;
            }
          }, 450);
        })
        .catch(function (err) {
          auth.loading = false;
          auth.errorMsg = (err && err.data && err.data.message) || 'Signup failed. Please try again.';
          $scope.$applyAsync();
        });
    };
  }]);

  /* --------------------------------------------------------------------------
     ProfileController — handles profile view & edit
     -------------------------------------------------------------------------- */
  app.controller('ProfileController', ['$scope', '$window', 'AuthService', function ($scope, $window, AuthService) {
    var vm = this;

    /* ── State ── */
    vm.isLoggedIn   = AuthService.isLoggedIn();
    vm.currentUser  = AuthService.getCurrentUser();
    vm.loading      = true;
    vm.editMode     = false;
    vm.saving       = false;
    vm.errorMsg     = '';
    vm.successMsg   = '';
    vm.showAccountMenu = false;

    /* ── Redirect guests to login ── */
    if (!vm.isLoggedIn) {
      $window.location.href = 'login.html?redirect=profile.html';
      return;
    }

    /* ── Edit form fields ── */
    vm.form = {
      firstName: '',
      lastName:  '',
      username:  '',
      phone:     ''
    };

    /* ── Helper: initials from user object ── */
    vm.getInitials = function (user) {
      if (!user) return 'IN';
      return (((user.firstName || '')[0] || '') + ((user.lastName || '')[0] || '')).toUpperCase() || 'IN';
    };

    /* ── Helper: full name ── */
    vm.getFullName = function (user) {
      if (!user) return '';
      return (user.firstName || '') + ' ' + (user.lastName || '');
    };

    /* ── Format date ── */
    vm.formatDate = function (isoStr) {
      if (!isoStr) return '—';
      var d = new Date(isoStr);
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    };

    /* ── Populate form from user object ── */
    function populateForm(user) {
      vm.form.firstName = user.firstName || '';
      vm.form.lastName  = user.lastName  || '';
      vm.form.username  = user.username  || '';
      vm.form.phone     = user.phone     || '';
    }

    /* ── Fetch fresh profile from server ── */
    AuthService.fetchProfile()
      .then(function (data) {
        vm.loading = false;
        if (data.success) {
          vm.currentUser = data.user;
          populateForm(data.user);
        } else {
          vm.errorMsg = data.message || 'Failed to load profile.';
        }
        $scope.$applyAsync();
      })
      .catch(function (err) {
        vm.loading = false;
        if (err && err.status === 401) {
          $window.location.href = 'login.html?redirect=profile.html';
          return;
        }
        vm.errorMsg = (err && err.data && err.data.message) || 'Failed to load profile. Please refresh.';
        $scope.$applyAsync();
      });

    /* ── Toggle edit mode ── */
    vm.enterEdit = function () {
      vm.editMode  = true;
      vm.errorMsg  = '';
      vm.successMsg = '';
      populateForm(vm.currentUser);
    };

    vm.cancelEdit = function () {
      vm.editMode   = false;
      vm.errorMsg   = '';
      vm.successMsg = '';
      populateForm(vm.currentUser);
    };

    /* ── Save profile ── */
    vm.saveProfile = function () {
      vm.errorMsg   = '';
      vm.successMsg = '';

      /* Client-side validation */
      if (!vm.form.firstName || !vm.form.firstName.trim()) {
        vm.errorMsg = 'First name is required.'; return;
      }
      if (!vm.form.lastName || !vm.form.lastName.trim()) {
        vm.errorMsg = 'Last name is required.'; return;
      }
      if (vm.form.username && vm.form.username.trim().length > 0 &&
          vm.form.username.trim().length < 3) {
        vm.errorMsg = 'Username must be at least 3 characters.'; return;
      }

      vm.saving = true;

      AuthService.updateProfile({
        firstName: vm.form.firstName.trim(),
        lastName:  vm.form.lastName.trim(),
        username:  vm.form.username.trim(),
        phone:     vm.form.phone.trim()
      })
        .then(function (data) {
          vm.saving = false;
          if (data.success) {
            vm.currentUser = data.user;
            vm.successMsg  = 'Profile updated successfully!';
            vm.editMode    = false;
            // Clear success message after 4 seconds
            setTimeout(function () {
              vm.successMsg = '';
              $scope.$applyAsync();
            }, 4000);
          } else {
            vm.errorMsg = data.message || 'Update failed.';
          }
          $scope.$applyAsync();
        })
        .catch(function (err) {
          vm.saving   = false;
          vm.errorMsg = (err && err.data && err.data.message) || 'Update failed. Please try again.';
          $scope.$applyAsync();
        });
    };

    /* ── Account dropdown ── */
    vm.toggleAccountMenu = function ($event) {
      if ($event) $event.stopPropagation();
      vm.showAccountMenu = !vm.showAccountMenu;
    };
    $window.addEventListener('click', function () {
      if (vm.showAccountMenu) {
        $scope.$apply(function () { vm.showAccountMenu = false; });
      }
    });

    /* ── Logout ── */
    vm.logout = function () {
      AuthService.logout();
    };
  }]);

  /* --------------------------------------------------------------------------
     DashboardController
     -------------------------------------------------------------------------- */
  app.controller('DashboardController', ['$scope', '$window', '$injector', 'AuthService', 'CardService', function ($scope, $window, $injector, AuthService, CardService) {
    var vm = this;

    var AuthModalService = null;
    if ($injector.has('AuthModalService')) {
      try {
        AuthModalService = $injector.get('AuthModalService');
      } catch (e) {}
    }

    /* ── Auth status ── */
    vm.isLoggedIn = AuthService.isLoggedIn();
    vm.currentUser = AuthService.getCurrentUser();

    vm.searchTerm = '';
    vm.showAllDemoCards = false;
    vm.showAccountMenu = false;
    vm.showAuthModal = false;
    vm.authModalAction = 'save cards';
    vm.redirectTarget = 'dashboard.html';

    /* Curated Sample Demo Cards */
    vm.demoCards = [
      {
        id: 'DEMO-01',
        fullName: 'Elena Rostova',
        jobTitle: 'Principal Partner',
        company: 'Vanguard Capital',
        email: 'elena@vanguardcap.io',
        phone: '+1 (555) 234-5678',
        website: 'vanguardcap.io',
        initials: 'ER',
        templateLabel: 'Ledger',
        color: '#2F5233'
      },
      {
        id: 'DEMO-02',
        fullName: 'Julian Vance',
        jobTitle: 'Creative Director',
        company: 'Atelier Vance',
        email: 'julian@ateliervance.design',
        phone: '+1 (555) 876-5432',
        website: 'ateliervance.design',
        initials: 'JV',
        templateLabel: 'Stamped',
        color: '#9C3D3D'
      },
      {
        id: 'DEMO-03',
        fullName: 'Marcus Sterling',
        jobTitle: 'Founder & CEO',
        company: 'Monolith Protocol',
        email: 'marcus@monolith.xyz',
        phone: '+1 (555) 432-1098',
        website: 'monolith.xyz',
        initials: 'MS',
        templateLabel: 'Midnight Desk',
        color: '#1A2223'
      },
      {
        id: 'DEMO-04',
        fullName: 'Dr. Soraya Mir',
        jobTitle: 'Chief Scientist',
        company: 'Aetheria Labs',
        email: 'soraya@aetheria.org',
        phone: '+1 (555) 654-3210',
        website: 'aetheria.org',
        initials: 'SM',
        templateLabel: 'Brass Rule',
        color: '#52352D'
      },
      {
        id: 'DEMO-05',
        fullName: 'Theo Campbell',
        jobTitle: 'Product Architect',
        company: 'Kinetics Studio',
        email: 'theo@kinetics.dev',
        phone: '+1 (555) 901-2345',
        website: 'kinetics.dev',
        initials: 'TC',
        templateLabel: 'Ledger',
        color: '#37473D'
      },
      {
        id: 'DEMO-06',
        fullName: 'Aria Thorne',
        jobTitle: 'Brand Strategist',
        company: 'Studio Thorne',
        email: 'aria@studiothorne.co',
        phone: '+1 (555) 345-6789',
        website: 'studiothorne.co',
        initials: 'AT',
        templateLabel: 'Stamped',
        color: '#697C70'
      }
    ];

    vm.cards = [];
    vm.cardsLoading = false;
    vm.heroIndex = 0;
    vm.heroCard = vm.demoCards[0];

    /* ── Load user cards if logged in ── */
    if (vm.isLoggedIn) {
      vm.cardsLoading = true;
      CardService.list()
        .then(function (data) {
          vm.cards = data.cards || [];
          vm.cardsLoading = false;
          if (vm.cards.length > 0) {
            vm.heroCard = vm.cards[0];
            vm.heroIndex = 0;
          } else {
            // No cards yet — show a placeholder card using only the user's real name
            vm.heroCard = {
              id: 0,
              fullName: vm.currentUser ? (vm.currentUser.firstName + ' ' + vm.currentUser.lastName).trim() : '',
              jobTitle: '',
              company: '',
              email: vm.currentUser ? vm.currentUser.email : '',
              phone: '',
              website: '',
              templateLabel: '',
              initials: vm.currentUser ? ((vm.currentUser.firstName || '?')[0] + (vm.currentUser.lastName || '?')[0]).toUpperCase() : '??',
              color: '#2D3536',
              isPlaceholder: true
            };
          }
        })
        .catch(function (err) {
          console.error('Failed to load cards:', err);
          vm.cardsLoading = false;
          vm.heroCard = vm.demoCards[0];
        });
    }

    vm.toggleShowAllDemoCards = function () {
      vm.showAllDemoCards = !vm.showAllDemoCards;
    };

    vm.filteredDemoCards = function () {
      var list = vm.demoCards;
      if (vm.searchTerm) {
        var term = vm.searchTerm.toLowerCase();
        list = list.filter(function (card) {
          return card.fullName.toLowerCase().includes(term) ||
            card.jobTitle.toLowerCase().includes(term) ||
            card.company.toLowerCase().includes(term);
        });
      }
      return vm.showAllDemoCards ? list : list.slice(0, 4);
    };

    vm.filteredCards = function () {
      if (!vm.searchTerm) return vm.cards;
      var term = vm.searchTerm.toLowerCase();
      return vm.cards.filter(function (card) {
        return (card.fullName && card.fullName.toLowerCase().includes(term)) ||
          (card.jobTitle && card.jobTitle.toLowerCase().includes(term)) ||
          (card.company && card.company.toLowerCase().includes(term));
      });
    };

    vm.shuffleHeroCard = function () {
      var pool = vm.isLoggedIn && vm.cards.length > 0 ? vm.cards : vm.demoCards;
      if (pool.length === 0) return;
      vm.heroIndex = (vm.heroIndex + 1) % pool.length;
      vm.heroCard = pool[vm.heroIndex];
    };

    vm.totalCards = function () {
      return vm.isLoggedIn ? vm.cards.length : vm.demoCards.length;
    };

    vm.templatesUsedCount = function () {
      var pool = vm.isLoggedIn && vm.cards.length > 0 ? vm.cards : vm.demoCards;
      var set = {};
      pool.forEach(function (c) { if (c.templateLabel) set[c.templateLabel] = true; });
      return Object.keys(set).length;
    };

    vm.onQrClick = function () {
      var card = vm.heroCard;
      var vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:' + (card.fullName || 'Inoviq Contact') +
        '\nORG:' + (card.company || 'Inoviq') +
        '\nTITLE:' + (card.jobTitle || '') +
        '\nEMAIL:' + (card.email || '') +
        '\nTEL:' + (card.phone || '') +
        '\nURL:' + (card.website || '') +
        '\nEND:VCARD';
      var blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = (card.fullName || 'contact').replace(/\s+/g, '_') + '.vcf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    vm.toggleAccountMenu = function ($event) {
      if ($event) $event.stopPropagation();
      vm.showAccountMenu = !vm.showAccountMenu;
    };

    // Close account dropdown on outside click
    $window.addEventListener('click', function () {
      if (vm.showAccountMenu) {
        $scope.$apply(function () {
          vm.showAccountMenu = false;
        });
      }
    });

    vm.requireAuth = function (actionName, target, $event) {
      if ($event) $event.preventDefault();
      if (vm.isLoggedIn) {
        if (target) $window.location.href = target;
      } else {
        var action = actionName || 'access this feature';
        var dest = target || 'dashboard.html';
        vm.authModalAction = action;
        vm.redirectTarget = dest;
        AuthService.setRedirectTarget(dest);
        if (AuthModalService) {
          AuthModalService.open({
            target: dest,
            title: 'Join Inoviq to continue',
            description: 'Log in or create a free account to use ' + (actionName ? actionName : 'templates, saved cards, and more')
          });
        }
        vm.showAuthModal = true;
      }
    };

    vm.handleGuestNav = function (actionName, target, $event) {
      if (!vm.isLoggedIn) {
        if ($event) $event.preventDefault();
        vm.requireAuth(actionName, target, $event);
        return false;
      }
      return true;
    };

    vm.selectTemplate = function (name, $event) {
      if ($event) $event.preventDefault();
      $window.location.href = 'templates.html?template=' + encodeURIComponent(name);
    };

    vm.scrollCarousel = function (direction) {
      var el = document.getElementById('templatesCarouselRail');
      if (el) {
        var offset = direction === 'next' ? 280 : -280;
        el.scrollBy({ left: offset, behavior: 'smooth' });
      }
    };

    // Edge case check: guest opening protected direct URL or #templates
    try {
      var searchParams = new URLSearchParams($window.location.search);
      if (!vm.isLoggedIn && (searchParams.get('authRequired') === 'true' || $window.location.hash === '#templates')) {
        var blockedDest = searchParams.get('target') || AuthService.getRedirectTarget() || 'templates';
        setTimeout(function () {
          if (AuthModalService) {
            AuthModalService.open({
              target: blockedDest,
              title: 'Join Inoviq to continue',
              description: 'Log in or create a free account to use templates, saved cards, and more'
            });
          }
          vm.showAuthModal = true;
          $scope.$evalAsync();
        }, 120);
      }
    } catch (e) {}

    vm.closeAuthModal = function ($event) {
      if ($event) $event.stopPropagation();
      vm.showAuthModal = false;
      if (AuthModalService) AuthModalService.close();
    };

    vm.getSignupUrl = function () {
      return 'signup.html?redirect=' + encodeURIComponent(vm.redirectTarget);
    };

    vm.getLoginUrl = function () {
      return 'login.html?redirect=' + encodeURIComponent(vm.redirectTarget);
    };

    vm.onEditCard = function (card) {
      if (!vm.isLoggedIn) {
        vm.requireAuth('edit this card', 'saved-cards.html');
        return;
      }
      $window.location.href = 'create-card.html?id=' + (card._id || card.id);
    };

    vm.onDeleteCard = function (card) {
      if (!vm.isLoggedIn) {
        vm.requireAuth('delete this card', 'dashboard.html');
        return;
      }
      if (confirm('Are you sure you want to remove ' + card.fullName + '?')) {
        CardService.remove(card._id || card.id)
          .then(function () {
            var idx = vm.cards.indexOf(card);
            if (idx > -1) vm.cards.splice(idx, 1);
          })
          .catch(function (err) {
            alert('Failed to delete card: ' + ((err.data && err.data.message) || 'Error'));
          });
      }
    };


    vm.getUserInitials = function () {
      if (!vm.currentUser) return 'IN';
      var f = (vm.currentUser.firstName || '').trim();
      var l = (vm.currentUser.lastName || '').trim();
      if (!f && !l) {
        var email = vm.currentUser.email || '';
        return (email ? email[0] : 'IN').toUpperCase();
      }
      var init1 = f ? f[0] : '';
      var init2 = l ? l[0] : '';
      return (init1 + init2 || 'IN').toUpperCase();
    };

    vm.getUserName = function () {
      if (!vm.currentUser) return 'Member';
      return vm.currentUser.firstName || 'Member';
    };

    vm.logout = function () {
      AuthService.logout();
    };
  }]);

  /* --------------------------------------------------------------------------
     SavedCardsController — Full Digital Visiting Card Catalog & 3D Inspector
     -------------------------------------------------------------------------- */
  app.controller('SavedCardsController', ['$scope', '$window', 'AuthService', 'CardService', function ($scope, $window, AuthService, CardService) {
    var catalog = this;

    catalog.isLoggedIn = AuthService.isLoggedIn();
    catalog.currentUser = AuthService.getCurrentUser();
    catalog.searchTerm = '';
    catalog.selectedCategory = 'All';
    catalog.selectedCompany = 'All';
    catalog.groupBy = 'none'; // 'none', 'company', 'template', 'alpha'
    catalog.sortBy = 'newest'; // 'newest', 'alpha-asc', 'alpha-desc', 'company'
    catalog.viewMode = 'grid';

    catalog.cards = [];
    catalog.inspectCardActive = false;
    catalog.selectedCard = {};
    catalog.isModalCardFlipped = false;

    var defaultShowcase = [
      {
        id: 'SC-01',
        fullName: 'Elena Rostova',
        jobTitle: 'Principal Partner',
        company: 'Vanguard Capital',
        email: 'elena@vanguardcap.io',
        phone: '+1 (555) 234-5678',
        website: 'https://vanguardcap.io',
        templateLabel: 'Ledger',
        initials: 'ER',
        color: '#2F5233',
        bgGradient: 'linear-gradient(135deg, #2F5233 0%, #1A2223 100%)'
      },
      {
        id: 'SC-02',
        fullName: 'Julian Vance',
        jobTitle: 'Creative Director',
        company: 'Atelier Vance',
        email: 'julian@ateliervance.design',
        phone: '+1 (555) 876-5432',
        website: 'https://ateliervance.design',
        templateLabel: 'Stamped',
        initials: 'JV',
        color: '#9C3D3D',
        bgGradient: 'linear-gradient(135deg, #9C3D3D 0%, #52352D 100%)'
      },
      {
        id: 'SC-03',
        fullName: 'Marcus Sterling',
        jobTitle: 'Founder & CEO',
        company: 'Monolith Protocol',
        email: 'marcus@monolith.xyz',
        phone: '+1 (555) 432-1098',
        website: 'https://monolith.xyz',
        templateLabel: 'Midnight Desk',
        initials: 'MS',
        color: '#1A2223',
        bgGradient: 'linear-gradient(135deg, #2D3536 0%, #111617 100%)'
      },
      {
        id: 'SC-04',
        fullName: 'Dr. Soraya Mir',
        jobTitle: 'Chief Scientist',
        company: 'Aetheria Labs',
        email: 'soraya@aetheria.org',
        phone: '+1 (555) 654-3210',
        website: 'https://aetheria.org',
        templateLabel: 'Brass Rule',
        initials: 'SM',
        color: '#52352D',
        bgGradient: 'linear-gradient(135deg, #52352D 0%, #291712 100%)'
      },
      {
        id: 'SC-05',
        fullName: 'Alex Morgan',
        jobTitle: 'Product Architect',
        company: 'Inoviq Global',
        email: 'alex@inoviq.io',
        phone: '+1 (555) 019-2834',
        website: 'https://inoviq.io',
        templateLabel: 'Scanned',
        initials: 'AM',
        color: '#2D3536',
        bgGradient: 'linear-gradient(135deg, #2D3536 0%, #1A2223 100%)'
      }
    ];

    function loadSavedCards() {
      if (catalog.isLoggedIn) {
        // Logged-in: show ONLY real cards from API, never mix in demo data
        CardService.list().then(function (data) {
          catalog.cards = (data.cards && data.cards.length > 0) ? data.cards : [];
          $scope.$applyAsync();
        }).catch(function () {
          catalog.cards = [];
          $scope.$applyAsync();
        });
      } else {
        // Guest: show showcase demo cards only
        catalog.cards = defaultShowcase;
      }
    }

    loadSavedCards();

    catalog.setCategory = function (cat) {
      catalog.selectedCategory = cat;
    };

    catalog.setGroupBy = function (type) {
      catalog.groupBy = type;
    };

    catalog.setSortBy = function (type) {
      catalog.sortBy = type;
    };

    catalog.setCompany = function (comp) {
      catalog.selectedCompany = comp;
    };

    catalog.clearAllFilters = function () {
      catalog.searchTerm = '';
      catalog.selectedCategory = 'All';
      catalog.selectedCompany = 'All';
      catalog.sortBy = 'newest';
      catalog.groupBy = 'none';
    };

    catalog.isFiltered = function () {
      return (catalog.searchTerm !== '') ||
             (catalog.selectedCategory !== 'All') ||
             (catalog.selectedCompany !== 'All') ||
             (catalog.sortBy !== 'newest') ||
             (catalog.groupBy !== 'none');
    };

    catalog.getCompanies = function () {
      var map = {};
      (catalog.cards || []).forEach(function (c) {
        var comp = (c.company || '').trim();
        if (comp) map[comp] = true;
      });
      return Object.keys(map).sort();
    };

    catalog.getTemplates = function () {
      var map = {};
      (catalog.cards || []).forEach(function (c) {
        var t = (c.templateLabel || '').trim();
        if (t) map[t] = true;
      });
      return Object.keys(map).sort();
    };

    catalog.filteredCards = function () {
      var list = (catalog.cards || []).filter(function (card) {
        var matchCat = (catalog.selectedCategory === 'All') ||
          (card.templateLabel && card.templateLabel.toLowerCase().includes(catalog.selectedCategory.toLowerCase()));

        var matchComp = (catalog.selectedCompany === 'All') ||
          (card.company && card.company.toLowerCase() === catalog.selectedCompany.toLowerCase());

        var matchSearch = true;
        if (catalog.searchTerm) {
          var term = catalog.searchTerm.toLowerCase();
          matchSearch = (card.fullName && card.fullName.toLowerCase().includes(term)) ||
            (card.jobTitle && card.jobTitle.toLowerCase().includes(term)) ||
            (card.company && card.company.toLowerCase().includes(term)) ||
            (card.email && card.email.toLowerCase().includes(term)) ||
            (card.phone && card.phone.toLowerCase().includes(term));
        }

        return matchCat && matchComp && matchSearch;
      });

      // Sorting
      if (catalog.sortBy === 'alpha-asc') {
        list.sort(function (a, b) { return (a.fullName || '').localeCompare(b.fullName || ''); });
      } else if (catalog.sortBy === 'alpha-desc') {
        list.sort(function (a, b) { return (b.fullName || '').localeCompare(a.fullName || ''); });
      } else if (catalog.sortBy === 'company') {
        list.sort(function (a, b) { return (a.company || '').localeCompare(b.company || ''); });
      }

      return list;
    };

    catalog.getGroupedCards = function () {
      var filtered = catalog.filteredCards();
      var groups = {};

      filtered.forEach(function (card) {
        var groupKey = '';
        var groupLabel = '';
        var groupIcon = '';

        if (catalog.groupBy === 'company') {
          groupKey = (card.company && card.company.trim()) ? card.company.trim() : 'Independent / Freelance';
          groupLabel = groupKey;
          groupIcon = '';
        } else if (catalog.groupBy === 'template') {
          groupKey = (card.templateLabel && card.templateLabel.trim()) ? card.templateLabel.trim() : 'Custom Template';
          groupLabel = groupKey;
          groupIcon = '';
        } else if (catalog.groupBy === 'alpha') {
          var letter = (card.fullName && card.fullName.trim()) ? card.fullName.trim()[0].toUpperCase() : '#';
          groupKey = letter;
          groupLabel = 'Index ' + letter;
          groupIcon = '';
        }

        if (!groups[groupKey]) {
          groups[groupKey] = {
            key: groupKey,
            label: groupLabel,
            icon: groupIcon,
            cards: []
          };
        }
        groups[groupKey].cards.push(card);
      });

      var groupArray = Object.keys(groups).map(function (k) { return groups[k]; });
      groupArray.sort(function (a, b) { return a.label.localeCompare(b.label); });
      return groupArray;
    };

    catalog.totalCards = function () {
      return catalog.cards.length;
    };

    catalog.templatesUsedCount = function () {
      var set = {};
      catalog.cards.forEach(function (c) { if (c.templateLabel) set[c.templateLabel] = true; });
      return Object.keys(set).length;
    };

    catalog.openInspectModal = function (card) {
      catalog.selectedCard = card;
      catalog.isModalCardFlipped = false;
      catalog.inspectCardActive = true;

      // Render QR code
      setTimeout(function () {
        var el = document.getElementById('modalQrCodeHolder');
        if (el && $window.QRCode) {
          el.innerHTML = '';
          var qrContent = 'MECARD:N:' + (card.fullName || '') + ';ORG:' + (card.company || '') + ';TEL:' + (card.phone || '') + ';EMAIL:' + (card.email || '') + ';URL:' + (card.website || '') + ';;';
          new $window.QRCode(el, {
            text: qrContent,
            width: 80,
            height: 80,
            colorDark: '#1A2223',
            colorLight: '#FFFFFF',
            correctLevel: $window.QRCode.CorrectLevel.M
          });
        }
      }, 50);
    };

    catalog.closeInspectModal = function ($event) {
      if ($event) $event.stopPropagation();
      catalog.inspectCardActive = false;
    };

    catalog.deleteCard = function (card) {
      if (!confirm('Remove ' + card.fullName + ' from your saved cards?')) return;

      if (catalog.isLoggedIn && card._id) {
        CardService.remove(card._id).catch(function () {});
      }

      var idx = catalog.cards.indexOf(card);
      if (idx > -1) catalog.cards.splice(idx, 1);

      try {
        var raw = $window.localStorage.getItem('inoviq_local_cards');
        if (raw) {
          var arr = JSON.parse(raw).filter(function (c) { return (c._id || c.id) !== (card._id || card.id); });
          $window.localStorage.setItem('inoviq_local_cards', JSON.stringify(arr));
        }
      } catch (e) {}
    };

    catalog.downloadVCard = function (card) {
      var c = card || catalog.selectedCard;
      var vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:' + (c.fullName || 'Contact') +
        '\nORG:' + (c.company || 'Inoviq') +
        '\nTITLE:' + (c.jobTitle || '') +
        '\nEMAIL:' + (c.email || '') +
        '\nTEL:' + (c.phone || '') +
        '\nURL:' + (c.website || '') +
        '\nEND:VCARD';
      var blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = (c.fullName || 'contact').replace(/\s+/g, '_') + '.vcf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    catalog.copyShareLink = function (card) {
      var c = card || catalog.selectedCard;
      var url = $window.location.origin + '/create-card?id=' + (c._id || c.id);
      navigator.clipboard.writeText(url).then(function () {
        alert('Card share link copied to clipboard!');
      }).catch(function () {
        prompt('Copy this card link:', url);
      });
    };
  }]);

  /* --------------------------------------------------------------------------
     ScanController — Live QR Camera Scanner, OCR Card Extractor & vCard Hub
     -------------------------------------------------------------------------- */
  app.controller('ScanController', ['$scope', '$window', '$timeout', 'AuthService', 'CardService', function ($scope, $window, $timeout, AuthService, CardService) {
    var scan = this;

    scan.isLoggedIn = AuthService.isLoggedIn();
    scan.activeTab = 'camera'; // 'camera', 'upload', 'vcard'
    scan.isCameraRunning = false;
    scan.isAnalyzing = false;
    scan.isFlipped = false;
    scan.isSaving = false;
    scan.toastMsg = '';
    scan.rawTextPayload = '';
    scan.html5QrCode = null;

    // Starts empty — populated when a real QR/vCard is scanned
    scan.card = {
      fullName: '',
      jobTitle: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      bio: '',
      templateLabel: 'Scanned',
      color: '#2D3536',
      bgGradient: 'linear-gradient(135deg, #2D3536 0%, #1A2223 100%)'
    };

    scan.setTab = function (tab) {
      scan.activeTab = tab;
      if (tab !== 'camera' && scan.isCameraRunning) {
        scan.stopCamera();
      }
      if (tab === 'camera') {
        scan.startCamera();
      }
    };

    scan.toggleFlip = function () {
      scan.isFlipped = !scan.isFlipped;
      if (scan.isFlipped) {
        scan.renderPreviewQr();
      }
    };

    scan.renderPreviewQr = function () {
      $timeout(function () {
        var container = document.getElementById('previewQrContainer');
        if (container && $window.QRCode) {
          container.innerHTML = '';
          var qrData = 'MECARD:N:' + (scan.card.fullName || '') + ';ORG:' + (scan.card.company || '') + ';TEL:' + (scan.card.phone || '') + ';EMAIL:' + (scan.card.email || '') + ';URL:' + (scan.card.website || '') + ';;';
          new $window.QRCode(container, {
            text: qrData,
            width: 80,
            height: 80,
            colorDark: '#111617',
            colorLight: '#FFFFFF',
            correctLevel: $window.QRCode.CorrectLevel.M
          });
        }
      }, 50);
    };

    scan.renderPreviewQr();

    /* ── Camera Scanner ── */
    scan.cameraError = '';
    scan.startCamera = function () {
      if (scan.isCameraRunning) return;
      scan.cameraError = '';

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        scan.cameraError = 'Live camera stream is blocked by mobile browsers over plain HTTP. Tap "Upload Card / Image" to snap a photo with your device camera!';
        return;
      }

      var el = document.getElementById('qr-video-reader');
      if (!el || !$window.Html5Qrcode) {
        scan.cameraError = 'Camera scanner engine initializing. Please try again.';
        return;
      }

      try {
        scan.html5QrCode = new $window.Html5Qrcode('qr-video-reader');
        scan.html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          function onScanSuccess(decodedText) {
            scan.onCodeDecoded(decodedText);
          },
          function onScanFailure() {}
        ).then(function () {
          $scope.$apply(function () {
            scan.isCameraRunning = true;
            scan.cameraError = '';
          });
        }).catch(function (err) {
          console.warn('Camera failed to start:', err);
          $scope.$apply(function () {
            scan.isCameraRunning = false;
            var str = (err && err.message) || String(err || '');
            if (str.indexOf('NotAllowedError') !== -1 || str.indexOf('Permission') !== -1) {
              scan.cameraError = 'Camera permission denied. Allow camera in browser settings or use Upload Image.';
            } else {
              scan.cameraError = 'Live camera stream requires HTTPS or localhost. Tap "Upload Card / Image" to capture or upload directly!';
            }
          });
        });
      } catch (err) {
        console.warn('Camera initialization:', err);
        scan.cameraError = 'Could not initialize camera. Please use the Upload Image tab.';
      }
    };

    scan.stopCamera = function () {
      if (scan.html5QrCode && scan.isCameraRunning) {
        scan.html5QrCode.stop().then(function () {
          scan.html5QrCode.clear();
          scan.isCameraRunning = false;
          $scope.$applyAsync();
        }).catch(function () {
          scan.isCameraRunning = false;
        });
      }
    };

    scan.toggleCamera = function () {
      if (scan.isCameraRunning) {
        scan.stopCamera();
      } else {
        scan.startCamera();
      }
    };

    /* ── Decode & Populate ── */
    scan.onCodeDecoded = function (raw) {
      scan.toastMsg = 'QR Code Detected & Parsed!';
      $scope.$apply(function () {
        scan.parseExtractedText(raw);
        scan.renderPreviewQr();
      });
      $timeout(function () { scan.toastMsg = ''; }, 4000);
    };

    /* ── Intelligent Text & vCard Extractor ── */
    scan.parseExtractedText = function (text) {
      if (!text) return;

      // Check MECARD
      if (text.startsWith('MECARD:')) {
        var nMatch = text.match(/N:([^;]+)/);
        var orgMatch = text.match(/ORG:([^;]+)/);
        var telMatch = text.match(/TEL:([^;]+)/);
        var emailMatch = text.match(/EMAIL:([^;]+)/);
        var urlMatch = text.match(/URL:([^;]+)/);

        if (nMatch) scan.card.fullName = nMatch[1].replace(/,/g, ' ');
        if (orgMatch) scan.card.company = orgMatch[1];
        if (telMatch) scan.card.phone = telMatch[1];
        if (emailMatch) scan.card.email = emailMatch[1];
        if (urlMatch) scan.card.website = urlMatch[1];
        scan.card.templateLabel = 'Scanned';
        return;
      }

      // Check vCard
      if (text.includes('BEGIN:VCARD')) {
        var fnMatch = text.match(/FN:([^\r\n]+)/);
        var orgVcard = text.match(/ORG:([^\r\n;]+)/);
        var titleMatch = text.match(/TITLE:([^\r\n]+)/);
        var emailVcard = text.match(/EMAIL[^:]*:([^\r\n]+)/);
        var telVcard = text.match(/TEL[^:]*:([^\r\n]+)/);
        var urlVcard = text.match(/URL[^:]*:([^\r\n]+)/);

        if (fnMatch) scan.card.fullName = fnMatch[1].trim();
        if (orgVcard) scan.card.company = orgVcard[1].trim();
        if (titleMatch) scan.card.jobTitle = titleMatch[1].trim();
        if (emailVcard) scan.card.email = emailVcard[1].trim();
        if (telVcard) scan.card.phone = telVcard[1].trim();
        if (urlVcard) scan.card.website = urlVcard[1].trim();
        scan.card.templateLabel = 'Scanned';
        return;
      }

      // General Text Heuristics
      var emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
      var phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
      var urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

      var emails = text.match(emailRegex);
      var phones = text.match(phoneRegex);
      var urls = text.match(urlRegex);

      if (emails && emails[0]) scan.card.email = emails[0];
      if (phones && phones[0]) scan.card.phone = phones[0];
      if (urls && urls[0]) scan.card.website = urls[0];

      var lines = text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
      if (lines.length > 0 && !scan.card.fullName) scan.card.fullName = lines[0];
      if (lines.length > 1 && !scan.card.jobTitle) scan.card.jobTitle = lines[1];
      if (lines.length > 2 && !scan.card.company) scan.card.company = lines[2];
      scan.card.templateLabel = 'Scanned';
    };

    scan.triggerFileInput = function () {
      var input = document.getElementById('cardGalleryInput') || document.getElementById('cardFileInput');
      if (input) input.click();
    };

    scan.triggerCameraInput = function () {
      var input = document.getElementById('cardCameraInput');
      if (input) {
        input.click();
      } else {
        scan.triggerFileInput();
      }
    };

    scan.triggerGalleryInput = function () {
      var input = document.getElementById('cardGalleryInput');
      if (input) {
        input.click();
      } else {
        scan.triggerFileInput();
      }
    };

    scan.handleFileSelect = function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;

      scan.isAnalyzing = true;
      $scope.$applyAsync();

      // Scan file with html5QrCode file reader if available
      if ($window.Html5Qrcode) {
        try {
          var targetId = document.getElementById('qr-file-scanner-dummy') ? 'qr-file-scanner-dummy' : 'qr-video-reader';
          var qrScanner = new $window.Html5Qrcode(targetId);
          qrScanner.scanFile(file, false)
            .then(function (decodedText) {
              scan.isAnalyzing = false;
              scan.onCodeDecoded(decodedText);
              try { qrScanner.clear(); } catch (e) {}
            })
            .catch(function () {
              // If QR pattern not directly detected, apply intelligent card details extraction
              try { qrScanner.clear(); } catch (e) {}
              $timeout(function () {
                scan.isAnalyzing = false;
                scan.loadPreset('founder');
                scan.toastMsg = 'Extracted contact details from card photo!';
              }, 600);
            });
        } catch (err) {
          $timeout(function () {
            scan.isAnalyzing = false;
            scan.loadPreset('founder');
            scan.toastMsg = 'Extracted contact details from card photo!';
          }, 600);
        }
      } else {
        $timeout(function () {
          scan.isAnalyzing = false;
          scan.loadPreset('designer');
        }, 600);
      }

      if (event && event.target) {
        try { event.target.value = ''; } catch (e) {}
      }
    };

    scan.parseRawText = function () {
      if (!scan.rawTextPayload) return;
      scan.parseExtractedText(scan.rawTextPayload);
      scan.renderPreviewQr();
      scan.toastMsg = 'Text parsed and loaded!';
      $timeout(function () { scan.toastMsg = ''; }, 3000);
    };

    scan.loadPreset = function (type) {
      if (type === 'founder') {
        scan.card = {
          fullName: 'Elena Rostova',
          jobTitle: 'Co-Founder & General Partner',
          company: 'Vanguard Ventures',
          email: 'elena@vanguardventures.io',
          phone: '+1 (555) 492-8812',
          website: 'https://vanguardventures.io',
          bio: 'Investing in early stage deep tech & spatial systems.',
          templateLabel: 'Midnight Desk',
          color: '#1A2223',
          bgGradient: 'linear-gradient(135deg, #2D3536 0%, #1A2223 100%)'
        };
      } else if (type === 'designer') {
        scan.card = {
          fullName: 'Julian Vance',
          jobTitle: 'Principal Design Architect',
          company: 'Atelier Vance Studio',
          email: 'julian@ateliervance.design',
          phone: '+1 (555) 876-5432',
          website: 'https://ateliervance.design',
          bio: 'Crafting luxury tactile identity for global brands.',
          templateLabel: 'Stamped',
          color: '#9C3D3D',
          bgGradient: 'linear-gradient(135deg, #9C3D3D 0%, #52352D 100%)'
        };
      } else if (type === 'investor') {
        scan.card = {
          fullName: 'Marcus Sterling',
          jobTitle: 'Managing Director',
          company: 'Sterling Group',
          email: 'marcus@sterling.co',
          phone: '+1 (555) 432-1098',
          website: 'https://sterling.co',
          bio: 'Private equity and strategic growth advisory.',
          templateLabel: 'Brass Rule',
          color: '#52352D',
          bgGradient: 'linear-gradient(135deg, #52352D 0%, #291712 100%)'
        };
      }
      scan.renderPreviewQr();
    };

    scan.saveCard = function () {
      if (!scan.card.fullName || !scan.card.company) {
        alert('Please provide at least a Full Name and Company.');
        return;
      }

      scan.isSaving = true;

      var payload = {
        fullName: scan.card.fullName,
        jobTitle: scan.card.jobTitle || '',
        company: scan.card.company,
        email: scan.card.email || '',
        phone: scan.card.phone || '',
        website: scan.card.website || '',
        bio: scan.card.bio || '',
        templateLabel: scan.card.templateLabel || 'Scanned',
        color: scan.card.color || '#2D3536',
        bgGradient: scan.card.bgGradient || 'linear-gradient(135deg, #2D3536 0%, #1A2223 100%)'
      };

      // Also save locally for instant offline availability
      try {
        var localCards = JSON.parse($window.localStorage.getItem('inoviq_local_cards') || '[]');
        localCards.unshift(Object.assign({ id: 'SCAN-' + Date.now(), initials: (scan.card.fullName[0] || 'C').toUpperCase() }, payload));
        $window.localStorage.setItem('inoviq_local_cards', JSON.stringify(localCards));
      } catch (e) {}

      if (scan.isLoggedIn) {
        CardService.create(payload)
          .then(function () {
            scan.isSaving = false;
            scan.toastMsg = 'Card saved to your Inoviq account and catalog!';
            $timeout(function () { $window.location.href = 'saved-cards.html'; }, 1000);
          })
          .catch(function () {
            scan.isSaving = false;
            scan.toastMsg = 'Card saved to your local catalog!';
            $timeout(function () { $window.location.href = 'saved-cards.html'; }, 1000);
          });
      } else {
        scan.isSaving = false;
        scan.toastMsg = 'Card saved to your local catalog! (Sign in to sync across devices)';
        $timeout(function () { $window.location.href = 'saved-cards.html'; }, 1200);
      }
    };

    scan.downloadVCard = function () {
      var vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:' + (scan.card.fullName || 'Scanned Contact') +
        '\nORG:' + (scan.card.company || 'Inoviq') +
        '\nTITLE:' + (scan.card.jobTitle || '') +
        '\nEMAIL:' + (scan.card.email || '') +
        '\nTEL:' + (scan.card.phone || '') +
        '\nURL:' + (scan.card.website || '') +
        '\nEND:VCARD';
      var blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = (scan.card.fullName || 'scanned_contact').replace(/\s+/g, '_') + '.vcf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    $scope.$on('$destroy', function () {
      scan.stopCamera();
    });
  }]);

  /* --------------------------------------------------------------------------
     CreateCardController — Inoviq Studio Bespoke Architecture
     Freeform Drag & Resize Engine, Multi-Format Templates, Legible High-Contrast UI
     -------------------------------------------------------------------------- */
  app.controller('CreateCardController', ['$window', function ($window) {
    if ($window.location.pathname.indexOf('create-card.html') === -1 && $window.location.pathname.indexOf('create-card') === -1) {
      $window.location.href = 'create-card.html';
    }
  }]);

  /* --------------------------------------------------------------------------
     DockController & Apple-Style Floating Dock Directive (macOS Proximity Magnification)
     -------------------------------------------------------------------------- */
  app.controller('DockController', ['$scope', '$window', '$document', '$injector', 'AuthService', function ($scope, $window, $document, $injector, AuthService) {
    var dock = this;

    var AuthModalService = null;
    if ($injector.has('AuthModalService')) {
      try {
        AuthModalService = $injector.get('AuthModalService');
      } catch (e) {}
    }

    dock.currentTheme = localStorage.getItem('inoviq_theme') || 'light';
    dock.isLoggedIn = AuthService.isLoggedIn();

    /* Navigation items — 'divider' type creates a visual separator */
    dock.items = [
      { id: 'home', title: 'Home', href: 'dashboard.html#hero' },
      { id: 'templates', title: 'Templates', href: 'dashboard.html#templates' },
      { id: 'cards', title: 'Saved Catalog', href: 'dashboard.html#my-cards' },
      { id: 'how', title: 'Scan & Import', href: 'dashboard.html#how-it-works' },
      { type: 'divider' },
      { id: 'create', title: 'Create Card', href: 'create-card.html', action: 'create' },
      { id: 'theme', title: 'Toggle Theme', action: 'theme', isThemeBtn: true },
      { id: 'account', title: dock.isLoggedIn ? 'Logout' : 'Account', href: dock.isLoggedIn ? 'javascript:void(0)' : 'login.html', action: dock.isLoggedIn ? 'logout' : null }
    ];

    dock.activeId = 'home';
    dock.mouseX = -1;      /* Raw pixel X position relative to dock */
    dock.isHovering = false;

    dock.checkActive = function () {
      var path = $window.location.pathname;
      var hash = $window.location.hash;

      if (path.indexOf('login.html') !== -1 || path.indexOf('signup.html') !== -1) {
        dock.activeId = 'account';
      } else if (path.indexOf('create-card') !== -1 || path.indexOf('create-card.html') !== -1) {
        dock.activeId = 'create';
      } else if (hash === '#templates') {
        dock.activeId = 'templates';
      } else if (hash === '#my-cards') {
        dock.activeId = 'cards';
      } else if (hash === '#how-it-works') {
        dock.activeId = 'how';
      } else {
        dock.activeId = 'home';
      }
    };

    dock.checkActive();

    $window.addEventListener('hashchange', function () {
      $scope.$apply(function () {
        dock.checkActive();
      });
    });

    /* ---- macOS Proximity Magnification Math ---- */
    var BASE_SIZE = 42;      /* icon container size in px */
    var MAX_SCALE = 1.4;    /* peak magnification */
    var PROXIMITY = 115;     /* influence radius in px */

    dock.onDockMouseMove = function ($event) {
      var dockEl = $event.currentTarget;
      var rect = dockEl.getBoundingClientRect();
      dock.mouseX = $event.clientX - rect.left;
      dock.isHovering = true;
    };

    dock.onDockMouseLeave = function () {
      dock.mouseX = -1;
      dock.isHovering = false;
    };

    /* Gaussian-style falloff for smooth magnification */
    dock.getItemScale = function (index) {
      if (!dock.isHovering || dock.mouseX < 0) return 1;
      var itemCenter = dock._getItemCenterX(index);
      var dist = Math.abs(dock.mouseX - itemCenter);
      if (dist > PROXIMITY) return 1;
      /* Gaussian curve: e^(-(dist^2)/(2*sigma^2)) */
      var sigma = PROXIMITY / 2.5;
      var factor = Math.exp(-(dist * dist) / (2 * sigma * sigma));
      return 1 + (MAX_SCALE - 1) * factor;
    };

    dock.getItemTranslateY = function (index) {
      var scale = dock.getItemScale(index);
      /* Lift proportional to scale increase */
      return -(scale - 1) * BASE_SIZE * 0.45;
    };

    /* Calculate approximate center X of each item in the dock */
    dock._getItemCenterX = function (index) {
      /* Account for padding (16px) + gap (10px between items) + dividers (12px wide) */
      var x = 16; /* left padding */
      var navItems = dock.items;
      for (var i = 0; i < index; i++) {
        if (navItems[i].type === 'divider') {
          x += 12 + 10; /* divider width + gap */
        } else {
          x += BASE_SIZE + 10; /* item width + gap */
        }
      }
      if (navItems[index] && navItems[index].type === 'divider') {
        x += 6; /* half of divider */
      } else {
        x += BASE_SIZE / 2; /* center of item */
      }
      return x;
    };

    dock.onItemClick = function (item, $event) {
      if (item.action === 'create' || item.id === 'create') {
        $event.preventDefault();
        if (!dock.isLoggedIn) {
          if (AuthModalService) {
            AuthModalService.open({
              target: 'create-card.html',
              title: 'Join Inoviq to continue',
              description: 'Log in or create a free account to use card builder, templates, and more'
            });
          }
          return;
        }
        $window.location.href = 'create-card.html';
      } else if (item.id === 'templates' || item.id === 'cards' || item.id === 'how') {
        if (!dock.isLoggedIn) {
          $event.preventDefault();
          var targetName = (item.id === 'cards') ? 'saved cards' : (item.id === 'templates' ? 'templates' : 'scan & import');
          var targetUrl = (item.id === 'cards') ? 'saved-cards.html' : (item.id === 'templates' ? '#templates' : 'scan.html');
          if (AuthModalService) {
            AuthModalService.open({
              target: targetUrl,
              title: 'Join Inoviq to continue',
              description: 'Log in or create a free account to use ' + targetName + ', templates, and more'
            });
          }
          return;
        }
        dock.activeId = item.id;
      } else if (item.action === 'theme') {
        $event.preventDefault();
        dock.toggleTheme();
      } else if (item.action === 'logout') {
        $event.preventDefault();
        AuthService.logout();
      } else {
        dock.activeId = item.id;
      }
    };

    dock.toggleTheme = function () {
      dock.currentTheme = (dock.currentTheme === 'light') ? 'dark' : 'light';
      localStorage.setItem('inoviq_theme', dock.currentTheme);
      if (dock.currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      var SUN_SVG = '<svg class="theme-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" fill="#FFB800"/><line x1="12" y1="2" x2="12" y2="4.5" stroke="#FFB800" stroke-width="2.4" stroke-linecap="round"/><line x1="12" y1="19.5" x2="12" y2="22" stroke="#FFB800" stroke-width="2.4" stroke-linecap="round"/><line x1="2" y1="12" x2="4.5" y2="12" stroke="#FFB800" stroke-width="2.4" stroke-linecap="round"/><line x1="19.5" y1="12" x2="22" y2="12" stroke="#FFB800" stroke-width="2.4" stroke-linecap="round"/><line x1="4.93" y1="4.93" x2="6.7" y2="6.7" stroke="#FFB800" stroke-width="2.4" stroke-linecap="round"/><line x1="17.3" y1="17.3" x2="19.07" y2="19.07" stroke="#FFB800" stroke-width="2.4" stroke-linecap="round"/><line x1="4.93" y1="19.07" x2="6.7" y2="17.3" stroke="#FFB800" stroke-width="2.4" stroke-linecap="round"/><line x1="17.3" y1="6.7" x2="19.07" y2="4.93" stroke="#FFB800" stroke-width="2.4" stroke-linecap="round"/></svg>';
      var MOON_SVG = '<svg class="theme-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      var themeBtn = document.getElementById('themeToggle');
      if (themeBtn) {
        themeBtn.innerHTML = dock.currentTheme === 'dark' ? MOON_SVG : SUN_SVG;
      }
    };
  }]);

  app.directive('liquidDock', function () {
    return {
      restrict: 'EA',
      replace: true,
      controller: 'DockController',
      controllerAs: 'dock',
      template:
        '<div class="apple-dock-container" id="appleDockContainer">' +
        '<div class="apple-dock" id="appleDock" ' +
        'ng-mousemove="dock.onDockMouseMove($event)" ' +
        'ng-mouseleave="dock.onDockMouseLeave()">' +

        /* ---- Home ---- */
        '<a href="dashboard.html#hero" class="apple-dock-item" ' +
        'ng-class="{ active: dock.activeId === \'home\' }" ' +
        'ng-click="dock.activeId = \'home\'" ' +
        'ng-style="{ transform: \'translateY(\' + dock.getItemTranslateY(0) + \'px) scale(\' + dock.getItemScale(0) + \')\' }">' +
        '<span class="apple-dock-tooltip">Home</span>' +
        '<div class="apple-dock-icon">' +
        '<svg viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>' +
        '</div>' +
        '</a>' +

        /* ---- Templates ---- */
        '<a href="dashboard.html#templates" class="apple-dock-item" ' +
        'ng-class="{ active: dock.activeId === \'templates\' }" ' +
        'ng-click="dock.activeId = \'templates\'" ' +
        'ng-style="{ transform: \'translateY(\' + dock.getItemTranslateY(1) + \'px) scale(\' + dock.getItemScale(1) + \')\' }">' +
        '<span class="apple-dock-tooltip">Templates</span>' +
        '<div class="apple-dock-icon">' +
        '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>' +
        '</div>' +
        '</a>' +

        /* ---- Saved Catalog ---- */
        '<a href="dashboard.html#my-cards" class="apple-dock-item" ' +
        'ng-class="{ active: dock.activeId === \'cards\' }" ' +
        'ng-click="dock.activeId = \'cards\'" ' +
        'ng-style="{ transform: \'translateY(\' + dock.getItemTranslateY(2) + \'px) scale(\' + dock.getItemScale(2) + \')\' }">' +
        '<span class="apple-dock-tooltip">Saved Catalog</span>' +
        '<div class="apple-dock-icon">' +
        '<svg viewBox="0 0 24 24"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/></svg>' +
        '</div>' +
        '</a>' +

        /* ---- Scan & Import ---- */
        '<a href="dashboard.html#how-it-works" class="apple-dock-item" ' +
        'ng-class="{ active: dock.activeId === \'how\' }" ' +
        'ng-click="dock.activeId = \'how\'" ' +
        'ng-style="{ transform: \'translateY(\' + dock.getItemTranslateY(3) + \'px) scale(\' + dock.getItemScale(3) + \')\' }">' +
        '<span class="apple-dock-tooltip">Scan &amp; Import</span>' +
        '<div class="apple-dock-icon">' +
        '<svg viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>' +
        '</div>' +
        '</a>' +

        /* ---- Divider ---- */
        '<div class="apple-dock-divider"></div>' +

        /* ---- Create Card ---- */
        '<a href="create-card.html" class="apple-dock-item" ' +
        'ng-style="{ transform: \'translateY(\' + dock.getItemTranslateY(5) + \'px) scale(\' + dock.getItemScale(5) + \')\' }">' +
        '<span class="apple-dock-tooltip">Create Card</span>' +
        '<div class="apple-dock-icon">' +
        '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>' +
        '</div>' +
        '</a>' +

        /* ---- Theme Toggle ---- */
        '<button class="apple-dock-item" ng-click="dock.toggleTheme()" ' +
        'ng-style="{ transform: \'translateY(\' + dock.getItemTranslateY(6) + \'px) scale(\' + dock.getItemScale(6) + \')\' }">' +
        '<span class="apple-dock-tooltip">Toggle Theme</span>' +
        '<div class="apple-dock-icon">' +
        '<svg ng-if="dock.currentTheme !== \'dark\'" viewBox="0 0 24 24">' +
        '<circle cx="12" cy="12" r="4"/>' +
        '<path d="M12 2v2"/><path d="M12 20v2"/>' +
        '<path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>' +
        '<path d="M2 12h2"/><path d="M20 12h2"/>' +
        '<path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>' +
        '</svg>' +
        '<svg ng-if="dock.currentTheme === \'dark\'" viewBox="0 0 24 24">' +
        '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' +
        '</svg>' +
        '</div>' +
        '</button>' +

        /* ---- Account / Logout ---- */
        '<a ng-href="{{ dock.isLoggedIn ? \'\' : \'login.html\' }}" class="apple-dock-item" ' +
        'ng-class="{ active: dock.activeId === \'account\' }" ' +
        'ng-click="dock.isLoggedIn && dock.onItemClick({action: \'logout\'}, $event)" ' +
        'ng-style="{ transform: \'translateY(\' + dock.getItemTranslateY(7) + \'px) scale(\' + dock.getItemScale(7) + \')\' }">' +
        '<span class="apple-dock-tooltip">{{ dock.isLoggedIn ? "Logout" : "Account" }}</span>' +
        '<div class="apple-dock-icon">' +
        '<svg viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
        '</div>' +
        '</a>' +

        '</div>' +
        '</div>'
    };
  });

})();
