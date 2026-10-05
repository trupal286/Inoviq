/* ==========================================================================
   INOVIQ — AngularJS Master Application & Liquid Glass Dock Directive
   Pure AngularJS Architecture with Synchronized Circle + Icon Elevation
   + AuthService, CardService, and API Integration
   ========================================================================== */

(function () {
  'use strict';

  var app = angular.module('digiCardApp', []);

  /* --------------------------------------------------------------------------
     AuthService — JWT token management & API calls
     -------------------------------------------------------------------------- */
  app.factory('AuthService', ['$http', '$window', function ($http, $window) {
    var API = '/api/auth';
    var TOKEN_KEY = 'inoviq_token';
    var USER_KEY = 'inoviq_user';

    function saveAuth(token, user) {
      $window.localStorage.setItem(TOKEN_KEY, token);
      $window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    function clearAuth() {
      $window.localStorage.removeItem(TOKEN_KEY);
      $window.localStorage.removeItem(USER_KEY);
    }

    return {
      signup: function (data) {
        return $http.post(API + '/signup', data).then(function (res) {
          if (res.data.success) {
            saveAuth(res.data.token, res.data.user);
          }
          return res.data;
        });
      },

      login: function (identifier, password) {
        return $http.post(API + '/login', {
          identifier: identifier,
          password: password
        }).then(function (res) {
          if (res.data.success) {
            saveAuth(res.data.token, res.data.user);
          }
          return res.data;
        });
      },

      logout: function () {
        clearAuth();
        $window.location.href = 'login.html';
      },

      getToken: function () {
        return $window.localStorage.getItem(TOKEN_KEY);
      },

      isLoggedIn: function () {
        var token = $window.localStorage.getItem(TOKEN_KEY);
        if (!token) return false;
        // Simple expiry check (JWT is base64-encoded JSON)
        try {
          var payload = JSON.parse(atob(token.split('.')[1]));
          return payload.exp * 1000 > Date.now();
        } catch (e) {
          return false;
        }
      },

      getCurrentUser: function () {
        try {
          var data = $window.localStorage.getItem(USER_KEY);
          return data ? JSON.parse(data) : null;
        } catch (e) {
          return null;
        }
      },

      fetchProfile: function () {
        return $http.get(API + '/me', {
          headers: { 'Authorization': 'Bearer ' + $window.localStorage.getItem(TOKEN_KEY) }
        }).then(function (res) {
          if (res.data.success) {
            $window.localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
          }
          return res.data;
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

    /* ── Login ── */
    auth.login = function () {
      auth.errorMsg = '';
      auth.loading = true;

      AuthService.login(auth.identifier, auth.password)
        .then(function (data) {
          auth.loading = false;
          if (data.success) {
            auth.successMsg = 'Login successful! Redirecting...';
            setTimeout(function () {
              $window.location.href = 'dashboard.html';
            }, 600);
          }
        })
        .catch(function (err) {
          auth.loading = false;
          auth.errorMsg = (err.data && err.data.message) || 'Login failed. Please try again.';
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

      AuthService.signup({
        firstName: auth.firstName,
        lastName: auth.lastName,
        email: auth.email,
        phone: auth.phone,
        password: auth.signupPassword,
        confirmPassword: auth.confirmPassword
      })
        .then(function (data) {
          auth.loading = false;
          if (data.success) {
            auth.successMsg = 'Account created! Redirecting...';
            setTimeout(function () {
              $window.location.href = 'dashboard.html';
            }, 800);
          }
        })
        .catch(function (err) {
          auth.loading = false;
          auth.errorMsg = (err.data && err.data.message) || 'Signup failed. Please try again.';
          $scope.$applyAsync();
        });
    };
  }]);

  /* --------------------------------------------------------------------------
     DashboardController
     -------------------------------------------------------------------------- */
  app.controller('DashboardController', ['$scope', '$window', 'AuthService', 'CardService', function ($scope, $window, AuthService, CardService) {
    var vm = this;

    /* ── Auth guard ── */
    vm.isLoggedIn = AuthService.isLoggedIn();
    vm.currentUser = AuthService.getCurrentUser();

    if (!vm.isLoggedIn) {
      $window.location.href = 'login.html';
      return;
    }

    vm.searchTerm = '';

    vm.navItems = [
      { label: 'Dashboard', active: true },
      { label: 'Templates', active: false },
      { label: 'Saved Catalog', active: false },
      { label: 'Scan & Import', active: false }
    ];

    vm.setActiveNav = function (selected) {
      vm.navItems.forEach(function (item) { item.active = false; });
      selected.active = true;
    };

    vm.cards = [];
    vm.cardsLoading = true;

    /* ── Load cards from API ── */
    function loadCards() {
      vm.cardsLoading = true;
      CardService.list()
        .then(function (data) {
          vm.cards = data.cards || [];
          vm.cardsLoading = false;
          // Set hero card
          if (vm.cards.length > 0) {
            vm.heroCard = vm.cards[0];
            vm.heroIndex = 0;
          } else {
            vm.heroCard = {
              id: 0,
              fullName: vm.currentUser ? (vm.currentUser.firstName + ' ' + vm.currentUser.lastName) : 'Your Name',
              jobTitle: 'Your Title',
              company: 'Your Company',
              templateLabel: 'Ledger',
              initials: vm.currentUser ? (vm.currentUser.firstName[0] + vm.currentUser.lastName[0]).toUpperCase() : 'YN',
              color: '#2F5233'
            };
          }
        })
        .catch(function (err) {
          console.error('Failed to load cards:', err);
          vm.cardsLoading = false;
          vm.cards = [];
          vm.heroCard = {
            id: 0,
            fullName: 'Your Name',
            jobTitle: 'Your Title',
            company: 'Your Company',
            templateLabel: 'Ledger',
            initials: 'YN',
            color: '#2F5233'
          };
        });
    }

    loadCards();

    vm.heroIndex = 0;
    vm.heroCard = {};

    vm.shuffleHeroCard = function () {
      if (vm.cards.length === 0) return;
      if ($window._pixelShuffle) {
        $window._pixelShuffle(function () {
          vm.heroIndex = (vm.heroIndex + 1) % vm.cards.length;
          vm.heroCard = vm.cards[vm.heroIndex];
          $scope.$applyAsync();
        });
      } else {
        vm.heroIndex = (vm.heroIndex + 1) % vm.cards.length;
        vm.heroCard = vm.cards[vm.heroIndex];
      }
    };

    vm.totalCards = function () {
      return vm.cards.length;
    };

    vm.templatesUsedCount = function () {
      var set = {};
      vm.cards.forEach(function (c) { if (c.templateLabel) set[c.templateLabel] = true; });
      return Object.keys(set).length;
    };

    vm.filteredCards = function () {
      if (!vm.searchTerm) return vm.cards;
      var term = vm.searchTerm.toLowerCase();
      return vm.cards.filter(function (card) {
        return card.fullName.toLowerCase().includes(term) ||
          card.jobTitle.toLowerCase().includes(term) ||
          card.company.toLowerCase().includes(term);
      });
    };

    vm.onCreateCard = function () {
      var name = prompt('Enter Cardholder Name:', 'New Member');
      if (!name) return;
      var role = prompt('Enter Job Title:', 'Creator & Developer') || 'Member';
      var company = prompt('Enter Company:', 'Inoviq') || 'Inoviq';

      CardService.create({
        fullName: name,
        jobTitle: role,
        company: company,
        templateLabel: 'Ledger',
        color: '#2F5233'
      }).then(function (data) {
        if (data.success) {
          vm.cards.unshift(data.card);
          if (vm.cards.length === 1) {
            vm.heroCard = vm.cards[0];
            vm.heroIndex = 0;
          }
        }
      }).catch(function (err) {
        alert('Failed to create card: ' + ((err.data && err.data.message) || 'Unknown error'));
      });
    };

    vm.onEditCard = function (card) {
      var name = prompt('Edit Cardholder Name:', card.fullName);
      if (name && name !== card.fullName) {
        CardService.update(card._id || card.id, { fullName: name })
          .then(function (data) {
            if (data.success) {
              card.fullName = data.card.fullName;
              card.initials = data.card.initials;
            }
          })
          .catch(function (err) {
            alert('Failed to update card: ' + ((err.data && err.data.message) || 'Unknown error'));
          });
      }
    };

    vm.onDeleteCard = function (card) {
      if (confirm('Are you sure you want to remove ' + card.fullName + '?')) {
        CardService.remove(card._id || card.id)
          .then(function (data) {
            if (data.success) {
              var idx = vm.cards.indexOf(card);
              if (idx > -1) vm.cards.splice(idx, 1);
            }
          })
          .catch(function (err) {
            alert('Failed to delete card: ' + ((err.data && err.data.message) || 'Unknown error'));
          });
      }
    };

    vm.selectTemplate = function (name) {
      alert('Selected Template: "' + name + '". Create a card to use this template!');
    };

    /* ── User info for nav ── */
    vm.getUserInitials = function () {
      if (!vm.currentUser) return 'YN';
      return ((vm.currentUser.firstName || '')[0] + (vm.currentUser.lastName || '')[0]).toUpperCase();
    };

    vm.getUserName = function () {
      if (!vm.currentUser) return 'Account';
      return vm.currentUser.firstName;
    };

    vm.logout = function () {
      AuthService.logout();
    };
  }]);

  /* --------------------------------------------------------------------------
     CreateCardController
     -------------------------------------------------------------------------- */
  app.controller('CreateCardController', ['$scope', '$window', 'AuthService', 'CardService', function ($scope, $window, AuthService, CardService) {
    var vm = this;

    /* ── Auth guard ── */
    if (!AuthService.isLoggedIn()) {
      $window.location.href = 'login.html';
      return;
    }

    vm.currentUser = AuthService.getCurrentUser();

    vm.cardData = {
      fullName: vm.currentUser ? (vm.currentUser.firstName + ' ' + vm.currentUser.lastName) : 'Your Name',
      jobTitle: 'Product Manager & Founder',
      company: 'Loop Studio',
      email: vm.currentUser ? vm.currentUser.email : 'you@company.com',
      phone: '+1 (555) 000-0000',
      website: 'https://company.io',
      bio: 'Crafting digital products with tactile aesthetics and human-centered design.',
      templateStyle: 'Dark Charcoal',
      color: '#2D3536',
      accentColor: '#B1D4D0',
      bgGradient: 'linear-gradient(135deg, #2D3536 0%, #1A2223 100%)'
    };

    vm.isFlipped = false;
    vm.saveSuccess = false;
    vm.saveError = '';
    vm.saving = false;

    vm.colorSwatches = [
      { name: 'Dark Charcoal', color: '#2D3536', accent: '#B1D4D0', gradient: 'linear-gradient(135deg, #2D3536 0%, #1A2223 100%)' },
      { name: 'Deep Espresso', color: '#52352D', accent: '#F2EFE2', gradient: 'linear-gradient(135deg, #52352D 0%, #36221C 100%)' },
      { name: 'Midnight Navy', color: '#1B2740', accent: '#67C3F3', gradient: 'linear-gradient(135deg, #1B2740 0%, #0F1726 100%)' },
      { name: 'Forest Moss', color: '#697C70', accent: '#F2EFE2', gradient: 'linear-gradient(135deg, #697C70 0%, #46554D 100%)' },
      { name: 'Eucalyptus', color: '#98AA9D', accent: '#2D3536', gradient: 'linear-gradient(135deg, #98AA9D 0%, #76897B 100%)' },
      { name: 'Warm Cream', color: '#F2EFE2', accent: '#52352D', gradient: 'linear-gradient(135deg, #F2EFE2 0%, #E2DDD0 100%)' },
      { name: 'Cyber Teal', color: '#104F55', accent: '#B1D4D0', gradient: 'linear-gradient(135deg, #104F55 0%, #082F33 100%)' }
    ];

    vm.templates = [
      { id: 'ledger', name: 'Ledger Pro', tag: 'Minimal Tactile' },
      { id: 'midnight', name: 'Midnight Desk', tag: 'Executive Dark' },
      { id: 'brass', name: 'Brass Rule', tag: 'Classic Serif' },
      { id: 'stamped', name: 'Stamped Gold', tag: 'Premium Foil' }
    ];
    vm.selectedTemplate = vm.templates[0];

    vm.selectSwatch = function (swatch) {
      vm.cardData.templateStyle = swatch.name;
      vm.cardData.color = swatch.color;
      vm.cardData.accentColor = swatch.accent;
      vm.cardData.bgGradient = swatch.gradient;
    };

    vm.selectTemplate = function (tpl) {
      vm.selectedTemplate = tpl;
    };

    vm.getInitials = function () {
      if (!vm.cardData.fullName) return 'YN';
      var parts = vm.cardData.fullName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      } else if (parts[0].length > 0) {
        return parts[0].substring(0, 2).toUpperCase();
      }
      return 'YN';
    };

    vm.toggleFlip = function () {
      vm.isFlipped = !vm.isFlipped;
    };

    vm.onSaveCard = function () {
      vm.saveError = '';
      vm.saving = true;

      var payload = angular.copy(vm.cardData);
      payload.templateLabel = vm.selectedTemplate.name;

      CardService.create(payload)
        .then(function (data) {
          vm.saving = false;
          if (data.success) {
            vm.saveSuccess = true;
            setTimeout(function () {
              $scope.$apply(function () {
                vm.saveSuccess = false;
              });
            }, 4000);
          }
        })
        .catch(function (err) {
          vm.saving = false;
          vm.saveError = (err.data && err.data.message) || 'Failed to save card. Please try again.';
          $scope.$applyAsync();
        });
    };

    vm.copyCardLink = function () {
      if (navigator.clipboard) {
        navigator.clipboard.writeText($window.location.origin + '/create-card?card=' + encodeURIComponent(vm.cardData.fullName));
      }
      alert('Card Public Link copied to clipboard!');
    };
  }]);

  /* --------------------------------------------------------------------------
     DockController & Apple-Style Floating Dock Directive (macOS Proximity Magnification)
     -------------------------------------------------------------------------- */
  app.controller('DockController', ['$scope', '$window', '$document', 'AuthService', function ($scope, $window, $document, AuthService) {
    var dock = this;

    dock.currentTheme = localStorage.getItem('inoviq_theme') || 'light';
    dock.isLoggedIn = AuthService.isLoggedIn();

    /* Navigation items — 'divider' type creates a visual separator */
    dock.items = [
      { id: 'home', title: 'Home', href: 'dashboard.html#hero' },
      { id: 'templates', title: 'Templates', href: 'dashboard.html#templates' },
      { id: 'cards', title: 'Saved Catalog', href: 'dashboard.html#my-cards' },
      { id: 'how', title: 'Scan & Import', href: 'dashboard.html#how-it-works' },
      { type: 'divider' },
      { id: 'create', title: 'Create Card', href: 'create-card.html' },
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
      if (item.action === 'create') {
        $event.preventDefault();
        $window.location.href = 'create-card.html';
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
      var themeBtn = document.getElementById('themeToggle');
      if (themeBtn) {
        themeBtn.textContent = dock.currentTheme === 'dark' ? '☀️' : '🌙';
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
        '<svg ng-if="dock.currentTheme === \'dark\'" viewBox="0 0 24 24">' +
        '<circle cx="12" cy="12" r="4"/>' +
        '<path d="M12 2v2"/><path d="M12 20v2"/>' +
        '<path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>' +
        '<path d="M2 12h2"/><path d="M20 12h2"/>' +
        '<path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>' +
        '</svg>' +
        '<svg ng-if="dock.currentTheme !== \'dark\'" viewBox="0 0 24 24">' +
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
