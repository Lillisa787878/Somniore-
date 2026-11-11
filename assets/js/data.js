/* =========================================================
   SOMNIORE — produktkatalog
   Här ändrar du produkter, färger, storlekar och priser.
   price: null visar "Pris kommer snart". Sätt t.ex. price: 1295.
   ========================================================= */

/* Färger per material. img-nycklarna används av produkterna nedan.
   stack = produktbild, pillows = örngott, bed/bed2/room = miljöbilder, detail = närbild */
const COLORS = {
  linne: {
    kritvit: { name: 'Kritvit', hex: '#F3F1EC', group: 'vit',
      img: { stack: 'p/linen-white-stack.jpg', pillows: 'p/linen-white-pillows.jpg', bed: 'linen-white-bed.jpg', bed2: 'linen-white-room.jpg', room: 'linen-white-bed2.jpg', detail: 'linen-hand.jpg' } },
    sand: { name: 'Sand', hex: '#D9CDB8', group: 'sand',
      img: { stack: 'p/linen-beige-stack.jpg', pillows: 'p/linen-beige-pillows.jpg', bed: 'linen-beige-room.jpg', bed2: 'linen-beige-window.jpg', room: 'linen-set-room.jpg', detail: 'linen-texture.jpg' } },
    mossa: { name: 'Mossa', hex: '#5C6344', group: 'gron',
      img: { stack: 'p/linen-green-stack.jpg', pillows: 'p/linen-green-pillows.jpg', bed: 'linen-green-room.jpg', bed2: 'linen-green-pillows.jpg', room: 'linen-green-bed.jpg', detail: 'linen-green-texture.jpg' } },
    midnatt: { name: 'Midnatt', hex: '#27324A', group: 'bla',
      img: { stack: 'p/linen-blue-stack.jpg', pillows: 'p/linen-blue-pillows.jpg', bed: 'linen-blue-room.jpg', bed2: 'linen-blue-window.jpg', room: 's/blue-2.jpg', detail: 'linen-blue-button.jpg' } },
  },
  percale: {
    vit: { name: 'Vit', hex: '#FAFAF8', group: 'vit',
      img: { stack: 'p/percale-white-stack.jpg', pillows: 'p/percale-white-pillows.jpg', bed: 'percale-white-bed.jpg', bed2: 'percale-white-pillows-navy.jpg', room: 'percale-white-duvet.jpg', detail: 'percale-white-texture.jpg' } },
    ljusgra: { name: 'Ljusgrå', hex: '#C9C8C4', group: 'ljusgra',
      img: { stack: 'p/percale-grey-stack.jpg', pillows: 'p/percale-grey-pillows.jpg', bed: 'percale-grey-dark-wall.jpg', bed2: 'percale-grey-headboard.jpg', room: 'percale-grey-bed.jpg', detail: 'percale-grey-close.jpg' } },
    havre: { name: 'Havre', hex: '#E6DDCC', group: 'sand',
      img: { stack: 'p/percale-beige-stack.jpg', pillows: 'percale-beige-pillow.jpg', bed: 'percale-beige-bed.jpg', bed2: 's/beige-4.jpg', room: 's/beige-5.jpg', detail: 'percale-beige-folded.jpg' } },
    salvia: { name: 'Salvia', hex: '#8A8D6E', group: 'gron',
      img: { stack: 'p/percale-green-stack.jpg', pillows: 'p/percale-green-pillows.jpg', bed: 'percale-green-bed.jpg', bed2: 'percale-green-above.jpg', room: 'percale-green-light.jpg', detail: 'percale-green-hem.jpg' } },
    fjord: { name: 'Fjord', hex: '#2E3A50', group: 'bla',
      img: { stack: 'p/percale-blue-stack.jpg', pillows: 'p/percale-blue-pillows.jpg', bed: 'percale-blue-bed.jpg', bed2: 'percale-blue-candle.jpg', room: 's/blue-3.jpg', detail: 'percale-blue-hem.jpg' } },
  },
};

