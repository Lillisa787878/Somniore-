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
    if (news) club.award(acc, CLUB.earn.news.points, 'Nyhetsbrev', 'news');
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
     Inloggad vy: kundportal
     ========================================================= */
  function renderPortal(acc) {
    $('portalView').hidden = false;
    const save = () => club.save(acc);

    function header() {
      const { tier } = club.tierOf(acc);
      $('helloName').textContent = acc.profile?.name || acc.name;
      $('avatar').innerHTML = acc.picture
        ? `<img src="${esc(acc.picture)}" alt="" referrerpolicy="no-referrer">`
        : esc((acc.profile?.name || acc.name || '?').charAt(0).toUpperCase());
      $('tierBadge').textContent = `${tier.name}-medlem`;
      $('tierBadge').dataset.tier = tier.key;
      $('memberSince').textContent = `· Medlem sedan ${fmtDate(acc.created)}`;
    }

    /* ---------- Översikt ---------- */
    function overview() {
      const { tier, next, total } = club.tierOf(acc);
      const pct = next ? Math.min(100, ((total - tier.min) / (next.min - tier.min)) * 100) : 100;
      const nextReward = CLUB.rewards.find(r => r.points > acc.points);
      $('pointsCard').innerHTML = `
        <div class="points-card__main">
          <p class="points-card__kicker">${CLUB.name} · ${tier.name}</p>
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
      $('codeCount').textContent = acc.codes.filter(c => !c.used).length;
      const done = ['birthday', 'address', 'news'].filter(k => acc.done[k]).length;
      $('profileDone').textContent = `${done}/3`;

      const tasks = [
        { key: 'signup', ...CLUB.earn.signup, href: null },
        { key: 'news', ...CLUB.earn.news, href: '#uppgifter' },
        { key: 'birthday', ...CLUB.earn.birthday, href: '#uppgifter' },
        { key: 'address', ...CLUB.earn.address, href: '#uppgifter' },
        { key: 'buy', points: null, label: 'Handla sängkläder', href: 'kollektion.html?c=alla' },
      ];
      $('earnList').innerHTML = tasks.map(t => {
        const ok = acc.done[t.key];
        const pts = t.points ? `+${t.points}` : `${tier.mult.toLocaleString('sv-SE')} p/kr`;
        return `<li class="${ok ? 'is-done' : ''}">
          <span class="earn-list__check">${ok ? '✓' : ''}</span>
          <span class="earn-list__label">${t.label}</span>
          <span class="earn-list__pts">${pts}</span>
          ${ok ? '<span class="earn-list__go">Klart</span>' : t.href ? `<a href="${t.href}" class="earn-list__go">${t.key === 'buy' ? 'Shoppa' : 'Fyll i'} →</a>` : ''}
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
    const tier = () => club.tierOf(acc).tier;

    /* ---------- Poäng & förmåner ---------- */
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

    /* ---------- Mina uppgifter ---------- */
    const pf = $('profileForm');
    function profile() {
      const p = acc.profile || {};
      pf.name.value = p.name || acc.name || '';
      pf.last.value = p.last || '';
      pf.email.value = acc.email;
      pf.phone.value = p.phone || '';
      pf.birthday.value = p.birthday || '';
      pf.street.value = p.street || '';
      pf.zip.value = p.zip || '';
      pf.city.value = p.city || '';
      pf.news.checked = !!p.news;
    }
    pf.addEventListener('submit', e => {
      e.preventDefault();
      acc.profile = {
        name: pf.name.value.trim(), last: pf.last.value.trim(), phone: pf.phone.value.trim(),
        birthday: pf.birthday.value, street: pf.street.value.trim(), zip: pf.zip.value.trim(),
        city: pf.city.value.trim(), news: pf.news.checked,
      };
      let got = 0;
      if (acc.profile.birthday && club.award(acc, CLUB.earn.birthday.points, 'Födelsedag tillagd', 'birthday')) got += CLUB.earn.birthday.points;
      if (acc.profile.street && acc.profile.zip && acc.profile.city && club.award(acc, CLUB.earn.address.points, 'Adress ifylld', 'address')) got += CLUB.earn.address.points;
      if (acc.profile.news && club.award(acc, CLUB.earn.news.points, 'Nyhetsbrev', 'news')) got += CLUB.earn.news.points;
      save(); refresh();
      $('profileMsg').textContent = got ? `Sparat! Du fick ${got} poäng.` : 'Sparat.';
      if (got) SOM.toast(`+${got} poäng`);
      setTimeout(() => $('profileMsg').textContent = '', 3500);
    });

    $('logoutBtn').addEventListener('click', () => { club.logout(); location.href = 'konto.html'; });

    /* ---------- Flikar via #hash ---------- */
    function showTab() {
      const key = (location.hash || '#oversikt').slice(1);
      const valid = ['oversikt', 'bestallningar', 'poang', 'uppgifter'].includes(key) ? key : 'oversikt';
      document.querySelectorAll('.panel').forEach(p => p.hidden = p.dataset.panel !== valid);
      document.querySelectorAll('.portal__nav a').forEach(a => a.classList.toggle('active', a.dataset.tab === valid));
    }
    window.addEventListener('hashchange', () => { showTab(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

    function refresh() { header(); overview(); orders(); points(); }
    refresh(); profile(); showTab();

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
