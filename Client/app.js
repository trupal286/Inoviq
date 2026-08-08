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
     DockController & Liquid Glass Dock Directive (Pure AngularJS)
     -------------------------------------------------------------------------- */
  app.controller('DockController', ['$scope', '$window', function ($scope, $window) {
    var dock = this;

    dock.currentTheme = localStorage.getItem('inoviq_theme') || 'light';

    dock.items = [
      { id: 'home', title: 'Home', href: 'dashboard.html#hero' },
      { id: 'templates', title: 'Templates', href: 'dashboard.html#templates' },
      { id: 'cards', title: 'Collection', href: 'dashboard.html#my-cards' },
      { id: 'how', title: 'Scan & Import', href: 'dashboard.html#how-it-works' },
      { id: 'create', title: 'Create Card', action: 'create' },
      { id: 'theme', title: 'Theme', action: 'theme', isThemeBtn: true },
      { id: 'account', title: 'Account', href: 'login.html' }
    ];

    dock.activeId = 'home';
    dock.hoveredIndex = -1;

    dock.checkActive = function () {
      var path = $window.location.pathname;
      var hash = $window.location.hash;

      if (path.indexOf('login.html') !== -1 || path.indexOf('signup.html') !== -1) {
        dock.activeId = 'account';
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

    dock.getItemIndex = function (id) {
      for (var i = 0; i < dock.items.length; i++) {
        if (dock.items[i].id === id) return i;
      }
      return 0;
    };

    dock.getIndicatorIndex = function () {
      if (dock.hoveredIndex >= 0) {
        return dock.hoveredIndex;
      }
      return dock.getItemIndex(dock.activeId);
    };

    /* Pure AngularJS Math calculations for 100% exact alignment and synchronized elevation */
    dock.getPillX = function () {
      var idx = dock.getIndicatorIndex();
      return 10 + (idx * 54);
    };

    dock.getPillTranslateY = function () {
      var idx = dock.getIndicatorIndex();
      return dock.getItemTranslateY(idx);
    };

    dock.getPillScale = function () {
      return dock.hoveredIndex >= 0 ? 1.35 : 1;
    };

    dock.getItemScale = function (index) {
      if (dock.hoveredIndex < 0) return 1;
      var dist = Math.abs(index - dock.hoveredIndex);
      if (dist === 0) return 1.45;
      if (dist === 1) return 1.22;
      if (dist === 2) return 1.08;
      return 1;
    };

    dock.getItemTranslateY = function (index) {
      if (dock.hoveredIndex < 0) return 0;
      var dist = Math.abs(index - dock.hoveredIndex);
      if (dist === 0) return -14;
      if (dist === 1) return -6;
      if (dist === 2) return -2;
      return 0;
    };

    dock.onMouseEnter = function (index) {
      dock.hoveredIndex = index;
    };

    dock.onMouseLeave = function () {
      dock.hoveredIndex = -1;
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
        '<nav class="liquid-dock-container" aria-label="Liquid Glass Dock Navigation">' +
          '<div class="liquid-dock-glass" ng-mouseleave="dock.onMouseLeave()">' +
            '<!-- Sliding Glass Circle Pill (Moves X and Y along with active/hovered icon) -->' +
            '<span class="dock-slide-pill" ' +
                  'ng-class="{ \'pill-hovered\': dock.hoveredIndex >= 0 }" ' +
                  'ng-style="{ ' +
                    'left: dock.getPillX() + \'px\', ' +
                    'transform: \'translateY(\' + dock.getPillTranslateY() + \'px) scale(\' + dock.getPillScale() + \')\' ' +
                  '}">' +
            '</span>' +
            '<!-- Dock Item Buttons (No title attribute to remove ugly browser native tooltip) -->' +
            '<a ng-repeat="item in dock.items track by item.id" ' +
               'ng-href="{{ item.href || \'javascript:void(0);\' }}" ' +
               'class="liquid-dock-item" ' +
               'ng-class="{ active: dock.activeId === item.id }" ' +
               'ng-mouseenter="dock.onMouseEnter($index)" ' +
               'ng-click="dock.onItemClick(item, $event)" ' +
               'ng-style="{ transform: \'translateY(\' + dock.getItemTranslateY($index) + \'px) scale(\' + dock.getItemScale($index) + \')\' }">' +
              '<span class="dock-icon-wrapper">' +
                '<!-- Home -->' +
                '<svg ng-if="item.id === \'home\'" class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                  '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' +
                  '<polyline points="9 22 9 12 15 12 15 22"/>' +
                '</svg>' +
                '<!-- Templates -->' +
                '<svg ng-if="item.id === \'templates\'" class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                  '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>' +
                  '<line x1="3" y1="9" x2="21" y2="9"/>' +
                  '<line x1="9" y1="21" x2="9" y2="9"/>' +
                '</svg>' +
                '<!-- Collection -->' +
                '<svg ng-if="item.id === \'cards\'" class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                  '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>' +
                  '<line x1="12" y1="18" x2="12.01" y2="18"/>' +
                '</svg>' +
                '<!-- Scan & Import -->' +
                '<svg ng-if="item.id === \'how\'" class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                  '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>' +
                '</svg>' +
                '<!-- Create Card -->' +
                '<svg ng-if="item.id === \'create\'" class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                  '<line x1="12" y1="5" x2="12" y2="19"/>' +
                  '<line x1="5" y1="12" x2="19" y2="12"/>' +
                '</svg>' +
                '<!-- Theme Toggle -->' +
                '<svg ng-if="item.id === \'theme\' && dock.currentTheme === \'dark\'" class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                  '<circle cx="12" cy="12" r="5"/>' +
                  '<line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>' +
                  '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>' +
                  '<line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>' +
                  '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>' +
                '</svg>' +
                '<svg ng-if="item.id === \'theme\' && dock.currentTheme !== \'dark\'" class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                  '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' +
                '</svg>' +
                '<!-- Account -->' +
                '<svg ng-if="item.id === \'account\'" class="dock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                  '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' +
                  '<circle cx="12" cy="7" r="4"/>' +
                '</svg>' +
              '</span>' +
              '<span class="dock-dot"></span>' +
              '<span class="dock-tooltip">{{ item.title }}</span>' +
              '</a>' +
          '</div>' +
        '</nav>'
    };
  });

})();
