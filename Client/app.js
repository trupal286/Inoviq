/* ==========================================================================
   INOVIQ — AngularJS Master Application & Liquid Glass Dock Directive
   Pure AngularJS Architecture with Synchronized Circle + Icon Elevation
   ========================================================================== */

(function () {
  'use strict';

  var app = angular.module('digiCardApp', []);

  /* --------------------------------------------------------------------------
     DashboardController
     -------------------------------------------------------------------------- */
  app.controller('DashboardController', ['$scope', '$window', function ($scope, $window) {
    var vm = this;

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

    vm.cards = [
      { id: 1, fullName: 'Trupal Panchal', jobTitle: 'Product Lead & Architect', company: 'Inoviq Studio', templateLabel: 'Ledger', initials: 'TP', color: '#2F5233' },
      { id: 2, fullName: 'Aarav Mehta', jobTitle: 'Senior UX Designer', company: 'Studio Craft', templateLabel: 'Midnight Desk', initials: 'AM', color: '#1B2740' },
      { id: 3, fullName: 'Riddhi Gandhi', jobTitle: 'Lead Software Engineer', company: 'Inoviq Tech', templateLabel: 'Brass Rule', initials: 'RG', color: '#B08D57' },
      { id: 4, fullName: 'Sofia Chen', jobTitle: 'Brand Designer', company: 'Aura Studio', templateLabel: 'Stamped', initials: 'SC', color: '#9C3D3D' }
    ];

    vm.heroIndex = 0;
    vm.heroCard = vm.cards[0];

    vm.shuffleHeroCard = function () {
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

      var initials = name.split(' ').map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();

      vm.cards.push({
        id: Date.now(),
        fullName: name,
        jobTitle: role,
        company: company,
        templateLabel: 'Ledger',
        initials: initials || 'IN',
        color: '#2F5233'
      });
    };

    vm.onEditCard = function (card) {
      var name = prompt('Edit Cardholder Name:', card.fullName);
      if (name) {
        card.fullName = name;
        card.initials = name.split(' ').map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
      }
    };

    vm.onDeleteCard = function (card) {
      if (confirm('Are you sure you want to remove ' + card.fullName + '?')) {
        var idx = vm.cards.indexOf(card);
        if (idx > -1) vm.cards.splice(idx, 1);
      }
    };

    vm.selectTemplate = function (name) {
      alert('Selected Template: "' + name + '". Create a card to use this template!');
    };
  }]);

  /* --------------------------------------------------------------------------
     CreateCardController
     -------------------------------------------------------------------------- */
  app.controller('CreateCardController', ['$scope', '$window', function ($scope, $window) {
    var vm = this;

    vm.cardData = {
      fullName: 'Trupal Panchal',
      jobTitle: 'Product Manager & Founder',
      company: 'Loop Studio',
      email: 'you@company.com',
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
      vm.saveSuccess = true;
      setTimeout(function () {
        $scope.$apply(function () {
          vm.saveSuccess = false;
        });
      }, 4000);
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
  app.controller('DockController', ['$scope', '$window', '$document', function ($scope, $window, $document) {
    var dock = this;

    dock.currentTheme = localStorage.getItem('inoviq_theme') || 'light';

    /* Navigation items — 'divider' type creates a visual separator */
    dock.items = [
      { id: 'home', title: 'Home', href: 'dashboard.html#hero' },
      { id: 'templates', title: 'Templates', href: 'dashboard.html#templates' },
      { id: 'cards', title: 'Saved Catalog', href: 'dashboard.html#my-cards' },
      { id: 'how', title: 'Scan & Import', href: 'dashboard.html#how-it-works' },
      { type: 'divider' },
      { id: 'create', title: 'Create Card', href: 'create-card.html' },
      { id: 'theme', title: 'Toggle Theme', action: 'theme', isThemeBtn: true },
      { id: 'account', title: 'Account', href: 'login.html' }
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
        var bodyEl = angular.element(document.body);
        var vm = bodyEl.scope() ? bodyEl.scope().vm : null;
        if (vm && typeof vm.onCreateCard === 'function') {
          vm.onCreateCard();
        } else {
          var name = prompt('Create Card — Enter Name:');
          if (name) {
            alert('Card created for ' + name + '! Redirecting to collection...');
          }
          $window.location.href = 'dashboard.html#my-cards';
        }
      } else if (item.action === 'theme') {
        $event.preventDefault();
        dock.toggleTheme();
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
        '<a href="javascript:void(0);" class="apple-dock-item" ' +
        'ng-click="dock.onItemClick({action: \'create\'}, $event)" ' +
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

        /* ---- Account ---- */
        '<a href="login.html" class="apple-dock-item" ' +
        'ng-class="{ active: dock.activeId === \'account\' }" ' +
        'ng-style="{ transform: \'translateY(\' + dock.getItemTranslateY(7) + \'px) scale(\' + dock.getItemScale(7) + \')\' }">' +
        '<span class="apple-dock-tooltip">Account</span>' +
        '<div class="apple-dock-icon">' +
        '<svg viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
        '</div>' +
        '</a>' +

        '</div>' +
        '</div>'
    };
  });

})();
