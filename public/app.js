const SIZES=[
  {id:'10',label:'10mL',price:120,weight:.12},
  {id:'30',label:'30mL',price:350,weight:.17},
  {id:'50',label:'50mL',price:600,weight:.22}
];
const P=[
['OMEGA 30mL','men','Bold signature built for confidence and presence.'],['BOAZ 30mL','men','Strong, polished and made to leave a mark.'],['ALPHA 30mL','men','Warm, confident and refined.'],['EXODUS NOIR 30mL','men','Dark and magnetic, with pear, lavender, cinnamon, vanilla and amber.'],['PACIFIC 30mL','men','Fresh, clean and effortless for everyday wear.'],['INVINCIBLE 30mL','men','Powerful and self-assured with a lasting character.'],['CAELUM 30mL','men','Crisp, elevated and composed.'],['GOURMAND 30mL','women','Sweet, rich and inviting.'],['SOLACE 30mL','women','Soft, graceful and understated.'],['HADAR 30mL','women','Bright, elegant and memorable.'],['DARLING 30mL','women','Playful, warm and charming.'],['ASMIRA 30mL','women','Smooth, feminine and refined.'],['ELAN 30mL','women','Clean sophistication with effortless character.']
].map((x,i)=>({id:i,name:x[0].replace(' 30mL',''),gender:x[1],desc:x[2],tags:i===3?['Dark','Magnetic','Warm']:i===2?['Confident','Warm','Refined']:i===4?['Fresh','Clean','Everyday']:['Signature','Seven']}));

const REGION_ZONE={
  'National Capital Region':'NCR','Cordillera Administrative Region':'Luzon','Ilocos Region':'Luzon','Cagayan Valley':'Luzon','Central Luzon':'Luzon','CALABARZON':'Luzon','MIMAROPA':'Luzon','Bicol Region':'Luzon','Western Visayas':'Visayas','Central Visayas':'Visayas','Eastern Visayas':'Visayas','Zamboanga Peninsula':'Mindanao','Northern Mindanao':'Mindanao','Davao Region':'Mindanao','SOCCSKSARGEN':'Mindanao','Caraga':'Mindanao','Bangsamoro Autonomous Region in Muslim Mindanao':'Mindanao'
};
const RATES={
  LBC:{NCR:95,Luzon:110,Visayas:145,Mindanao:165},
  JNT:{NCR:85,Luzon:100,Visayas:135,Mindanao:155}
};