/* Färggrupper för filter ("Vit" visar både Kritvit och Vit osv.) */
const COLOR_GROUPS = {
  vit: { name: 'Vit', hex: '#F4F2EE' },
  sand: { name: 'Sand', hex: '#D9CDB8' },
  ljusgra: { name: 'Ljusgrå', hex: '#C8C7C3' },
  gron: { name: 'Grön', hex: '#6E7456' },
  bla: { name: 'Blå', hex: '#27324A' },
};

const MATERIALS = {
  linne: { name: 'Linne', spec: '100 % linne · 160 gsm', short: 'Luftigt. Avslappnat.',
    care: 'Maskintvätt 40 °C med likfärgat. Torktumla på låg värme eller häng på tork. Stryk vid behov på medelvärme — eller njut av den naturliga strukturen.',
    about: 'Stentvättat europeiskt linne som andas, reglerar värmen och blir mjukare för varje tvätt.' },
  percale: { name: 'Percale', spec: '100 % kammad bomull · 300 TC', short: 'Krispigt. Svalt.',
    care: 'Maskintvätt 60 °C. Torktumla på låg värme. Stryk på hög värme för en extra krispig hotellfinish.',
    about: 'Tät enkelvävd bomull med en matt, krispig yta — känslan av en nybäddad hotellsäng.' },
};

const CATEGORIES = {
  paslakan:    { name: 'Påslakan',     plural: 'Påslakan',     card: 'stack',   hover: 'bed',    gallery: ['bed', 'stack', 'bed2', 'detail', 'room'] },
  lakan:       { name: 'Lakan',        plural: 'Lakan',        card: 'stack',   hover: 'bed2',   gallery: ['stack', 'bed2', 'detail', 'bed'] },
  drapa:       { name: 'Dra-på-lakan', plural: 'Dra-på-lakan', card: 'stack',   hover: 'detail', gallery: ['stack', 'detail', 'bed', 'bed2'] },
  orngott:     { name: 'Örngott',      plural: 'Örngott',      card: 'pillows', hover: 'bed',    gallery: ['pillows', 'bed', 'detail', 'bed2'] },
  lakanset:    { name: 'Lakanset',     plural: 'Lakanset',     card: 'stack',   hover: 'room',   gallery: ['stack', 'room', 'bed', 'pillows', 'detail'] },
  paslakanset: { name: 'Påslakanset',  plural: 'Påslakanset',  card: 'stack',   hover: 'bed',    gallery: ['bed', 'stack', 'pillows', 'bed2', 'room'] },
  baddpaket:   { name: 'Bäddpaket',    plural: 'Bäddpaket',    card: 'stack',   hover: 'room',   gallery: ['room', 'stack', 'bed', 'pillows', 'bed2', 'detail'] },
};

const SIZES = {
  paslakan: ['150×200', '150×210', '220×220', '240×220'],
  lakan: ['150×260', '240×260', '270×270'],
  drapa: ['90×200', '120×200', '140×200', '160×200', '180×200'],
  orngott: ['50×60', '50×70', '65×65'],
  lakanset: ['90×200', '140×200', '160×200', '180×200'],
  paslakanset: ['150×210', '220×220', '240×220'],
  baddpaket: ['90×200', '140×200', '160×200', '180×200'],   // sängens bredd × längd
};

