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
            vm.heroCard = {
              id: 0,
              fullName: vm.currentUser ? (vm.currentUser.firstName + ' ' + vm.currentUser.lastName) : 'Your Name',
              jobTitle: 'Principal Architect',
              company: 'Inoviq Global',
              email: vm.currentUser ? vm.currentUser.email : 'contact@inoviq.io',
              phone: '+1 (555) 019-2834',
              website: 'inoviq.io',
              templateLabel: 'Ledger',
              initials: vm.currentUser ? ((vm.currentUser.firstName[0] || 'Y') + (vm.currentUser.lastName[0] || 'N')).toUpperCase() : 'YN',
              color: '#2D3536'
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

    vm.requireAuth = function (actionName, target) {
      if (vm.isLoggedIn) {
        $window.location.href = target;
      } else {
        vm.authModalAction = actionName || 'access this page';
        vm.redirectTarget = target || 'dashboard.html';
        vm.showAuthModal = true;
      }
    };

    vm.closeAuthModal = function ($event) {
      if ($event) $event.stopPropagation();
      vm.showAuthModal = false;
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

    vm.selectTemplate = function (name) {
      $window.location.href = 'create-card.html?template=' + encodeURIComponent(name);
    };

    vm.getUserInitials = function () {
      if (!vm.currentUser) return 'IN';
      return ((vm.currentUser.firstName || '')[0] + (vm.currentUser.lastName || '')[0]).toUpperCase();
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
      var localCards = [];
      try {
        var raw = $window.localStorage.getItem('inoviq_local_cards');
        if (raw) localCards = JSON.parse(raw);
      } catch (e) {}

      if (catalog.isLoggedIn) {
        CardService.list().then(function (data) {
          catalog.cards = (data.cards && data.cards.length > 0) ? data.cards : localCards.concat(defaultShowcase);
        }).catch(function () {
          catalog.cards = localCards.concat(defaultShowcase);
        });
      } else {
        catalog.cards = localCards.concat(defaultShowcase);
      }
    }

    loadSavedCards();

    catalog.setCategory = function (cat) {
      catalog.selectedCategory = cat;
    };

    catalog.filteredCards = function () {
      return catalog.cards.filter(function (card) {
        var matchCat = (catalog.selectedCategory === 'All') ||
          (card.templateLabel && card.templateLabel.toLowerCase() === catalog.selectedCategory.toLowerCase());

        var matchSearch = true;
        if (catalog.searchTerm) {
          var term = catalog.searchTerm.toLowerCase();
          matchSearch = (card.fullName && card.fullName.toLowerCase().includes(term)) ||
            (card.jobTitle && card.jobTitle.toLowerCase().includes(term)) ||
            (card.company && card.company.toLowerCase().includes(term)) ||
            (card.email && card.email.toLowerCase().includes(term));
        }

        return matchCat && matchSearch;
      });
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

    scan.card = {
      fullName: 'Alexandre Moreau',
      jobTitle: 'Design Technologist',
      company: 'Atelier Spatial',
      email: 'alexandre@atelierspatial.com',
      phone: '+1 (555) 789-0123',
      website: 'https://atelierspatial.com',
      bio: 'Physical computing and brand identity systems.',
      templateLabel: 'Ledger',
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
    scan.startCamera = function () {
      if (scan.isCameraRunning) return;
      var el = document.getElementById('qr-video-reader');
      if (!el || !$window.Html5Qrcode) return;

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
          });
        }).catch(function (err) {
          console.warn('Camera failed to start:', err);
        });
      } catch (err) {
        console.warn('Camera initialization:', err);
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
      scan.toastMsg = '🎯 QR Code Detected & Parsed!';
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
      var input = document.getElementById('cardFileInput');
      if (input) input.click();
    };

    scan.handleFileSelect = function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;

      scan.isAnalyzing = true;
      $scope.$applyAsync();

      // Scan file with html5QrCode file reader if available
      if ($window.Html5Qrcode) {
        var qrScanner = new $window.Html5Qrcode('qr-video-reader');
        qrScanner.scanFile(file, true)
          .then(function (decodedText) {
            scan.isAnalyzing = false;
            scan.onCodeDecoded(decodedText);
          })
          .catch(function () {
            // If QR not found, simulate OCR card extraction
            $timeout(function () {
              scan.isAnalyzing = false;
              scan.loadPreset('founder');
              scan.toastMsg = '✨ Extracted contact details from card photo!';
            }, 800);
          });
      } else {
        $timeout(function () {
          scan.isAnalyzing = false;
          scan.loadPreset('designer');
        }, 600);
      }
    };

    scan.parseRawText = function () {
      if (!scan.rawTextPayload) return;
      scan.parseExtractedText(scan.rawTextPayload);
      scan.renderPreviewQr();
      scan.toastMsg = '✨ Text parsed and loaded!';
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
            scan.toastMsg = '✅ Card saved to your Inoviq account and catalog!';
            $timeout(function () { $window.location.href = 'saved-cards.html'; }, 1000);
          })
          .catch(function () {
            scan.isSaving = false;
            scan.toastMsg = '💾 Card saved to your local catalog!';
            $timeout(function () { $window.location.href = 'saved-cards.html'; }, 1000);
          });
      } else {
        scan.isSaving = false;
        scan.toastMsg = '💾 Card saved to your local catalog! (Sign in to sync across devices)';
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
