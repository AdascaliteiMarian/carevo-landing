// app.js – doar cu DB (fără mock/fallback)

// ---------- Load products din DB ----------
async function loadProducts() {
  const res = await fetch('/.netlify/functions/getProducts');
  if (!res.ok) throw new Error('Eroare la încărcarea produselor');
  return await res.json();
}

(async () => {
  const PRODUCTS = await loadProducts();

  // --- Render produse (carduri)
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
        <ul class="features">${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
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

  document.querySelectorAll('[data-open-checkout]').forEach(el => {
    el.addEventListener('click', () => {
      ok.classList.add('hide');
      document.getElementById('order-form').reset();
      updateTotal();
      dlg.showModal();
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
    });
  });

  // --- Submit comandă (salvează în DB prin function saveOrder)
  document.getElementById('submit-order').addEventListener('click', async (e) => {
    e.preventDefault();
    const name = document.getElementById('n').value.trim();
    const phone = document.getElementById('p').value.trim();
    const address = document.getElementById('a').value.trim();
    const pid = select.value; const qtyVal = Math.max(1, +qty.value || 1);
    if (!name || !phone || !address) { alert('Te rugăm să completezi numele, telefonul și adresa.'); return; }

    const payload = { name, phone, address, product: pid, qty: qtyVal };
    const res = await fetch('/.netlify/functions/saveOrder', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      alert('Eroare la salvarea comenzii. Încearcă din nou.');
      return;
    }
    ok.classList.remove('hide');

    // close dialog and reset form after 5 seconds
    setTimeout(() => {
      dlg.close();
      document.getElementById('order-form').reset();
    }, 5000);
  });

  document.querySelectorAll('button[value="close"]').forEach(b => b.addEventListener('click', () => dlg.close()));

  // --- Modal Detalii produs (scrollable)
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
        pmFeatures.innerHTML = p.features.map(f => `<li>${f}</li>`).join('');
        pmDesc.textContent = p.desc || '';
        pm.showModal();
        pmToCart.onclick = () => {
          pm.close();
          select.value = p.id; updateTotal();
          dlg.showModal();
        };
      });
    });
    pmClose.addEventListener('click', () => pm.close());
  }

  // Footer year
  document.getElementById('y').textContent = new Date().getFullYear();
})();
