(function () {
  'use strict';

  angular
    .module('digiCardApp', [])
    .run(['$rootScope', function ($rootScope) {
      window.__inoviqScope = $rootScope;
    }])
    .controller('DashboardController', DashboardController);

  function DashboardController() {
    var vm = this;

    vm.searchTerm = '';

    vm.navItems = [
      { label: 'Dashboard', active: true },
      { label: 'My Cards', active: false },
      { label: 'Create Card', active: false },
      { label: 'Templates', active: false },
      { label: 'Settings', active: false }
    ];

    // Demo data — replace with data fetched from the Django API
    // (GET /api/cards/) once the backend is wired up.
    vm.cards = [
      { id: 1, fullName: 'Trupal Panchal', jobTitle: 'Product Manager', company: 'Loop Studio', initials: 'TP', color: '#8E7CC3', templateLabel: 'Template · Minimal', updatedAt: new Date('2026-07-18') },
      { id: 2, fullName: 'Riddhi Gandhi', jobTitle: 'Founder', company: 'Nimbus Labs', initials: 'RG', color: '#B7A6E0', templateLabel: 'Template · Studio', updatedAt: new Date('2026-07-10') },
      { id: 3, fullName: 'Palak Harwani', jobTitle: 'UX Design Lead', company: 'Vertex Design Co.', initials: 'PH', color: '#6C57A8', templateLabel: 'Custom', updatedAt: new Date('2026-07-05') },
      { id: 4, fullName: 'Hency Patel', jobTitle: 'Software Engineer', company: 'Pixel Forge', initials: 'HP', color: '#A594D6', templateLabel: 'Template · Signal', updatedAt: new Date('2026-06-28') },
      { id: 5, fullName: 'Elizabeth Smith', jobTitle: 'Marketing Head', company: 'Brightline Co.', initials: 'ES', color: '#8E7CC3', templateLabel: 'Custom', updatedAt: new Date('2026-06-20') }
    ];

    vm.heroCard = vm.cards[0];
    vm.heroCardIndex = 0;
    vm.encryptedChars = 'SCAN TO SAVE · NFC READY · 256-BIT'.split('');

    vm.setActiveNav = setActiveNav;
    vm.onCreateCard = onCreateCard;
    vm.onEditCard = onEditCard;
    vm.onDeleteCard = onDeleteCard;
    vm.featuredCard = featuredCard;
    vm.filteredCards = filteredCards;
    vm.totalCards = totalCards;
    vm.templatesUsedCount = templatesUsedCount;
    vm.shuffleHeroCard = shuffleHeroCard;

    // The most recently updated card is promoted to the featured banner.
    function featuredCard() {
      if (vm.cards.length === 0) return null;
      var sorted = vm.cards.slice().sort(function (a, b) {
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
      return sorted[0];
    }

    function filteredCards() {
      var fc = featuredCard();
      var rest = vm.cards.filter(function (c) {
        return !fc || c.id !== fc.id;
      });
      var term = vm.searchTerm.trim().toLowerCase();
      if (!term) return rest;
      return rest.filter(function (c) {
        return c.fullName.toLowerCase().indexOf(term) !== -1 ||
          c.company.toLowerCase().indexOf(term) !== -1 ||
          c.jobTitle.toLowerCase().indexOf(term) !== -1;
      });
    }

    function totalCards() {
      return vm.cards.length;
    }

    function templatesUsedCount() {
      var labels = vm.cards.map(function (c) { return c.templateLabel; });
      return labels.filter(function (label, index) {
        return labels.indexOf(label) === index;
      }).length;
    }

    function setActiveNav(selected) {
      vm.navItems.forEach(function (item) {
        item.active = (item === selected);
      });
    }

    function shuffleHeroCard() {
      // Use the pixel-dissolve animation if it's ready
      if (typeof window._pixelShuffle === 'function') {
        window._pixelShuffle(function () {
          vm.heroCardIndex = (vm.heroCardIndex + 1) % vm.cards.length;
          vm.heroCard = vm.cards[vm.heroCardIndex];
          // Apply scope update from outside Angular
          if (window.__inoviqScope) {
            window.__inoviqScope.$apply();
          }
        });
      } else {
        vm.heroCardIndex = (vm.heroCardIndex + 1) % vm.cards.length;
        vm.heroCard = vm.cards[vm.heroCardIndex];
      }
    }

    function onCreateCard() {
      // Hook this up to the Create Card route, e.g. $location.path('/create-card')
      console.log('Navigate to Create Card page');
    }

    function onEditCard(card) {
      console.log('Edit card', card.id);
    }

    function onDeleteCard(card) {
      vm.cards = vm.cards.filter(function (c) {
        return c.id !== card.id;
      });
    }
  }

})();
