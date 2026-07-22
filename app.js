(function () {
  'use strict';

  angular
    .module('digiCardApp', [])
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
      { id: 4, fullName: 'Dev Patel', jobTitle: 'Software Engineer', company: 'Pixel Forge', initials: 'DP', color: '#A594D6', templateLabel: 'Template · Signal', updatedAt: new Date('2026-06-28') },
      { id: 5, fullName: 'Sanya Nair', jobTitle: 'Marketing Head', company: 'Brightline Co.', initials: 'SN', color: '#8E7CC3', templateLabel: 'Custom', updatedAt: new Date('2026-06-20') }
    ];

    vm.setActiveNav = setActiveNav;
    vm.onCreateCard = onCreateCard;
    vm.onEditCard = onEditCard;
    vm.onDeleteCard = onDeleteCard;
    vm.featuredCard = featuredCard;
    vm.filteredCards = filteredCards;
    vm.totalCards = totalCards;
    vm.templatesUsedCount = templatesUsedCount;

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
