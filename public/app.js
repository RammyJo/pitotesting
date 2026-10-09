const state = {
  catalog: [],
  sizes: [], regionZone: {}, rates: {},
  cart: [], filter: 'all', query: '', sort: 'featured', favoritesOnly: false,
  activeProductId: null, checkoutCourier: 'JNT', lastFocus: null, submitting: false,
  route: null,
  member: null,
  memberMessage: '',
  vipMode: 'register',
  renderedHash: location.hash || '#/',
  gallerySlide: 0,
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const money = value => `₱${Math.round(Number(value) || 0).toLocaleString('en-PH')}`;
const productById = id => state.catalog.find(product => product.id === id) || null;
const sizeById = id => state.sizes.find(size => size.id === String(id)) || null;
const PRODUCT_DETAILS = {
  omega:{mood:'Decisive', bestFor:'Evening plans, formal settings, and moments that call for confidence.', profile:'A bold, composed profile with a polished finish. Its character is direct and assured, designed to feel noticeable without becoming overwhelming.', story:'OMEGA is imagined for someone who values clarity, confidence, and a strong first impression. It suits moments when you want your presence to feel intentional from the beginning to the end of the day.', notes:['Clean','Deep','Confident']},
  boaz:{mood:'Commanding', bestFor:'Important meetings, evenings out, and dressed-up occasions.', profile:'A stronger, darker character built around presence and quiet confidence. The overall impression is structured and polished, with a confident edge that feels suited to deliberate occasions.', story:'BOAZ is positioned as a signature for someone who enters a room with calm authority. Its concept balances strength with control, making it a natural fit for nights out and moments that call for a more dressed-up feel.', notes:['Structured','Warm','Polished']},
  alpha:{mood:'Confident', bestFor:'Date nights, evenings, and signature everyday wear.', profile:'Warm and refined, created for the person who wants to be remembered after they leave the room. Cardamom, vanilla, and amberwood form the current concept profile, giving the description a smooth, welcoming direction.', story:'ALPHA is imagined as a dependable signature: confident enough for an evening out, but refined enough to wear when you simply want to feel put together. Its story is warm, personal, and designed to leave a memorable impression.', notes:['Cardamom','Vanilla','Amberwood']},
  'exodus-noir':{mood:'Magnetic', bestFor:'Date nights, dinners, and after-dark occasions.', profile:'A darker interpretation with pear, lavender, cinnamon, vanilla, and amber in the current concept profile. The contrast between fruity, aromatic, spicy, and warm impressions gives it a rich, evening-oriented character.', story:'EXODUS NOIR is made for the mood of an evening that stretches beyond the ordinary. Its concept is expressive and magnetic, with a darker feel suited to dinners, dressed-up plans, and moments you want people to remember.', notes:['Pear','Lavender','Cinnamon','Vanilla','Amber']},
  pacific:{mood:'Effortless', bestFor:'Daily wear, daytime plans, travel, and warm weather.', profile:'Fresh and clean with an easygoing character that never feels overworked. Its concept leans bright, airy, and uncomplicated, designed for days when you want fragrance to feel natural rather than formal.', story:'PACIFIC takes its inspiration from open space and a clear start. It is positioned as an easy reach for everyday routines, warm-weather plans, travel, and casual moments when a lighter presence feels right.', notes:['Fresh','Clean','Airy']},
  invincible:{mood:'Powerful', bestFor:'Events, celebrations, and any day you want stronger presence.', profile:'Built around confidence and momentum, with a bold, warm impression. The concept is intended to feel assertive and memorable without needing a complicated description.', story:'INVINCIBLE is for the days when you want to show up with extra confidence. Its positioning is energetic and self-assured, suited to celebrations, events, and occasions when you want your fragrance to be part of your presence.', notes:['Bold','Warm','Long-Wearing']},
  caelum:{mood:'Elevated', bestFor:'Work, formal occasions, and understated daily wear.', profile:'Crisp and composed with a clean, elevated character. Its concept favors restraint and polish over intensity, making it easy to imagine in professional and formal settings.', story:'CAELUM is designed around quiet refinement. It suits someone who prefers a neat, considered impression at work, at an event, or during everyday plans without making fragrance the loudest part of the room.', notes:['Crisp','Clean','Refined']},
  gourmand:{mood:'Indulgent', bestFor:'Evenings, social occasions, and cozy moments.', profile:'Sweet, rich, and inviting with a comforting personality. The concept is rounded and cozy, designed to feel warm and expressive rather than sharp or distant.', story:'GOURMAND is positioned for people who enjoy an inviting, comforting scent story. It fits social evenings, relaxed celebrations, and little moments when you want your fragrance to feel warm and memorable.', notes:['Sweet','Rich','Creamy']},
  solace:{mood:'Serene', bestFor:'Quiet evenings, self-care moments, and elegant everyday wear.', profile:'Soft and graceful, designed to feel effortlessly refined. Its concept is calm and smooth, favoring a gentle presence over an attention-seeking one.', story:'SOLACE draws on the feeling of slowing down and making space for yourself. It is positioned for quiet evenings, self-care routines, and everyday occasions where understated elegance feels most natural.', notes:['Soft','Elegant','Smooth']},
  hadar:{mood:'Radiant', bestFor:'Daytime occasions, celebrations, and polished everyday wear.', profile:'Bright and elegant with a lively, memorable lift. Its concept is cheerful and polished, built around an impression that feels open and optimistic.', story:'HADAR is imagined for bright days and occasions worth celebrating. Its positioning is polished but approachable, offering a sense of freshness for daytime plans and moments when you want to feel especially put together.', notes:['Bright','Elegant','Clean']},
  darling:{mood:'Playful', bestFor:'Dates, casual outings, and warm social occasions.', profile:'Warm and charming with a lighter, more playful attitude. The concept feels friendly and expressive, designed to leave a positive impression without feeling too serious.', story:'DARLING is built around charm and spontaneity. It suits casual outings, dates, and social moments when you want your fragrance to feel approachable, playful, and easy to remember.', notes:['Warm','Playful','Charming']},
  asmira:{mood:'Refined', bestFor:'Formal days, dinners, and occasions that call for grace.', profile:'Smooth and feminine with a polished, understated presence. Its concept prioritizes balance and grace, keeping the impression elegant rather than overpowering.', story:'ASMIRA is positioned for moments when you want to feel graceful and composed. It is an easy fit for formal plans, dinners, and everyday occasions where subtle polish feels more meaningful than excess.', notes:['Smooth','Feminine','Refined']},
  elan:{mood:'Sophisticated', bestFor:'Work, brunch, travel, and refined everyday wear.', profile:'Clean sophistication with an effortless sense of composure. Its concept is airy and balanced, made to feel versatile across casual, professional, and dressed-up plans.', story:'ELAN represents an understated, modern kind of confidence. It suits workdays, brunch, travel, and daily routines when you want a refined signature that works with your style rather than competing with it.', notes:['Clean','Elegant','Airy']}
};
function productDetails(id){ return PRODUCT_DETAILS[id] || {mood:'Signature',bestFor:'Everyday wear and special occasions.',profile:'A Seven Perfume signature waiting to become part of your story.',notes:[]}; }
function loadCartSafely() {
  try {
    const raw = JSON.parse(localStorage.getItem('seven-cart') || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.filter(item => item && typeof item.productId === 'string' && typeof item.sizeId === 'string' && Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0)
      .map(item => ({ productId: item.productId, sizeId: item.sizeId, quantity: Math.min(99, Math.max(1, Number(item.quantity))) }));
  } catch { return []; }
}
function normalizeCartAfterCatalogLoad() {
  state.cart = loadCartSafely().filter(item => productById(item.productId) && sizeById(item.sizeId));
  try { localStorage.setItem('seven-cart', JSON.stringify(state.cart)); } catch {}
}
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[ch]));

