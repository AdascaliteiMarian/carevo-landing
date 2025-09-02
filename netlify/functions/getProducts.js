import { neon } from '@netlify/neon';

const sql = neon(); // folosește NETLIFY_DATABASE_URL automat

export async function handler() {
  try {
    const rows = await sql`
      select id, name, price, old_price as "oldPrice",
             badge, features, img, description as "desc"
      from products
      order by name;
    `;
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(rows),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'DB_ERROR', details: String(err) }),
    };
  }
}
