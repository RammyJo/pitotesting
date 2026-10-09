import { PRODUCTS, SIZES, REGION_ZONE, RATES, PACKAGING_WEIGHT } from './catalog.js';
import { buildOrder } from './order.js';

const orders = globalThis.__SEVEN_TEST_ORDERS__ || [];
globalThis.__SEVEN_TEST_ORDERS__ = orders;
const requestWindow = new Map();
const adminWindow = new Map();
const accountWindow = new Map();
const MAX_BODY_BYTES = 50_000;
const RATE_WINDOW_MS = 60_000;
const MAX_ORDER_REQUESTS = 12;

const securityHeaders = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...securityHeaders,
      'content-type': 'application/json; charset=UTF-8',
      'cache-control': 'no-store',
      ...extraHeaders,
    },
  });
}

function secure(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(securityHeaders)) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function clientIp(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || 'unknown';
}

function sameOrigin(request, url) {
  const origin = request.headers.get('Origin');
  return !origin || origin === url.origin;
}

function adminAuthorized(request, env) {
  const token = String(env.ADMIN_TOKEN || '').trim();
  if (!token) return false;
  const auth = request.headers.get('Authorization') || '';
  return auth === `Bearer ${token}`;
}

async function readJson(request) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_BODY_BYTES) return { ok: false, response: json({ error: 'Request too large.' }, 413) };
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return { ok: false, response: json({ error: 'Request too large.' }, 413) };
  try { return { ok: true, data: JSON.parse(raw) }; }
  catch { return { ok: false, response: json({ error: 'Invalid JSON.' }, 400) }; }
}

function rateLimited(map, ip, limit) {
  const now = Date.now();
  const existing = map.get(ip) || [];
  const recent = existing.filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  recent.push(now);
  if (map.size > 10000) {
    for (const [key, values] of map) {
      if (!values.some((timestamp) => now - timestamp < RATE_WINDOW_MS)) map.delete(key);
      if (map.size <= 5000) break;
    }
  }
  map.set(ip, recent);
  return recent.length > limit;
}

