const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[ch]));
const money = value => `₱${Math.round(Number(value) || 0).toLocaleString('en-PH')}`;
let token = sessionStorage.getItem('seven-admin-token') || '';

function setMessage(text, good = false) { const node=$('#loginMessage'); node.textContent=text; node.style.color=good?'#bba77f':''; }
async function load(){
  if(!token){$('#loginPanel').hidden=false;$('#ordersPanel').hidden=true;return;}
  const response=await fetch('/api/orders',{headers:{Authorization:`Bearer ${token}`,Accept:'application/json'}});
  const data=await response.json().catch(()=>({}));
  if(!response.ok){sessionStorage.removeItem('seven-admin-token');token='';$('#loginPanel').hidden=false;$('#ordersPanel').hidden=true;setMessage(data.error||'Invalid admin token.');return;}
  $('#loginPanel').hidden=true;$('#ordersPanel').hidden=false;
  const node=$('#orders');
  if(!data.orders.length){node.innerHTML='<div class="empty-cart">No test orders yet.</div>';return;}
  node.innerHTML=data.orders.map(order=>`<article class="orderCard"><div class="orderGrid"><div><b>${escapeHtml(order.id)}</b><div class="muted">${escapeHtml(new Date(order.createdAt).toLocaleString())}</div><div class="status" style="margin-top:8px">${escapeHtml(order.paymentStatus)}</div></div><div><b>${escapeHtml(order.customer.name)}</b><div class="muted">${escapeHtml(order.customer.email)}</div><div class="muted">${escapeHtml(order.customer.phone)}</div><div class="muted">${escapeHtml(order.customer.region)} · ${escapeHtml(order.customer.province)} · ${escapeHtml(order.customer.city)}</div><div class="muted">${escapeHtml(order.customer.barangay)} · ${escapeHtml(order.customer.address)} · ${escapeHtml(order.customer.zipCode)}</div></div><div>${order.items.map(item=>`<div>${escapeHtml(item.name)} × ${item.quantity} — ${money(item.price*item.quantity)}</div>`).join('')}<div class="orderShip">${order.shipping?.courier==='JNT'?'J&T Express':'LBC Express'} · ${money(order.shipping?.fee||0)} · ${Number(order.shipping?.weight||0).toFixed(2)}kg</div></div><div><div>Subtotal <b>${money(order.subtotal)}</b></div><div>Shipping <b>${money(order.shipping?.fee||0)}</b></div><div class="orderTotal">Total <b>${money(order.total)}</b></div><div class="status">${escapeHtml(order.orderStatus)}</div></div></div></article>`).join('');
}
$('#login').addEventListener('click',()=>{token=$('#adminToken').value.trim();if(!token)return setMessage('Enter the admin token.');sessionStorage.setItem('seven-admin-token',token);load()});
$('#adminToken').addEventListener('keydown',event=>{if(event.key==='Enter')$('#login').click()});
$('#refresh').addEventListener('click',load);
$('#logout').addEventListener('click',()=>{sessionStorage.removeItem('seven-admin-token');token='';load();setMessage('Logged out.')});
$('#clear').addEventListener('click',async()=>{if(!confirm('Clear all test orders?'))return;const response=await fetch('/api/orders',{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});if(response.ok)load();else setMessage('Unable to clear test orders.')});
load();