/* ---------- Produkter ---------- */
const PRODUCTS = [
  { id: 'linne-paslakan', hero: 'sand', name: 'Påslakan i linne', material: 'linne', cat: 'paslakan', best: true,
    desc: 'Ett luftigt påslakan i stentvättat linne med en mjuk, levande yta. Dold knäppning nedtill håller täcket på plats.',
    details: ['Dold knäppning nedtill', 'Inre hörnband som håller täcket på plats', 'Förtvättat för minimal krympning'] },
  { id: 'linne-lakan', hero: 'mossa', name: 'Lakan i linne', material: 'linne', cat: 'lakan',
    desc: 'Ett generöst överlakan i tvättat linne — svalt om sommaren, ombonat om vintern.',
    details: ['Dubbelvikt fåll', 'Generös längd för att stoppa in', 'Förtvättat för minimal krympning'] },
  { id: 'linne-drapa', hero: 'kritvit', name: 'Dra-på-lakan i linne', material: 'linne', cat: 'drapa',
    desc: 'Dra-på-lakan i tvättat linne med djup kant och resår runt om för en slät, välbäddad säng.',
    details: ['Passar madrasser upp till 35 cm', 'Resår runt om', 'Förtvättat för minimal krympning'] },
  { id: 'linne-orngott', hero: 'mossa', name: 'Örngott i linne', material: 'linne', cat: 'orngott', isNew: true, pack: '2-pack',
    desc: 'Två örngott i stentvättat linne med innerficka som håller kudden på plats.',
    details: ['Säljs i 2-pack', 'Innerficka', 'Förtvättat för minimal krympning'] },
  { id: 'linne-lakanset', hero: 'midnatt', name: 'Lakanset i linne', material: 'linne', cat: 'lakanset', best: true, tag: 'Ny färg',
    desc: 'Allt du behöver för en välbäddad säng i tvättat linne — samlat i ett set.',
    includes: ['1 lakan', '1 dra-på-lakan', '2 örngott'],
    details: ['Samma linne och färgbad i alla delar', 'Förtvättat för minimal krympning'] },
  { id: 'linne-paslakanset', hero: 'mossa', name: 'Påslakanset i linne', material: 'linne', cat: 'paslakanset', best: true,
    desc: 'Påslakan och två örngott i tvättat linne. Den enklaste vägen till en avslappnad, nordisk säng.',
    includes: ['1 påslakan', '2 örngott'],
    details: ['Dold knäppning på påslakanet', 'Förtvättat för minimal krympning'] },

  { id: 'percale-paslakan', hero: 'fjord', name: 'Påslakan i percale', material: 'percale', cat: 'paslakan', best: true,
    desc: 'Ett krispigt, svalt påslakan i kammad bomullspercale med 300 trådars täthet.',
    details: ['Dold knäppning', 'Inre hörnband', 'Mjuknar för varje tvätt'] },
  { id: 'percale-lakan', hero: 'salvia', name: 'Lakan i percale', material: 'percale', cat: 'lakan',
    desc: 'Ett klassiskt överlakan i percale — slätt, matt och svalt mot huden.',
    details: ['Bred fåll med dekorsöm', 'Generös längd för att stoppa in'] },
  { id: 'percale-drapa', hero: 'vit', name: 'Dra-på-lakan i percale', material: 'percale', cat: 'drapa',
    desc: 'Dra-på-lakan i kammad bomullspercale som sitter slätt och stramt — natt efter natt.',
    details: ['Passar madrasser upp till 35 cm', 'Resår runt om'] },
  { id: 'percale-orngott', hero: 'vit', name: 'Örngott med oxfordkant', material: 'percale', cat: 'orngott', best: true, tag: 'Bästsäljare', pack: '2-pack',
    desc: 'Två örngott i percale med klassisk oxfordkant — en tidlös detalj från hotellbäddningens värld.',
    details: ['Säljs i 2-pack', 'Sydd oxfordkant', 'Innerficka'] },
  { id: 'percale-lakanset', hero: 'havre', name: 'Lakanset i percale', material: 'percale', cat: 'lakanset', best: true,
    desc: 'Lakan, dra-på-lakan och två örngott i krispig percale. Hotellkänsla, hemma.',
    includes: ['1 lakan', '1 dra-på-lakan', '2 örngott med oxfordkant'],
    details: ['Samma bomull och färgbad i alla delar', 'Mjuknar för varje tvätt'] },
  { id: 'percale-paslakanset', hero: 'ljusgra', name: 'Påslakanset i percale', material: 'percale', cat: 'paslakanset', isNew: true,
    desc: 'Påslakan och två örngott med oxfordkant i svalt, krispigt percale.',
    includes: ['1 påslakan', '2 örngott med oxfordkant'],
    details: ['Dold knäppning på påslakanet', 'Mjuknar för varje tvätt'] },

  /* Bäddpaket: allt till sängen i ett köp */
  { id: 'linne-baddpaket', hero: 'mossa', name: 'Bäddpaket i linne', material: 'linne', cat: 'baddpaket', best: true, tag: 'Paketpris',
    desc: 'Hela sängen i stentvättat linne — påslakan, lakan, dra-på-lakan och örngott i samma färgbad. Allt du behöver, i ett köp.',
    includes: ['1 påslakan', '1 lakan', '1 dra-på-lakan', '2 örngott'],
    details: ['Samma linne och färgbad i alla delar', 'Dold knäppning på påslakanet', 'Förtvättat för minimal krympning'] },
  { id: 'percale-baddpaket', hero: 'havre', name: 'Bäddpaket i percale', material: 'percale', cat: 'baddpaket', best: true, tag: 'Paketpris',
    desc: 'Krispig hotellsäng i ett paket — påslakan, lakan, dra-på-lakan och örngott med oxfordkant i kammad bomullspercale.',
    includes: ['1 påslakan', '1 lakan', '1 dra-på-lakan', '2 örngott med oxfordkant'],
    details: ['Samma bomull och färgbad i alla delar', 'Dold knäppning på påslakanet', 'Mjuknar för varje tvätt'] },
  { id: 'linne-baddpaket-stort', hero: 'sand', name: 'Stort bäddpaket i linne', material: 'linne', cat: 'baddpaket', tag: 'Paketpris',
    desc: 'För dubbelsängen: allt i bäddpaketet, plus två extra örngott för en generöst bäddad säng i tvättat linne.',
    includes: ['1 påslakan', '1 lakan', '1 dra-på-lakan', '4 örngott'],
    details: ['Samma linne och färgbad i alla delar', 'Dold knäppning på påslakanet', 'Förtvättat för minimal krympning'] },
  { id: 'percale-baddpaket-stort', hero: 'fjord', name: 'Stort bäddpaket i percale', material: 'percale', cat: 'baddpaket', tag: 'Paketpris',
    desc: 'För dubbelsängen: allt i bäddpaketet, plus två extra örngott med oxfordkant i svalt, krispigt percale.',
    includes: ['1 påslakan', '1 lakan', '1 dra-på-lakan', '4 örngott med oxfordkant'],
    details: ['Samma bomull och färgbad i alla delar', 'Dold knäppning på påslakanet', 'Mjuknar för varje tvätt'] },
].map(p => ({ price: null, ...p }));

