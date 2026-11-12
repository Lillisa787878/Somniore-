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

  /* ---------- Favoriter (hjärtat på produktbilder) ---------- */
  const FAV_KEY = 'somniore-favs';
  const favs = {
    list() { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; } },
    has(id) { return this.list().includes(id); },
    toggle(id) {
      const l = this.list(); const i = l.indexOf(id);
      if (i >= 0) l.splice(i, 1); else l.push(id);
      try { localStorage.setItem(FAV_KEY, JSON.stringify(l)); } catch {}
      return i < 0;
    },
  };
  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3s-7.6-4.6-9.2-9.4C1.7 7.5 3.9 4.4 7.2 4.4c2 0 3.6 1.1 4.8 2.9 1.2-1.8 2.8-2.9 4.8-2.9 3.3 0 5.5 3.1 4.4 6.5-1.6 4.8-9.2 9.4-9.2 9.4z"/></svg>';
  const favBtn = id => { const on = favs.has(id); return `<button type="button" class="fav${on ? ' on' : ''}" data-fav="${id}" aria-pressed="${on}" aria-label="${on ? 'Ta bort från favoriter' : 'Spara som favorit'}">${HEART}</button>`; };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-fav]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const on = favs.toggle(b.dataset.fav);
    document.querySelectorAll(`[data-fav="${b.dataset.fav}"]`).forEach(x => {
      x.classList.toggle('on', on); x.setAttribute('aria-pressed', on);
      x.setAttribute('aria-label', on ? 'Ta bort från favoriter' : 'Spara som favorit');
    });
    updateFavCount();
    toast(on ? 'Sparad som favorit' : 'Borttagen från favoriter');
    document.dispatchEvent(new CustomEvent('som:fav', { detail: { id: b.dataset.fav, on } }));
  });
  function updateFavCount() {
    const el = document.getElementById('favCount'); if (!el) return;
    const n = favs.list().length;
    el.textContent = n || ''; el.toggleAttribute('data-zero', n === 0);
  }

  const catLink = c => `kollektion.html?c=${c}`;
  const colDots = (mat) => Object.entries(COLORS[mat]).map(([k, c]) =>
    `<a href="kollektion.html?c=${mat}&farg=${c.group}"><i style="--c:${c.hex}"></i>${c.name}</a>`).join('');

  const megaHead = (title, href) => `<a class="mega__head" href="${href}">${title} <span>→</span></a>`;

  /* ---------- Megamenyer ---------- */
  const pUrl = (id, color) => productUrl(productById(id), color);
  /* Två stora bilder med rubrik och länk (som Parachute) */
  const megaPair = items => items.map(([href, img, title, link]) => `
      <a class="mega__feature mega__feature--big" href="${href}">
        <img src="assets/img/${img}" alt="">
        <span class="mega__feature-title">${title}</span>
        <span class="mega__feature-link">→ ${link}</span>
      </a>`).join('');
  const MEGA = {
    bastsaljare: `
      <div class="mega__col">
        ${megaHead('Bästsäljare', catLink('bastsaljare'))}
        <a href="${pUrl('linne-lakanset')}">Lakanset i linne</a>
        <a href="${pUrl('linne-paslakanset')}">Påslakanset i linne</a>
        <a href="${pUrl('percale-lakanset')}">Lakanset i percale</a>
        <a href="${pUrl('percale-paslakanset')}">Påslakanset i percale</a>
        <a href="baddpaket.html">Bäddpaket</a>
        <a href="${catLink('orngott')}">2-pack örngott</a>
      </div>
      ${megaPair([
        [pUrl('linne-paslakanset', 'sand'), 'linen-beige-bed2.jpg', 'Mjukare för varje natt.', 'Shoppa påslakanset i linne'],
        [pUrl('percale-lakanset', 'vit'), 'percale-white-bed.jpg', 'Krispigt som på hotell.', 'Shoppa lakanset i percale'],
      ])}`,
    nyheter: `
      <div class="mega__col">
        ${megaHead('Nyheter', catLink('nyheter'))}
        <a href="${catLink('alla')}&farg=bla">Nya blå nyanser</a>
        <a href="${pUrl('linne-paslakanset', 'midnatt')}">Midnatt i linne</a>
        <a href="${pUrl('percale-paslakanset', 'fjord')}">Fjord i percale</a>
        <a href="${pUrl('linne-orngott')}">2-pack örngott i linne</a>
        <a href="${catLink('lakanochset')}">Lakan &amp; lakanset</a>
      </div>
      ${megaPair([
        [pUrl('linne-lakanset', 'midnatt'), 'linen-blue-dusk.jpg', 'Djupt som en nordisk natt.', 'Shoppa Midnatt'],
        [pUrl('percale-paslakanset', 'fjord'), 'percale-blue-candle.jpg', 'Stilla blått för långa kvällar.', 'Shoppa Fjord'],
      ])}`,
    sangklader: `
      <div class="mega__col">
        ${megaHead('Lakan', catLink('lakanset'))}
        <a href="${catLink('lakanset')}">Lakanset</a>
        <a href="baddpaket.html">Bäddpaket</a>
        <a href="${catLink('paslakanset')}">Påslakanset</a>
        <a href="${catLink('drapa')}">Dra-på-lakan</a>
        <a href="${catLink('lakan')}">Lakan styckvis</a>
      </div>
      <div class="mega__col">
        ${megaHead('Bäddning', catLink('paslakanset'))}
        <a href="${productUrl(productById('linne-paslakanset'))}">Påslakanset i linne</a>
        <a href="${productUrl(productById('percale-paslakanset'))}">Påslakanset i percale</a>
        <a href="${catLink('orngott')}">2-pack örngott</a>
        <a href="${catLink('paslakanset')}">Alla påslakanset</a>
      </div>
      <div class="mega__col">
        ${megaHead('Material', 'material.html')}
        <a href="${catLink('percale')}" class="mega__mat">Percale<small>${MATERIALS.percale.short}</small></a>
        <a href="${catLink('linne')}" class="mega__mat">Linne<small>${MATERIALS.linne.short}</small></a>
        <a href="material.html" class="mega__mat">Jämför material<small>Hitta din favorit.</small></a>
      </div>
      <div class="mega__col">
        ${megaHead('Färg', catLink('alla'))}
        ${Object.entries(COLOR_GROUPS).map(([k, g]) => `<a href="kollektion.html?c=alla&farg=${k}"><i style="--c:${g.hex}"></i>${g.name}</a>`).join('')}
      </div>
      <div class="mega__col">
        <span class="mega__head mega__head--plain">Paket &amp; spara</span>
        <a href="baddpaket.html">Alla bäddpaket</a>
        <a href="baddpaket.html?m=percale">Bäddpaket i percale</a>
        <a href="baddpaket.html?m=linne">Bäddpaket i linne</a>
      </div>
      <a class="mega__feature" href="kollektion.html?c=alla&farg=vit">
        <img src="assets/img/white-sheet-line.jpg" alt="Vitt lakan som torkar i vinden">
        <span class="mega__feature-title">Torkat i vinden.<br>Vävt i Portugal.</span>
        <span class="mega__feature-link">→ Shoppa vitt</span>
      </a>`,
    bad: `
      <div class="mega__col">
        ${megaHead('Bad', catLink('bad'))}
        <a href="${catLink('handdukar')}">Handdukar</a>
        <a href="${catLink('badlakan')}">Badlakan</a>
        <a href="${catLink('morgonrockar')}">Morgonrockar</a>
      </div>
      <div class="mega__col mega__col--text">
        <span class="mega__head mega__head--plain">Kommer snart</span>
        <p>Handdukar och morgonrockar i samma nordiska anda som våra sängkläder — mjuka, naturliga och gjorda för att hålla.</p>
        <a href="${catLink('bad')}" class="mega__more">Få besked först →</a>
      </div>
      <a class="mega__feature" href="${catLink('bad')}">
        <img src="assets/img/percale-white-texture.jpg" alt="">
        <span class="mega__feature-title">Mjukt efter badet.</span>
        <span class="mega__feature-link">→ Kommer snart</span>
      </a>`,
  };

  /* ---------- Sidhuvud ---------- */
  const header = `
  <div class="announce"><p>Fri frakt över 1000 kr <span>|</span> <b class="more">30 dagars öppet köp</b></p></div>
  <header class="header" id="header">
    <div class="header__bar">
      <div class="m-left">
        <button class="burger" id="burger" aria-label="Meny" aria-expanded="false"><span></span><span></span><span></span></button>
        <button class="tool m-search" aria-label="Sök">${ICON.search}</button>
      </div>
      <nav class="nav" aria-label="Huvudmeny">
        <div class="nav__item" data-mega="bastsaljare"><a href="${catLink('bastsaljare')}" class="nav__link">Bästsäljare</a></div>
        <div class="nav__item" data-mega="nyheter"><a href="${catLink('nyheter')}" class="nav__link">Nyheter</a></div>
        <div class="nav__item" data-mega="sangklader"><a href="${catLink('alla')}" class="nav__link">Sängkläder</a></div>
        <div class="nav__item" data-mega="bad"><a href="${catLink('bad')}" class="nav__link">Bad</a></div>
      </nav>
      <a href="index.html" class="logo" aria-label="Somniore – till startsidan">SOMNIORE</a>
      <div class="tools">
        <nav class="nav nav--right" aria-label="Mer">
          <a href="material.html" class="nav__link">Våra material</a>
          <a href="om-oss.html" class="nav__link">Om Somniore</a>
        </nav>
        <button class="tool hide-m" aria-label="Sök">${ICON.search}</button>
        <a class="tool acc-link${me ? ' is-in' : ''}" href="konto.html" aria-label="${me ? 'Mitt konto' : 'Logga in'}" title="${me ? 'Mitt konto · ' + (me.points || 0) + ' poäng' : 'Logga in'}">${ICON.user}</a>
        <a class="tool fav-link" href="favoriter.html" aria-label="Favoriter" title="Favoriter">${HEART}<span class="cart-count" id="favCount"></span></a>
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
        <details><summary>Bästsäljare</summary>
          <div class="drawer__sub">
            <a href="${pUrl('linne-lakanset')}">Lakanset i linne</a><a href="${pUrl('linne-paslakanset')}">Påslakanset i linne</a><a href="${pUrl('percale-lakanset')}">Lakanset i percale</a><a href="${pUrl('percale-paslakanset')}">Påslakanset i percale</a><a href="baddpaket.html">Bäddpaket</a><a href="${catLink('orngott')}">2-pack örngott</a>
            <a href="${catLink('bastsaljare')}" class="drawer__all">Alla bästsäljare</a>
          </div>
        </details>
        <details><summary>Nyheter</summary>
          <div class="drawer__sub">
            <a href="${pUrl('linne-paslakanset', 'midnatt')}">Midnatt i linne</a><a href="${pUrl('percale-paslakanset', 'fjord')}">Fjord i percale</a><a href="${pUrl('linne-orngott')}">2-pack örngott i linne</a><a href="${catLink('lakanochset')}">Lakan &amp; lakanset</a>
            <a href="${catLink('nyheter')}" class="drawer__all">Alla nyheter</a>
          </div>
        </details>
        <details><summary>Sängkläder</summary>
          <div class="drawer__sub">
            <p>Lakan</p>
            <a href="${catLink('lakanset')}">Lakanset</a><a href="baddpaket.html">Bäddpaket</a><a href="${catLink('paslakanset')}">Påslakanset</a><a href="${catLink('drapa')}">Dra-på-lakan</a><a href="${catLink('lakan')}">Lakan styckvis</a>
            <p>Bäddning</p>
            <a href="${productUrl(productById('linne-paslakanset'))}">Påslakanset i linne</a><a href="${productUrl(productById('percale-paslakanset'))}">Påslakanset i percale</a><a href="${catLink('orngott')}">2-pack örngott</a>
            <p>Material</p>
            <a href="${catLink('percale')}">Percale <small>${MATERIALS.percale.short}</small></a><a href="${catLink('linne')}">Linne <small>${MATERIALS.linne.short}</small></a>
            <a href="${catLink('alla')}" class="drawer__all">Visa alla sängkläder</a>
          </div>
        </details>
        <details><summary>Bad</summary>
          <div class="drawer__sub">
            <p>Kommer snart</p>
            <a href="${catLink('handdukar')}">Handdukar</a><a href="${catLink('badlakan')}">Badlakan</a><a href="${catLink('morgonrockar')}">Morgonrockar</a>
            <a href="${catLink('bad')}" class="drawer__all">Allt inom bad</a>
          </div>
        </details>
        <a href="material.html">Våra material</a>
        <a href="om-oss.html">Om Somniore</a>
      </nav>
      <div class="drawer__tiles">
        <a href="baddpaket.html"><img src="assets/img/percale-grey-dark-wall.jpg" alt="" loading="lazy"><span>Bäddpaket</span></a>
        <a href="${catLink('linne')}"><img src="assets/img/linen-green-bed.jpg" alt="" loading="lazy"><span>Tvättat linne</span></a>
      </div>
      <div class="drawer__foot">
        <a href="konto.html">${me ? 'Mitt konto · ' + (me.points || 0) + ' poäng' : 'Logga in / Skapa konto'}</a>
        <a href="favoriter.html">Mina favoriter</a>
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
        <div class="cart__row"><span>Frakt</span><span>Fri över 1000 kr</span></div>
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
          <input id="email" name="EMAIL" type="email" placeholder="E-postadress" autocomplete="email" required>
          <input type="text" name="email_address_check" value="" tabindex="-1" autocomplete="off" aria-hidden="true" class="news__trap">
          <button type="submit" aria-label="Prenumerera">${ICON.arrow}</button>
        </form>
        <p class="news__msg" id="newsMsg" role="status"></p>
        <p class="news__legal">Du får ett mejl där du bekräftar din adress. Avregistrera dig när du vill.</p>
      </div>
      <div class="footer__cols">
        <div><h4>Shoppa</h4><a href="${'baddpaket.html'}">Bäddpaket</a><a href="${catLink('linne')}">Linne</a><a href="${catLink('percale')}">Percale</a><a href="${catLink('alla')}">Alla sängkläder</a><a href="${catLink('bastsaljare')}">Bästsäljare</a></div>
        <div><h4>Kundservice</h4><a href="konto.html">Mitt konto</a><a href="favoriter.html">Mina favoriter</a><a href="konto.html#poang">Somniore Club</a><a href="kundservice.html">Kontakta oss</a><a href="kundservice.html#frakt">Frakt &amp; leverans</a><a href="kundservice.html#returer">Returer</a><a href="kundservice.html#skotsel">Skötselråd</a><a href="kundservice.html#storlekar">Storleksguide</a></div>
        <div><h4>Somniore</h4><a href="om-oss.html">Om oss</a><a href="material.html">Våra material</a><a href="om-oss.html#hantverk">Hantverk</a><a href="#">Instagram</a><a href="mailto:hello@somniore.com">hello@somniore.com</a></div>
      </div>
    </div>
    <div class="footer__mark" aria-hidden="true">SOMNIORE</div>
    <div class="footer__bottom">
      <span>© ${new Date().getFullYear()} Somniore AB · <a href="mailto:hello@somniore.com">hello@somniore.com</a></span>
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

  /* ---------- Nyhetsbrev: sparas i Brevo (listan "Somniore") ---------- */
  const BREVO_FORM = 'https://6756cb5b.sibforms.com/serve/MUIFADCSpeyQrSiQFg7hRp3l5YsJ8H_oMawDbOZJYfD6GqTfssbAda0tcY3VSmuCTFnyEtcJBZAqJVkWz8DbbduX34q_9yxf3SXLIr9P25kuAbwSjjreVF-gmgd2LnROxf04AX2TetxQfSGfBkyP4EBY-VtOLS0WUGL9Lp16lXq7JyE32CBchnaYs_hugHXSz6mLxL55M-mDwiQNHA==';
  async function subscribe(email) {
    const data = new FormData();
    data.append('EMAIL', email); data.append('email_address_check', ''); data.append('locale', 'sv');
    const res = await fetch(BREVO_FORM, { method: 'POST', body: data });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) throw new Error('brevo');
  }
  $('newsForm').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target, msg = $('newsMsg'), btn = form.querySelector('button');
    const email = form.EMAIL.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Ange en giltig e-postadress.'; return; }
    if (form.email_address_check.value) return;            // spamrobot
    btn.disabled = true; msg.textContent = 'Skickar…';
    try {
      await subscribe(email);
      msg.textContent = 'Tack! Kolla din inkorg och bekräfta din adress.';
      form.reset();
    } catch (err) {
      msg.textContent = 'Något gick fel. Försök igen om en stund.';
    }
    btn.disabled = false;
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

  /* ---------- Runda kategoribilder (som Quince) — bara det Somniore säljer ---------- */
  const CAT_CIRCLES = [
    { key: 'alla', label: 'Sängkläder', href: 'kollektion.html?c=alla', img: 'linen-white-bed.jpg', match: ['alla'] },
    { key: 'lakanochset', label: 'Lakan & lakanset', href: 'kollektion.html?c=lakanochset', img: 'p/percale-white-stack.jpg', match: ['lakanochset', 'lakan', 'drapa', 'lakanset'] },
    { key: 'paslakanset', label: 'Påslakanset', href: 'kollektion.html?c=paslakanset', img: 'p/linen-beige-stack.jpg', match: ['paslakanset'] },
    { key: 'orngott', label: '2-pack örngott', href: 'kollektion.html?c=orngott', img: 'p/linen-white-pillows.jpg', match: ['orngott'] },
    { key: 'baddpaket', label: 'Bäddpaket', href: 'baddpaket.html', img: 'p/linen-green-stack.jpg', match: ['baddpaket'] },
  ];
  const catCircles = active => `
    <nav class="cat-circles" aria-label="Kategorier">
      ${CAT_CIRCLES.map(c => {
        const on = c.match.includes(active);
        return `<a href="${c.href}" class="cat-circle${on ? ' active' : ''}"${on ? ' aria-current="page"' : ''}>
          <span class="cat-circle__img"><img src="${IMG(c.img)}" alt="" loading="lazy"></span>
          <span class="cat-circle__label">${c.label}</span>
        </a>`;
      }).join('')}
    </nav>`;

  /* ---------- Snabbköp: kassen nere till höger på produktbilden ---------- */
  const QUICK_BTN = `<button type="button" class="quick" data-quick aria-label="Snabbköp — välj storlek"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 8h15l-1.3 13H5.8z"/><path d="M8.5 8V6.5a3.5 3.5 0 017 0V8"/><path d="M12 11.5v6M9 14.5h6"/></svg></button>`;
  function closeQuick(except) {
    document.querySelectorAll('.quick-panel').forEach(el => { if (el !== except) el.remove(); });
  }
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-quick]');
    const size = e.target.closest('[data-qsize]');
    const close = e.target.closest('[data-qclose]');
    if (!btn && !size && !close) { if (!e.target.closest('.quick-panel')) closeQuick(); return; }
    e.preventDefault(); e.stopPropagation();
    const card = e.target.closest('.product');
    const p = productById(card.dataset.id);
    const color = card.querySelector('.product__swatches .active')?.dataset.color || card.dataset.color || firstColorKey(p);
    if (close) { closeQuick(); return; }
    if (btn) {
      const open = card.querySelector('.quick-panel');
      closeQuick(); if (open) return;
      const sizes = SIZES[p.cat].map(sizeInfo);
      card.querySelector('.product__frame').insertAdjacentHTML('beforeend', `
        <div class="quick-panel" role="dialog" aria-label="Välj storlek">
          <div class="quick-panel__head"><span>Välj storlek <small>· ${colorsOf(p)[color].name}</small></span><button type="button" data-qclose aria-label="Stäng">${ICON.close}</button></div>
          <div class="quick-panel__sizes">${sizes.map(s => `<button type="button" data-qsize="${s.label}">${s.title}${s.sub !== 'cm' ? `<small>${s.sub}</small>` : ''}</button>`).join('')}</div>
        </div>`);
      return;
    }
    SOM.addToCart({ id: p.id, color, size: size.dataset.qsize, qty: 1 });
    closeQuick();
    toast(`${p.name} · ${colorsOf(p)[color].name} lades i varukorgen`);
    setTimeout(() => { renderCart(); togglePanel(cart, true); }, 300);
  }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeQuick(); });

  /* ---------- Produktkort (används på flera sidor) ----------
     productCard(p)         → kortet visar produktens första färg
     productCard(p, 'mossa') → ett kort för just den färgen        */
  function productCard(p, colorArg) {
    const cat = CATEGORIES[p.cat];
    const colors = colorsOf(p);
    const perColor = typeof colorArg === 'string' && colors[colorArg];
    const first = perColor ? colorArg : firstColorKey(p);
    return `
    <article class="product" data-id="${p.id}"${perColor ? ` data-color="${first}"` : ''}>
      <div class="product__frame">
        ${favBtn(p.id)}
        <a href="${productUrl(p, first)}" class="product__media">
          ${p.tag ? `<span class="tag">${p.tag}</span>` : p.isNew ? '<span class="tag">Nyhet</span>' : ''}
          <img src="${productImg(p, first, cat.card)}" alt="${p.name} i ${colors[first].name}" loading="lazy" class="main">
          <img src="${productImg(p, first, cat.hover)}" alt="" class="alt" loading="lazy">
        </a>
        ${QUICK_BTN}
      </div>
      <a href="${productUrl(p, first)}" class="product__name">${p.name}</a>
      ${perColor ? `<p class="product__color">${colors[first].name}</p>` : ''}
      <p class="product__meta">${formatPrice(p)}</p>
      <div class="product__swatches">
        ${Object.entries(colors).map(([k, c]) => `<button class="${k === first ? 'active' : ''}" style="--c:${c.hex}" data-color="${k}" aria-label="${c.name}" title="${c.name}"></button>`).join('')}
      </div>
    </article>`;
  }
  /* Delar upp produkter i ett kort per färg. Ordningen roterar färgerna så att
     två kort bredvid varandra aldrig har samma färg och rutnätet blir varierat. */
  function byColor(list, keep = () => true) {
    const rows = [];
    list.forEach((p, pi) => {
      const keys = Object.keys(colorsOf(p));
      keys.forEach((color, ci) => {
        if (!keep(colorsOf(p)[color], color)) return;
        const round = ((ci - pi) % keys.length + keys.length) % keys.length;
        rows.push({ p, color, pi, ci, round });
      });
    });
    return rows.sort((a, b) => a.round - b.round || a.pi - b.pi);
  }
  const colorCards = rows => rows.map(r => productCard(r.p, r.color)).join('');

  /* Färgprickar på produktkort byter bild, länk och färgnamn */
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
    const label = card.querySelector('.product__color');
    if (label) label.textContent = colorsOf(p)[sw.dataset.color].name;
  });

  /* Sidfot: fällbara listor på mobil */
  document.querySelectorAll('.footer__cols h4').forEach(h => {
    h.setAttribute('role', 'button'); h.tabIndex = 0;
    h.addEventListener('click', () => h.parentElement.classList.toggle('open'));
  });

  updateCount();
  updateFavCount();

  window.SOM = {
    club, subscribe, fadeIn, productCard, byColor, colorCards, toast, favs, favBtn, quickBtn: QUICK_BTN, catCircles, openCart: () => { renderCart(); togglePanel(cart, true); },
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
