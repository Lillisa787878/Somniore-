/* =========================================================
   SOMNIORE — produktsida (produkt.html?p=linne-paslakanset&farg=sand)
   Upplägg som Quince: miniatyrer + stor bild, rena val, rund köpknapp,
   kort beskrivning, egenskaper, utfällbara sektioner och jämförelse.
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
    size: null, img: 0,
  };
  const $ = id => document.getElementById(id);

  /* ---------- Texter per material ---------- */
  const TEXT = isLinen ? {
    story: 'Skapa ett avslappnat, svalt sovrum. Stentvättat europeiskt linne som andas och reglerar värmen — svalt om sommaren, ombonat om vintern. Mjukt redan första natten och ännu mjukare för varje tvätt.',
    feel: 'Luftigt, mjukt och svalt mot huden.',
    look: 'Levande, naturligt skrynklig yta med matt lyster.',
    chips: [['leaf', '100 % linne'], ['drop', 'Stentvättat'], ['wind', 'Andas & reglerar värme'], ['pin', 'Vävt i Portugal']],
  } : {
    story: 'Känslan av en nybäddad hotellsäng, varje kväll. Tät enkelvävd bomull med en matt, krispig yta som känns sval mot huden och blir mjukare för varje tvätt. Klassisk, tidlös och lätt att kombinera.',
    feel: 'Krispigt, slätt och svalt — perfekt för dig som sover varmt.',
    look: 'Stram, matt yta med en ren och tidlös finish.',
    chips: [['leaf', '100 % kammad bomull'], ['grid', '300 trådars täthet'], ['wind', 'Svalt & krispigt'], ['pin', 'Vävt i Portugal']],
  };
  const ICONS = {
    leaf: '<path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14z"/><path d="M5 19l8-8"/>',
    drop: '<path d="M12 3.5s6 6.4 6 10.5a6 6 0 01-12 0c0-4.1 6-10.5 6-10.5z"/>',
    wind: '<path d="M3 9h11a3 3 0 10-3-3"/><path d="M3 15h15a3 3 0 11-3 3"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0113 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    grid: '<path d="M4 4h16v16H4zM4 9.3h16M4 14.6h16M9.3 4v16M14.6 4v16"/>',
  };

  /* ---------- Rubrik, brödsmulor, pris ---------- */
  document.title = `${p.name} — Somniore`;
  $('crumbs').innerHTML = `
    <a href="index.html">Hem</a> <span>/</span>
    <a href="kollektion.html?c=${p.material}">${mat.name}</a> <span>/</span>
    <a href="kollektion.html?c=${p.cat}">${cat.plural}</a> <span>/</span>
    <span>${p.name}</span>`;
  $('backLink').href = p.cat === 'baddpaket' ? 'baddpaket.html' : `kollektion.html?c=${p.cat}`;
  $('backLink').innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg> ${cat.plural}`;
  const tag = p.tag || (p.isNew ? 'Nyhet' : '');
  if (tag) { $('pTag').textContent = tag; $('pTag').hidden = false; }
  $('pTitle').textContent = p.name;
  $('pSpec').textContent = mat.spec + (p.pack ? ' · ' + p.pack : '') + ' · Vävt i Portugal';
  $('pPrice').textContent = formatPrice(p);
  $('pStory').textContent = (p.desc ? p.desc + ' ' : '') + TEXT.story;
  $('pFeel').textContent = TEXT.feel;
  $('pLook').textContent = TEXT.look;
  $('chipsRow').innerHTML = TEXT.chips.map(([i, t]) =>
    `<span class="pd-chip"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[i]}</svg>${t}</span>`).join('');
  $('media').insertAdjacentHTML('beforeend', SOM.favBtn(p.id));

  /* ---------- Bilder: miniatyrer + stor bild (dator), svepbar rad (mobil) ---------- */
  const images = () => cat.gallery.map(k => productImg(p, state.color, k));
  function showImage(i) {
    const list = images();
    state.img = (i + list.length) % list.length;
    $('mainImg').src = list[state.img];
    $('mainImg').alt = `${p.name} i ${colors[state.color].name}`;
    $('thumbs').querySelectorAll('button').forEach((b, n) => b.classList.toggle('active', n === state.img));
  }
  function renderGallery() {
    const list = images();
    $('thumbs').innerHTML = list.map((src, i) => `<button aria-label="Bild ${i + 1}"><img src="${src}" alt=""></button>`).join('');
    $('track').innerHTML = list.map((src, i) => `<img src="${src}" alt="${i ? '' : p.name + ' i ' + colors[state.color].name}"${i ? ' loading="lazy"' : ''}>`).join('');
    $('track').scrollLeft = 0;
    showImage(0);
  }
  $('thumbs').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    showImage([...$('thumbs').children].indexOf(b));
  });
  $('imgPrev').addEventListener('click', () => showImage(state.img - 1));
  $('imgNext').addEventListener('click', () => showImage(state.img + 1));

  /* ---------- Färg (runda prickar) ---------- */
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
    tintRails();
    updateSticky();
    const url = new URL(location.href); url.searchParams.set('farg', state.color);
    history.replaceState(null, '', url);
  }

  /* ---------- Typ: endast lakan / lakanset, påslakanset / 2-pack örngott ---------- */
  const PAIRS = { lakanset: 'lakan', lakan: 'lakanset', paslakanset: 'orngott', orngott: 'paslakanset' };
  const TYPE_LABEL = { lakan: 'Endast lakan', lakanset: 'Lakanset', paslakanset: 'Påslakanset', orngott: '2-pack örngott' };
  const TYPE_ORDER = ['lakan', 'lakanset', 'paslakanset', 'orngott'];
  function renderTypes() {
    const otherCat = PAIRS[p.cat];
    const other = otherCat && PRODUCTS.find(x => x.material === p.material && x.cat === otherCat);
    if (!other) return;
    $('typeOpt').hidden = false;
    $('pTypeName').textContent = TYPE_LABEL[p.cat];
    const opts = [p, other].sort((a, b) => TYPE_ORDER.indexOf(a.cat) - TYPE_ORDER.indexOf(b.cat));
    $('pTypes').innerHTML = opts.map(x => x.id === p.id
      ? `<span class="pd-box active">${TYPE_LABEL[x.cat]}</span>`
      : `<a class="pd-box" href="${productUrl(x, state.color)}">${TYPE_LABEL[x.cat]}</a>`).join('');
  }

  /* ---------- Storlek ---------- */
  $('pSizes').innerHTML = SIZES[p.cat].map(sizeInfo).map(s =>
    `<button class="pd-box" data-s="${s.label}">${s.title}${s.sub !== 'cm' ? `<small>${s.sub}</small>` : ''}</button>`).join('');
  $('pSizes').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $('pSizes').querySelector('.active')?.classList.remove('active'); b.classList.add('active');
    state.size = b.dataset.s; $('pSizeName').textContent = state.size; $('sizeError').textContent = '';
    updateSticky();
  });

  /* ---------- Köp ---------- */
  function addToCart() {
    if (!state.size) {
      $('sizeError').textContent = 'Välj en storlek först.';
      $('pSizes').scrollIntoView({ behavior: 'smooth', block: 'center' });
      $('pSizes').classList.add('shake'); setTimeout(() => $('pSizes').classList.remove('shake'), 500);
      return;
    }
    SOM.addToCart({ id: p.id, color: state.color, size: state.size, qty: 1 });
    SOM.toast(`${p.name} lades i varukorgen`);
    setTimeout(SOM.openCart, 350);
  }
  $('addBtn').addEventListener('click', addToCart);

  /* ---------- Fast köpknapp längst ner på mobil ---------- */
  const sticky = document.createElement('div');
  sticky.className = 'pd-sticky';
  sticky.innerHTML = `<button class="pd-sticky__btn">Lägg i varukorg</button><span class="pd-sticky__meta" id="stickyMeta"></span>`;
  document.body.appendChild(sticky);
  function updateSticky() {
    const m = $('stickyMeta'); if (!m) return;
    m.textContent = `${colors[state.color].name} · ${state.size || 'Välj storlek'}`;
  }
  sticky.querySelector('button').addEventListener('click', addToCart);
  /* Visas när den vanliga köpknappen har scrollats förbi */
  const toggleSticky = () => sticky.classList.toggle('show', $('addBtn').getBoundingClientRect().bottom < 0);
  window.addEventListener('scroll', toggleSticky, { passive: true });
  toggleSticky();

  /* ---------- Utfällbara sektioner ---------- */
  const includes = p.includes
    ? `<p class="pd-acc__sub">Innehåll</p><ul>${p.includes.map(i => `<li>${i}</li>`).join('')}</ul>` : '';
  const note = /paslakan/.test(p.cat) ? '<p>Påslakanet har dold knäppning och inre band som håller täcket på plats.</p>' : '';
  const detailsTable = `
    <dl class="pd-table">
      <dt>Mått</dt><dd>${SIZES[p.cat].map(s => sizeInfo(s).label).join('<br>')}</dd>
      <dt>Material</dt><dd>${mat.spec}</dd>
      <dt>Ursprung</dt><dd>Vävt i Guimarães, Portugal</dd>
      <dt>Detaljer</dt><dd>${p.details.join('<br>')}</dd>
    </dl>`;
  const sections = [
    ['Detaljer', `${includes}${note}${detailsTable}`],
    ['Skötsel', `<p>${mat.care}</p>`],
    ['Frakt & returer', '<p>Fri frakt på beställningar över 1000 kr inom Sverige. Leverans inom 2–5 arbetsdagar.</p><p>30 dagars öppet köp — returnera otvättat i originalförpackning. Frågor? <a href="kundservice.html">Kontakta oss</a>.</p>'],
  ];
  $('accordion').innerHTML = sections.map(([t, body]) =>
    `<details><summary>${t}</summary><div>${body}</div></details>`).join('');

  /* ---------- Jämförelse linne / percale ---------- */
  const ROWS = [
    ['Material', '100 % linne, 160 gsm', '100 % kammad bomull, 300 TC'],
    ['Känsla', 'Luftigt & mjukt', 'Krispigt & slätt'],
    ['Yta', 'Naturligt skrynklig', 'Stram & matt'],
    ['Passar dig som', 'Vill ha en avslappnad säng året runt', 'Sover varmt & älskar hotellkänsla'],
    ['Tvätt', '40 °C', '60 °C'],
    ['Vävt i Portugal', '●', '●'],
  ];
  const on = isLinen ? 1 : 2;
  $('compare').innerHTML = `
    <thead><tr><th></th><th${on === 1 ? ' class="on"' : ''}>Linne</th><th${on === 2 ? ' class="on"' : ''}>Percale</th></tr></thead>
    <tbody>${ROWS.map(r => `<tr><th>${r[0]}</th>${[1, 2].map(i => `<td${i === on ? ' class="on"' : ''}>${r[i] === '●' ? '<i class="dot"></i>' : r[i]}</td>`).join('')}</tr>`).join('')}</tbody>`;

  /* ---------- Inspiration (miljöbilder i vald färg) ---------- */
  function renderInspiration() {
    $('insp').innerHTML = ['bed', 'bed2', 'room', 'detail'].map(k =>
      `<figure><img src="${productImg(p, state.color, k)}" alt="" loading="lazy"></figure>`).join('');
  }

  /* ---------- Karuseller: fullborda looken + mer att upptäcka ---------- */
  const look = PRODUCTS.filter(x => x.material === p.material && x.id !== p.id && x.cat !== 'baddpaket');
  const more = PRODUCTS.filter(x => x.material !== p.material && x.cat === p.cat)
    .concat(PRODUCTS.filter(x => x.material !== p.material && x.cat !== p.cat)).slice(0, 6);
  $('lookTrack').innerHTML = look.map(SOM.productCard).join('');
  $('moreTrack').innerHTML = more.map(SOM.productCard).join('');
  SOM.bindRail($('lookTrack'), $('lookPrev'), $('lookNext'));
  SOM.bindRail($('moreTrack'), $('morePrev'), $('moreNext'));
  /* Korten i "Fullborda looken" visar samma färg som vald produkt */
  function tintRails() {
    $('lookTrack').querySelectorAll('.product').forEach(card => card.querySelector(`[data-color="${state.color}"]`)?.click());
  }

  updateColor();
  SOM.fadeIn('.pd-maker > div, .pd-insp figure');
})();