/* ---------- Kollektioner (kollektion.html?c=...) ---------- */
const COLLECTIONS = {
  alla:        { title: 'Alla sängkläder', desc: 'Linne och percale i dämpade, nordiska nyanser — vävt i Portugal och formgivet för lugnare nätter.', img: 'hero-linen-beige.jpg', filter: () => true },
  bastsaljare: { title: 'Bästsäljare', desc: 'Favoriterna våra kunder återvänder till — natt efter natt.', img: 'linen-blue-room.jpg', filter: p => p.best },
  nyheter:     { title: 'Nyheter', desc: 'Det senaste från Somniore.', img: 'percale-green-light.jpg', filter: p => p.isNew || p.tag === 'Ny färg' },
  linne:       { title: 'Linne', desc: MATERIALS.linne.about, img: 'linen-beige-window.jpg', filter: p => p.material === 'linne', material: 'linne' },
  percale:     { title: 'Percale', desc: MATERIALS.percale.about, img: 'percale-white-window.jpg', filter: p => p.material === 'percale', material: 'percale' },
  paslakan:    { title: 'Påslakan', desc: 'Påslakan i tvättat linne och krispig percale.', img: 'linen-green-room.jpg', filter: p => p.cat === 'paslakan' },
  lakan:       { title: 'Lakan', desc: 'Överlakan i linne och percale med generös längd.', img: 'percale-green-folded.jpg', filter: p => p.cat === 'lakan' },
  drapa:       { title: 'Dra-på-lakan', desc: 'Djupa dra-på-lakan som sitter slätt och stramt.', img: 'percale-white-fitted.jpg', filter: p => p.cat === 'drapa' },
  orngott:     { title: 'Örngott', desc: 'Örngott i 2-pack — i linne eller percale med oxfordkant.', img: 'percale-beige-pillow.jpg', filter: p => p.cat === 'orngott' },
  lakanset:    { title: 'Lakanset', desc: 'Lakan, dra-på-lakan och örngott — samlat i ett set.', img: 'linen-set-room.jpg', filter: p => p.cat === 'lakanset' },
  bad:          { title: 'Bad', desc: 'Handdukar, badlakan och morgonrockar i samma nordiska anda — mjuka, naturliga och gjorda för att hålla. Kommer snart.', img: 'white-sheet-line.jpg', filter: () => false, soon: true },
  handdukar:    { title: 'Handdukar', desc: 'Mjuka, tunga handdukar som torkar snabbt. Kommer snart.', img: 'white-sheet-line.jpg', filter: () => false, soon: true, parent: 'bad' },
  badlakan:     { title: 'Badlakan', desc: 'Generösa badlakan att svepa in sig i. Kommer snart.', img: 'white-sheet-line.jpg', filter: () => false, soon: true, parent: 'bad' },
  morgonrockar: { title: 'Morgonrockar', desc: 'Lätta morgonrockar för långsamma morgnar. Kommer snart.', img: 'white-sheet-line.jpg', filter: () => false, soon: true, parent: 'bad' },
  badmattor:    { title: 'Badmattor', desc: 'Badmattor i naturliga material. Kommer snart.', img: 'white-sheet-line.jpg', filter: () => false, soon: true, parent: 'bad' },
  baddpaket:   { title: 'Bäddpaket', desc: 'Hela sängen i ett köp — påslakan, lakan, dra-på-lakan och örngott i samma färg och material, till paketpris.', img: 'linen-beige-bed2.jpg', filter: p => p.cat === 'baddpaket', bundle: true },
  paslakanset: { title: 'Påslakanset', desc: 'Påslakan och två örngott. Den enklaste vägen till en färdigbäddad säng.', img: 'percale-blue-candle.jpg', filter: p => p.cat === 'paslakanset' },
};

