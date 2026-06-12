(function() {
  'use strict';
  var search = document.getElementById('pokemonSearch');
  var grid = document.getElementById('pokemonGrid');
  var filterBar = document.getElementById('filterBar');
  var countEl = document.getElementById('pokedexCount');
  var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.pokemon-card')) : [];
  var activeFilter = 'all';

  function updateCount() {
    var visible = cards.filter(function(c) { return c.style.display !== 'none'; }).length;
    if (countEl) countEl.textContent = '全' + visible + '件表示中';
  }

  function applyFilters() {
    var query = (search ? search.value : '').toLowerCase();
    cards.forEach(function(card) {
      var name = (card.getAttribute('data-name') || '').toLowerCase();
      var types = card.getAttribute('data-types') || '';
      var areas = card.getAttribute('data-areas') || '';
      var matchSearch = !query || name.indexOf(query) !== -1;
      var matchFilter = true;
      if (activeFilter === 'all') {
        matchFilter = true;
      } else if (activeFilter === 'legendary') {
        matchFilter = card.querySelector('.badge-legendary') !== null;
      } else if (activeFilter.indexOf('area-') === 0) {
        var areaId = activeFilter.replace('area-', '');
        matchFilter = areas.split(',').indexOf(areaId) !== -1;
      } else if (activeFilter.indexOf('type-') === 0) {
        var typeStr = activeFilter.replace('type-', '');
        matchFilter = types.split(',').indexOf(typeStr) !== -1;
      }
      card.style.display = (matchSearch && matchFilter) ? '' : 'none';
    });
    updateCount();
  }

  if (search) {
    search.addEventListener('input', applyFilters);
  }

  if (filterBar) {
    filterBar.addEventListener('click', function(e) {
      var chip = e.target.closest('.filter-chip');
      if (!chip) return;
      activeFilter = chip.getAttribute('data-filter') || 'all';
      var chips = filterBar.querySelectorAll('.filter-chip');
      for (var i = 0; i < chips.length; i++) {
        chips[i].classList.toggle('active', chips[i] === chip);
      }
      applyFilters();
      if (activeFilter !== 'all') {
        history.replaceState(null, '', '#' + activeFilter);
      } else {
        history.replaceState(null, '', location.pathname);
      }
    });
  }

  // URLハッシュ対応
  function loadFromHash() {
    var hash = location.hash.replace('#', '');
    if (hash) {
      activeFilter = hash;
      var chips = filterBar ? filterBar.querySelectorAll('.filter-chip') : [];
      for (var i = 0; i < chips.length; i++) {
        chips[i].classList.toggle('active', (chips[i].getAttribute('data-filter') || '') === hash);
      }
      applyFilters();
    }
  }
  loadFromHash();
  window.addEventListener('hashchange', loadFromHash);
})();
