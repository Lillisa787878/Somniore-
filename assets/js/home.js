/* =========================================================
   SOMNIORE — startsidan
   ========================================================= */
(function () {
  /* ---------- Bästsäljare ---------- */
  const track = document.getElementById('productTrack');
  track.innerHTML = PRODUCTS.filter(p => p.best).concat(PRODUCTS.filter(p => !p.best)).slice(0, 8).map(SOM.productCard).join('');
  const [prev, next] = document.querySelectorAll('#bastsaljare .arrow');
  SOM.bindRail(track, prev, next);

  /* ---------- Palett: bilder per nyans ---------- */
  const SHADES = [
    { key: 'white', group: 'vit', name: 'Vit', color: '#F4F2EE', dark: false,
      text: 'Krispigt som nysnö. Ljust, rent och tidlöst — grunden i varje sovrum.', avail: 'Linne · Percale',
      items: [['linne-paslakanset', 'kritvit'], ['percale-lakanset', 'vit'], ['linne-lakanset', 'kritvit'], ['percale-paslakan', 'vit'], ['percale-orngott', 'vit'], ['percale-lakan', 'vit']] },
    { key: 'beige', group: 'sand', name: 'Sand', color: '#D9CDB8', dark: false,
      text: 'Varm som strandsand i kvällssol. Mjuk, naturlig och lätt att kombinera.', avail: 'Linne · Percale',
      items: [['linne-paslakanset', 'sand'], ['linne-lakanset', 'sand'], ['linne-paslakan', 'sand'], ['percale-lakanset', 'havre'], ['percale-orngott', 'havre'], ['percale-paslakan', 'havre']] },
    { key: 'grey', group: 'ljusgra', name: 'Ljusgrå', color: '#C8C7C3', dark: false,
      text: 'Dimmorgon över sjön. Lugn och diskret, med en sval elegans.', avail: 'Percale',
      items: [['percale-lakanset', 'ljusgra'], ['percale-orngott', 'ljusgra'], ['percale-paslakan', 'ljusgra'], ['percale-paslakanset', 'ljusgra'], ['percale-lakan', 'ljusgra'], ['percale-drapa', 'ljusgra']] },
    { key: 'green', group: 'gron', name: 'Salvia & Mossa', color: '#6E7456', dark: true,
      text: 'Från granskogens golv. Djupa, jordnära gröna toner som lugnar.', avail: 'Linne · Percale',
      items: [['linne-orngott', 'mossa'], ['linne-paslakanset', 'mossa'], ['percale-lakanset', 'salvia'], ['percale-paslakan', 'salvia'], ['percale-lakan', 'salvia'], ['percale-paslakanset', 'salvia']] },
    { key: 'blue', group: 'bla', name: 'Midnatt & Fjord', color: '#27324A', dark: true,
      text: 'Blå timmen en sommarnatt. Mörkt, ombonat och sofistikerat.', avail: 'Linne · Percale',
      items: [['linne-paslakanset', 'midnatt'], ['linne-paslakan', 'midnatt'], ['linne-lakanset', 'midnatt'], ['percale-lakanset', 'fjord'], ['percale-paslakan', 'fjord'], ['percale-paslakanset', 'fjord']] },
  ];

  const paletteTrack = document.getElementById('paletteTrack');
  const swatchBox = document.getElementById('paletteSwatches');
  swatchBox.innerHTML = SHADES.map((s, i) => `
    <button class="pswatch${i === 0 ? ' active' : ''}" role="tab" aria-selected="${i === 0}" data-i="${i}">
      <i style="--c:${s.color}"></i><span>${s.name}</span>
    </button>`).join('');

  const [pPrev, pNext] = document.querySelectorAll('.palette .arrow');
  let updatePaletteArrows = () => {};

  function renderShade(i) {
    const s = SHADES[i];
    paletteTrack.innerHTML = `
      <a href="kollektion.html?c=alla&farg=${s.group}" class="shade-card${s.dark ? ' is-dark' : ''}" style="--c:${s.color}">
        <p class="shade-card__kicker">Nyans</p>
        <h3>${s.name}</h3>
        <p>${s.text}</p>
        <p class="shade-card__avail">Finns i ${s.avail}</p>
      </a>
      ${s.items.map(([id, color], n) => {
        const p = productById(id);
        return `
        <a href="${productUrl(p, color)}" class="look">
          <div class="look__img"><img src="assets/img/s/${s.key}-${n}.jpg" alt="${p.name} i ${colorsOf(p)[color].name}" loading="lazy"></div>
          <p class="look__title">${p.name}</p>
          <p class="look__meta">${colorsOf(p)[color].name}</p>
        </a>`;
      }).join('')}`;
    paletteTrack.scrollLeft = 0;
    updatePaletteArrows();
  }
  swatchBox.addEventListener('click', e => {
    const btn = e.target.closest('.pswatch');
    if (!btn || btn.classList.contains('active')) return;
    const prevBtn = swatchBox.querySelector('.active');
    prevBtn.classList.remove('active'); prevBtn.setAttribute('aria-selected', 'false');
    btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
    paletteTrack.classList.add('fading');
    setTimeout(() => { renderShade(Number(btn.dataset.i)); paletteTrack.classList.remove('fading'); }, 220);
  });
  renderShade(0);
  updatePaletteArrows = SOM.bindRail(paletteTrack, pPrev, pNext);

  /* ---------- Linne-blocket: färgval byter bilder ---------- */
  document.querySelectorAll('[data-spotlight]').forEach(box => {
    const big = box.querySelector('.spot__large img');
    const pack = box.querySelector('.spot__pack img');
    const packLink = box.querySelector('.spot__pack');
    const name = box.querySelector('[data-color-name]');
    const keys = { Sand: 'sand', Kritvit: 'kritvit', Mossa: 'mossa', Midnatt: 'midnatt' };
    box.querySelectorAll('.spot__swatch').forEach(btn => {
      new Image().src = btn.dataset.big; new Image().src = btn.dataset.pack;
      btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) return;
        box.querySelector('.spot__swatch.active').classList.remove('active');
        btn.classList.add('active');
        name.textContent = btn.dataset.name;
        packLink.href = `produkt.html?p=linne-lakanset&farg=${keys[btn.dataset.name]}`;
        box.classList.add('fading');
        setTimeout(() => { big.src = btn.dataset.big; pack.src = btn.dataset.pack; box.classList.remove('fading'); }, 220);
      });
    });
  });

  SOM.fadeIn('.statement p, .spot__large, .spot__info, .tile, .block__head, .palette__head, .tiles__captions > div');
})();
