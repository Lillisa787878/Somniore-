/* =========================================================
   SOMNIORE — startsidan
   ========================================================= */
(function () {
  /* ---------- Bästsäljare med flikar (som Parachute) ---------- */
  const track = document.getElementById('productTrack');
  const [prev, next] = document.querySelectorAll('#bastsaljare .arrow');
  const LISTS = {
    alla: () => PRODUCTS.filter(p => p.best && p.cat !== 'baddpaket'),
    linne: () => PRODUCTS.filter(p => p.material === 'linne' && p.cat !== 'baddpaket'),
    percale: () => PRODUCTS.filter(p => p.material === 'percale' && p.cat !== 'baddpaket'),
    orngott: () => PRODUCTS.filter(p => p.cat === 'orngott'),
  };
  let update = () => {};
  function show(key) {
    track.innerHTML = SOM.colorCards(SOM.byColor(LISTS[key]()).slice(0, 10));
    track.scrollLeft = 0;
    update();
  }
  show('alla');
  update = SOM.bindRail(track, prev, next);
  document.getElementById('bestTabs').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.classList.contains('active')) return;
    document.querySelectorAll('#bestTabs button').forEach(x => x.classList.toggle('active', x === b));
    show(b.dataset.v);
  });

  SOM.fadeIn('.promises > *, .story__copy, .story__img, .bundle-tile, .club-band__copy, .club-band__tiers li');
})();
