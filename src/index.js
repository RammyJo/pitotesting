// Seven Perfume Cloudflare Worker
// TEST backend only: order data is kept in memory until we add D1.
const orders = globalThis.__SEVEN_ORDERS__ || [];
globalThis.__SEVEN_ORDERS__ = orders;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'cache-control': 'no-store',
    },
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function validOrder(body) {
  return Boolean(
    body &&
    body.customer &&
    body.customer.name &&
    body.customer.email &&
    Array.isArray(body.items) &&
    body.items.length
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/orders') {
      if (request.method === 'GET') {
        return json({ orders: [...orders].reverse(), testMode: true });
      }

      if (request.method === 'DELETE') {
        orders.length = 0;
        return json({ ok: true, testMode: true });
      }

      if (request.method === 'POST') {
        const body = await readJson(request);
        if (!validOrder(body)) return json({ error: 'Invalid test order.' }, 400);

        const order = {
          id: `SP-${Math.floor(100000 + Math.random() * 900000)}`,
          createdAt: new Date().toISOString(),
          paymentStatus: 'TEST_PAID',
          orderStatus: 'PROCESSING',
          customer: body.customer,
          items: body.items,
          subtotal: Number(body.subtotal || 0),
          shipping: body.shipping || { courier: 'JNT', fee: 0, weight: 0, zone: '' },
          total: Number(body.total || 0),
        };

        orders.push(order);
        return json({ order, testMode: true }, 201);
      }

      return json({ error: 'Method not allowed.' }, 405);
    }

    // Everything else is served by Cloudflare's static-assets binding.
    return env.ASSETS.fetch(request);
  },
};