function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(window.__sevenToast);
  window.__sevenToast = setTimeout(() => node.classList.remove('show'), 1600);
}
function favorites() { try { return JSON.parse(localStorage.getItem('seven-favorites') || '[]'); } catch { return []; } }
function saveFavorites(value) { try { localStorage.setItem('seven-favorites', JSON.stringify(value)); } catch {} }
function shortName(name) { return name.split(' ')[0]; }
function bottle(productId, scale = 1) {
  const index = Math.max(0, state.catalog.findIndex(p => p.id === productId));
  const product = productById(productId) || state.catalog[0];
  const name = product ? shortName(product.name) : 'SEVEN';
  return `<div class="bottle tone-${index % 13}" style="--bscale:${scale}"><div class="cap"></div><div class="label"><span>SEVEN PERFUME</span><b>${escapeHtml(name)}</b><em>EAU DE PARFUM</em></div></div>`;
}
function sizeSelect(productId, className = '') {
  return `<label class="cardSizeLabel">SIZE<select class="sizeSelect ${className}" data-size-select="${escapeHtml(productId)}">${state.sizes.map(size => `<option value="${size.id}" ${size.id === '30' ? 'selected' : ''}>${size.label} · ${money(size.price)}</option>`).join('')}</select></label>`;
}
function renderCard(id, compact = false) {
  const p = productById(id), loved = favorites().includes(id);
  return `<article class="card ${compact ? 'compactCard' : ''}" data-product-id="${escapeHtml(id)}">
    <button class="cardVisualButton" type="button" data-action="gallery" data-product-id="${escapeHtml(id)}" aria-label="Open ${escapeHtml(p.name)} image preview">
      <div class="visual">${bottle(id)}<span class="badge">${escapeHtml(p.gender)}</span><span class="visualHint">VIEW PHOTOS +</span></div>
    </button>
    <div class="info">
      <div class="cardTop"><div class="cardHeading"><div class="cardNameText">${escapeHtml(p.name)}</div><div class="desc">${escapeHtml(p.description)}</div></div><button class="heart ${loved ? 'loved' : ''}" type="button" data-action="favorite" aria-label="${loved ? 'Remove' : 'Save'} ${escapeHtml(p.name)}" aria-pressed="${loved}">${loved ? '♥' : '♡'}</button></div>
      ${sizeSelect(id)}
      <div class="meta"><span class="price" data-card-price="${escapeHtml(id)}">${money(state.sizes[1]?.price || 350)}</span><span class="stock">In stock</span></div>
      <div class="actions"><button class="dark viewDetailsBtn" type="button" data-route="product" data-route-id="${escapeHtml(id)}" aria-label="View full details for ${escapeHtml(p.name)}">VIEW DETAILS →</button><button class="gold" type="button" data-action="add">ADD TO CART</button></div>
    </div>
  </article>`;
}
function renderShopGrid() {
  const query = state.query;
  let ids = state.catalog.map(p => p.id).filter(id => {
    const p = productById(id);
    return (state.filter === 'all' || p.gender === state.filter) &&
      (!query || p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)) &&
      (!state.favoritesOnly || favorites().includes(p.id));
  });
  if (state.sort === 'az') ids.sort((a,b) => productById(a).name.localeCompare(productById(b).name));
  if (state.sort === 'za') ids.sort((a,b) => productById(b).name.localeCompare(productById(a).name));
  $('#shopGrid').innerHTML = ids.length ? ids.map(id => renderCard(id)).join('') : '<div class="empty-cart pageEmpty">No fragrances found.</div>';
  $('#favCount').textContent = favorites().length;
  const searchInput=$('#search'); if(searchInput && searchInput.value!==state.query)searchInput.value=state.query;
  $$('.filter').forEach(button=>button.classList.toggle('active',button.dataset.g===state.filter));
  $('#shopFavOnly')?.classList.toggle('active',state.favoritesOnly);
}
function productPage(id) {
  const p = productById(id);
  if (!p) return notFoundPage();
  const d = productDetails(id);
  const notes = d.notes.map(tag => `<span>${escapeHtml(tag)}</span>`).join('');
  return `<section class="page productPage">
    <div class="pageIntro compactIntro"><button class="backLink" type="button" data-route-back>← BACK TO SHOP</button><small>SEVEN PERFUME / FRAGRANCE PROFILE</small></div>
    <div class="productDetail">
      <div class="productHeroVisual"><button class="productGalleryTrigger" type="button" data-action="gallery" data-product-id="${escapeHtml(id)}" aria-label="Open ${escapeHtml(p.name)} photo preview">${bottle(id,1.55)}<span class="productGalleryHint">OPEN GALLERY +</span></button><div class="verticalNote">${escapeHtml(p.gender)} / ${escapeHtml(p.name)}</div></div>
      <div class="productCopy">
        <small>MEET YOUR NEXT SIGNATURE</small><div class="productKicker">${escapeHtml(d.mood)} · ${escapeHtml(p.gender)}</div><h1>${escapeHtml(p.name)}</h1>
        <p class="productLead">${escapeHtml(d.profile)}</p>
        <div class="tagRow" aria-label="Scent character">${notes}</div>
        <div class="detailRule"></div>
        <div class="productBuy"><div class="detailPrice" id="detailPrice">${money(state.sizes[1]?.price || 350)}</div>${sizeSelect(id,'detailSize')}<button class="gold detailAdd" type="button" data-detail-add="${escapeHtml(id)}">ADD TO CART</button><button class="dark detailBuy" type="button" data-detail-buy="${escapeHtml(id)}">BUY NOW</button></div>
        <div class="detailInfo"><div><small>THE MOOD</small><p>${escapeHtml(d.mood)}</p></div><div><small>BEST FOR</small><p>${escapeHtml(d.bestFor)}</p></div></div>
      </div>
    </div>
    <div class="productStory"><div><small>THE SCENT PROFILE</small><h2>${escapeHtml(p.name)}<br>IN DETAIL.</h2></div><div class="productDescription">
      <section><small>THE CHARACTER</small><p>${escapeHtml(d.story || d.profile)}</p></section>
      <section><small>THE PROFILE</small><p>${escapeHtml(d.profile)}</p></section>
      <section><small>WHEN TO WEAR IT</small><p>${escapeHtml(d.bestFor)}</p></section>
      <section><small>THE IMPRESSION</small><p>${escapeHtml(p.description)}</p></section>
      <button class="textLink" type="button" data-route="shop">EXPLORE MORE FRAGRANCES →</button>
    </div></div>
    ${footerHtml()}
  </section>`;
}

