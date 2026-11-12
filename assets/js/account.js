/* =========================================================
   SOMNIORE — Mitt konto (inloggning, kundportal, poäng)
   ========================================================= */
(function () {
  /* Google-inloggning: klistra in ert Client ID från Google Cloud Console här.
     Tomt = demoläge (knappen loggar in ett testkonto). */
  const GOOGLE_CLIENT_ID = '';

  const club = SOM.club;
  const $ = id => document.getElementById(id);
  const fmtDate = iso => new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  async function hash(text) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('somniore:' + text));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { return btoa(unescape(encodeURIComponent(text))); }
  }

  /* Skapar nytt konto med välkomstpoäng */
  function createAccount({ email, name, provider, picture, news }) {
    const acc = {
      email: email.toLowerCase(), name: name || email.split('@')[0], provider, picture: picture || '',
      created: new Date().toISOString(), points: 0, earned: 0, history: [], done: {}, codes: [], orders: [],
      profile: { name: name || '', news: !!news },
    };
    club.award(acc, CLUB.earn.signup.points, 'Välkomstgåva', 'signup');
    if (news) { club.award(acc, CLUB.earn.news.points, 'Nyhetsbrev', 'news'); SOM.subscribe(email).catch(() => {}); }
    return acc;
  }

  function signIn(acc, isNew) {
    club.save(acc);
    club.login(acc.email);
    sessionStorage.setItem('somniore-welcome', isNew ? 'new' : 'back');
    location.hash = '#oversikt';
    location.reload();
  }

  /* =========================================================
     Utloggad vy
     ========================================================= */
  function renderAuth() {
    $('authView').hidden = false;
    let mode = location.hash === '#skapa' ? 'register' : 'login';
    const form = $('authForm');

    const setMode = m => {
      mode = m;
      document.querySelectorAll('.auth__tabs button').forEach(b => b.classList.toggle('active', b.dataset.mode === m));
      form.querySelectorAll('[data-only]').forEach(el => el.hidden = el.dataset.only !== m);
      $('authTitle').textContent = m === 'login' ? 'Välkommen tillbaka' : 'Bli medlem';
      $('authLead').textContent = m === 'login'
        ? 'Logga in för att se dina beställningar och dina poäng.'
        : `Skapa ett konto och få ${CLUB.earn.signup.points} poäng direkt i välkomstgåva.`;
      $('authSubmit').textContent = m === 'login' ? 'Logga in' : 'Skapa konto';
      form.password.autocomplete = m === 'login' ? 'current-password' : 'new-password';
      $('authError').textContent = '';
    };
    document.querySelectorAll('.auth__tabs button').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
    setMode(mode);

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const err = $('authError');
      const email = form.email.value.trim().toLowerCase();
      const pass = form.password.value;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Ange en giltig e-postadress.'; return; }
      if (pass.length < 6) { err.textContent = 'Lösenordet måste vara minst 6 tecken.'; return; }
      const existing = club.get(email);
      const h = await hash(pass);

      if (mode === 'login') {
        if (!existing) { err.textContent = 'Vi hittar inget konto med den e-posten. Skapa ett konto i stället?'; return; }
        if (existing.provider === 'google' && !existing.pass) { err.textContent = 'Det här kontot använder Google. Välj "Fortsätt med Google".'; return; }
        if (existing.pass !== h) { err.textContent = 'Fel lösenord. Försök igen.'; return; }
        signIn(existing, false);
      } else {
        if (existing) { err.textContent = 'Det finns redan ett konto med den e-posten. Logga in i stället.'; return; }
        const acc = createAccount({ email, name: form.name.value.trim(), provider: 'email', news: form.news.checked });
        acc.pass = h;
        signIn(acc, true);
      }
    });

    /* ---------- Google ---------- */
    function handleGoogle(profile) {
      const existing = club.get(profile.email);
      if (existing) {
        existing.provider = existing.provider || 'google';
        if (profile.picture && !existing.picture) existing.picture = profile.picture;
        signIn(existing, false);
      } else {
        signIn(createAccount({ ...profile, provider: 'google' }), true);
      }
    }

    if (GOOGLE_CLIENT_ID) {
      /* Riktig Google-inloggning via Google Identity Services */
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = () => {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: res => {
            const data = JSON.parse(decodeURIComponent(escape(atob(res.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))));
            handleGoogle({ email: data.email, name: data.given_name || data.name, picture: data.picture });
          },
        });
        $('googleBtn').hidden = true;
        const box = $('googleOfficial'); box.hidden = false;
        google.accounts.id.renderButton(box, { theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', width: box.clientWidth || 360, locale: 'sv' });
      };
      document.head.appendChild(s);
    } else {
      $('googleBtn').addEventListener('click', () => {
        SOM.toast('Demoläge: Google kopplas in vid lansering');
        setTimeout(() => handleGoogle({ email: 'demo.google@somniore.se', name: 'Demo' }), 700);
      });
    }
  }

  /* =========================================================
     Inloggad vy: kundportal (upplägg som Quince)
     ========================================================= */
  const TABS = ['oversikt', 'bestallningar', 'favoriter', 'poang', 'sang', 'profil', 'adresser', 'betalning', 'kommunikation', 'service'];
  /* Val i "Min säng" — samma mått som butiken säljer */
  const BED_OPTS = {
    bed: [['90×200', '90 cm'], ['120×200', '120 cm'], ['180×200', '180 cm']],
    duvet: [['Enkel', 'Enkel · 150×210'], ['Dubbel', 'Dubbel · 220×220']],
    pillow: [['50×60', '50×60'], ['50×70', '50×70'], ['65×65', '65×65']],
    material: [['linne', 'Linne'], ['percale', 'Percale'], ['', 'Båda']],
  };

  function renderPortal(acc) {
    $('portalView').hidden = false;
    const save = () => club.save(acc);
    const flash = (id, text) => { $(id).textContent = text; setTimeout(() => $(id).textContent = '', 3500); };
    const tier = () => club.tierOf(acc).tier;

    function header() {
      const { tier: t } = club.tierOf(acc);
      $('helloName').textContent = acc.profile?.name || acc.name;
      $('helloMail').textContent = acc.email;
      $('avatar').innerHTML = acc.picture
        ? `<img src="${esc(acc.picture)}" alt="" referrerpolicy="no-referrer">`
        : esc((acc.profile?.name || acc.name || '?').charAt(0).toUpperCase());
      $('tierBadge').textContent = `${t.name}-medlem`;
      $('tierBadge').dataset.tier = t.key;
      $('memberSince').textContent = `Medlem sedan ${fmtDate(acc.created)}`;
    }

    /* ---------- Översikt ---------- */
    function overview() {
      const { tier: t, next, total } = club.tierOf(acc);
      const pct = next ? Math.min(100, ((total - t.min) / (next.min - t.min)) * 100) : 100;
      const nextReward = CLUB.rewards.find(r => r.points > acc.points);
      $('pointsCard').innerHTML = `
        <div class="points-card__main">
          <p class="points-card__kicker">${CLUB.name} · ${t.name}</p>
          <p class="points-card__num"><b>${acc.points.toLocaleString('sv-SE')}</b> poäng</p>
          <p class="points-card__hint">${nextReward
            ? `${(nextReward.points - acc.points).toLocaleString('sv-SE')} poäng kvar till ${nextReward.value} kr rabatt`
            : 'Du kan lösa in dina poäng mot rabatt'}</p>
          <a href="#poang" class="points-card__btn">Lös in poäng</a>
        </div>
        <div class="points-card__tier">
          <div class="progress"><i style="width:${pct}%"></i></div>
          <p>${next
            ? `<b>${(next.min - total).toLocaleString('sv-SE')}</b> poäng till nivå <b>${next.name}</b>`
            : 'Du har nått högsta nivån — tack för att du sover med oss.'}</p>
        </div>`;
      $('orderCount').textContent = acc.orders.length;
      $('favCountTile').textContent = SOM.favs.list().length;
      $('codeCount').textContent = acc.codes.filter(c => !c.used).length;

      const tasks = [
        { key: 'signup', ...CLUB.earn.signup, href: null },
        { key: 'news', ...CLUB.earn.news, href: '#kommunikation' },
        { key: 'birthday', ...CLUB.earn.birthday, href: '#profil' },
        { key: 'address', ...CLUB.earn.address, href: '#adresser' },
        { key: 'buy', points: null, label: 'Handla sängkläder', href: 'kollektion.html?c=alla' },
      ];
      $('earnList').innerHTML = tasks.map(x => {
        const ok = acc.done[x.key];
        const pts = x.points ? `+${x.points}` : `${t.mult.toLocaleString('sv-SE')} p/kr`;
        return `<li class="${ok ? 'is-done' : ''}">
          <span class="earn-list__check">${ok ? '✓' : ''}</span>
          <span class="earn-list__label">${x.label}</span>
          <span class="earn-list__pts">${pts}</span>
          ${ok ? '<span class="earn-list__go">Klart</span>' : x.href ? `<a href="${x.href}" class="earn-list__go">${x.key === 'buy' ? 'Shoppa' : 'Fyll i'} →</a>` : ''}
        </li>`;
      }).join('');
    }

    /* ---------- Beställningar ---------- */
    function orders() {
      $('orders').innerHTML = acc.orders.length
        ? acc.orders.map(o => `
          <div class="order">
            <div><span class="order__label">Order</span><b>#${o.id}</b></div>
            <div><span class="order__label">Datum</span>${fmtDate(o.date)}</div>
            <div><span class="order__label">Status</span>${o.status}</div>
            <div><span class="order__label">Summa</span>${o.total.toLocaleString('sv-SE')} kr</div>
          </div>`).join('')
        : `<div class="empty-box">
            <p class="empty-box__title">Inga beställningar än</p>
            <p>När du handlar ser du dina ordrar här, kan spåra paketet och starta en retur. Du får ${tier().mult.toLocaleString('sv-SE')} poäng för varje krona.</p>
            <a href="kollektion.html?c=bastsaljare" class="auth__submit auth__submit--inline">Shoppa bästsäljare</a>
          </div>`;
    }

    /* ---------- Favoriter ---------- */
    function favorites() {
      const items = SOM.favs.list().map(productById).filter(Boolean);
      $('favGrid').innerHTML = items.length
        ? `<div class="grid portal-favs__grid">${items.map(SOM.productCard).join('')}</div>`
        : `<div class="empty-box">
            <p class="empty-box__title">Inga favoriter än</p>
            <p>Tryck på hjärtat på en produktbild så sparas den här — perfekt när du vill jämföra färger.</p>
            <a href="kollektion.html?c=alla" class="auth__submit auth__submit--inline">Upptäck sängkläder</a>
          </div>`;
    }
    document.addEventListener('som:fav', () => setTimeout(() => { favorites(); overview(); }, 320));

    /* ---------- Somniore Club ---------- */
    function points() {
      const { tier: cur, total } = club.tierOf(acc);
      $('tiers').innerHTML = CLUB.tiers.map(t => `
        <div class="tier${t.key === cur.key ? ' is-current' : ''}${total >= t.min ? ' is-reached' : ''}">
          <p class="tier__name">${t.name}</p>
          <p class="tier__min">${t.min ? `Från ${t.min.toLocaleString('sv-SE')} poäng` : 'Som medlem'}</p>
          <ul>${t.perks.map(p => `<li>${p}</li>`).join('')}</ul>
          ${t.key === cur.key ? '<span class="tier__you">Din nivå</span>' : ''}
        </div>`).join('');

      $('rewards').innerHTML = CLUB.rewards.map(r => {
        const can = acc.points >= r.points;
        return `<div class="reward${can ? '' : ' is-locked'}">
          <p class="reward__value">${r.value} kr</p>
          <p class="reward__pts">${r.points.toLocaleString('sv-SE')} poäng</p>
          <button class="reward__btn" data-points="${r.points}" data-value="${r.value}" ${can ? '' : 'disabled'}>
            ${can ? 'Lös in' : `${(r.points - acc.points).toLocaleString('sv-SE')} kvar`}
          </button>
        </div>`;
      }).join('');

      const active = acc.codes.filter(c => !c.used);
      $('codesBox').innerHTML = active.length ? `
        <h2 class="portal__h2">Dina rabattkoder</h2>
        <div class="codes">${active.map(c => `
          <div class="code"><b>${c.code}</b><span>${c.value} kr rabatt · skapad ${fmtDate(c.date)}</span>
          <button data-copy="${c.code}">Kopiera</button></div>`).join('')}
        </div>` : '';

      $('history').innerHTML = acc.history.map(h => `
        <tr><td>${fmtDate(h.date)}</td><td>${esc(h.label)}</td><td class="${h.points < 0 ? 'neg' : 'pos'}">${h.points > 0 ? '+' : ''}${h.points}</td></tr>`).join('');
    }
    $('rewards').addEventListener('click', e => {
      const b = e.target.closest('.reward__btn'); if (!b) return;
      const pts = Number(b.dataset.points), value = Number(b.dataset.value);
      if (!club.spend(acc, pts, `Inlöst: ${value} kr rabatt`)) return;
      const code = 'SOM-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + value;
      acc.codes.unshift({ code, value, date: new Date().toISOString(), used: false });
      save(); refresh();
      SOM.toast(`Klart! Din kod: ${code}`);
    });
    $('codesBox').addEventListener('click', e => {
      const b = e.target.closest('[data-copy]'); if (!b) return;
      navigator.clipboard?.writeText(b.dataset.copy);
      b.textContent = 'Kopierad'; setTimeout(() => b.textContent = 'Kopiera', 1600);
    });

    /* ---------- Min säng ---------- */
    const bf = $('bedForm');
    function bed() {
      const cur = acc.bed || {};
      bf.querySelectorAll('.opt-row').forEach(row => {
        const name = row.dataset.name;
        row.innerHTML = BED_OPTS[name].map(([v, l]) =>
          `<label class="opt"><input type="radio" name="${name}" value="${v}"${(cur[name] ?? null) === v ? ' checked' : ''}><span>${l}</span></label>`).join('');
      });
    }
    bf.addEventListener('submit', e => {
      e.preventDefault();
      const val = n => bf.querySelector(`input[name="${n}"]:checked`)?.value ?? null;
      acc.bed = { bed: val('bed'), duvet: val('duvet'), pillow: val('pillow'), material: val('material') };
      save();
      flash('bedMsg', 'Sparat! Vi väljer nu dina mått automatiskt på produktsidorna.');
    });

    /* ---------- Min profil ---------- */
    const pf = $('profileForm');
    function profile() {
      const p = acc.profile || {};
      pf.name.value = p.name || acc.name || '';
      pf.last.value = p.last || '';
      pf.email.value = acc.email;
      pf.phone.value = p.phone || '';
      pf.birthday.value = p.birthday || '';
    }
    pf.addEventListener('submit', e => {
      e.preventDefault();
      Object.assign(acc.profile, { name: pf.name.value.trim(), last: pf.last.value.trim(), phone: pf.phone.value.trim(), birthday: pf.birthday.value });
      let got = 0;
      if (acc.profile.birthday && club.award(acc, CLUB.earn.birthday.points, 'Födelsedag tillagd', 'birthday')) got += CLUB.earn.birthday.points;
      save(); refresh();
      flash('profileMsg', got ? `Sparat! Du fick ${got} poäng.` : 'Sparat.');
      if (got) SOM.toast(`+${got} poäng`);
    });

    /* ---------- Adresser ---------- */
    const af = $('addressForm');
    function address() {
      const p = acc.profile || {};
      af.street.value = p.street || ''; af.co.value = p.co || ''; af.zip.value = p.zip || ''; af.city.value = p.city || '';
      $('addressCard').innerHTML = p.street ? `
        <div class="address-card">
          <p class="address-card__kicker">Leveransadress</p>
          <p>${esc([p.name, p.last].filter(Boolean).join(' ') || acc.name)}<br>${esc(p.street)}${p.co ? '<br>' + esc(p.co) : ''}<br>${esc(p.zip)} ${esc(p.city)}<br>Sverige</p>
        </div>` : '';
    }
    af.addEventListener('submit', e => {
      e.preventDefault();
      Object.assign(acc.profile, { street: af.street.value.trim(), co: af.co.value.trim(), zip: af.zip.value.trim(), city: af.city.value.trim() });
      let got = 0;
      if (acc.profile.street && acc.profile.zip && acc.profile.city && club.award(acc, CLUB.earn.address.points, 'Adress ifylld', 'address')) got += CLUB.earn.address.points;
      save(); refresh(); address();
      flash('addressMsg', got ? `Sparat! Du fick ${got} poäng.` : 'Sparat.');
      if (got) SOM.toast(`+${got} poäng`);
    });

    /* ---------- Nyhetsbrev & aviseringar ---------- */
    const nf = $('prefForm');
    function prefs() {
      const pr = acc.prefs || {};
      nf.news.checked = !!acc.profile?.news;
      nf.colors.checked = !!pr.colors; nf.restock.checked = !!pr.restock; nf.care.checked = !!pr.care;
    }
    nf.addEventListener('submit', e => {
      e.preventDefault();
      acc.profile.news = nf.news.checked;
      acc.prefs = { colors: nf.colors.checked, restock: nf.restock.checked, care: nf.care.checked };
      let got = 0;
      if (acc.profile.news && club.award(acc, CLUB.earn.news.points, 'Nyhetsbrev', 'news')) { got += CLUB.earn.news.points; SOM.subscribe(acc.email).catch(() => {}); }
      save(); refresh();
      flash('prefMsg', got ? `Sparat! Du fick ${got} poäng.` : 'Dina val är sparade.');
      if (got) SOM.toast(`+${got} poäng`);
    });

    $('logoutBtn').addEventListener('click', () => { club.logout(); location.href = 'konto.html'; });

    /* ---------- Flikar via #hash (gamla länkar #uppgifter → profil) ---------- */
    function showTab() {
      let key = (location.hash || '#oversikt').slice(1);
      if (key === 'uppgifter') key = 'profil';
      const valid = TABS.includes(key) ? key : 'oversikt';
      document.querySelectorAll('.panel').forEach(p => p.hidden = p.dataset.panel !== valid);
      document.querySelectorAll('.portal__nav a').forEach(a => a.classList.toggle('active', a.dataset.tab === valid));
      /* Mobil: scrolla fram vald flik i menyraden */
      const nav = document.querySelector('.portal__nav'), act = nav.querySelector('.active');
      if (act && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: act.offsetLeft - 16, behavior: 'smooth' });
    }
    window.addEventListener('hashchange', () => { showTab(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

    function refresh() { header(); overview(); orders(); points(); }
    acc.profile = acc.profile || {};
    refresh(); favorites(); bed(); profile(); address(); prefs(); showTab();

    const welcome = sessionStorage.getItem('somniore-welcome');
    if (welcome) {
      sessionStorage.removeItem('somniore-welcome');
      SOM.toast(welcome === 'new' ? `Välkommen! Du har fått ${CLUB.earn.signup.points} poäng.` : 'Välkommen tillbaka!');
    }
  }

  const acc = club.current();
  if (acc) {
    acc.orders = acc.orders || []; acc.codes = acc.codes || []; acc.history = acc.history || []; acc.done = acc.done || {};
    renderPortal(acc);
  } else {
    renderAuth();
  }
})();