const S={cart:[],filter:'all',q:'',sort:'featured',favOnly:false,active:0,checkoutCourier:'JNT'};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=n=>'₱'+Math.round(n).toLocaleString('en-PH');
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(window.tt);window.tt=setTimeout(()=>e.classList.remove('show'),1500)};
const favorites=()=>JSON.parse(localStorage.getItem('seven-favorites')||'[]');
const saveFav=v=>localStorage.setItem('seven-favorites',JSON.stringify(v));
function bottle(i=0,scale=1){const p=P[i]||P[0];const short=p.name.split(' ')[0];return `<div class="bottle tone-${i%13}" style="--bscale:${scale}"><div class="cap"></div><div class="label"><span>SEVEN PERFUME</span><b>${short}</b><em>EAU DE PARFUM</em></div></div>`}
function sizeSelect(i,compact=false){return `<select class="sizeSelect ${compact?'compact':''}" data-size-select="${i}">${SIZES.map((s,n)=>`<option value="${s.id}" ${s.id==='30'?'selected':''}>${s.label} · ${money(s.price)}</option>`).join('')}</select>`}
function render(){
 let ids=P.map((_,i)=>i).filter(i=>{let p=P[i];return(S.filter==='all'||p.gender===S.filter)&&(!S.q||p.name.toLowerCase().includes(S.q)||p.desc.toLowerCase().includes(S.q))&&(!S.favOnly||favorites().includes(p.name))});
 if(S.sort==='az')ids.sort((a,b)=>P[a].name.localeCompare(P[b].name));if(S.sort==='za')ids.sort((a,b)=>P[b].name.localeCompare(P[a].name));
 $('#grid').innerHTML=ids.length?ids.map(card).join(''):'<div class="empty-cart" style="grid-column:1/-1">No fragrances found.</div>';
 $('#favCount').textContent=favorites().length;
}
function card(i){let p=P[i],f=favorites().includes(p.name);return `<article class="card"><div class="visual">${bottle(i)}<span class="badge">${p.gender}</span><button class="heart ${f?'loved':''}" onclick="fav(${i})">${f?'♥':'♡'}</button></div><div class="info"><div class="name">${p.name}</div><div class="desc">${p.desc}</div>${sizeSelect(i)}<div class="meta"><span class="price" data-card-price="${i}">₱350</span><span class="stock">In stock</span></div><div class="actions"><button class="dark" onclick="quick(${i})">Quick view</button><button class="gold" onclick="addFromCard(${i})">Add</button></div></div></article>`}
function getCardSize(i){return SIZES.find(x=>x.id===$(`[data-size-select="${i}"]`)?.value)||SIZES[1]}
function addFromCard(i){const sz=getCardSize(i);addVariant(i,sz.id)}
function fav(i){let f=favorites();f=f.includes(P[i].name)?f.filter(x=>x!==P[i].name):[...f,P[i].name];saveFav(f);render()}
function addVariant(i,sizeId){let x=S.cart.find(x=>x.i===i&&x.sizeId===sizeId);x?x.q++:S.cart.push({i,q:1,sizeId});cart();toast(`${P[i].name} ${sizeId}mL added`);openCart()}
function add(i){addVariant(i,'30')}
function change(i,sizeId,d){let x=S.cart.find(x=>x.i===i&&x.sizeId===sizeId);if(!x)return;x.q+=d;if(x.q<1)S.cart=S.cart.filter(y=>!(y.i===i&&y.sizeId===sizeId));cart()}
function remove(i,sizeId){S.cart=S.cart.filter(x=>!(x.i===i&&x.sizeId===sizeId));cart()}
function subtotal(){return S.cart.reduce((s,x)=>{let z=SIZES.find(z=>z.id===x.sizeId);return s+z.price*x.q},0)}
function cartWeight(){return S.cart.reduce((s,x)=>{let z=SIZES.find(z=>z.id===x.sizeId);return s+z.weight*x.q},.10)}
function shippingRate(courier,region){if(!region)return 0;const zone=REGION_ZONE[region];const base=RATES[courier][zone]||RATES[courier].Luzon;const tiers=Math.max(0,Math.ceil(Math.max(0,cartWeight()-.5)/.5));return base+tiers*(courier==='LBC'?20:15)}
function total(){return subtotal()+shippingRate(S.checkoutCourier,$('#region')?.value)}
function cart(){
 let c=S.cart.reduce((s,x)=>s+x.q,0);$('#count').textContent=c;$('#total').textContent=money(subtotal());
 $('#items').innerHTML=S.cart.length?S.cart.map(x=>{const p=P[x.i],z=SIZES.find(z=>z.id===x.sizeId);return `<div class="cartLine"><div class="lineVisual">${bottle(x.i,.55)}</div><div><div class="lineName">${p.name} <span class="sizeText">${z.label}</span></div><div class="muted">${money(z.price)} each · ${z.weight.toFixed(2)}kg</div><div class="qty"><button onclick="change(${x.i},'${z.id}',-1)">−</button><span>${x.q}</span><button onclick="change(${x.i},'${z.id}',1)">+</button><button class="remove" onclick="remove(${x.i},'${z.id}')">Remove</button></div></div></div>`}).join(''):'<div class="empty-cart">Your cart is empty.</div>'
}
function openCart(){document.body.classList.add('cartOpen','lock')};function closeCart(){document.body.classList.remove('cartOpen','lock')}
function quick(i){S.active=i;let p=P[i];$('#mname').textContent=p.name;$('#mprice').textContent='₱350';$('#mdesc').textContent=p.desc;$('#mtags').innerHTML=p.tags.map(t=>`<span>${t}</span>`).join('');$('#mvisual').innerHTML=bottle(i,1.35);$('#modalSize').innerHTML=SIZES.map(s=>`<option value="${s.id}" ${s.id==='30'?'selected':''}>${s.label} · ${money(s.price)}</option>`).join('');updateModalPrice();document.body.classList.add('modalOpen','lock')}
function updateModalPrice(){$('#mprice').textContent=money(SIZES.find(s=>s.id===$('#modalSize').value).price)}
function closeModal(){document.body.classList.remove('modalOpen','lock')}
function renderShippingOptions(){
 const region=$('#region').value; const box=$('#shippingOptions');
 if(!region){box.innerHTML='<div class="shippingHint">Select your region to calculate nationwide shipping.</div>';return}
 box.innerHTML=['JNT','LBC'].map(c=>`<label class="shipOption ${S.checkoutCourier===c?'selected':''}"><input type="radio" name="courier" value="${c}" ${S.checkoutCourier===c?'checked':''}><span><b>${c==='JNT'?'J&T Express':'LBC Express'}</b><small>${c==='JNT'?'Assumed nationwide test rate':'Assumed nationwide test rate'}</small></span><strong>${money(shippingRate(c,region))}</strong></label>`).join('');
 $$('input[name="courier"]').forEach(r=>r.onchange=()=>{S.checkoutCourier=r.value;renderShippingOptions();updateCheckoutTotals()});
 updateCheckoutTotals();
}
function updateCheckoutTotals(){
 const ship=shippingRate(S.checkoutCourier,$('#region').value);$('#shipTotal').textContent=money(ship);$('#payTotal').textContent=money(subtotal()+ship);$('#shipWeight').textContent=cartWeight().toFixed(2)+' kg';
}
function openCheckout(){if(!S.cart.length)return toast('Add a product first');closeCart();$('#summary').innerHTML=S.cart.map(x=>{const z=SIZES.find(z=>z.id===x.sizeId);return `<div class="sumrow"><span>${P[x.i].name} · ${z.label} × ${x.q}</span><b>${money(z.price*x.q)}</b></div>`}).join('');$('#region').value='';renderShippingOptions();updateCheckoutTotals();document.body.classList.add('checkoutOpen','lock')}
function closeCheckout(){document.body.classList.remove('checkoutOpen','lock')}
async function placeOrder(){
 let customer={name:$('#name').value.trim(),email:$('#email').value.trim(),phone:$('#phone').value.trim(),region:$('#region').value,province:$('#province').value.trim(),city:$('#city').value.trim(),barangay:$('#barangay').value.trim(),address:$('#address').value.trim()};
 if(Object.values(customer).some(v=>!v))return toast('Complete all delivery details'); if(!customer.region)return toast('Select your region');
 const ship=shippingRate(S.checkoutCourier,customer.region);let body={customer,items:S.cart.map(x=>{const z=SIZES.find(z=>z.id===x.sizeId);return{name:`${P[x.i].name} ${z.label}`,quantity:x.q,price:z.price,weight:z.weight}}),subtotal:subtotal(),shipping:{courier:S.checkoutCourier,fee:ship,weight:cartWeight(),zone:REGION_ZONE[customer.region]},total:subtotal()+ship,paymentStatus:'TEST_PAID'};
 let r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});let j=await r.json();closeCheckout();S.cart=[];cart();$('#orderId').textContent=j.order.id;$('#successMsg').textContent=`Test order created for ${customer.name}. ${S.checkoutCourier==='JNT'?'J&T Express':'LBC Express'} shipping: ${money(ship)}. No money was charged.`;document.body.classList.add('successOpen')
}
const Q=[['What do you want your fragrance to say?',['I’m confident','I’m mysterious','I’m fresh','I’m elegant']],['When will you wear it most?',['Date night','Every day','Work / formal','Special occasions']],['Which feeling sounds most like you?',['Warm & bold','Dark & magnetic','Clean & effortless','Soft & refined']]];let qs=0,qa=[];
function qrender(){if(qs===3)return qfinish();$('#qstep').textContent=`STEP ${qs+1} / 3`;$('#qtitle').textContent=Q[qs][0];$('#answers').innerHTML=Q[qs][1].map((a,i)=>`<button class="answer" onclick="qpick(${i})"><strong>0${i+1}</strong><br>${a}</button>`).join('');$('#recommend').classList.remove('show')}
function qpick(i){qa.push(i);qs++;qrender()}
function qfinish(){let c=[0,0,0,0];qa.forEach(x=>c[x]++);let target=[2,3,4,8][c.indexOf(Math.max(...c))];let p=P[target];$('#recommend').innerHTML=`<div class="recgrid"><div class="recvisual">${bottle(target,1.05)}</div><div><small>YOUR MATCH</small><div class="recname">${p.name}</div><p>${p.desc}</p>${sizeSelect(target,true)}<button class="gold" onclick="addFromRecommend(${target})">ADD TO CART →</button><button class="dark" onclick="qs=0;qa=[];qrender()">TRY AGAIN</button></div></div>`;$('#recommend').classList.add('show')}
function addFromRecommend(i){const sel=$('#recommend [data-size-select]');addVariant(i,sel.value)}