function homePage() {
  const featured = ['alpha','exodus-noir','pacific'].filter(id => productById(id));
  return `<section class="page homePage">
    <section class="hero"><div class="orb o1"></div><div class="orb o2"></div><div class="heroIn"><small>LASTS LIKE MEMORIES.</small><h1>FIND THE<br><i>SCENT</i><br>THAT FEELS<br>LIKE YOU.</h1><p>Browse the collection, discover your match, and buy in moments.</p><button class="gold heroCta" type="button" data-route="shop">SHOP THE COLLECTION <span>→</span></button></div><div class="heroAside">SEVEN / FRAGRANCE HOUSE</div></section>
    <div class="ticker">13 FRAGRANCES · 10mL · 30mL · 50mL · NATIONWIDE DELIVERY · 13 FRAGRANCES · 10mL · 30mL · 50mL · NATIONWIDE DELIVERY · </div>
    <section class="homeFeature section"><div class="splitIntro"><div><small>THE COLLECTION</small><h2>A FEW<br>WAYS TO<br>MEET SEVEN.</h2></div><div><p>Three signatures to start with. The full collection is one click away.</p><button class="textLink" type="button" data-route="shop">VIEW ALL FRAGRANCES →</button></div></div><div class="grid featuredGrid">${featured.map(id => renderCard(id,true)).join('')}</div></section>
    <section class="statement"><div><small>THE SEVEN SCENT FINDER</small><h2>DON'T GUESS.<br>DISCOVER.</h2></div><div><p>Tell us how you want to feel, when you will wear it, and what you want your fragrance to say.</p><button class="dark largeGhost" type="button" data-route="finder">FIND YOUR SCENT →</button></div></section>
    <section class="homeAbout section"><div><small>SEVEN PERFUME</small><h2>YOUR SCENT.<br>YOUR STORY.</h2></div><div><p>Fragrance should feel personal. Seven is built around a simple idea: the bottle is only the beginning. The scent becomes part of how people remember you.</p><button class="textLink" type="button" data-route="about">READ OUR STORY →</button></div></section>
    ${footerHtml()}
  </section>`;
}
function shopPage() {
  return `<section class="page shopPage"><div class="pageIntro"><div><small>THE COLLECTION</small><h1>SHOP THE<br>FRAGRANCES.</h1><p>Choose a size, search, filter, sort, favorite, quick-view, and add directly to your cart.</p></div><button id="shopFavOnly" class="dark" type="button">Favorites <b id="favCount">0</b></button></div><div class="toolbar"><label class="srOnly" for="search">Search fragrance</label><input id="search" autocomplete="off" placeholder="Search fragrance…" value="${escapeHtml(state.query)}"><div role="group" aria-label="Filter by collection"><button type="button" class="filter active" data-g="all">All</button><button type="button" class="filter" data-g="men">Men</button><button type="button" class="filter" data-g="women">Women</button></div><label class="srOnly" for="sort">Sort fragrances</label><select id="sort"><option value="featured">Featured</option><option value="az">A–Z</option><option value="za">Z–A</option></select></div><div class="grid" id="shopGrid" aria-live="polite"></div>${footerHtml()}</section>`;
}
function finderPage() {
  return `<section class="page finderPage"><div class="pageIntro"><div><small>THE SEVEN SCENT FINDER</small><h1>THREE QUESTIONS.<br>ONE MATCH.</h1><p>Pick a mood and occasion. We will recommend a bottle and let you choose the size.</p></div></div><div class="finder finderPageCard"><div class="fleft"><small>YOUR VIBE</small><h2>LET'S<br>FIND IT.</h2><p>There is no wrong answer. Choose the option that feels most like you.</p><button class="textLink" type="button" data-route="shop">SKIP TO SHOP →</button></div><div class="fright"><small id="qstep">STEP 1 / 3</small><h3 id="qtitle"></h3><div id="answers"></div><div id="recommend"></div></div></div>${footerHtml()}</section>`;
}
function aboutPage() {
  return `<section class="page aboutPage"><div class="pageIntro"><div><small>SEVEN PERFUME / OUR STORY</small><h1>YOUR SCENT.<br>YOUR STORY.</h1><p>Seven began with a simple idea: fragrance should feel personal, memorable, and easy to choose.</p></div></div><div class="aboutStory"><div class="storyBig"><span>01</span><h2>A SMALL IDEA.<br>A LASTING<br>MEMORY.</h2></div><div class="storyCopy"><p>Seven Perfume started as a simple conversation about why people remember certain moments through scent. A first date. A late-night drive. A suit worn for the first important meeting. The details change, but the feeling stays.</p><p>The brand was imagined around that idea: create fragrances that can become part of those memories without asking the wearer to overthink them.</p><p>The result is a collection built around personality and mood. Clean when you want clean. Warm when you want warmth. Dark when the night calls for it.</p></div></div><div class="storyTimeline"><div><small>THE BEGINNING</small><h3>START WITH<br>THE FEELING.</h3><p>Before the bottle, before the name, there is the mood. Seven starts there.</p></div><div><small>THE COLLECTION</small><h3>THIRTEEN<br>WAYS TO BE YOU.</h3><p>Different personalities deserve different signatures. The collection is designed to make that choice easier.</p></div><div><small>THE PROMISE</small><h3>LASTS LIKE<br>MEMORIES.</h3><p>A scent should not disappear into the background. It should become part of how the moment is remembered.</p></div></div><div class="aboutGrid"><div><small>THE COLLECTION</small><strong>13 FRAGRANCES</strong><p>Different moods, personalities, and occasions.</p></div><div><small>SIZE OPTIONS</small><strong>10 / 30 / 50mL</strong><p>Choose the size that fits the moment.</p></div><div><small>DELIVERY</small><strong>NATIONWIDE</strong><p>Test courier options through J&amp;T and LBC.</p></div></div>${footerHtml()}</section>`;
}

