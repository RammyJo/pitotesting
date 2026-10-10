/* Additive UI improvements for the actual pitotesting V9.3 app.
   Depends on existing state/catalog/renderCard/navigation handlers in app.js. */
(function sevenPerfumeInterfacePolish(){
  'use strict';

  const qs = (selector, root=document) => root.querySelector(selector);
  const qsa = (selector, root=document) => [...root.querySelectorAll(selector)];
  let revealObserver = null;

  function makeArrowControls(track, className=''){
    const controls = document.createElement('div');
    controls.className = `polishShelfControls ${className}`.trim();
    controls.innerHTML = '<button type="button" data-shelf-dir="-1" aria-label="Scroll products left">‹</button><button type="button" data-shelf-dir="1" aria-label="Scroll products right">›</button>';
    const buttons = qsa('button', controls);
    const update = () => {
      const max = Math.max(0, track.scrollWidth - track.clientWidth - 3);
      buttons[0].disabled = track.scrollLeft <= 2;
      buttons[1].disabled = track.scrollLeft >= max;
    };
    buttons.forEach(button => button.addEventListener('click', () => {
      const direction = Number(button.dataset.shelfDir) || 1;
      track.scrollBy({left: direction * Math.max(220, track.clientWidth * .82), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    }));
    track.addEventListener('scroll', update, {passive:true});
    window.addEventListener('resize', update, {passive:true});
    track.addEventListener('keydown', event => {
      if (event.target !== track) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        track.scrollBy({left:(event.key === 'ArrowRight' ? 1 : -1) * track.clientWidth * .72, behavior:'smooth'});
      }
    });
    requestAnimationFrame(update);
    return controls;
  }

  function addRevealEffects(root){
    const candidates = qsa('.homeFeature, .statement, .homeAbout, .polishCampaign, .polishShelfSection, .polishPromoBand', root);
    if (!('IntersectionObserver' in window)) return;
    if (!revealObserver) revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('polishVisible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {threshold:.08, rootMargin:'0px 0px -35px 0px'});
    candidates.forEach(el => {
      if (el.dataset.polishReveal === '1') return;
      el.dataset.polishReveal = '1';
      el.classList.add('polishReveal');
      revealObserver.observe(el);
    });
  }

  function campaignSection(){
    const section = document.createElement('section');
    section.className = 'polishCampaign';
    section.setAttribute('aria-labelledby','polishCampaignTitle');
    section.innerHTML = `
      <div class="polishCampaignCopy">
        <div class="polishEyebrow">THE SEVEN EDIT · FEATURED</div>
        <h2 id="polishCampaignTitle">Some scents<br>say it <em>all.</em></h2>
        <p>A fragrance is a detail people remember. Find the one that feels like you, then make it part of your own story.</p>
        <div class="polishCampaignActions">
          <button class="gold" type="button" data-route="shop">EXPLORE THE COLLECTION <span aria-hidden="true">→</span></button>
          <button class="polishTextAction" type="button" data-route="finder">HELP ME CHOOSE ↗</button>
        </div>
      </div>
      <div class="polishCampaignArt" aria-hidden="true">
        <div class="polishCampaignGlow"></div>
        <div class="polishBottle"><div class="polishBottleCap"></div><div class="polishBottleGlass"></div><div class="polishBottleLabel"><small>SEVEN PERFUME</small><strong>NO. 07</strong><em>EAU DE PARFUM</em></div></div>
        <div class="polishCampaignNote">SCENT · MEMORY · IDENTITY</div>
      </div>`;
    return section;
  }

  function makeShelf(title, eyebrow, copy, products, trackId){
    if (!products.length || typeof renderCard !== 'function') return null;
    const section = document.createElement('section');
    section.className = 'section polishShelfSection';
    section.setAttribute('aria-labelledby',`${trackId}-heading`);
    section.innerHTML = `
      <div class="polishShelfHeading">
        <div><div class="polishEyebrow">${eyebrow}</div><h2 id="${trackId}-heading">${title}</h2><p>${copy}</p></div>
      </div>
      <div class="polishShelfTrack" id="${trackId}" role="region" aria-label="${title} fragrances" tabindex="0"></div>`;
    const track = qs(`#${trackId}`, section);
    track.innerHTML = products.map(product => renderCard(product.id, true)).join('');
    section.querySelector('.polishShelfHeading').append(makeArrowControls(track));
    return section;
  }

  function promoBand(){
    const band = document.createElement('section');
    band.className = 'polishPromoBand';
    band.setAttribute('aria-label','Explore Seven Perfume');
    band.innerHTML = `
      <article class="polishPromoCard">
        <span class="polishPromoGlyph" aria-hidden="true">07</span>
        <small>START WITH A SMALLER BOTTLE</small>
        <h3>Find your signature.<br>One spray at a time.</h3>
        <p>Try a 10mL size first, then choose the bottle that suits your everyday.</p>
        <button type="button" data-route="shop">EXPLORE BOTTLE SIZES →</button>
      </article>
      <article class="polishPromoCard">
        <span class="polishPromoGlyph" aria-hidden="true">✳</span>
        <small>NOT SURE WHERE TO START?</small>
        <h3>Your mood can<br>lead the way.</h3>
        <p>Answer three quick questions and discover a fragrance to explore.</p>
        <button type="button" data-route="finder">TRY THE SCENT FINDER →</button>
      </article>`;
    return band;
  }

  function enhanceHome(){
    const home = qs('#routeView .homePage');
    if (!home || home.dataset.polishReady === '1') return;
    if (typeof renderCard !== 'function' || typeof state === 'undefined' || !state.catalog?.length) return;
    home.dataset.polishReady = '1';

    const homeFeature = qs('.homeFeature', home);
    const ticker = qs('.ticker', home);
    const statement = qs('.statement', home);
    const homeAbout = qs('.homeAbout', home);

    // Turn the existing featured products into a genuine sideways-scroll shelf.
    const featuredGrid = qs('.featuredGrid', home);
    if (featuredGrid){
      featuredGrid.id = 'polishFeaturedTrack';
      featuredGrid.classList.add('polishShelfTrack','polishFeaturedTrack');
      featuredGrid.setAttribute('role','region');
      featuredGrid.setAttribute('aria-label','Featured Seven fragrances');
      featuredGrid.setAttribute('tabindex','0');
      const wrap = document.createElement('div');
      wrap.className = 'polishTrackWrap polishFeaturedWrap';
      featuredGrid.parentNode.insertBefore(wrap, featuredGrid);
      wrap.append(featuredGrid, makeArrowControls(featuredGrid,'polishSplitControls'));
    }

    // Editorial campaign is inserted after the first featured collection.
    const campaign = campaignSection();
    if (homeFeature) homeFeature.insertAdjacentElement('afterend', campaign);
    else if (ticker) ticker.insertAdjacentElement('afterend', campaign);

    const men = state.catalog.filter(product => product.gender === 'men');
    const women = state.catalog.filter(product => product.gender === 'women');
    const menShelf = makeShelf('FOR HIM','THE MENSWEAR EDIT','Fresh, warm, bold, or understated. Explore the scents that fit your kind of presence.',men,'polishMenTrack');
    if (menShelf) campaign.insertAdjacentElement('afterend',menShelf);

    const promos = promoBand();
    if (menShelf) menShelf.insertAdjacentElement('afterend',promos);
    else campaign.insertAdjacentElement('afterend',promos);

    const womenShelf = makeShelf('FOR HER','THE FRAGRANCE EDIT','Soft, playful, radiant, or refined. Find a fragrance that fits your own signature.',women,'polishWomenTrack');
    if (womenShelf){
      if (statement) home.insertBefore(womenShelf,statement);
      else if (homeAbout) home.insertBefore(womenShelf,homeAbout);
      else home.append(womenShelf);
    }

    // Make the header text and current product cards feel more intentional.
    const splitCopy = qs('.homeFeature .splitIntro > div:last-child',home);
    if (splitCopy){
      const p = qs('p',splitCopy);
      if (p) p.textContent = 'Start with a few signatures, swipe through the collection, and open any fragrance for its full profile.';
    }
    addRevealEffects(home);
    requestAnimationFrame(() => {
      qsa('.polishShelfTrack',home).forEach(track => track.dispatchEvent(new Event('scroll')));
    });
  }

  // Existing V9.3 size handler updated the first matching price when products
  // appeared more than once. This later listener updates the actual card being used.
  document.addEventListener('change',event=>{
    const select = event.target.closest('[data-size-select]');
    if (!select) return;
    const card = select.closest('.card');
    if (!card || typeof state === 'undefined') return;
    const size = state.sizes.find(item => String(item.id) === String(select.value));
    const price = card.querySelector('[data-card-price]');
    if (size && price && typeof money === 'function') price.textContent = money(size.price);
  });

  // Keep matching hearts in sync across the home shelves and featured shelf.
  document.addEventListener('click',event=>{
    const button = event.target.closest('[data-action="favorite"]');
    const card = button?.closest('[data-product-id]');
    const id = card?.dataset.productId;
    if (!id) return;
    requestAnimationFrame(()=>{
      const loved = button.getAttribute('aria-pressed') === 'true';
      qsa('[data-action="favorite"]',document).forEach(heart=>{
        const productId = heart.closest('[data-product-id]')?.dataset.productId;
        if (productId !== id) return;
        heart.classList.toggle('loved',loved);
        heart.textContent = loved ? '♥' : '♡';
        heart.setAttribute('aria-pressed',String(loved));
        heart.setAttribute('aria-label',`${loved ? 'Remove' : 'Save'} ${card.querySelector('.cardNameText')?.textContent || 'fragrance'}`);
      });
    });
  });

  function observeRoutes(){
    const routeView = qs('#routeView');
    if (!routeView) return;
    const observer = new MutationObserver(() => {
      enhanceHome();
      if (qs('#routeView .homePage')) addRevealEffects(qs('#routeView .homePage'));
    });
    observer.observe(routeView,{childList:true,subtree:true});
    enhanceHome();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',observeRoutes,{once:true});
  else observeRoutes();
})();
