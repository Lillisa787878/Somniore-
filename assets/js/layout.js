/* =========================================================
   SOMNIORE — gemensam layout för alla sidor
   Sidhuvud, megameny, mobilmeny, varukorg och sidfot.
   Varje sida har <div id="site-header"></div> och <div id="site-footer"></div>.
   ========================================================= */
(function () {
  /* ---------- Somniore Club: konton och poäng ----------
     Demo: konton sparas i webbläsaren (localStorage).
     Vid lansering byts detta mot en riktig kunddatabas (t.ex. Shopify eller Firebase). */
  const ACC_KEY = 'somniore-accounts', SES_KEY = 'somniore-session';
  const readJSON = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const club = {
    all: () => readJSON(ACC_KEY, {}),
    get: email => club.all()[email?.toLowerCase()] || null,
    save(acc) { const all = club.all(); all[acc.email.toLowerCase()] = acc; writeJSON(ACC_KEY, all); return acc; },
    current: () => { const e = readJSON(SES_KEY, null); return e ? club.get(e) : null; },
    login: email => writeJSON(SES_KEY, email.toLowerCase()),
    logout: () => { try { localStorage.removeItem(SES_KEY); } catch (e) {} },
    tierOf(acc) {
      const total = acc.earned || 0;
      let i = 0; CLUB.tiers.forEach((t, n) => { if (total >= t.min) i = n; });
      return { tier: CLUB.tiers[i], next: CLUB.tiers[i + 1] || null, total };
    },
    /* Ger poäng en gång per anledning (key), eller alltid om key saknas */
    award(acc, points, label, key) {
      acc.done = acc.done || {};
      if (key && acc.done[key]) return false;
      if (key) acc.done[key] = true;
      acc.points = (acc.points || 0) + points;
      acc.earned = (acc.earned || 0) + points;
      acc.history = [{ date: new Date().toISOString(), label, points }, ...(acc.history || [])];
      return true;
    },
    spend(acc, points, label) {
      if ((acc.points || 0) < points) return false;
      acc.points -= points;
      acc.history = [{ date: new Date().toISOString(), label, points: -points }, ...(acc.history || [])];
      return true;
    },
  };
  const me = club.current();
  const ICON = {
    search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.3-4 4.3-6 8-6s6.7 2 8 6"/></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M4.5 8h15l-1.3 13H5.8z"/><path d="M8.5 8V6.5a3.5 3.5 0 017 0V8"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  };

  const catLink = c => `kollektion.html?c=${c}`;
  const colDots = (mat) => Object.entries(COLORS[mat]).map(([k, c]) =>
    `<a href="kollektion.html?c=${mat}&farg=${c.group}"><i style="--c:${c.hex}"></i>${c.name}</a>`).join('');

  const megaHead = (title, href) => `<a class="mega__head" href="${href}">${title} <span>→</span></a>`;

  /* ---------- Megamenyer ---------- */
  const MEGA = {
    sangklader: `
      <div class="mega__col">
        ${megaHead('Sängkläder', catLink('alla'))}
        ${Object.entries(CATEGORIES).map(([k, c]) => `<a href="${catLink(k)}">${c.plural}</a>`).join('')}
      </div>
      <div class="mega__col">
        ${megaHead('Material', 'material.html')}
        <a href="${catLink('linne')}" class="mega__mat">Linne<small>${MATERIALS.linne.short}</small></a>
        <a href="${catLink('percale')}" class="mega__mat">Percale<small>${MATERIALS.percale.short}</small></a>
        <a href="material.html" class="mega__mat">Jämför material<small>Hitta din favorit.</small></a>
      </div>
      <div class="mega__col">
        ${megaHead('Färg', catLink('alla'))}
        ${Object.entries(COLOR_GROUPS).map(([k, g]) => `<a href="kollektion.html?c=alla&farg=${k}"><i style="--c:${g.hex}"></i>${g.name}</a>`).join('')}
      </div>
      <div class="mega__col">
        ${megaHead('Utvalt', catLink('bastsaljare'))}
        <a href="${catLink('bastsaljare')}">Bästsäljare</a>
        <a href="${catLink('nyheter')}">Nyheter</a>
        <a href="material.html">Våra material</a>
      </div>
      <a class="mega__feature" href="${productUrl(productById('linne-paslakan'), 'midnatt')}">
        <img src="assets/img/linen-blue-room.jpg" alt="">
        <span class="mega__feature-title">Mörka kvällar.<br>Svala lakan.</span>
        <span class="mega__feature-link">→ Shoppa Midnatt</span>
      </a>`,
    linne: `
      <div class="mega__col">
        ${megaHead('Linne', catLink('linne'))}
        ${PRODUCTS.filter(p => p.material === 'linne').map(p => `<a href="${productUrl(p)}">${CATEGORIES[p.cat].name}</a>`).join('')}
      </div>
      <div class="mega__col">
        ${megaHead('Färger', catLink('linne'))}
        ${colDots('linne')}
      </div>
      <div class="mega__col mega__col--text">
        ${megaHead('Om linne', 'material.html')}
        <p>${MATERIALS.linne.spec}</p>
        <p>${MATERIALS.linne.about}</p>
      </div>
      <a class="mega__feature" href="${catLink('linne')}">
        <img src="assets/img/linen-beige-window.jpg" alt="">
        <span class="mega__feature-title">Tvättat linne.</span>
        <span class="mega__feature-link">→ Shoppa linne</span>
      </a>`,
    percale: `
      <div class="mega__col">
        ${megaHead('Percale', catLink('percale'))}
        ${PRODUCTS.filter(p => p.material === 'percale').map(p => `<a href="${productUrl(p)}">${CATEGORIES[p.cat].name}</a>`).join('')}
      </div>
      <div class="mega__col">
        ${megaHead('Färger', catLink('percale'))}
        ${colDots('percale')}
      </div>
      <div class="mega__col mega__col--text">
        ${megaHead('Om percale', 'material.html')}
        <p>${MATERIALS.percale.spec}</p>
        <p>${MATERIALS.percale.about}</p>
      </div>
      <a class="mega__feature" href="${catLink('percale')}">
        <img src="assets/img/percale-white-window.jpg" alt="">
        <span class="mega__feature-title">Krispig percale.</span>
        <span class="mega__feature-link">→ Shoppa percale</span>
      </a>`,
  };

  /* ---------- Sidhuvud ---------- */
  const header = `
  <div class="announce"><p>Fri frakt på alla beställningar <span>|</span> <b class="more">30 dagars öppet köp</b></p></div>
  <header class="header" id="header">
    <div class="header__bar">
      <button class="burger" id="burger" aria-label="Meny" aria-expanded="false"><span></span><span></span><span></span></button>
      <nav class="nav" aria-label="Huvudmeny">
        <a href="${catLink('bastsaljare')}" class="nav__link">Bästsäljare</a>
        <div class="nav__item" data-mega="sangklader"><a href="${catLink('alla')}" class="nav__link">Sängkläder</a></div>
        <div class="nav__item" data-mega="linne"><a href="${catLink('linne')}" class="nav__link">Linne</a></div>
        <div class="nav__item" data-mega="percale"><a href="${catLink('percale')}" class="nav__link">Percale</a></div>
      </nav>
      <a href="index.html" class="logo" aria-label="Somniore – till startsidan">SOMNIORE</a>
      <div class="tools">
        <nav class="nav nav--right" aria-label="Mer">
          <a href="material.html" class="nav__link">Våra material</a>
          <a href="om-oss.html" class="nav__link">Om Somniore</a>
        </nav>
        <button class="tool" aria-label="Sök">${ICON.search}</button>
        <a class="tool hide-m acc-link${me ? ' is-in' : ''}" href="konto.html" aria-label="${me ? 'Mitt konto' : 'Logga in'}" title="${me ? 'Mitt konto · ' + (me.points || 0) + ' poäng' : 'Logga in'}">${ICON.user}</a>
        <button class="tool cart-btn" id="cartBtn" aria-label="Varukorg">${ICON.bag}<span class="cart-count" id="cartCount">0</span></button>
      </div>
    </div>
    ${Object.entries(MEGA).map(([k, html]) => `<div class="mega" id="mega-${k}"><div class="mega__inner">${html}</div></div>`).join('')}
  </header>

  <aside class="drawer" id="drawer" aria-hidden="true">
    <div class="drawer__panel">
      <div class="drawer__head">
        <span class="logo logo--dark">SOMNIORE</span>
        <button class="drawer__close" id="drawerClose" aria-label="Stäng meny">${ICON.close}</button>
      </div>
      <nav class="drawer__nav">
        <a href="${catLink('bastsaljare')}">Bästsäljare</a>
        <details><summary>Sängkläder</summary>
          <div>${Object.entries(CATEGORIES).map(([k, c]) => `<a href="${catLink(k)}">${c.plural}</a>`).join('')}<a href="${catLink('alla')}">Visa alla</a></div>
        </details>
        <details><summary>Linne</summary>
          <div>${PRODUCTS.filter(p => p.material === 'linne').map(p => `<a href="${productUrl(p)}">${p.name}</a>`).join('')}<a href="${catLink('linne')}">Allt i linne</a></div>
        </details>
        <details><summary>Percale</summary>
          <div>${PRODUCTS.filter(p => p.material === 'percale').map(p => `<a href="${productUrl(p)}">${p.name}</a>`).join('')}<a href="${catLink('percale')}">Allt i percale</a></div>
        </details>
        <a href="material.html">Våra material</a>
        <a href="om-oss.html">Om Somniore</a>
      </nav>
      <div class="drawer__foot">
        <a href="konto.html">${me ? 'Mitt konto · ' + (me.points || 0) + ' poäng' : 'Logga in / Skapa konto'}</a>
        <a href="kundservice.html">Kundservice</a>
        <a href="kundservice.html#frakt">Frakt &amp; returer</a>
      </div>
    </div>
  </aside>

  <aside class="cart" id="cart" aria-hidden="true">
    <div class="cart__panel">
      <div class="cart__head">
        <h2>Varukorg</h2>
        <button class="drawer__close" id="cartClose" aria-label="Stäng varukorg">${ICON.close}</button>
      </div>
      <div class="cart__items" id="cartItems"></div>
      <div class="cart__foot">
        <div class="cart__row"><span>Frakt</span><span>Fri</span></div>
        <div class="cart__row cart__total"><span>Totalt</span><span id="cartTotal">—</span></div>
        <button class="btn btn--dark cart__checkout" id="checkoutBtn">Till kassan</button>
        <p class="cart__club">${me ? `Du har <b>${me.points || 0}</b> poäng · <a href="konto.html#poang">Lös in</a>` : `<a href="konto.html">Logga in</a> och samla poäng på ditt köp`}</p>
        <p class="cart__note" id="cartNote">Kassan öppnar när webbutiken lanseras.</p>
      </div>
    </div>
  </aside>
  <div class="toast" id="toast" role="status"></div>`;

  /* ---------- Sidfot ---------- */
  const footer = `
  <footer class="footer">
    <div class="footer__top">
      <div class="footer__news">
        <h2 class="footer__title">Sov bättre med oss.</h2>
        <p>Nya färger, sömnråd och erbjudanden — direkt i inkorgen.</p>
        <form class="news" id="newsForm">
          <label class="sr-only" for="email">E-postadress</label>
          <input id="email" type="email" placeholder="E-postadress" required>
          <button type="submit" aria-label="Prenumerera">${ICON.arrow}</button>
        </form>
        <p class="news__msg" id="newsMsg" role="status"></p>
      </div>
      <div class="footer__cols">
        <div><h4>Shoppa</h4><a href="${catLink('linne')}">Linne</a><a href="${catLink('percale')}">Percale</a><a href="${catLink('alla')}">Alla sängkläder</a><a href="${catLink('bastsaljare')}">Bästsäljare</a></div>
        <div><h4>Kundservice</h4><a href="konto.html">Mitt konto</a><a href="konto.html#poang">Somniore Club</a><a href="kundservice.html">Kontakta oss</a><a href="kundservice.html#frakt">Frakt &amp; leverans</a><a href="kundservice.html#returer">Returer</a><a href="kundservice.html#skotsel">Skötselråd</a><a href="kundservice.html#storlekar">Storleksguide</a></div>
        <div><h4>Somniore</h4><a href="om-oss.html">Om oss</a><a href="material.html">Våra material</a><a href="om-oss.html#hantverk">Hantverk</a><a href="#">Instagram</a></div>
      </div>
    </div>
    <div class="footer__mark" aria-hidden="true">SOMNIORE</div>
    <div class="footer__bottom">
      <span>© ${new Date().getFullYear()} Somniore AB</span>
      <span><a href="#">Integritetspolicy</a> · <a href="#">Köpvillkor</a> · <a href="#">Cookies</a></span>
    </div>
  </footer>`;

  document.getElementById('site-header').outerHTML = header;
  document.getElementById('site-footer').outerHTML = footer;

  const $ = id => document.getElementById(id);
  const headerEl = $('header');

  /* ---------- Genomskinlig header över hero ---------- */
  const hero = document.querySelector('.hero');
  if (hero && document.body.classList.contains('has-hero')) {
    const checkTop = () => document.body.classList.toggle('is-top', hero.getBoundingClientRect().bottom > 120);
    window.addEventListener('scroll', checkTop, { passive: true });
    checkTop();
  } else {
    document.body.classList.remove('is-top');
  }

  /* ---------- Megameny ---------- */
  let closeTimer;
  const closeAllMega = () => {
    document.querySelectorAll('.mega.open').forEach(m => m.classList.remove('open'));
    document.querySelectorAll('.nav__item.active').forEach(n => n.classList.remove('active'));
    headerEl.classList.remove('mega-open');
  };
  document.querySelectorAll('[data-mega]').forEach(item => {
    const panel = $('mega-' + item.dataset.mega);
    const open = () => {
      clearTimeout(closeTimer);
      closeAllMega();
      panel.classList.add('open'); item.classList.add('active'); headerEl.classList.add('mega-open');
    };
    const close = () => { closeTimer = setTimeout(closeAllMega, 140); };
    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);
    panel.addEventListener('mouseenter', () => clearTimeout(closeTimer));
    panel.addEventListener('mouseleave', close);
  });
  document.querySelectorAll('.nav > .nav__link').forEach(a => a.addEventListener('mouseenter', closeAllMega));
  window.addEventListener('scroll', closeAllMega, { passive: true });

  /* ---------- Paneler: mobilmeny och varukorg ---------- */
  const togglePanel = (el, open) => {
    el.classList.toggle('open', open);
    el.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  const drawer = $('drawer'), cart = $('cart');
  $('burger').addEventListener('click', () => togglePanel(drawer, true));
  $('drawerClose').addEventListener('click', () => togglePanel(drawer, false));
  drawer.addEventListener('click', e => { if (e.target === drawer || e.target.closest('.drawer__nav > a, .drawer__nav details a')) togglePanel(drawer, false); });
  $('cartBtn').addEventListener('click', () => { renderCart(); togglePanel(cart, true); });
  $('cartClose').addEventListener('click', () => togglePanel(cart, false));
  cart.addEventListener('click', e => { if (e.target === cart) togglePanel(cart, false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { togglePanel(drawer, false); togglePanel(cart, false); } });

  /* ---------- Varukorg (sparas i webbläsaren) ---------- */
  const KEY = 'somniore-cart';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const save = items => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} updateCount(); };
  const updateCount = () => {
    const n = load().reduce((s, i) => s + i.qty, 0);
    $('cartCount').textContent = n;
    $('cartCount').toggleAttribute('data-zero', n === 0);
  };

  function renderCart() {
    const items = load();
    const box = $('cartItems');
    if (!items.length) {
      box.innerHTML = `<div class="cart__empty"><p>Din varukorg är tom.</p><a href="kollektion.html?c=bastsaljare" class="btn btn--dark">Shoppa bästsäljare</a></div>`;
      $('cartTotal').textContent = '—';
      return;
    }
    box.innerHTML = items.map((it, i) => {
      const p = productById(it.id); if (!p) return '';
      const c = colorsOf(p)[it.color];
      return `
      <div class="cart-item">
        <a href="${productUrl(p, it.color)}" class="cart-item__img"><img src="${productImg(p, it.color, CATEGORIES[p.cat].card)}" alt=""></a>
        <div class="cart-item__info">
          <a href="${productUrl(p, it.color)}" class="cart-item__name">${p.name}</a>
          <p>${c.name} · ${it.size}</p>
          <p>${formatPrice(p)}</p>
          <div class="cart-item__qty">
            <button data-i="${i}" data-d="-1" aria-label="Minska">−</button><span>${it.qty}</span><button data-i="${i}" data-d="1" aria-label="Öka">+</button>
            <button class="cart-item__remove" data-i="${i}" data-remove>Ta bort</button>
          </div>
        </div>
      </div>`;
    }).join('');
    const priced = items.every(it => productById(it.id)?.price);
    $('cartTotal').textContent = priced
      ? items.reduce((s, it) => s + productById(it.id).price * it.qty, 0).toLocaleString('sv-SE') + ' kr'
      : 'Pris kommer snart';
    box.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => {
      const list = load(); const it = list[b.dataset.i];
      it.qty = Math.max(1, it.qty + Number(b.dataset.d)); save(list); renderCart();
    }));
    box.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
      const list = load(); list.splice(b.dataset.i, 1); save(list); renderCart();
    }));
  }
  $('checkoutBtn').addEventListener('click', () => {
    $('cartNote').textContent = 'Tack! Kassan öppnar när webbutiken lanseras.';
  });

  let toastTimer;
  function toast(msg) {
    const t = $('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------- Nyhetsbrev (demo) ---------- */
  $('newsForm').addEventListener('submit', e => {
    e.preventDefault();
    $('newsMsg').textContent = 'Tack! Välkommen till Somniore.';
    e.target.reset();
  });

  /* ---------- Mjuk inladdning ---------- */
  function fadeIn(selector) {
    const els = document.querySelectorAll(selector);
    els.forEach(el => el.classList.add('fade'));
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ---------- Produktkort (används på flera sidor) ---------- */
  function productCard(p) {
    const cat = CATEGORIES[p.cat];
    const first = firstColorKey(p);
    const colors = colorsOf(p);
    return `
    <article class="product" data-id="${p.id}">
      <a href="${productUrl(p, first)}" class="product__media">
        ${p.tag ? `<span class="tag">${p.tag}</span>` : p.isNew ? '<span class="tag">Nyhet</span>' : ''}
        <img src="${productImg(p, first, cat.card)}" alt="${p.name}" loading="lazy" class="main">
        <img src="${productImg(p, first, cat.hover)}" alt="" class="alt" loading="lazy">
      </a>
      <a href="${productUrl(p, first)}" class="product__name">${p.name}</a>
      <p class="product__meta">${formatPrice(p)}</p>
      <div class="product__swatches">
        ${Object.entries(colors).map(([k, c], i) => `<button class="${k === first ? 'active' : ''}" style="--c:${c.hex}" data-color="${k}" aria-label="${c.name}" title="${c.name}"></button>`).join('')}
      </div>
    </article>`;
  }
  /* Färgprickar på produktkort byter bild och länk */
  document.addEventListener('click', e => {
    const sw = e.target.closest('.product__swatches button');
    if (!sw) return;
    const card = sw.closest('.product');
    const p = productById(card.dataset.id); const cat = CATEGORIES[p.cat];
    card.querySelector('.product__swatches .active')?.classList.remove('active');
    sw.classList.add('active');
    card.querySelector('img.main').src = productImg(p, sw.dataset.color, cat.card);
    card.querySelector('img.alt').src = productImg(p, sw.dataset.color, cat.hover);
    card.querySelectorAll('a').forEach(a => a.href = productUrl(p, sw.dataset.color));
  });

  updateCount();

  window.SOM = {
    club, fadeIn, productCard, toast, openCart: () => { renderCart(); togglePanel(cart, true); },
    addToCart(item) {
      const list = load();
      const same = list.find(i => i.id === item.id && i.color === item.color && i.size === item.size);
      if (same) same.qty += item.qty || 1; else list.push({ qty: 1, ...item });
      save(list);
    },
    /* Pilar för horisontella karuseller */
    bindRail(trackEl, prevBtn, nextBtn) {
      const update = () => {
        const max = trackEl.scrollWidth - trackEl.clientWidth - 2;
        if (prevBtn) prevBtn.disabled = trackEl.scrollLeft <= 2;
        if (nextBtn) nextBtn.disabled = trackEl.scrollLeft >= max;
      };
      prevBtn?.addEventListener('click', () => trackEl.scrollBy({ left: -trackEl.clientWidth * 0.8, behavior: 'smooth' }));
      nextBtn?.addEventListener('click', () => trackEl.scrollBy({ left: trackEl.clientWidth * 0.8, behavior: 'smooth' }));
      trackEl.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
      return update;
    },
  };
})();