function tierForSpend(spend){
  if(spend>=20000)return {name:'Diamond',threshold:20000,next:null,previous:10000,benefits:['Highest tier of member offers','Limited-edition access','VIP launch access']};
  if(spend>=10000)return {name:'Platinum',threshold:10000,next:20000,previous:5000,benefits:['Priority access to new fragrances','Platinum-only offers','Exclusive member bundles']};
  if(spend>=5000)return {name:'Gold',threshold:5000,next:10000,previous:1500,benefits:['Gold-exclusive deals','Better member offers','Exclusive fragrance bundles']};
  if(spend>=1500)return {name:'Silver',threshold:1500,next:5000,previous:0,benefits:['Silver-only deals','Early access to selected promotions','Member-only offers']};
  return {name:'Not yet a member',threshold:0,next:1500,previous:0,benefits:['Register and shop while signed in to earn membership progress.']};
}
function vipPage(){
  const member=state.member;
  if(!member){
    return `<section class="page vipPage"><div class="pageIntro vipIntro"><div><small>SEVEN PRIVÉ / MEMBER CLUB</small><h1>GOOD SCENTS.<br>GREATER<br>PRIVILEGES.</h1><p>Register before you shop to collect qualifying purchases, unlock member-only offers, and progress through four levels of Seven Privé.</p></div><div class="vipIntroSeal"><span>SEVEN</span><b>PRIVÉ</b><small>MEMBER CLUB</small></div></div>
      <div class="vipLayout"><div class="vipBenefits"><small>THE MEMBERSHIP LADDER</small><h2>YOUR NEXT<br>LEVEL AWAITS.</h2><p>Qualifying spend is counted over a rolling 12-month period. Orders must be paid and not cancelled or refunded. Guest purchases do not count.</p><div class="tierGrid">
        <article class="tierCard tierSilver"><span class="tierEyebrow">LEVEL 01</span><div class="tierIcon">S</div><h3>Silver</h3><b>₱1,500</b><p>Member-only deals and early access to selected promotions.</p></article>
        <article class="tierCard tierGold"><span class="tierEyebrow">LEVEL 02</span><div class="tierIcon">G</div><h3>Gold</h3><b>₱5,000</b><p>Gold offers, exclusive bundles, and better member deals.</p></article>
        <article class="tierCard tierPlatinum"><span class="tierEyebrow">LEVEL 03</span><div class="tierIcon">P</div><h3>Platinum</h3><b>₱10,000</b><p>Priority fragrance access and Platinum-only promotions.</p></article>
        <article class="tierCard tierDiamond"><span class="tierEyebrow">LEVEL 04</span><div class="tierIcon">D</div><h3>Diamond</h3><b>₱20,000</b><p>Top-tier offers, limited-edition access, and VIP launches.</p></article>
      </div><p class="vipFinePrint">Thresholds and member benefits are proposed for the V9 demo and can be tuned before launch. Discount percentages will be set after product margins are confirmed.</p></div>
      <div class="accountPanel"><div class="accountPanelHead"><small>YOUR SEVEN ACCOUNT</small><h2>${state.vipMode==='login'?'WELCOME BACK.':'BECOME A MEMBER.'}</h2><p>${state.vipMode==='login'?'Sign in to view your current tier and progress.':'Create an account before purchasing so eligible orders can count toward membership.'}</p></div>
        <div class="accountSwitch"><button type="button" data-vip-mode="register" class="${state.vipMode==='register'?'selected':''}">Create account</button><button type="button" data-vip-mode="login" class="${state.vipMode==='login'?'selected':''}">Sign in</button></div>
        <form id="vipForm" class="vipForm" autocomplete="on">
          ${state.vipMode==='register'?'<label>FULL NAME<input name="name" autocomplete="name" maxlength="100" required placeholder="Your name"></label>':''}
          <label>EMAIL ADDRESS<input name="email" type="email" autocomplete="email" maxlength="160" required placeholder="you@example.com"></label>
          <label>PASSWORD<input name="password" type="password" autocomplete="${state.vipMode==='login'?'current-password':'new-password'}" minlength="10" required placeholder="At least 10 characters"></label>
          ${state.vipMode==='register'?'<p class="formHint">Use at least 10 characters. Keep your password private.</p>':''}
          <button class="gold full" type="submit">${state.vipMode==='login'?'SIGN IN →':'CREATE MY ACCOUNT →'}</button>
          <p id="vipMessage" class="formMessage" role="status" aria-live="polite">${escapeHtml(state.memberMessage||'')}</p>
          <p class="formHint">Your account and member progress require the store's secure account database to be enabled. This demo will show a clear message if that service is not connected yet.</p>
        </form>
      </div></div>${footerHtml()}</section>`;
  }
  const spend=Number(member.qualifyingSpend)||0;
  const tier=tierForSpend(spend);
  const next=tier.next;
  const progress=next===null?100:Math.max(0,Math.min(100,spend/(next||1500)*100));
  const remaining=next===null?0:Math.max(0,next-spend);
  return `<section class="page vipPage"><div class="pageIntro vipIntro"><div><small>SEVEN PRIVÉ / YOUR MEMBERSHIP</small><h1>WELCOME,<br>${escapeHtml((member.name||'MEMBER').split(/\s+/)[0]).toUpperCase()}.</h1><p>Your purchases. Your progress. Your privileges.</p></div><div class="vipIntroSeal"><span>SEVEN</span><b>PRIVÉ</b><small>MEMBER CLUB</small></div></div>
    <div class="memberDashboard"><div class="memberHello"><small>YOUR CURRENT TIER</small><div class="memberTierLine"><span class="memberTierBadge tier${tier.name.replace(/[^A-Za-z]/g,'')}">${tier.name==='Not yet a member'?'MEMBER':tier.name.toUpperCase()}</span><span class="memberSince">Signed in as ${escapeHtml(member.email)}</span></div><h2>${tier.name==='Not yet a member'?'YOUR JOURNEY STARTS HERE.':`YOU'RE ${tier.name.toUpperCase()}.`}</h2><p>${next===null?'You have reached the highest membership tier.':`Spend ${money(remaining)} more in your rolling 12-month period to reach ${tier.name==='Not yet a member'?'Silver':tier.name==='Silver'?'Gold':tier.name==='Gold'?'Platinum':'Diamond'}.`}</p>
      <div class="vipProgress"><div class="vipProgressMeta"><span>QUALIFYING SPEND · LAST 12 MONTHS</span><b>${money(spend)}${next===null?' · MAX TIER':''}</b></div><div class="vipTrack"><span style="width:${progress}%"></span></div><div class="vipProgressMeta vipEnds"><span>${tier.name==='Not yet a member'?'START AT ₱1,500':`CURRENT: ${tier.name.toUpperCase()}`}</span><span>${next===null?'DIAMOND UNLOCKED':`NEXT: ${money(next)}`}</span></div></div>
    </div><aside class="memberPerks"><small>YOUR MEMBER PRIVILEGES</small><h3>GOOD THINGS<br>COME CLOSER.</h3><ul>${tier.benefits.map(b=>`<li>${escapeHtml(b)}</li>`).join('')}</ul><p>Specific discount values and offer availability are managed by Seven Perfume and will appear here once configured.</p><button class="gold full" type="button" data-route="shop">SHOP THE COLLECTION →</button><button class="textLink" id="vipLogout" type="button">SIGN OUT</button></aside></div>
    <section class="memberRules"><small>HOW YOUR TIER WORKS</small><h2>EVERY 12 MONTHS.<br>A FRESH MEASURE.</h2><p>Membership uses a rolling 12-month window, not a January reset. Only paid, qualifying orders tied to this signed-in account count. Cancelled and refunded orders are excluded. Purchases made as a guest do not count.</p></section>${footerHtml()}</section>`;
}

function checkoutPage() {
  return `<section class="page checkoutPage"><div class="pageIntro"><div><small>SEVEN PERFUME / CHECKOUT</small><h1>MAKE IT<br>YOURS.</h1><p>Enter your details, choose your courier, and review your order before placing it.</p>${state.member?`<div class="vipCheckoutHint"><b>SEVEN PRIVÉ MEMBER</b><span>Use ${escapeHtml(state.member.email)} as the checkout email for this order to count toward your rolling 12-month VIP spend.</span></div>`:`<div class="vipCheckoutHint"><b>WANT VIP PROGRESS?</b><span>Register and sign in before checkout. Guest purchases do not count toward membership.</span><button class="textLink" type="button" data-route="vip">CREATE AN ACCOUNT →</button></div>`}</div></div><div class="checkoutPageGrid"><div class="checkoutPane"><label>FULL NAME<input id="name" autocomplete="name" required></label><label>EMAIL<input id="email" type="email" autocomplete="email" required></label><label>PHONE<input id="phone" inputmode="tel" autocomplete="tel" required></label><div class="formGrid"><label>REGION<select id="region" autocomplete="address-level1" required><option value="">Select region…</option><option>National Capital Region</option><option>Cordillera Administrative Region</option><option>Ilocos Region</option><option>Cagayan Valley</option><option>Central Luzon</option><option>CALABARZON</option><option>MIMAROPA</option><option>Bicol Region</option><option>Western Visayas</option><option>Central Visayas</option><option>Eastern Visayas</option><option>Zamboanga Peninsula</option><option>Northern Mindanao</option><option>Davao Region</option><option>SOCCSKSARGEN</option><option>Caraga</option><option>Bangsamoro Autonomous Region in Muslim Mindanao</option></select></label><label>PROVINCE<input id="province" autocomplete="address-level1" placeholder="e.g. La Union" required></label></div><div class="formGrid"><label>CITY / MUNICIPALITY<input id="city" autocomplete="address-level2" required></label><label>BARANGAY<input id="barangay" autocomplete="address-line2" required></label></div><label>HOUSE NO. / STREET<input id="address" autocomplete="street-address" required></label><label>ZIP CODE<input id="zipCode" inputmode="numeric" autocomplete="postal-code" maxlength="4" pattern="[0-9]{4}" required></label><div class="shippingBox"><div class="shipHead"><span>DELIVERY</span><small>TEST RATES · NATIONWIDE</small></div><div id="shippingOptions"><div class="shippingHint">Select your region to calculate shipping.</div></div><div class="shippingMeta">Package weight: <b id="shipWeight">0.10 kg</b></div></div><p class="test">TEST MODE: shipping prices are assumed development rates only. No courier API is connected yet. Payment is simulated locally.</p></div><aside class="checkoutSummary"><small>ORDER SUMMARY</small><div id="summary" class="summary"></div><div class="totals"><div><span>Subtotal</span><b id="sumSubtotal">₱0</b></div><div><span>Shipping</span><b id="shipTotal">₱0</b></div><div class="grand"><span>Total</span><b id="payTotal">₱0</b></div></div><button class="gold full" id="place" type="button">PLACE TEST ORDER</button></aside></div></section>`;
}
function notFoundPage(){ return `<section class="page simplePage"><small>SEVEN PERFUME</small><h1>PAGE NOT FOUND.</h1><button class="gold" type="button" data-route="home">BACK HOME →</button></section>`; }
function footerHtml(){ return `<footer class="footer"><div class="footerBrand"><strong>SEVEN PERFUME</strong><span>LASTS LIKE MEMORIES.</span></div><nav aria-label="Footer navigation"><button type="button" data-route="shop">Shop</button><button type="button" data-route="finder">Find Your Scent</button><button type="button" data-route="about">Our Story</button><button type="button" data-route="vip">Seven Privé</button></nav><aside class="footerSocial" aria-label="Follow Seven Perfume"><a class="socialLink instagram" href="https://www.instagram.com/seven_philippines/" target="_blank" rel="noopener noreferrer" aria-label="Open Seven Perfume on Instagram" title="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle class="socialDot" cx="17.5" cy="6.7" r="1"/></svg></a><a class="socialLink facebook" href="https://www.facebook.com/sevenbyexodusera" target="_blank" rel="noopener noreferrer" aria-label="Open Seven Perfume on Facebook" title="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.1 21v-8h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.5 1.6-1.5h1.7V3.3c-.3 0-1.4-.1-2.5-.1-2.6 0-4.3 1.6-4.3 4.4v2.2H7.8V13h2.8v8h3.5Z"/></svg></a></aside></footer>`; }

function renderRoute(route, {initial=false}={}) {
  const view = $('#routeView');
  if (!view) return;
  let html;
  if (route.name === 'home') html = homePage();
  else if (route.name === 'shop') html = shopPage();
  else if (route.name === 'finder') html = finderPage();
  else if (route.name === 'about') html = aboutPage();
  else if (route.name === 'vip') html = vipPage();
  else if (route.name === 'checkout') html = checkoutPage();
  else if (route.name === 'product') html = productPage(route.id);
  else if (route.name === 'order-confirmation') html = orderConfirmationPage(route.id);
  else html = notFoundPage();

  // Swap the destination immediately. Delaying the DOM update while fading the
  // old page made View Details feel like a scroll-to-top instead of navigation.
  view.classList.remove('isLeaving', 'isEntering');
  view.innerHTML = html;
  view.dataset.route = route.name;
  state.route = route;
  updateNavState(route);
  bindRoute(route);
  if (route.name === 'shop') renderShopGrid();
  if (route.name === 'finder') renderQuiz();
  if (route.name === 'checkout') { renderSummary(); renderShippingOptions(); updateCheckoutTotals(); }
  window.scrollTo({top:0, behavior:'auto'});
  if (!initial) {
    view.classList.add('isEntering');
    setTimeout(() => view.classList.remove('isEntering'), 420);
  }
}
function parseRoute(){
  const raw = location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
  if (!raw || raw === 'home') return {name:'home'};
  const parts = raw.split('/');
  if (parts[0] === 'product' && parts[1]) return {name:'product',id:parts[1]};
  if (['shop','finder','about','checkout','vip'].includes(parts[0])) return {name:parts[0]};
  if (parts[0] === 'order-confirmation' && parts[1]) return {name:'order-confirmation',id:parts[1]};
  return {name:'notfound'};
}
function navigate(name,id){
  closeCart({restoreFocus:false});
  closeModal({restoreFocus:false});
  closeMobileMenu();
  const target = id ? `#/${name}/${encodeURIComponent(id)}` : `#/${name}`;
  const current = location.hash || '#/';
  // Push the route and render it ourselves. This avoids relying on a late
  // hashchange event, which made some CTA clicks appear to do nothing.
  if (current !== target) history.pushState({sevenPerfumeRoute:true}, '', target);
  else if (state.route?.name === name && state.route?.id === id) return;
  state.renderedHash = target;
  renderRoute(parseRoute());
}
function syncRouteFromHistory(){
  const current = location.hash || '#/';
  if (current === state.renderedHash) return;
  state.renderedHash = current;
  renderRoute(parseRoute());
}
function updateNavState(route){
  $$('[data-route]').forEach(link => {
    const target = link.dataset.route;
    const active = target === route.name || (route.name === 'product' && target === 'shop');
    link.classList.toggle('activeNav', active);
  });
}
async function apiPost(path,payload={}){
  const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},credentials:'same-origin',body:JSON.stringify(payload)});
  const data=await response.json().catch(()=>({error:'Unexpected server response.'}));
  if(!response.ok)throw new Error(data.error||'Request failed.');
  return data;
}
async function loadMember({silent=false}={}){
  try{
    const response=await fetch('/api/account/me',{headers:{Accept:'application/json'},credentials:'same-origin',cache:'no-store'});
    const data=await response.json().catch(()=>({}));
    if(response.ok&&data.account){state.member=data.account;state.memberMessage='';return state.member;}
    state.member=null;
    if(!silent && response.status!==401)state.memberMessage=data.error||'Member account service is not available yet.';
  }catch(error){state.member=null;if(!silent)state.memberMessage='Unable to reach the member account service. Check your connection and try again.';}
  return null;
}
function bindVIP(){
  $$('[data-vip-mode]').forEach(button=>button.addEventListener('click',()=>{state.vipMode=button.dataset.vipMode;state.memberMessage='';renderRoute({name:'vip'});}));
  const form=$('#vipForm');
  if(form)form.addEventListener('submit',async event=>{
    event.preventDefault();
    const data=new FormData(form);const payload={email:String(data.get('email')||'').trim().toLowerCase(),password:String(data.get('password')||'')};
    if(state.vipMode==='register')payload.name=String(data.get('name')||'').trim();
    const button=$('button[type="submit"]',form);button.disabled=true;button.textContent=state.vipMode==='register'?'CREATING ACCOUNT…':'SIGNING IN…';
    const message=$('#vipMessage');message.textContent='';message.classList.remove('isError','isSuccess');
    try{
      const result=await apiPost(state.vipMode==='register'?'/api/account/register':'/api/account/login',payload);
      state.member=result.account||null;
      state.memberMessage='';
      if(!state.member)await loadMember();
      if(state.member){toast(state.vipMode==='register'?'Your Seven account is ready.':'Welcome back.');renderRoute({name:'vip'});}
      else {message.textContent=result.message||'Account created. Sign in to continue.';message.classList.add('isSuccess');}
    }catch(error){message.textContent=error.message;message.classList.add('isError');}
    finally{if(button.isConnected){button.disabled=false;button.textContent=state.vipMode==='login'?'SIGN IN →':'CREATE MY ACCOUNT →';}}
  });
  $('#vipLogout')?.addEventListener('click',async()=>{
    try{await apiPost('/api/account/logout',{});}catch{}
    state.member=null;state.vipMode='login';state.memberMessage='You have signed out.';renderRoute({name:'vip'});
  });
}

