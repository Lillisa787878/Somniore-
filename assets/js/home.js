/* =========================================================
   SOMNIORE — startsidan
   ========================================================= */
(function () {
  /* ---------- Bästsäljare ---------- */
  const track = document.getElementById('productTrack');
  const best = PRODUCTS.filter(p => p.best && p.cat !== 'baddpaket');
  track.innerHTML = SOM.colorCards(SOM.byColor(best.length ? best : PRODUCTS).slice(0, 10));
  const [prev, next] = document.querySelectorAll('#bastsaljare .arrow');
  SOM.bindRail(track, prev, next);

  SOM.fadeIn('.statement p, .tile, .block__head, .tiles__captions > div');
})();