$$('.filter').forEach(b=>b.onclick=()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');S.filter=b.dataset.g;render()});
$('#search').oninput=e=>{S.q=e.target.value.toLowerCase();render()};$('#sort').onchange=e=>{S.sort=e.target.value;render()};$('#favOnly').onclick=()=>{S.favOnly=!S.favOnly;$('#favOnly').classList.toggle('active',S.favOnly);render()};
$$('[data-size-select]').forEach(s=>s.onchange=()=>{const i=s.dataset.sizeSelect;const z=SIZES.find(z=>z.id===s.value);const cardPrice=$(`[data-card-price="${i}"]`);if(cardPrice)cardPrice.textContent=money(z.price)});
$('#cartOpen').onclick=openCart;$('#closeCart').onclick=closeCart;$('#cbg').onclick=closeCart;$('#checkout').onclick=openCheckout;$('#cox').onclick=closeCheckout;$('#xbg').onclick=closeCheckout;$('#place').onclick=placeOrder;$('#mx').onclick=closeModal;$('#mbg').onclick=closeModal;$('#madd').onclick=()=>{addVariant(S.active,$('#modalSize').value);closeModal()};$('#mbuy').onclick=()=>{addVariant(S.active,$('#modalSize').value);closeModal();openCheckout()};$('#modalSize').onchange=updateModalPrice;$('#region').onchange=renderShippingOptions;$$('[data-go]').forEach(b=>b.onclick=()=>document.querySelector(b.dataset.go).scrollIntoView({behavior:'smooth'}));
qrender();render();cart();
