/* =========================================================
   SOMNIORE — produktsida (produkt.html?p=linne-paslakanset&farg=sand)
   Upplägg inspirerat av The Citizenry: bildgalleri med miniatyrer,
   köpdel med utfällbara sektioner, fördelar, hantverk, flikar.
   ========================================================= */
(function () {
  const params = new URLSearchParams(location.search);
  const p = productById(params.get('p')) || PRODUCTS[0];
  const colors = colorsOf(p);
  const cat = CATEGORIES[p.cat];
  const mat = MATERIALS[p.material];
  const isLinen = p.material === 'linne';
  const state = {
    color: colors[params.get('farg')] ? params.get('farg') : firstColorKey(p),
    size: null, qty: 1, img: 0,
  };
  const $ = id => document.getElementById(id);

  /* ---------- Texter per material ---------- */
  const STORY = isLinen
    ? 'Skapa ett avslappnat, svalt sovrum. Andningsbart men ändå varmt — det perfekta lagret från sommar till vinter. Stentvättat för en luftig, mjuk och naturligt levande känsla redan första natten. Våra dova, naturnära färger är gjorda för att kombineras fritt med resten av kollektionen.'
    : 'Känslan av en nybäddad hotellsäng, varje kväll. Den täta enkelvävningen ger en matt, krispig yta som känns sval mot huden och blir mjukare för varje tvätt. Klassisk, tidlös och lätt att kombinera med resten av kollektionen.';
  const BENEFITS = isLinen
    ? [['Luftigt & svalt', 'Linets ihåliga fibrer andas och reglerar temperaturen — svalt om sommaren, ombonat om vintern.', 'linen-hand.jpg'],
       ['Mjukare för varje tvätt', 'Stentvättat för en levande yta som bara blir vackrare med tiden.', 'linen-texture.jpg'],
       ['Vävt i Portugal', 'Vävt i Guimarães av europeiskt lin, med kunnande som gått i arv i generationer.', 'linen-folded.jpg']]
    : [['Krispigt & svalt', 'Den täta enkelvävningen ger en matt, sval yta — perfekt för dig som sover varmt.', 'percale-texture.jpg'],
       ['Slitstarkt', 'Kammad bomull med 300 trådars täthet som håller i många år och mjuknar för varje tvätt.', 'percale-white-fitted.jpg'],
       ['Vävt i Portugal', 'Vävt i Guimarães, Portugals textilhjärta, med kunnande som gått i arv i generationer.', 'linen-folded.jpg']];

  /* ---------- Rubrik, brödsmulor, pris ---------- */
  document.title = `${p.name} — Somniore`;
  $('crumbs').innerHTML = `
    <a href="index.html">Hem</a> <span>/</span>
    <a href="kollektion.html?c=${p.material}">${mat.name}</a> <span>/</span>
    <a href="kollektion.html?c=${p.cat}">${cat.plural}</a> <span>/</span>
    <span>${p.name}</span>`;
  const tag = p.tag || (p.isNew ? 'Nyhet' : '');
  if (tag) { $('pTag').textContent = tag; $('pTag').hidden = false; }
  $('pTitle').textContent = p.name;
  $('pSpec').textContent = mat.spec + (p.pack ? ' · ' + p.pack : '');
  $('pPrice').textContent = formatPrice(p);
  $('pLead').textContent = p.desc;

  /* ---------- Galleri med miniatyrer ---------- */
  const images = () => cat.gallery.map(k => productImg(p, state.color, k));
  function showImage(i) {
    const list = images();
    state.img = (i + list.length) % list.length;
    $('mainImg').src = list[state.img];
    $('mainImg').alt = `${p.name} i ${colors[state.color].name}`;
    $('imgCounter').textContent = `${state.img + 1} / ${list.length}`;
    $('thumbs').querySelectorAll('button').forEach((b, n) => b.classList.toggle('active', n === state.img));
  }
  function renderGallery() {
    $('thumbs').innerHTML = images().map((src, i) => `<button aria-label="Bild ${i + 1}"><img src="${src}" alt=""></button>`).join('');
    showImage(0);
  }
  $('thumbs').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    showImage([...$('thumbs').children].indexOf(b));
  });
  $('imgPrev').addEventListener('click', () => showImage(state.img - 1));
  $('imgNext').addEventListener('click', () => showImage(state.img + 1));
  /* svep på mobil */
  let startX = null;
  $('mainImg').addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  $('mainImg').addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) showImage(state.img + (dx < 0 ? 1 : -1));
    startX = null;
  });

  /* ---------- Färg (fyrkantiga rutor) ---------- */
  $('pSwatches').innerHTML = Object.entries(colors).map(([k, c]) =>
    `<button class="${k === state.color ? 'active' : ''}" data-k="${k}" style="--c:${c.hex}" aria-label="${c.name}" title="${c.name}"></button>`).join('');
  $('pSwatches').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.dataset.k === state.color) return;
    $('pSwatches').querySelector('.active').classList.remove('active'); b.classList.add('active');
    state.color = b.dataset.k; updateColor();
  });
  function updateColor() {
    $('pColorName').textContent = colors[state.color].name;
    renderGallery();
    renderInspiration();
    renderTypes();
    const url = new URL(location.href); url.searchParams.set('farg', state.color);
    history.replaceState(null, '', url);
  }

  /* ---------- Typ: t.ex. endast påslakan / påslakan + örngott ---------- */
  const PAIRS = { lakanset: 'lakan', lakan: 'lakanset' };
  function renderTypes() {
    const otherCat = PAIRS[p.cat];
    const other = otherCat && PRODUCTS.find(x => x.material === p.material && x.cat === otherCat);
    if (!other) return;
    $('typeOpt').hidden = false;
    const label = x => ({ paslakan: ['Påslakan', 'Endast påslakan'], paslakanset: ['Påslakan', '+ 2 örngott'], lakan: ['Lakan', 'Endast lakan'], lakanset: ['Lakanset', 'Lakan, dra-på + örngott'] })[x.cat];
    const opts = [p, other].sort((a, b) => (a.cat.length - b.cat.length));
    $('pTypes').innerHTML = opts.map(x => {
      const [a, b] = label(x);
      return x.id === p.id
        ? `<span class="pd-box active"><b>${a}</b>${b}</span>`
        : `<a class="pd-box" href="${productUrl(x, state.color)}"><b>${a}</b>${b}</a>`;
    }).join('');
  }

  /* ---------- Storlek (boxar) ---------- */
  $('pSizes').innerHTML = SIZES[p.cat].map(sizeInfo).map(s => `<button class="pd-box" data-s="${s.label}"><b>${s.title}</b>${s.sub}</button>`).join('');
  $('pSizes').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $('pSizes').querySelector('.active')?.classList.remove('active'); b.classList.add('active');
    state.size = b.dataset.s; $('pSizeName').textContent = state.size; $('sizeError').textContent = '';
  });

  /* ---------- Antal + köp ---------- */
  const setQty = n => { state.qty = Math.max(1, Math.min(9, n)); $('qty').textContent = state.qty; };
  $('qtyMinus').addEventListener('click', () => setQty(state.qty - 1));
  $('qtyPlus').addEventListener('click', () => setQty(state.qty + 1));
  $('addBtn').addEventListener('click', () => {
    if (!state.size) {
      $('sizeError').textContent = 'Välj en storlek först.';
      $('pSizes').classList.add('shake'); setTimeout(() => $('pSizes').classList.remove('shake'), 500);
      return;
    }
    SOM.addToCart({ id: p.id, color: state.color, size: state.size, qty: state.qty });
    SOM.toast(`${p.name} lades i varukorgen`);
    setTimeout(SOM.openCart, 350);
  });

  /* ---------- Fast köpknapp längst ner på mobil (som Parachute) ---------- */
  const sticky = document.createElement('div');
  sticky.className = 'pd-sticky';
  sticky.innerHTML = `<div class="pd-sticky__info"><b>${p.name}</b><span id="stickyMeta"></span></div><button class="pd-sticky__btn">Lägg i varukorg</button>`;
  document.body.appendChild(sticky);
  const updateSticky = () => { $('stickyMeta').textContent = `${colorsOf(p)[state.color].name} · ${state.size || 'Välj storlek'}`; };
  updateSticky();
  document.addEventListener('click', e => { if (e.target.closest('#pSwatches, #pSizes')) setTimeout(updateSticky, 0); });
  sticky.querySelector('button').addEventListener('click', () => {
    if (!state.size) { $('pSizes').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    $('addBtn').click();
  });
  new IntersectionObserver(([e]) => {
    sticky.classList.toggle('show', !e.isIntersecting && e.boundingClientRect.top < 0);
  }).observe($('addBtn'));

  /* ---------- Utfällbara sektioner ---------- */
  const includes = p.includes
    ? `<p class="pd-acc__sub">Setet innehåller:</p><ul>${p.includes.map(i => `<li>${i}</li>`).join('')}</ul>` : '';
  const note = /paslakan/.test(p.cat) ? '<p><em>Påslakanet har dold knäppning och inre band som håller täcket på plats.</em></p>' : '';
  const detailsTable = `
    <dl class="pd-table">
      <dt>Mått</dt><dd>${SIZES[p.cat].map(s => sizeInfo(s).label).join('<br>')}</dd>
      <dt>Material</dt><dd>${mat.spec}</dd>
      <dt>Ursprung</dt><dd>Vävt i Guimarães, Portugal</dd>
      <dt>Detaljer</dt><dd>${p.details.join('<br>')}</dd>
      <dt>Returer</dt><dd>30 dagars öppet köp. Returnera otvättat i originalförpackning.</dd>
    </dl>`;
  const sections = [
    ['Berättelse', `<p>${STORY}</p><p>Vävt i Guimarães — Portugals textilhjärta — där kunnandet gått i arv i generationer.</p>${includes}${note}<p>Vill du jämföra material? Läs mer i <a href="material.html">materialguiden</a>.</p>`, true],
    ['Produktdetaljer', detailsTable],
    ['Frakt & returer', '<p><strong>Fri frakt</strong> på beställningar över 1000 kr inom Sverige. Leverans inom 2–5 arbetsdagar.</p><p><strong>30 dagars öppet köp.</strong> Sov på saken — passar det inte returnerar du enkelt.</p>'],
  ];
  $('accordion').innerHTML = sections.map(([t, body, open]) =>
    `<details${open ? ' open' : ''}><summary>${t}</summary><div>${body}</div></details>`).join('');

  /* ---------- Tre fördelar ---------- */
  $('benefits').innerHTML = BENEFITS.map(([t, txt, img]) => `
    <div class="pd-benefit">
      <div class="pd-benefit__img"><img src="${IMG(img)}" alt="" loading="lazy"></div>
      <h3>${t}</h3>
      <p>${txt}</p>
    </div>`).join('');

  /* ---------- Flikar ---------- */
  const TABS = {
    frakt: ['Frakt & returer', [
      ['Fri frakt', 'Fri frakt på beställningar över 1000 kr inom Sverige. Leverans inom 2–5 arbetsdagar.'],
      ['30 dagars öppet köp', 'Returnera inom 30 dagar. Skicka tillbaka otvättat och i originalförpackning.'],
      ['Frågor?', 'Vår kundservice hjälper dig gärna — <a href="kundservice.html">kontakta oss</a>.']]],
    detaljer: ['Detaljer', [
      ['Material', mat.spec + '. ' + mat.about],
      ['Utförande', p.details.join('. ') + '.'],
      ['Ursprung', 'Vävt i Guimarães, Portugal. Formgivet i Sverige.']]],
    skotsel: ['Skötselråd', [
      ['Tvätt', isLinen ? 'Maskintvätt 40 °C med likfärgat.' : 'Maskintvätt 60 °C.'],
      ['Torkning', 'Torktumla på låg värme eller häng på tork.'],
      ['Strykning', isLinen ? 'Stryk vid behov på medelvärme — eller njut av den naturliga strukturen.' : 'Stryk på hög värme för en extra krispig hotellfinish.']]],
  };
  function renderTab(key) {
    const [title, cols] = TABS[key];
    $('tabPanel').innerHTML = `<h3 class="pd-tabs__title">${title}</h3>
      <div class="pd-tabs__cols">${cols.map(([h, t]) => `<div><h4>${h}</h4><p>${t}</p></div>`).join('')}</div>`;
  }
  document.querySelector('.pd-tabs__nav').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    document.querySelectorAll('.pd-tabs__nav button').forEach(x => x.classList.toggle('active', x === b));
    renderTab(b.dataset.tab);
  });
  renderTab('frakt');

  /* ---------- Inspiration (miljöbilder i vald färg) ---------- */
  function renderInspiration() {
    const keys = ['bed', 'bed2', 'room', 'detail'];
    $('insp').innerHTML = keys.map(k => `<figure><img src="${productImg(p, state.color, k)}" alt="" loading="lazy"></figure>`).join('');
  }

  /* ---------- Köps ofta tillsammans ---------- */
  const related = PRODUCTS.filter(x => x.material === p.material && x.id !== p.id).slice(0, 4);
  $('related').innerHTML = related.map(SOM.productCard).join('');
  $('related').querySelectorAll('.product').forEach(card => card.querySelector(`[data-color="${state.color}"]`)?.click());

  updateColor();
  SOM.fadeIn('.pd-benefit, .pd-maker > div, .pd-insp figure');
})();
