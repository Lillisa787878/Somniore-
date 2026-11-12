/* =========================================================
   SOMNIORE — Bäddpaket (baddpaket.html)
   Ett kort per paket och färg, som Parachutes "Bed Bundles".
   ========================================================= */
(function () {
  const bundles = PRODUCTS.filter(p => p.cat === 'baddpaket');
  const NEW_COLORS = ['midnatt', 'fjord'];          // får etiketten "Ny färg"

  /* Alla kombinationer paket × färg, blandade så att rutnätet blir färgrikt */
  const items = [];
  bundles.forEach(p => Object.keys(colorsOf(p)).forEach((color, i) => items.push({ p, color, i })));
  items.sort((a, b) => (a.p.id.includes('stort') - b.p.id.includes('stort')) || (a.i - b.i) || a.p.material.localeCompare(b.p.material));

  function card({ p, color }) {
    const colors = Object.entries(colorsOf(p));
    const shown = [colors.find(([k]) => k === color), ...colors.filter(([k]) => k !== color)].slice(0, 3);
    const more = colors.length - shown.length;
    const tag = NEW_COLORS.includes(color) ? 'Ny färg' : 'Paketpris';
    const url = productUrl(p, color);
    return `
    <article class="product bp-card" data-id="${p.id}" data-mat="${p.material}" data-big="${p.id.includes('stort')}">
      ${SOM.favBtn(p.id)}
      <a href="${url}" class="product__media">
        <span class="tag">${tag}</span>
        <img src="${productImg(p, color, 'stack')}" alt="${p.name} i ${colorsOf(p)[color].name}" loading="lazy" class="main">
        <img src="${productImg(p, color, 'room')}" alt="" class="alt" loading="lazy">
      </a>
      <a href="${url}" class="product__name">${p.name}</a>
      <p class="product__color">${colorsOf(p)[color].name}</p>
      <p class="product__meta">${formatPrice(p)}</p>
      <div class="product__swatches">
        ${shown.map(([k, c]) => `<button class="${k === color ? 'active' : ''}" style="--c:${c.hex}" data-color="${k}" aria-label="${c.name}" title="${c.name}"></button>`).join('')}
        ${more > 0 ? `<a href="${url}" class="bp-more">+${more}</a>` : ''}
      </div>
    </article>`;
  }

  const grid = document.getElementById('bpGrid');
  grid.innerHTML = items.map(card).join('');
  document.getElementById('bpCount').textContent = items.length;

  /* Filter */
  const chips = document.getElementById('bpChips');
  function apply(v) {
    chips.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.v === v));
    let n = 0;
    grid.querySelectorAll('.bp-card').forEach(c => {
      const show = v === 'alla' || c.dataset.mat === v || (v === 'stort' && c.dataset.big === 'true');
      c.hidden = !show; if (show) n++;
    });
    document.getElementById('bpShown').textContent = `${n} paket`;
  }
  chips.addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) apply(b.dataset.v); });
  document.querySelectorAll('.bp-head__links [data-mat]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); apply(a.dataset.mat);
    document.querySelector('.bp-bar').scrollIntoView({ behavior: 'smooth' });
  }));
  const m = new URLSearchParams(location.search).get('m');
  apply(['linne', 'percale', 'stort'].includes(m) ? m : 'alla');

  SOM.fadeIn('.bp-included li');
})();
