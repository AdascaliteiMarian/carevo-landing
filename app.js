// app.js – DB only (no mock/fallback)

// ---------- Load products from DB ----------
async function loadProducts() {
  const res = await fetch('/.netlify/functions/getProducts');
  if (!res.ok) throw new Error('Eroare la încărcarea produselor');
  return await res.json();
}

(async () => {
  const PRODUCTS = await loadProducts();

  // --- Render products (cards)
  const grid = document.getElementById('product-grid');
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="card" data-id="${p.id}">
      <img class="img" src="${p.img}" alt="${p.name}" />
      <div class="body">
        <div class="pill">${p.badge || 'Popular'}</div>
        <h3 style="margin:8px 0 4px; font-size:18px">${p.name}</h3>
        <div class="price">
          <span class="now">${p.price} lei</span>
          ${p.oldPrice ? `<span class="old">${p.oldPrice} lei</span>` : ''}
        </div>
        <ul class="features">${(p.features || []).map(f => `<li>${f}</li>`).join('')}</ul>
        <div class="actions">
          <button class="btn" data-buy="${p.id}">Comandă acum</button>
          <button class="btn secondary" data-details="${p.id}">Detalii</button>
        </div>
      </div>
    </article>
  `).join('');

  // --- Checkout
  const dlg = document.getElementById('checkout');
  const select = document.getElementById('prod');
  const qty = document.getElementById('q');
  const total = document.getElementById('total');
  const ok = document.getElementById('ok');

  select.innerHTML = PRODUCTS.map(p => `<option value="${p.id}" data-price="${p.price}">${p.name} — ${p.price} lei</option>`).join('');

  function priceOf(id) { return PRODUCTS.find(p => p.id === id)?.price || 0 }
  function updateTotal() { total.textContent = `Total: ${priceOf(select.value) * Math.max(1, +qty.value || 1)} lei` }
  updateTotal();
  qty.addEventListener('input', updateTotal);
  select.addEventListener('change', updateTotal);

  // Open checkout (global button)
  document.querySelectorAll('[data-open-checkout]').forEach(el => {
    el.addEventListener('click', () => {
      ok.classList.add('hide');
      document.getElementById('order-form').reset();
      updateTotal();
      dlg.showModal();
      trackBeginCheckout(select.value); // Meta Pixel: InitiateCheckout
    });
  });

  // Card → Comandă acum
  document.querySelectorAll('[data-buy]').forEach(btn => {
    btn.addEventListener('click', () => {
      select.value = btn.dataset.buy; updateTotal();
      ok.classList.add('hide');
      document.getElementById('order-form').reset();
      select.value = btn.dataset.buy; updateTotal();
      dlg.showModal();
      trackBeginCheckout(select.value); // Meta Pixel: InitiateCheckout
    });
  });

  // --- Submit order (save to DB through saveOrder function)
  document.getElementById('submit-order').addEventListener('click', async (e) => {
    e.preventDefault();
    const name = document.getElementById('n').value.trim();
    const phone = document.getElementById('p').value.trim();
    const address = document.getElementById('a').value.trim();
    const pid = select.value;
    const qtyVal = Math.max(1, +qty.value || 1);

    if (!name || !phone || !address) {
      alert('Te rugăm să completezi numele, telefonul și adresa.');
      return;
    }

    const payload = { name, phone, address, product: pid, qty: qtyVal };

    let data;
    try {
      const res = await fetch('/.netlify/functions/saveOrder', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      data = await res.json();
      if (!res.ok || !data?.ok) throw new Error('Save failed');
    } catch (err) {
      alert('Eroare la salvarea comenzii. Încearcă din nou.');
      return;
    }

    // Success UI
    ok.classList.remove('hide');

    // ---- Meta Pixel: Purchase ----
    try {
      const price = priceOf(pid);
      const orderTotal = price * qtyVal;
      trackPurchase({
        id: data?.orderId || ('ord_' + Date.now()),
        product: pid,
        qty: qtyVal,
        total: orderTotal
      });
    } catch (_) {}

    // close dialog and reset form after 5 seconds
    setTimeout(() => {
      dlg.close();
      document.getElementById('order-form').reset();
    }, 5000);
  });

  document.querySelectorAll('button[value="close"]').forEach(b => b.addEventListener('click', () => dlg.close()));

  // --- Product Details Modal (scrollable) + Meta Pixel ViewContent
  const pm = document.getElementById('product-modal');
  if (pm) {
    const pmTitle = document.getElementById('pm-title');
    const pmImg = document.getElementById('pm-img');
    const pmBadge = document.getElementById('pm-badge');
    const pmPrice = document.getElementById('pm-price');
    const pmOld = document.getElementById('pm-old');
    const pmFeatures = document.getElementById('pm-features');
    const pmDesc = document.getElementById('pm-desc');
    const pmClose = document.getElementById('pm-close');
    const pmToCart = document.getElementById('pm-to-cart');

    document.querySelectorAll('[data-details]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = PRODUCTS.find(x => x.id === btn.dataset.details);
        if (!p) return;

        pmTitle.textContent = p.name;
        pmImg.src = p.img; pmImg.alt = p.name;
        pmBadge.textContent = p.badge || 'Produs';
        pmPrice.textContent = `${p.price} lei`;
        pmOld.textContent = p.oldPrice ? `${p.oldPrice} lei` : '';
        pmFeatures.innerHTML = (p.features || []).map(f => `<li>${f}</li>`).join('');
        pmDesc.textContent = p.desc || '';

        pm.showModal();

        // Meta Pixel: ViewContent
        trackViewContent({
          id: p.id,
          name: p.name,
          price: p.price
        });

        pmToCart.onclick = () => {
          pm.close();
          select.value = p.id; updateTotal();
          dlg.showModal();
          trackBeginCheckout(select.value); // starting checkout from modal → InitiateCheckout
        };
      });
    });

    pmClose.addEventListener('click', () => pm.close());
  }

  // Footer year
  document.getElementById('y').textContent = new Date().getFullYear();
})();

// =====================
// Meta Pixel helpers
// =====================

// Track when checkout is opened
function trackBeginCheckout(productId) {
  try {
    if (window.fbq) fbq('track', 'InitiateCheckout', {
      content_ids: [productId || '(unknown)'],
      content_type: 'product'
    });
  } catch (_) {}
}

// Track when a product detail is viewed
function trackViewContent(product) {
  try {
    if (window.fbq) fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: 'RON'
    });
  } catch (_) {}
}

// Track purchase after successful order save
function trackPurchase(order) {
  try {
    if (window.fbq) fbq('track', 'Purchase', {
      currency: 'RON',
      value: order.total,
      contents: [{ id: order.product, quantity: order.qty }],
      content_type: 'product'
    });
  } catch (_) {}
}
