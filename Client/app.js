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
     CreateCardController — Inoviq Studio Bespoke Architecture
     Freeform Drag & Resize Engine, Multi-Format Templates, Legible High-Contrast UI
     -------------------------------------------------------------------------- */
  app.controller('CreateCardController', ['$scope', '$window', '$timeout', 'AuthService', 'CardService', function ($scope, $window, $timeout, AuthService, CardService) {
    var vm = this;

    /* ── Auth & Current User ── */
    vm.isLoggedIn = AuthService.isLoggedIn();
    vm.currentUser = AuthService.getCurrentUser();

    /* ── Theme Mode (Light by default for clear legibility, toggleable to dark) ── */
    vm.themeMode = $window.localStorage.getItem('inoviq_studio_theme') || 'light';
    document.body.setAttribute('data-theme', vm.themeMode);

    vm.toggleTheme = function () {
      vm.themeMode = vm.themeMode === 'light' ? 'dark' : 'light';
      $window.localStorage.setItem('inoviq_studio_theme', vm.themeMode);
      document.body.setAttribute('data-theme', vm.themeMode);
    };

    /* ── Card Template Formats ── */
    // 'business' (Landscape 3.5:2), 'event' (Portrait 2:3), 'social' (Square 1:1), 'mobile' (Phone 9:16), 'minimal' (Swiss), 'cyber' (Tech Terminal)
    vm.cardFormat = 'business';

    /* ── Active Inspector Navigation Tab ── */
    vm.activeTab = 'content'; // 'content', 'design', 'elements', 'templates'
    vm.switchTab = function (tab) {
      vm.activeTab = tab;
    };

    /* ── Card Content Data ── */
    vm.cardData = {
      fullName: vm.currentUser ? (vm.currentUser.firstName + ' ' + (vm.currentUser.lastName || '')).trim() : 'Alex Morgan',
      jobTitle: 'Principal Product Architect',
      company: 'Inoviq Global Studios',
      email: vm.currentUser ? vm.currentUser.email : 'alex.morgan@inoviq.io',
      phone: '+1 (555) 019-2834',
      website: 'https://inoviq.io',
      location: 'San Francisco, CA',
      bio: 'Crafting high-precision spatial tools and digital identity systems.',
      badgeText: 'VERIFIED ID',
      handle: '@alexmorgan'
    };

    /* ── Card Visual Design Properties ── */
    vm.cardProps = {
      paletteName: 'Obsidian Noir',
      bgColor: '#0F172A',
      cardBgType: 'gradient', // 'solid', 'gradient', 'glass'
      bgGradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #090D16 100%)',
      textColor: '#FFFFFF',
      accentColor: '#38BDF8',
      mutedTextColor: '#94A3B8',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      radius: 20,
      pattern: 'dots', // 'none', 'dots', 'grid', 'mesh', 'lines'
      showChip: true,
      showNfc: true,
      showBarcode: false,
      orgTag: 'INOVIQ // PROTOCOL',
      borderStyle: 'subtle', // 'none', 'subtle', 'glow', 'gold'
      shadowStrength: 'medium' // 'none', 'subtle', 'medium', 'deep'
    };

    /* ── Curated Professional Palettes (Human-crafted, high legibility) ── */
    vm.curatedPalettes = [
      {
        name: 'Obsidian Noir',
        desc: 'Deep titanium slate with electric cyan accent',
        bg: '#0F172A',
        bgGrad: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #090D16 100%)',
        text: '#F8FAFC',
        accent: '#38BDF8',
        muted: '#94A3B8'
      },
      {
        name: 'Pure Editorial Light',
        desc: 'Crisp gallery white with deep carbon contrast',
        bg: '#FFFFFF',
        bgGrad: 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)',
        text: '#0F172A',
        accent: '#2563EB',
        muted: '#64748B'
      },
      {
        name: 'Royal Indigo',
        desc: 'Rich deep violet with vibrant electric blue',
        bg: '#1E1B4B',
        bgGrad: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #0F172A 100%)',
        text: '#FFFFFF',
        accent: '#818CF8',
        muted: '#C7D2FE'
      },
      {
        name: 'Swiss Bauhaus Red',
        desc: 'Minimal stark cream with signature crimson',
        bg: '#FAFAF9',
        bgGrad: 'linear-gradient(135deg, #FAFAF9 0%, #F5F5F4 100%)',
        text: '#1C1917',
        accent: '#DC2626',
        muted: '#78716C'
      },
      {
        name: 'Emerald Executive',
        desc: 'Deep forest green with warm champagne gold',
        bg: '#064E3B',
        bgGrad: 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)',
        text: '#ECFDF5',
        accent: '#FBBF24',
        muted: '#A7F3D0'
      },
      {
        name: 'Cyberpunk Monolith',
        desc: 'Matte black with radiant neon lime matrix',
        bg: '#050505',
        bgGrad: 'linear-gradient(135deg, #000000 0%, #111111 60%, #050505 100%)',
        text: '#FFFFFF',
        accent: '#10B981',
        muted: '#6EE7B7'
      },
      {
        name: 'Warm Cashmere',
        desc: 'Warm beige aesthetic with espresso typography',
        bg: '#F5F2EB',
        bgGrad: 'linear-gradient(135deg, #FBF9F5 0%, #EDE8DC 100%)',
        text: '#292524',
        accent: '#9A3412',
        muted: '#78716C'
      },
      {
        name: 'Midnight Hologram',
        desc: 'Dark iridescent glass with prismatic reflections',
        bg: '#0B0F19',
        bgGrad: 'linear-gradient(135deg, #0B0F19 0%, #1E1B4B 40%, #064E3B 100%)',
        text: '#F8FAFC',
        accent: '#C084FC',
        muted: '#94A3B8'
      }
    ];

    vm.applyPalette = function (pal) {
      vm.cardProps.paletteName = pal.name;
      vm.cardProps.bgColor = pal.bg;
      vm.cardProps.bgGradient = pal.bgGrad;
      vm.cardProps.textColor = pal.text;
      vm.cardProps.accentColor = pal.accent;
      vm.cardProps.mutedTextColor = pal.muted;
      vm.recordChange();
    };

    /* ── Template Presets Switcher ── */
    vm.setFormat = function (format) {
      vm.cardFormat = format;
      if (format === 'event') {
        vm.cardProps.showBarcode = true;
        vm.cardProps.showChip = false;
        vm.qrTransform.x = 28;
        vm.qrTransform.y = 65;
        vm.qrTransform.size = 110;
        if (vm.imageTransform) {
          vm.imageTransform.x = 35;
          vm.imageTransform.y = 12;
          vm.imageTransform.size = 90;
        }
      } else if (format === 'social') {
        vm.cardProps.showBarcode = false;
        vm.cardProps.showChip = false;
        vm.qrTransform.x = 65;
        vm.qrTransform.y = 65;
        vm.qrTransform.size = 95;
        if (vm.imageTransform) {
          vm.imageTransform.x = 8;
          vm.imageTransform.y = 8;
          vm.imageTransform.size = 75;
        }
      } else if (format === 'mobile') {
        vm.cardProps.showBarcode = false;
        vm.cardProps.showChip = true;
        vm.qrTransform.x = 32;
        vm.qrTransform.y = 70;
        vm.qrTransform.size = 105;
        if (vm.imageTransform) {
          vm.imageTransform.x = 36;
          vm.imageTransform.y = 14;
          vm.imageTransform.size = 85;
        }
      } else if (format === 'minimal') {
        vm.applyPalette(vm.curatedPalettes[1]); // Pure Editorial Light
        vm.cardProps.fontFamily = "'Inter', sans-serif";
        vm.cardProps.showChip = false;
        vm.cardProps.radius = 8;
        vm.qrTransform.x = 72;
        vm.qrTransform.y = 62;
        vm.qrTransform.size = 80;
      } else if (format === 'cyber') {
        vm.applyPalette(vm.curatedPalettes[5]); // Cyberpunk Monolith
        vm.cardProps.fontFamily = "'IBM Plex Mono', monospace";
        vm.cardProps.showBarcode = true;
        vm.cardProps.radius = 12;
      } else {
        // Business default
        vm.qrTransform.x = 72;
        vm.qrTransform.y = 56;
        vm.qrTransform.size = 84;
        if (vm.imageTransform) {
          vm.imageTransform.x = 72;
          vm.imageTransform.y = 12;
          vm.imageTransform.size = 60;
        }
      }
      vm.recordChange();
      vm.renderQR();
    };

    /* ── Freeform Interactive Transform Engine (Direct Canvas Drag + Handles) ── */
    vm.selectedObject = null; // 'qr', 'image', 'avatar', 'logo'

    vm.qrTransform = {
      x: 72,       // percentage from left
      y: 56,       // percentage from top
      size: 84,    // width/height in px
      rotation: 0,
      opacity: 100,
      borderRadius: 12,
      shadow: true,
      invertColor: false
    };

    vm.imageTransform = {
      x: 72,
      y: 12,
      size: 65,
      rotation: 0,
      opacity: 100,
      borderRadius: 14,
      shape: 'rounded', // 'square', 'rounded', 'circle'
      shadow: true,
      border: true
    };

    vm.uploadedImageUrl = null;
    vm.uploadedLogoUrl = null;

    vm.selectObject = function (type, event) {
      if (event) event.stopPropagation();
      vm.selectedObject = type;
      vm.activeTab = 'elements';
    };

    vm.deselectObjects = function (event) {
      // If clicking directly on the canvas background, deselect
      if (event && (event.target.id === 'canvasContainer' || event.target.id === 'canvasViewport')) {
        vm.selectedObject = null;
      }
    };

    /* ── Direct Drag & Resize Physics ── */
    var dragState = {
      isDragging: false,
      isResizing: false,
      resizeCorner: null,
      target: null,
      startX: 0,
      startY: 0,
      initialLeftPct: 0,
      initialTopPct: 0,
      initialSize: 0,
      cardRect: null
    };

    vm.startDrag = function (target, event) {
      event.preventDefault();
      event.stopPropagation();
      vm.selectedObject = target;

      var cardElem = document.getElementById('cardRenderFrame');
      if (!cardElem) return;
      var cardRect = cardElem.getBoundingClientRect();

      var transform = target === 'qr' ? vm.qrTransform : vm.imageTransform;

      dragState.isDragging = true;
      dragState.isResizing = false;
      dragState.target = target;
      dragState.startX = event.clientX;
      dragState.startY = event.clientY;
      dragState.initialLeftPct = transform.x;
      dragState.initialTopPct = transform.y;
      dragState.cardRect = cardRect;

      $window.addEventListener('mousemove', onMouseMove);
      $window.addEventListener('mouseup', onMouseUp);
    };

    vm.startResize = function (target, corner, event) {
      event.preventDefault();
      event.stopPropagation();

      var cardElem = document.getElementById('cardRenderFrame');
      if (!cardElem) return;
      var cardRect = cardElem.getBoundingClientRect();

      var transform = target === 'qr' ? vm.qrTransform : vm.imageTransform;

      dragState.isDragging = false;
      dragState.isResizing = true;
      dragState.resizeCorner = corner;
      dragState.target = target;
      dragState.startX = event.clientX;
      dragState.startY = event.clientY;
      dragState.initialSize = transform.size;
      dragState.cardRect = cardRect;

      $window.addEventListener('mousemove', onMouseMove);
      $window.addEventListener('mouseup', onMouseUp);
    };

    function onMouseMove(e) {
      if (!dragState.cardRect) return;

      $scope.$apply(function () {
        var transform = dragState.target === 'qr' ? vm.qrTransform : vm.imageTransform;

        if (dragState.isDragging) {
          var deltaXPx = e.clientX - dragState.startX;
          var deltaYPx = e.clientY - dragState.startY;

          var deltaXPct = (deltaXPx / dragState.cardRect.width) * 100;
          var deltaYPct = (deltaYPx / dragState.cardRect.height) * 100;

          var newX = Math.round(dragState.initialLeftPct + deltaXPct);
          var newY = Math.round(dragState.initialTopPct + deltaYPct);

          // Boundary clamping (0% to 88%)
          transform.x = Math.max(0, Math.min(88, newX));
          transform.y = Math.max(0, Math.min(88, newY));
        } else if (dragState.isResizing) {
          var deltaSize = 0;
          if (dragState.resizeCorner === 'se' || dragState.resizeCorner === 'ne') {
            deltaSize = (e.clientX - dragState.startX);
          } else {
            deltaSize = (dragState.startX - e.clientX);
          }

          var newSize = Math.round(dragState.initialSize + deltaSize);
          transform.size = Math.max(36, Math.min(220, newSize));

          if (dragState.target === 'qr') {
            vm.renderQR();
          }
        }
      });
    }

    function onMouseUp() {
      if (dragState.isDragging || dragState.isResizing) {
        dragState.isDragging = false;
        dragState.isResizing = false;
        dragState.target = null;
        vm.recordChange();
      }
      $window.removeEventListener('mousemove', onMouseMove);
      $window.removeEventListener('mouseup', onMouseUp);
    }

    /* ── Snap Object to Card Corners ── */
    vm.snapObject = function (target, position) {
      var transform = target === 'qr' ? vm.qrTransform : vm.imageTransform;
      if (position === 'top-left') {
        transform.x = 6;
        transform.y = 8;
      } else if (position === 'top-right') {
        transform.x = 74;
        transform.y = 8;
      } else if (position === 'bottom-left') {
        transform.x = 6;
        transform.y = 60;
      } else if (position === 'bottom-right') {
        transform.x = 72;
        transform.y = 56;
      } else if (position === 'center') {
        transform.x = 40;
        transform.y = 40;
      }
      vm.recordChange();
      if (target === 'qr') vm.renderQR();
    };

    /* ── Image Upload & Handling ── */
    vm.triggerUpload = function () {
      var input = document.getElementById('imageInputHidden');
      if (input) input.click();
    };

    vm.onImagePicked = function (inputElem) {
      if (inputElem.files && inputElem.files[0]) {
        var file = inputElem.files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
          $scope.$apply(function () {
            vm.uploadedImageUrl = e.target.result;
            vm.selectedObject = 'image';
            vm.activeTab = 'elements';
            vm.triggerToast('Image imported! Drag or resize directly on the card.');
            vm.recordChange();
          });
        };
        reader.readAsDataURL(file);
      }
    };

    vm.removeImage = function () {
      vm.uploadedImageUrl = null;
      if (vm.selectedObject === 'image') vm.selectedObject = null;
      vm.recordChange();
      vm.triggerToast('Uploaded image removed.');
    };

    /* ── QR Target & Dynamic Encoding Engine ── */
    vm.qrTarget = 'vcard'; // 'vcard', 'website', 'email', 'phone', 'social'

    function buildQRData() {
      var d = vm.cardData;
      if (vm.qrTarget === 'website' && d.website) return d.website;
      if (vm.qrTarget === 'email' && d.email) return 'mailto:' + d.email;
      if (vm.qrTarget === 'phone' && d.phone) return 'tel:' + d.phone;
      if (vm.qrTarget === 'social' && d.handle) return 'https://instagram.com/' + d.handle.replace('@', '');

      // Default high-compatibility vCard 3.0
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:' + (d.fullName || 'Member') + ';;;;',
        'FN:' + (d.fullName || 'Member'),
        'ORG:' + (d.company || 'Inoviq'),
        'TITLE:' + (d.jobTitle || ''),
        d.phone ? ('TEL;TYPE=CELL,VOICE:' + d.phone) : '',
        d.email ? ('EMAIL;TYPE=PREF,INTERNET:' + d.email) : '',
        d.website ? ('URL:' + d.website) : '',
        d.location ? ('ADR:;;;' + d.location + ';;;') : '',
        'NOTE:' + (d.bio || 'Inoviq Digital Pass'),
        'END:VCARD'
      ].filter(Boolean).join('\n');
    }

    vm.renderQR = function () {
      $timeout(function () {
        var container = document.getElementById('liveQRHolder');
        if (!container) return;
        container.innerHTML = '';

        var qrData = buildQRData();
        var size = Math.max(48, vm.qrTransform.size);

        if ($window.QRCode) {
          new $window.QRCode(container, {
            text: qrData,
            width: size,
            height: size,
            colorDark: vm.qrTransform.invertColor ? '#FFFFFF' : '#0F172A',
            colorLight: vm.qrTransform.invertColor ? '#0F172A' : '#FFFFFF',
            correctLevel: $window.QRCode.CorrectLevel.M
          });
        }
      }, 50);
    };

    $timeout(function () {
      vm.renderQR();
    }, 150);

    /* ── 3D Interactive Perspective Tilt ── */
    vm.enable3DTilt = false;
    vm.tiltStyle = {};

    vm.onCanvasMouseMove = function (e) {
      if (!vm.enable3DTilt) return;
      var frame = document.getElementById('cardRenderFrame');
      if (!frame) return;
      var rect = frame.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var cx = rect.width / 2;
      var cy = rect.height / 2;

      var rotX = ((y - cy) / cy) * -12;
      var rotY = ((x - cx) / cx) * 12;

      vm.tiltStyle = {
        transform: 'perspective(1000px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) scale3d(1.02, 1.02, 1.02)',
        transition: 'transform 0.08s ease-out'
      };
    };

    vm.onCanvasMouseLeave = function () {
      if (!vm.enable3DTilt) return;
      vm.tiltStyle = {
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      };
    };

    /* ── Canvas Zoom Controls ── */
    vm.zoom = 100;
    vm.zoomIn = function () { if (vm.zoom < 160) vm.zoom += 10; };
    vm.zoomOut = function () { if (vm.zoom > 50) vm.zoom -= 10; };
    vm.resetZoom = function () { vm.zoom = 100; };

    /* ── Undo / Redo History Stack ── */
    var historyStack = [];
    var historyIndex = -1;
    var maxHistory = 40;

    vm.recordChange = function () {
      var snapshot = {
        cardData: angular.copy(vm.cardData),
        cardProps: angular.copy(vm.cardProps),
        cardFormat: vm.cardFormat,
        qrTransform: angular.copy(vm.qrTransform),
        imageTransform: angular.copy(vm.imageTransform),
        uploadedImageUrl: vm.uploadedImageUrl
      };

      if (historyIndex < historyStack.length - 1) {
        historyStack = historyStack.slice(0, historyIndex + 1);
      }
      historyStack.push(JSON.stringify(snapshot));
      if (historyStack.length > maxHistory) {
        historyStack.shift();
      } else {
        historyIndex++;
      }
    };

    vm.canUndo = function () { return historyIndex > 0; };
    vm.canRedo = function () { return historyIndex < historyStack.length - 1; };

    vm.undo = function () {
      if (vm.canUndo()) {
        historyIndex--;
        applyHistory(historyStack[historyIndex]);
      }
    };

    vm.redo = function () {
      if (vm.canRedo()) {
        historyIndex++;
        applyHistory(historyStack[historyIndex]);
      }
    };

    function applyHistory(serializedState) {
      var st = JSON.parse(serializedState);
      vm.cardData = st.cardData;
      vm.cardProps = st.cardProps;
      vm.cardFormat = st.cardFormat;
      vm.qrTransform = st.qrTransform;
      vm.imageTransform = st.imageTransform;
      vm.uploadedImageUrl = st.uploadedImageUrl;
      vm.renderQR();
    }

    vm.recordChange(); // Initial baseline

    // Keyboard Shortcuts
    $window.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        $scope.$apply(function () {
          if (e.shiftKey) vm.redo();
          else vm.undo();
        });
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        $scope.$apply(function () { vm.redo(); });
      } else if (e.key === 'Escape') {
        $scope.$apply(function () { vm.selectedObject = null; });
      }
    });

    /* ── High-Resolution PNG Card Export ── */
    vm.downloadPNG = function () {
      var frame = document.getElementById('cardRenderFrame');
      if (!frame || !$window.html2canvas) {
        alert('Rendering engine initializing. Please try again.');
        return;
      }

      vm.selectedObject = null; // Hide selection border for clean capture
      vm.triggerToast('Exporting high-resolution PNG…');

      $timeout(function () {
        $window.html2canvas(frame, {
          scale: 3,
          useCORS: true,
          backgroundColor: null,
          logging: false
        }).then(function (canvas) {
          var link = document.createElement('a');
          var fileName = (vm.cardData.fullName ? vm.cardData.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'inoviq') + '_card.png';
          link.href = canvas.toDataURL('image/png');
          link.download = fileName;
          link.click();
          vm.triggerToast('Card exported as PNG successfully!');
        }).catch(function (err) {
          console.error('Export failure:', err);
          alert('Could not export image.');
        });
      }, 100);
    };

    /* ── Export QR Code Separately ── */
    vm.downloadQROnly = function () {
      var container = document.getElementById('liveQRHolder');
      if (!container) return;
      var canvas = container.querySelector('canvas');
      var img = container.querySelector('img');
      var url = canvas ? canvas.toDataURL('image/png') : (img ? img.src : null);

      if (url) {
        var link = document.createElement('a');
        link.href = url;
        link.download = (vm.cardData.fullName ? vm.cardData.fullName.replace(/\s+/g, '_') : 'card') + '_qr.png';
        link.click();
        vm.triggerToast('QR Code exported!');
      }
    };

    /* ── MongoDB Save to Catalog API Integration ── */
    vm.isSaving = false;
    vm.toastNotice = '';

    vm.triggerToast = function (msg) {
      vm.toastNotice = msg;
      $timeout(function () {
        vm.toastNotice = '';
      }, 3500);
    };

    vm.saveCardToCatalog = function () {
      if (!AuthService.isLoggedIn()) {
        if (confirm('An account is required to save cards to your permanent catalog. Go to Login?')) {
          $window.location.href = 'login.html';
        }
        return;
      }

      vm.isSaving = true;

      var payload = {
        fullName: vm.cardData.fullName || 'Alex Morgan',
        jobTitle: vm.cardData.jobTitle || 'Executive',
        company: vm.cardData.company || 'Inoviq Studio',
        phone: vm.cardData.phone || '',
        email: vm.cardData.email || '',
        website: vm.cardData.website || '',
        bio: vm.cardData.bio || '',
        color: vm.cardProps.bgColor || '#0F172A',
        accentColor: vm.cardProps.accentColor || '#38BDF8',
        templateLabel: vm.cardFormat.toUpperCase() + ' (' + vm.cardProps.paletteName + ')',
        avatar: vm.uploadedImageUrl || ''
      };

      CardService.create(payload)
        .then(function (res) {
          vm.isSaving = false;
          if (res.success) {
            vm.triggerToast('Card saved and published to your Inoviq Catalog!');
          }
        })
        .catch(function (err) {
          vm.isSaving = false;
          alert('Failed to save card: ' + ((err.data && err.data.message) || 'Check network connection'));
        });
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
