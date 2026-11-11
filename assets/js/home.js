/* =========================================================
   SOMNIORE — startsidan
   ========================================================= */
(function () {
  /* ---------- Bästsäljare ---------- */
  const track = document.getElementById('productTrack');
  track.innerHTML = PRODUCTS.filter(p => p.best).concat(PRODUCTS.filter(p => !p.best)).slice(0, 8).map(SOM.productCard).join('');
  const [prev, next] = document.querySelectorAll('#bastsaljare .arrow');
  SOM.bindRail(track, prev, next);

  SOM.fadeIn('.statement p, .tile, .block__head, .tiles__captions > div');
})();
