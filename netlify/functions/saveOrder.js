import { neon } from '@netlify/neon';

const sql = neon();

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { name, phone, address, product: productId, qty } =
      JSON.parse(event.body || '{}');

    if (!name || !phone || !address || !productId || !qty) {
      return { statusCode: 400, body: 'Missing fields' };
    }

    const [p] = await sql`select id, price from products where id = ${productId}`;
    if (!p) return { statusCode: 404, body: 'Product not found' };

    const quantity = Math.max(1, parseInt(qty, 10) || 1);
    const unitPrice = p.price;
    const total = unitPrice * quantity;

    const [row] = await sql`
      insert into orders (name, phone, address, product_id, qty, unit_price, total)
      values (${name}, ${phone}, ${address}, ${productId}, ${quantity}, ${unitPrice}, ${total})
      returning id, created_at as "createdAt", total
    `;

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, order: row }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'DB_ERROR', details: String(err) }),
    };
  }
}
