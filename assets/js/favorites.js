/* =========================================================
   SOMNIORE — Mina favoriter (favoriter.html)
   Visar produkterna som sparats med hjärtat.
   ========================================================= */
(function () {
  const grid = document.getElementById('grid');
  const empty = document.getElementById('empty');
  const total = document.getElementById('favTotal');

  function update() {
    const n = grid.querySelectorAll('.product').length;
    total.textContent = n || '';
    grid.hidden = n === 0;
    empty.hidden = n > 0;
  }

  const items = SOM.favs.list().map(productById).filter(Boolean);
  grid.innerHTML = items.map(SOM.productCard).join('');
  update();

  /* Avmarkerat hjärta: kortet tonar ut och försvinner */
  document.addEventListener('som:fav', e => {
    if (e.detail.on) return;
    const card = grid.querySelector(`.product[data-id="${e.detail.id}"]`);
    if (!card) return;
    card.classList.add('is-leaving');
    setTimeout(() => { card.remove(); update(); }, 300);
  });
})();