function bindRoute(route){
  $$('[data-route-back]').forEach(el => { el.onclick = event => { event.preventDefault(); navigate('shop'); }; });
  if (route.name === 'home') return;
  if (route.name === 'shop') bindShop();
  if (route.name === 'finder') bindFinder();
  if (route.name === 'vip') bindVIP();
  if (route.name === 'product') bindProduct(route.id);
  if (route.name === 'checkout') bindCheckout();
}
function closeMobileMenu(){ const menu=$('#mobileMenu'); menu.setAttribute('hidden',''); $('#mobileMenuOpen').setAttribute('aria-expanded','false'); }
function bindShop(){
  $$('.filter').forEach(button => button.addEventListener('click', () => { $$('.filter').forEach(item => item.classList.remove('active')); button.classList.add('active'); state.filter=button.dataset.g; renderShopGrid(); }));
  $('#search').addEventListener('input', event => { state.query=event.target.value.trim().toLowerCase(); renderShopGrid(); });
  $('#search').addEventListener('search', event => { state.query=event.target.value.trim().toLowerCase(); renderShopGrid(); });
  $('#sort').addEventListener('change', event => { state.sort=event.target.value; renderShopGrid(); });
  $('#shopFavOnly').addEventListener('click', () => { state.favoritesOnly=!state.favoritesOnly; $('#shopFavOnly').classList.toggle('active',state.favoritesOnly); renderShopGrid(); });
}
function bindFinder(){
  $('#answers').addEventListener('click', event => { const btn=event.target.closest('[data-answer-index]'); if(!btn)return; quizAnswers.push(Number(btn.dataset.answerIndex)); quizStep += 1; renderQuiz(); });
  $('#recommend').addEventListener('click', event => { const add=event.target.closest('[data-recommend-add]'); if(add){const select=$('[data-size-select]', $('#recommend'));addVariant(add.dataset.recommendAdd,select?.value||'30');return;} if(event.target.closest('[data-quiz-again]')){quizStep=0;quizAnswers=[];renderQuiz();} if(event.target.closest('[data-product-view]')) navigate('product',event.target.closest('[data-product-view]').dataset.productView); });
}
function bindProduct(id){
  const select=$('[data-size-select]', $('#routeView'));
  if(select) select.addEventListener('change',()=>{const size=sizeById(select.value); const price=$('#detailPrice'); if(price) price.textContent=money(size?.price||0);});
}
function bindCheckout(){
  if(state.member){if($('#name')&&!$('#name').value)$('#name').value=state.member.name||'';if($('#email')&&!$('#email').value)$('#email').value=state.member.email||'';}
  const shippingBox=$('#shippingOptions');
  shippingBox.addEventListener('change', event => { if(event.target.name==='courier'){state.checkoutCourier=event.target.value;renderShippingOptions();} });
  shippingBox.addEventListener('click', event => {
    const option=event.target.closest('.shipOption');
    if(!option)return;
    const radio=$('input[name=\"courier\"]', option);
    if(!radio)return;
    state.checkoutCourier=radio.value;
    renderShippingOptions();
  });
  $('#region').addEventListener('change',renderShippingOptions);
  $('#place').addEventListener('click',placeOrder);
  setTimeout(()=>$('#name')?.focus(), 100);
}
function renderQuiz(){
  if (!$('#answers')) return;
  if (quizStep === QUESTIONS.length) return finishQuiz();
  $('#qstep').textContent = `STEP ${quizStep + 1} / ${QUESTIONS.length}`;
  $('#qtitle').textContent = QUESTIONS[quizStep][0];
  $('#answers').innerHTML = QUESTIONS[quizStep][1].map((answer,index) => `<button class="answer" type="button" data-answer-index="${index}"><span class="answerNumber">0${index + 1}</span><span class="answerCopy">${answer}</span></button>`).join('');
  $('#recommend').classList.remove('show');
}
let quizStep = 0, quizAnswers = [];
const QUESTIONS = [
  ['What do you want your fragrance to say?', ['<strong>Bold</strong><span>I want to feel confident and unforgettable.</span>','<strong>Mysterious</strong><span>I want to leave a lasting impression.</span>','<strong>Fresh</strong><span>I want to feel clean and energized.</span>','<strong>Refined</strong><span>I want to feel calm and sophisticated.</span>']],
  ['When will you wear it most?', ['Date night','Every day','Work / formal','Special occasions']],
  ['Which feeling sounds most like you?', ['Warm & bold','Dark & magnetic','Clean & effortless','Soft & refined']],
];
function finishQuiz(){
  const counts=[0,0,0,0]; quizAnswers.forEach(answer=>counts[answer]+=1); const winner=counts.indexOf(Math.max(...counts));
  const targetIds=['alpha','exodus-noir','pacific','solace']; const p=productById(targetIds[winner])||state.catalog[0];
  $('#recommend').innerHTML=`<div class="recgrid"><div class="recvisual">${bottle(p.id,1.05)}</div><div><small>YOUR MATCH</small><div class="recname">${escapeHtml(p.name)}</div><p>${escapeHtml(p.description)}</p>${sizeSelect(p.id,'compact')}<button class="gold" type="button" data-recommend-add="${escapeHtml(p.id)}">ADD TO CART →</button><button class="dark" type="button" data-product-view="${escapeHtml(p.id)}">VIEW FRAGRANCE →</button><button class="textLink" type="button" data-quiz-again>TRY AGAIN</button></div></div>`;
  $('#recommend').classList.add('show');
}

