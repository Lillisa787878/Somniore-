/* =========================================================
   SOMNIORE — kollektionssida (kollektion.html?c=linne&farg=bla)
   ========================================================= */
(function () {
  const params = new URLSearchParams(location.search);
  if (params.get('c') === 'baddpaket') { location.replace('baddpaket.html'); return; }
  const key = COLLECTIONS[params.get('c')] ? params.get('c') : 'alla';
  const col = COLLECTIONS[key];
  const state = {
    chip: 'alla',                       // material eller kategori
    color: COLOR_GROUPS[params.get('farg')] ? params.get('farg') : 'alla',
    sort: 'featured',
  };

  /* Sidhuvud för kollektionen */
  document.title = `${col.title} — Somniore`;
  document.getElementById('colTitle').textContent = col.title;
  document.getElementById('colCrumb').textContent = col.title;
  if (col.parent) document.getElementById('colCrumb').insertAdjacentHTML('beforebegin', `<a href="kollektion.html?c=${col.parent}">${COLLECTIONS[col.parent].title}</a> <span>/</span> `);
  document.getElementById('colDesc').textContent = col.desc;
  document.getElementById('colImg').src = IMG(col.img);

  if (col.soon) {
    document.getElementById('soon').hidden = false;
    ['filters', 'grid'].forEach(id => document.getElementById(id).hidden = true);
    document.getElementById('soonBtn').addEventListener('click', e => {
      e.preventDefault();
      const f = document.getElementById('email');
      f.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => f.focus(), 600);
    });
    return;
  }

  const base = PRODUCTS.filter(col.filter);

  /* Chips: kategorier i materialkollektioner, annars material */
  const chipMode = col.material ? 'cat' : 'material';
  const chipOptions = chipMode === 'cat'
    ? [...new Set(base.map(p => p.cat))].map(c => [c, CATEGORIES[c].plural])
    : [...new Set(base.map(p => p.material))].map(m => [m, MATERIALS[m].name]);
  const chips = document.getElementById('chips');
  if (chipOptions.length > 1) {
    chips.innerHTML = [['alla', 'Alla'], ...chipOptions]
      .map(([v, l]) => `<button class="chip${v === 'alla' ? ' active' : ''}" data-v="${v}">${l}</button>`).join('');
  }

  /* Färgfilter: bara färger som finns i kollektionen */
  const groupsInBase = new Set(base.flatMap(p => Object.values(colorsOf(p)).map(c => c.group)));
  const colorFilter = document.getElementById('colorFilter');
  colorFilter.innerHTML = Object.entries(COLOR_GROUPS).filter(([k]) => groupsInBase.has(k))
    .map(([k, g]) => `<button class="cdot${state.color === k ? ' active' : ''}" data-v="${k}" style="--c:${g.hex}" title="${g.name}" aria-label="${g.name}"></button>`).join('');

  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');

  function render() {
    let list = base.filter(p => state.chip === 'alla' || (chipMode === 'cat' ? p.cat === state.chip : p.material === state.chip));
    if (state.color !== 'alla') list = list.filter(p => Object.values(colorsOf(p)).some(c => c.group === state.color));
    if (state.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'sv'));
    if (state.sort === 'material') list = [...list].sort((a, b) => a.material.localeCompare(b.material));
    if (state.sort === 'featured') list = [...list].sort((a, b) => (b.best ? 1 : 0) - (a.best ? 1 : 0));

    grid.innerHTML = list.map(SOM.productCard).join('');
    empty.hidden = list.length > 0;
    document.getElementById('count').textContent = `${list.length} ${list.length === 1 ? 'produkt' : 'produkter'}`;

    /* Visa vald färg direkt på korten */
    if (state.color !== 'alla') {
      grid.querySelectorAll('.product').forEach(card => {
        const p = productById(card.dataset.id);
        const match = Object.entries(colorsOf(p)).find(([, c]) => c.group === state.color);
        if (match) card.querySelector(`[data-color="${match[0]}"]`)?.click();
      });
    }

    const url = new URL(location.href);
    url.searchParams.set('c', key);
    state.color === 'alla' ? url.searchParams.delete('farg') : url.searchParams.set('farg', state.color);
    history.replaceState(null, '', url);
  }

  chips.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    chips.querySelector('.active')?.classList.remove('active'); b.classList.add('active');
    state.chip = b.dataset.v; render();
  });
  colorFilter.addEventListener('click', e => {
    const b = e.target.closest('.cdot'); if (!b) return;
    const was = b.classList.contains('active');
    colorFilter.querySelectorAll('.active').forEach(x => x.classList.remove('active'));
    if (!was) b.classList.add('active');
    state.color = was ? 'alla' : b.dataset.v; render();
  });
  document.getElementById('sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
  document.getElementById('resetFilters').addEventListener('click', () => {
    state.chip = 'alla'; state.color = 'alla';
    chips.querySelectorAll('.chip').forEach((c, i) => c.classList.toggle('active', i === 0));
    colorFilter.querySelectorAll('.active').forEach(x => x.classList.remove('active'));
    render();
  });

  render();
  SOM.fadeIn('.more .tile');
})();