const SESSION_COOKIE = 'sp_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PASSWORD_ITERATIONS = 100000;
function base64(bytes){let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary);}
function fromBase64(value){return Uint8Array.from(atob(value),ch=>ch.charCodeAt(0));}
function randomBytes(length){const bytes=new Uint8Array(length);crypto.getRandomValues(bytes);return bytes;}
async function sha256Hex(value){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function hashPassword(password,salt){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:PASSWORD_ITERATIONS,hash:'SHA-256'},key,256);return new Uint8Array(bits);}
function sameBytes(a,b){if(a.length!==b.length)return false;let result=0;for(let i=0;i<a.length;i++)result|=a[i]^b[i];return result===0;}
function cookieValue(request,name){const raw=request.headers.get('Cookie')||'';for(const part of raw.split(';')){const [key,...value]=part.trim().split('=');if(key===name)return value.join('=');}return '';}
function sessionCookie(token,maxAge=2592000){return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;}
async function currentAccount(request,env){
  if(!env.DB)return null;
  const token=cookieValue(request,SESSION_COOKIE);if(!token)return null;
  const tokenHash=await sha256Hex(token);
  return await env.DB.prepare('SELECT c.id, c.name, c.email FROM sessions s JOIN customers c ON c.id=s.customer_id WHERE s.token_hash=? AND s.expires_at>? LIMIT 1').bind(tokenHash,Date.now()).first();
}
async function createSession(env,customerId){
  const token=[...randomBytes(32)].map(x=>x.toString(16).padStart(2,'0')).join('');
  const expires=Date.now()+SESSION_TTL_MS;
  await env.DB.prepare('INSERT INTO sessions (token_hash, customer_id, expires_at, created_at) VALUES (?, ?, ?, ?)').bind(await sha256Hex(token),customerId,expires,new Date().toISOString()).run();
  return token;
}
async function membershipSummary(env,customer){
  const row=await env.DB.prepare(`SELECT COALESCE(SUM(subtotal),0) AS spend FROM orders WHERE customer_id=? AND datetime(created_at)>=datetime('now','-12 months') AND payment_status IN ('PAID','TEST_PAID') AND order_status NOT IN ('CANCELLED','REFUNDED')`).bind(customer.id).first();
  const spend=Math.max(0,Number(row?.spend)||0);
  const tiers=[{name:'Silver',min:1500},{name:'Gold',min:5000},{name:'Platinum',min:10000},{name:'Diamond',min:20000}];
  let current={name:'Not yet a member',min:0};let next=tiers[0];
  for(let i=0;i<tiers.length;i++){if(spend>=tiers[i].min){current=tiers[i];next=tiers[i+1]||null;}else{next=tiers[i];break;}}
  if(spend>=20000){current=tiers[3];next=null;}
  return {id:customer.id,name:customer.name,email:customer.email,tier:current.name,qualifyingSpend:spend,nextTier:next?.name||null,nextThreshold:next?.min??null,remaining:next?Math.max(0,next.min-spend):0,period:'rolling-12-months'};
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith('/api/')) {
      if (!sameOrigin(request, url)) return json({ error: 'Cross-origin request denied.' }, 403);

      if (path === '/api/health' && request.method === 'GET') {
        return json({ ok: true, mode: 'TEST', service: 'seven-perfume' });
      }

      if (path === '/api/catalog' && request.method === 'GET') {
        return json({ products: PRODUCTS, sizes: SIZES, regionZone: REGION_ZONE, rates: RATES, packagingWeight: PACKAGING_WEIGHT, testMode: true });
      }

      if (path.startsWith('/api/account/')) {
        if (!env.DB) return json({ error: 'Member accounts are not enabled yet. Connect the D1 database using the V9 setup guide before registering.' }, 503);
        if ((path === '/api/account/register' || path === '/api/account/login') && request.method === 'POST' && rateLimited(accountWindow, clientIp(request), 6)) return json({ error: 'Too many account attempts. Please wait a minute and try again.' }, 429);
        if (path === '/api/account/me' && request.method === 'GET') {
          const customer=await currentAccount(request,env);
          if(!customer)return json({error:'Please sign in to view your membership.'},401);
          return json({account:await membershipSummary(env,customer)});
        }
        if (path === '/api/account/register' && request.method === 'POST') {
          const parsed=await readJson(request);if(!parsed.ok)return parsed.response;
          const name=String(parsed.data?.name||'').trim().slice(0,100);
          const email=String(parsed.data?.email||'').trim().toLowerCase();
          const password=String(parsed.data?.password||'');
          if(name.length<2)return json({error:'Enter your full name.'},400);
          if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>160)return json({error:'Enter a valid email address.'},400);
          if(password.length<10||password.length>128)return json({error:'Password must be between 10 and 128 characters.'},400);
          const salt=randomBytes(16);const derived=await hashPassword(password,salt);const id=crypto.randomUUID();const createdAt=new Date().toISOString();
          try{await env.DB.prepare('INSERT INTO customers (id,name,email,password_salt,password_hash,created_at) VALUES (?,?,?,?,?,?)').bind(id,name,email,base64(salt),base64(derived),createdAt).run();}
          catch(error){if(String(error?.message||'').toLowerCase().includes('unique')||String(error?.message||'').toLowerCase().includes('constraint'))return json({error:'An account with this email already exists. Please sign in instead.'},409);throw error;}
          const token=await createSession(env,id);const account=await membershipSummary(env,{id,name,email});
          return json({account,message:'Your account has been created.'},201,{'set-cookie':sessionCookie(token)});
        }
        if (path === '/api/account/login' && request.method === 'POST') {
          const parsed=await readJson(request);if(!parsed.ok)return parsed.response;
          const email=String(parsed.data?.email||'').trim().toLowerCase();const password=String(parsed.data?.password||'');
          if(!email||!password)return json({error:'Enter your email and password.'},400);
          const customer=await env.DB.prepare('SELECT id,name,email,password_salt,password_hash FROM customers WHERE lower(email)=lower(?) LIMIT 1').bind(email).first();
          if(!customer)return json({error:'Email or password is incorrect.'},401);
          const computed=await hashPassword(password,fromBase64(customer.password_salt));
          if(!sameBytes(computed,fromBase64(customer.password_hash)))return json({error:'Email or password is incorrect.'},401);
          const token=await createSession(env,customer.id);const account=await membershipSummary(env,customer);
          return json({account,message:'Signed in successfully.'},200,{'set-cookie':sessionCookie(token)});
        }
        if (path === '/api/account/logout' && request.method === 'POST') {
          const token=cookieValue(request,SESSION_COOKIE);if(token)await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256Hex(token)).run();
          return json({ok:true},200,{'set-cookie':sessionCookie('',0)});
        }
        return json({error:'Not found.'},404);
      }

      if (path === '/api/orders' && request.method === 'GET') {
        if (rateLimited(adminWindow, clientIp(request), 8)) return json({ error: 'Too many admin attempts. Please wait a moment.' }, 429);
        if (!adminAuthorized(request, env)) return json({ error: env.ADMIN_TOKEN ? 'Unauthorized.' : 'Admin access is not configured.' }, env.ADMIN_TOKEN ? 401 : 503);
        if(env.DB){const rows=await env.DB.prepare('SELECT payload_json FROM orders ORDER BY created_at DESC LIMIT 500').all();return json({orders:(rows.results||[]).map(row=>{try{return JSON.parse(row.payload_json)}catch{return null}}).filter(Boolean),testMode:true});}
        return json({ orders: [...orders].reverse(), testMode: true });
      }

      if (path === '/api/orders' && request.method === 'DELETE') {
        if (rateLimited(adminWindow, clientIp(request), 8)) return json({ error: 'Too many admin attempts. Please wait a moment.' }, 429);
        if (!adminAuthorized(request, env)) return json({ error: env.ADMIN_TOKEN ? 'Unauthorized.' : 'Admin access is not configured.' }, env.ADMIN_TOKEN ? 401 : 503);
        orders.length = 0;
        if(env.DB)await env.DB.prepare('DELETE FROM orders').run();
        return json({ ok: true, testMode: true });
      }

      if (path === '/api/orders' && request.method === 'POST') {
        if (rateLimited(requestWindow, clientIp(request), MAX_ORDER_REQUESTS)) return json({ error: 'Too many order attempts. Please wait a moment and try again.' }, 429);
        const parsed = await readJson(request);
        if (!parsed.ok) return parsed.response;
        const result = buildOrder(parsed.data);
        if (!result.ok) return json({ error: result.error }, 400);
        const order = {
          id: `SP-${crypto.randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`,
          createdAt: new Date().toISOString(),
          paymentStatus: 'TEST_PAID',
          orderStatus: 'PROCESSING',
          ...result.order,
          mode: 'TEST',
        };
        if(env.DB){
          const account=await currentAccount(request,env);
          const customerId=account&&String(account.email).toLowerCase()===String(order.customer.email).toLowerCase()?account.id:null;
          await env.DB.prepare('INSERT INTO orders (id,customer_id,created_at,payment_status,order_status,subtotal,payload_json) VALUES (?,?,?,?,?,?,?)').bind(order.id,customerId,order.createdAt,order.paymentStatus,order.orderStatus,order.subtotal,JSON.stringify(order)).run();
          return json({order,testMode:true, vipCounted:Boolean(customerId)} ,201);
        }
        orders.push(order);
        return json({ order, testMode: true, vipCounted:false }, 201);
      }

      return json({ error: 'Not found.' }, 404);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return json({ error: 'Method not allowed.' }, 405);
    }

    if (path === '/admin') return Response.redirect(new URL('/admin.html', url), 302);
    return secure(await env.ASSETS.fetch(request));
  },
};