function getSelectedCardSize(productId, root=document){ return sizeById($(`[data-size-select="${CSS.escape(productId)}"]`, root)?.value) || state.sizes[1]; }
function addVariant(productId, sizeId, open = true) {
  const product = productById(productId), size = sizeById(sizeId);
  if (!product || !size) return toast('That product option is unavailable.');
  const line = state.cart.find(item => item.productId === productId && item.sizeId === size.id);
  if (line) line.quantity += 1; else state.cart.push({ productId, sizeId: size.id, quantity: 1 });
  renderCart(); toast(`${product.name} ${size.label} added`); if (open) openCart();
}
function changeLine(productId,sizeId,delta){const line=state.cart.find(item=>item.productId===productId&&item.sizeId===sizeId);if(!line)return;line.quantity+=delta;if(line.quantity<1)removeLine(productId,sizeId);else renderCart();}
function removeLine(productId,sizeId){state.cart=state.cart.filter(item=>!(item.productId===productId&&item.sizeId===sizeId));renderCart();}
function subtotal(){return state.cart.reduce((sum,item)=>sum+(sizeById(item.sizeId)?.price||0)*item.quantity,0)}
function cartWeight(){return Number((0.10+state.cart.reduce((sum,item)=>sum+(sizeById(item.sizeId)?.weight||0)*item.quantity,0)).toFixed(2))}
function shippingRate(courier,region){const zone=state.regionZone[region];if(!zone||!state.rates[courier])return 0;const base=state.rates[courier][zone];const extraHalfKilos=Math.max(0,Math.ceil(Math.max(0,cartWeight()-0.5)/0.5));const extra=courier==='LBC'?20:15;return base+extraHalfKilos*extra}
function renderCart(){
  try { localStorage.setItem('seven-cart', JSON.stringify(state.cart)); } catch {}
  state.cart = state.cart.filter(item => productById(item.productId) && sizeById(item.sizeId) && Number(item.quantity) > 0);
  $('#count').textContent=state.cart.reduce((sum,item)=>sum+item.quantity,0);$('#total').textContent=money(subtotal());
  $('#items').innerHTML=state.cart.length?state.cart.map(item=>{const product=productById(item.productId),size=sizeById(item.sizeId);return `<div class="cartLine"><div class="lineVisual">${bottle(item.productId,.55)}</div><div><div class="lineName">${escapeHtml(product.name)} <span class="sizeText">${size.label}</span></div><div class="muted">${money(size.price)} each · ${size.weight.toFixed(2)}kg</div><div class="qty"><button type="button" data-cart-action="dec" data-product-id="${item.productId}" data-size-id="${size.id}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-cart-action="inc" data-product-id="${item.productId}" data-size-id="${size.id}" aria-label="Increase quantity">+</button><button class="remove" type="button" data-cart-action="remove" data-product-id="${item.productId}" data-size-id="${size.id}">Remove</button></div></div></div>`}).join(''):'<div class="empty-cart">Your cart is empty.</div>';
}
function openCart(){state.lastFocus=document.activeElement;document.body.classList.add('cartOpen','lock');$('#cart').setAttribute('aria-hidden','false');$('#cartOpen').setAttribute('aria-expanded','true');$('#cbg').setAttribute('aria-hidden','false');requestAnimationFrame(()=>$('#closeCart').focus({preventScroll:true}));}
function closeCart({restoreFocus=true}={}){const wasOpen=document.body.classList.contains('cartOpen');document.body.classList.remove('cartOpen','lock');$('#cart').setAttribute('aria-hidden','true');$('#cartOpen').setAttribute('aria-expanded','false');$('#cbg').setAttribute('aria-hidden','true');const focusTarget=state.lastFocus;state.lastFocus=null;if(wasOpen&&restoreFocus&&focusTarget?.isConnected)focusTarget.focus({preventScroll:true});}
function openModal(productId){
  const p=productById(productId);if(!p)return;
  const d=productDetails(productId);
  state.activeProductId=productId;state.gallerySlide=0;state.lastFocus=document.activeElement;
  $('#mname').textContent=p.name;$('#mprice').textContent=money(state.sizes[1]?.price||350);
  $('#mdesc').textContent=`${d.profile} ${d.bestFor ? `Best for: ${d.bestFor}` : ''}`.trim();
  $('#mtags').innerHTML=d.notes.map(tag=>`<span>${escapeHtml(tag)}</span>`).join('');
  const shotLabels=['FRONT VIEW','ANGLE VIEW','CLOSE DETAIL'];
  $('#mvisual').innerHTML=`<div class="galleryExperience">
    <div class="galleryStage" aria-live="polite">
      ${shotLabels.map((label,index)=>`<div class="galleryShot ${index===0?'active':''}" data-gallery-frame="${index}" aria-label="${label}">${bottle(productId,index===2?2.05:1.55)}<span class="galleryShotLabel">0${index+1} / ${label}</span></div>`).join('')}
    </div>
    <div class="galleryThumbs" role="group" aria-label="Choose a product view">
      ${shotLabels.map((label,index)=>`<button type="button" class="galleryThumb ${index===0?'active':''}" data-gallery-slide="${index}" aria-pressed="${index===0}"><span class="galleryThumbVisual">${bottle(productId,.32)}</span><span>${label}</span></button>`).join('')}
    </div>
    <p class="galleryDisclaimer">Preview artwork only. Official product photos can replace these placeholders later.</p>
  </div>`;
  $('#modalSize').innerHTML=state.sizes.map(size=>`<option value="${size.id}" ${size.id==='30'?'selected':''}>${size.label} · ${money(size.price)}</option>`).join('');
  updateModalPrice();
  document.body.classList.add('modalOpen','lock');$('#modal').setAttribute('aria-hidden','false');$('#mbg').setAttribute('aria-hidden','false');
  requestAnimationFrame(()=>$('#mx').focus({preventScroll:true}));
}
function setGallerySlide(index){
  if(!Number.isInteger(index)||index<0||index>2)return;
  state.gallerySlide=index;
  $$('[data-gallery-frame]',$('#mvisual')).forEach(frame=>frame.classList.toggle('active',Number(frame.dataset.galleryFrame)===index));
  $$('[data-gallery-slide]',$('#mvisual')).forEach(button=>{
    const active=Number(button.dataset.gallerySlide)===index;
    button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
  });
}
function updateModalPrice(){const size=sizeById($('#modalSize').value);$('#mprice').textContent=money(size?.price||0)}
function closeModal({restoreFocus=true}={}){const wasOpen=document.body.classList.contains('modalOpen');document.body.classList.remove('modalOpen','lock');$('#modal').setAttribute('aria-hidden','true');$('#mbg').setAttribute('aria-hidden','true');const focusTarget=state.lastFocus;state.lastFocus=null;if(wasOpen&&restoreFocus&&focusTarget?.isConnected)focusTarget.focus({preventScroll:true});}
function renderShippingOptions(){const region=$('#region')?.value,box=$('#shippingOptions');if(!box)return;if(!region){box.innerHTML='<div class="shippingHint">Select your region to calculate nationwide shipping.</div>';updateCheckoutTotals();return;}box.innerHTML=['JNT','LBC'].map(courier=>`<label class="shipOption ${state.checkoutCourier===courier?'selected':''}"><input type="radio" name="courier" value="${courier}" ${state.checkoutCourier===courier?'checked':''}><span><b>${courier==='JNT'?'J&T Express':'LBC Express'}</b><small>Assumed nationwide test rate</small></span><strong>${money(shippingRate(courier,region))}</strong></label>`).join('');updateCheckoutTotals();}
function updateCheckoutTotals(){if(!$('#sumSubtotal'))return;const ship=shippingRate(state.checkoutCourier,$('#region').value);$('#sumSubtotal').textContent=money(subtotal());$('#shipTotal').textContent=money(ship);$('#payTotal').textContent=money(subtotal()+ship);$('#shipWeight').textContent=`${cartWeight().toFixed(2)} kg`;}
function renderSummary(){if(!$('#summary'))return;$('#summary').innerHTML=state.cart.map(item=>{const p=productById(item.productId),z=sizeById(item.sizeId);return `<div class="sumrow"><span>${escapeHtml(p.name)} · ${z.label} × ${item.quantity}</span><b>${money(z.price*item.quantity)}</b></div>`}).join('');}
function openCheckout(){if(!state.cart.length)return toast('Add a product first.');closeCart();navigate('checkout');}
function closeCheckout(){if(state.route?.name==='checkout')navigate('shop');}
function openBuyNow(productId,sizeId){closeModal({restoreFocus:false});closeCart({restoreFocus:false});addVariant(productId,sizeId,false);navigate('checkout');}
async function placeOrder(){
  if(state.submitting)return;const customer={name:$('#name').value.trim(),email:$('#email').value.trim(),phone:$('#phone').value.trim(),region:$('#region').value,province:$('#province').value.trim(),city:$('#city').value.trim(),barangay:$('#barangay').value.trim(),address:$('#address').value.trim(),zipCode:$('#zipCode').value.trim()};
  if(!customer.name||!customer.email||!customer.phone||!customer.region||!customer.province||!customer.city||!customer.barangay||!customer.address||!customer.zipCode)return toast('Complete all delivery details.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))return toast('Enter a valid email address.');
  if(!/^\d{4}$/.test(customer.zipCode))return toast('Enter a valid 4-digit ZIP code.');
  if(!['JNT','LBC'].includes(state.checkoutCourier))return toast('Select a courier.');
  state.submitting=true;$('#place').disabled=true;$('#place').textContent='CREATING ORDER…';
  try{const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);const response=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer,items:state.cart.map(item=>({productId:item.productId,sizeId:item.sizeId,quantity:item.quantity})),shipping:{courier:state.checkoutCourier}}),signal:controller.signal});clearTimeout(timeout);const payload=await response.json().catch(()=>({}));if(!response.ok||!payload.order)throw new Error(payload.error||'Unable to create the order.');const order=payload.order;window.__lastOrderVipCounted=Boolean(payload.vipCounted);state.cart=[];renderCart();navigate('order-confirmation',order.id);window.__lastOrder=order;
  }catch(error){toast(error.name==='AbortError'?'The request timed out. Try again.':error.message);}finally{state.submitting=false;}
}
function orderConfirmationPage(orderId){const order=window.__lastOrder;const vipMessage=window.__lastOrderVipCounted?'This purchase has been linked to your Seven Privé account for membership progress.':state.member?'This order was not linked to your membership. Use your account email at checkout.':'Guest orders do not count toward Seven Privé membership.';return `<section class="page confirmationPage"><small>ORDER CONFIRMED</small><h1>${escapeHtml(orderId||order?.id||'THANK YOU')}</h1><p>${order?`Your test order for ${escapeHtml(order.customer.name)} has been created. ${order.shipping.courier==='JNT'?'J&T Express':'LBC Express'} shipping: ${money(order.shipping.fee)}. No money was charged.`:'Your order has been recorded.'}</p><p class="vipOrderNote">${escapeHtml(vipMessage)}</p><div class="confirmActions"><button class="gold" type="button" data-route="shop">CONTINUE SHOPPING →</button><a class="dark link" href="/admin.html">TEST ADMIN →</a></div></section>`}