/* ---------- Hjälpfunktioner ---------- */
const IMG = path => 'assets/img/' + path;
const productById = id => PRODUCTS.find(p => p.id === id);
const colorsOf = p => COLORS[p.material];
const firstColorKey = p => p.hero || Object.keys(colorsOf(p))[0];
const formatPrice = p => p.price ? p.price.toLocaleString('sv-SE') + ' kr' : 'Pris kommer snart';
const productUrl = (p, color) => `produkt.html?p=${p.id}${color ? '&farg=' + color : ''}`;
const productImg = (p, colorKey, key) => IMG(colorsOf(p)[colorKey].img[key]);

/* ---------- Somniore Club: nivåer, förmåner och poängregler ----------
   Ändra siffrorna här så uppdateras hela sajten. */
const CLUB = {
  name: 'Somniore Club',
  perKrona: 1,                       // grundpoäng per krona
  tiers: [
    { key: 'gryning',  name: 'Gryning',  min: 0,    mult: 1,    perks: ['1 poäng per krona', '200 poäng i välkomstgåva', 'Födelsedagsöverraskning'] },
    { key: 'skymning', name: 'Skymning', min: 1000, mult: 1.25, perks: ['1,25 poäng per krona', 'Förtur till nya färger', 'Fri retur alltid'] },
    { key: 'midnatt',  name: 'Midnatt',  min: 2500, mult: 1.5,  perks: ['1,5 poäng per krona', 'Exklusiva medlemskvällar', 'Personlig sömnrådgivning'] },
  ],
  rewards: [
    { points: 500,  value: 50 },
    { points: 1000, value: 125 },
    { points: 2000, value: 300 },
  ],
  earn: {
    signup:   { points: 200, label: 'Bli medlem' },
    news:     { points: 100, label: 'Prenumerera på nyhetsbrevet' },
    birthday: { points: 100, label: 'Lägg till din födelsedag' },
    address:  { points: 50,  label: 'Fyll i din adress' },
  },
};