// Grid interactions stay delegated because the product cards are recreated by filters/search.
$('#routeView').addEventListener('click',event=>{
  const actionEl=event.target.closest('[data-action]');
  if(actionEl){
    event.preventDefault();
    const action=actionEl.dataset.action;
    const productId=actionEl.dataset.productId || actionEl.closest('[data-product-id]')?.dataset.productId;
    if(productId && action==='favorite'){
      const before=favorites();const wasLoved=before.includes(productId);
      const next=wasLoved?before.filter(id=>id!==productId):[...before,productId];saveFavorites(next);
      const isLoved=!wasLoved;
      actionEl.classList.toggle('loved',isLoved);actionEl.textContent=isLoved?'♥':'♡';
      actionEl.setAttribute('aria-label',`${isLoved?'Remove':'Save'} ${productById(productId)?.name||'fragrance'}`);
      actionEl.setAttribute('aria-pressed',String(isLoved));
      if($('#favCount'))$('#favCount').textContent=next.length;
      // In the Favorites-only view, remove just this card instead of rebuilding
      // the whole grid (replacing a focused button can jump the page to the top).
      if(state.route?.name==='shop' && state.favoritesOnly && wasLoved){
        const currentY=window.scrollY;const card=actionEl.closest('.card');card?.remove();
        if(!$('#shopGrid .card') && $('#shopGrid'))$('#shopGrid').innerHTML='<div class="empty-cart pageEmpty">No favorite fragrances yet. Tap a heart to save one.</div>';
        requestAnimationFrame(()=>window.scrollTo(0,currentY));
      }
    }
    if(productId && action==='gallery')openModal(productId);
    if(productId && action==='add')addVariant(productId,$(`[data-size-select="${CSS.escape(productId)}"]`,actionEl.closest('[data-product-id]')||$('#routeView'))?.value||'30');
  }
  const detailAdd=event.target.closest('[data-detail-add]');
  const detailBuy=event.target.closest('[data-detail-buy]');
  if(detailAdd){ event.preventDefault(); const id=detailAdd.dataset.detailAdd; const select=$('[data-size-select]', $('#routeView')); addVariant(id, select?.value||'30'); }
  if(detailBuy){ event.preventDefault(); const id=detailBuy.dataset.detailBuy; const select=$('[data-size-select]', $('#routeView')); openBuyNow(id, select?.value||'30'); }
});
$('#routeView').addEventListener('change',event=>{if(!event.target.matches('[data-size-select]'))return;const productId=event.target.dataset.sizeSelect;const size=sizeById(event.target.value);const price=$(`[data-card-price="${CSS.escape(productId)}"]`,$('#routeView'));if(price&&size)price.textContent=money(size.price);if($('#detailPrice')&&size)$('#detailPrice').textContent=money(size.price);});
$('#items').addEventListener('click',event=>{const btn=event.target.closest('[data-cart-action]');if(!btn)return;const{cartAction,productId,sizeId}=btn.dataset;if(cartAction==='inc')changeLine(productId,sizeId,1);if(cartAction==='dec')changeLine(productId,sizeId,-1);if(cartAction==='remove')removeLine(productId,sizeId);});
$('#cartOpen').addEventListener('click',openCart);$('#closeCart').addEventListener('click',closeCart);$('#cbg').addEventListener('click',closeCart);$('#checkout').addEventListener('click',openCheckout);
$('#mx').addEventListener('click',closeModal);$('#mbg').addEventListener('click',closeModal);$('#modalSize').addEventListener('change',updateModalPrice);$('#mvisual').addEventListener('click',event=>{const slide=event.target.closest('[data-gallery-slide]');if(slide){event.preventDefault();setGallerySlide(Number(slide.dataset.gallerySlide));}});$('#madd').addEventListener('click',()=>{const id=state.activeProductId,size=$('#modalSize').value;closeModal();addVariant(id,size,false);openCart();});$('#mbuy').addEventListener('click',()=>{const id=state.activeProductId,size=$('#modalSize').value;closeModal({restoreFocus:false});openBuyNow(id,size);});
$('#mobileMenuOpen').addEventListener('click',()=>{const menu=$('#mobileMenu');const open=!menu.hasAttribute('hidden');if(open)closeMobileMenu();else{menu.removeAttribute('hidden');$('#mobileMenuOpen').setAttribute('aria-expanded','true');$('#menuSearch')?.focus({preventScroll:true});}});
$('#menuSearchForm').addEventListener('submit',event=>{event.preventDefault();state.query=$('#menuSearch').value.trim().toLowerCase();state.filter='all';state.favoritesOnly=false;state.sort='featured';closeMobileMenu();navigate('shop');});
document.addEventListener('click',event=>{
  const routeButton=event.target.closest('[data-route]');
  if(!routeButton)return;
  event.preventDefault();
  navigate(routeButton.dataset.route,routeButton.dataset.routeId||undefined);
});
window.addEventListener('popstate',syncRouteFromHistory);
window.addEventListener('hashchange',syncRouteFromHistory);
document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(document.body.classList.contains('modalOpen'))closeModal();else if(document.body.classList.contains('cartOpen'))closeCart();else if(state.route?.name==='checkout')navigate('shop');else closeMobileMenu();});

const FALLBACK_CATALOG = {
  products: [
    {id:'omega',name:'OMEGA',gender:'men',description:'Bold signature built for confidence and presence.',tags:['Signature','Confident','Bold']},
    {id:'boaz',name:'BOAZ',gender:'men',description:'Strong, polished and made to leave a mark.',tags:['Signature','Strong','Polished']},
    {id:'alpha',name:'ALPHA',gender:'men',description:'Warm, confident and refined.',tags:['Confident','Warm','Refined']},
    {id:'exodus-noir',name:'EXODUS NOIR',gender:'men',description:'Dark and magnetic, with pear, lavender, cinnamon, vanilla and amber.',tags:['Dark','Magnetic','Warm']},
    {id:'pacific',name:'PACIFIC',gender:'men',description:'Fresh, clean and effortless for everyday wear.',tags:['Fresh','Clean','Everyday']},
    {id:'invincible',name:'INVINCIBLE',gender:'men',description:'Powerful and self-assured with a lasting character.',tags:['Powerful','Bold','Confident']},
    {id:'caelum',name:'CAELUM',gender:'men',description:'Crisp, elevated and composed.',tags:['Crisp','Elevated','Clean']},
    {id:'gourmand',name:'GOURMAND',gender:'women',description:'Sweet, rich and inviting.',tags:['Sweet','Rich','Inviting']},
    {id:'solace',name:'SOLACE',gender:'women',description:'Soft, graceful and understated.',tags:['Soft','Elegant','Refined']},
    {id:'hadar',name:'HADAR',gender:'women',description:'Bright, elegant and memorable.',tags:['Bright','Elegant','Memorable']},
    {id:'darling',name:'DARLING',gender:'women',description:'Playful, warm and charming.',tags:['Playful','Warm','Charming']},
    {id:'asmira',name:'ASMIRA',gender:'women',description:'Smooth, feminine and refined.',tags:['Smooth','Feminine','Refined']},
    {id:'elan',name:'ELAN',gender:'women',description:'Clean sophistication with effortless character.',tags:['Clean','Sophisticated','Elegant']}
  ],
  sizes: [
    {id:'10',label:'10mL',price:120,weight:0.12},
    {id:'30',label:'30mL',price:350,weight:0.17},
    {id:'50',label:'50mL',price:600,weight:0.22}
  ],
  regionZone:{'National Capital Region':'NCR','Cordillera Administrative Region':'Luzon','Ilocos Region':'Luzon','Cagayan Valley':'Luzon','Central Luzon':'Luzon','CALABARZON':'Luzon','MIMAROPA':'Luzon','Bicol Region':'Luzon','Western Visayas':'Visayas','Central Visayas':'Visayas','Eastern Visayas':'Visayas','Zamboanga Peninsula':'Mindanao','Northern Mindanao':'Mindanao','Davao Region':'Mindanao','SOCCSKSARGEN':'Mindanao','Caraga':'Mindanao','Bangsamoro Autonomous Region in Muslim Mindanao':'Mindanao'},
  rates:{JNT:{NCR:85,Luzon:100,Visayas:135,Mindanao:155},LBC:{NCR:95,Luzon:110,Visayas:145,Mindanao:165}},
  packagingWeight:0.10,
  testMode:true
};
function showLoadError(message){
  const view=$('#routeView');
  if(!view)return;
  view.innerHTML=`<section class="page simplePage"><small>SEVEN PERFUME</small><h1>WE NEED A MOMENT.</h1><p>${escapeHtml(message)}</p><button class="gold" type="button" id="retryCatalog">TRY AGAIN →</button></section>`;
  $('#retryCatalog')?.addEventListener('click', init);
}
async function init(){
  const loading=$('#routeView');
  if(loading) loading.innerHTML='<section class="page simplePage"><small>SEVEN PERFUME</small><h1>PREPARING THE COLLECTION.</h1><p>Loading the fragrance catalog…</p></section>';
  try {
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),10000);
    const response=await fetch('/api/catalog',{headers:{Accept:'application/json'},signal:controller.signal});
    clearTimeout(timeout);
    if(!response.ok)throw new Error('Catalog request failed.');
    const data=await response.json();
    if(!Array.isArray(data.products)||!Array.isArray(data.sizes)||!data.regionZone||!data.rates)throw new Error('Catalog configuration is incomplete.');
    state.catalog=data.products; state.sizes=data.sizes; state.regionZone=data.regionZone; state.rates=data.rates;
    normalizeCartAfterCatalogLoad();
  } catch(error) {
    console.warn('Catalog API unavailable; using local test catalog.',error);
    state.catalog=FALLBACK_CATALOG.products; state.sizes=FALLBACK_CATALOG.sizes; state.regionZone=FALLBACK_CATALOG.regionZone; state.rates=FALLBACK_CATALOG.rates;
    normalizeCartAfterCatalogLoad();
    toast('Using local test catalog.');
  }
  await loadMember({silent:true});
  renderCart();
  renderRoute(parseRoute(),{initial:true});
}
window.addEventListener('error', event => {
  if (document.querySelector('#routeView') && (!state.catalog.length || !document.querySelector('#routeView').innerHTML.trim())) {
    showLoadError('Something interrupted the storefront. Please refresh the page.');
  }
  console.error('Seven Perfume runtime error:', event.error || event.message);
});
init();
