// --- Produse mock (am adăugat descriere lungă pentru modalul de detalii)
const PRODUCTS = [
  {
    id: "shampoo-01",
    name: "Șampon anti-mătreață – Natural Care",
    price: 56, oldPrice: 69, badge: "Nou",
    features: ["Pentru scalp sensibil", "Fără parabeni", "200 ml"],
    img: "https://hemerama.com/wp-content/uploads/2024/07/sampon-natural-1.png",
    desc: `Șampon delicat formulat pentru scalp sensibil, cu extracte botanice care reduc descuamarea și calmează senzația de mâncărime. Nu conține parabeni sau coloranți. Potrivit pentru utilizare frecventă.`
  },
  {
    id: "soap-01",
    name: "Săpun natural cu cărbune activ",
    price: 24, oldPrice: 29, badge: "Nou",
    features: ["Detoxifiant", "Miros fresh", "100 g"],
    img: "https://s13emagst.akamaized.net/products/54423/54422310/images/res_f9543ad9e824821ad516ecd673a4c4ad.jpg",
    desc: `Săpun artizanal cu cărbune activ pentru curățare profundă. Ajută la îndepărtarea impurităților și sebumului în exces, lăsând pielea curată și revigorată. Ideal pentru ten mixt/gras și pentru duș.`
  },
  {
    id: "cream-01",
    name: "Cremă pentru dureri musculare – ActiveFlex",
    price: 57, oldPrice: 69, badge: "Recomandat",
    features: ["Efect răcoritor", "Mentol & arnică", "125 ml"],
    img: "https://media.bebetei.ro/images/products-photos/gel-pentru-reducerea-durerii-sau-a-rigiditatii-musculare-promovia-100-ml-innate-3068.jpg",
    desc: `Formulă cu mentol, arnică și extracte naturale, concepută pentru a calma rapid tensiunea și disconfortul muscular după antrenament sau stat prelungit la birou. Se absoarbe rapid, fără senzație grasă.`
  },
  {
    id: "balm-01",
    name: "Balsam hidratant pentru buze – HydraShea",
    price: 19, oldPrice: 25, badge: "Promo",
    features: ["Unt de shea", "Fără parfum", "15 ml"],
    img: "https://ladys.ro/images/Balsam%20hidratant%20pentru%20buze%20Hydra%20-%20BF5029_b.jpg",
    desc: `Balsam cremos cu unt de shea și uleiuri vegetale. Hidratează intens buzele uscate și crăpate și le protejează de vânt și frig. Fără parfum adăugat.`
  },
  {
    id: "lotion-01",
    name: "Loțiune de corp cu ulei de cocos",
    price: 42, oldPrice: 55, badge: "Best Seller",
    features: ["Hidratare intensă", "Aromă exotică", "250 ml"],
    img: "https://media.bebetei.ro/gallery/17763/lotiune-de-corp-hidratanta-cu-ulei-de-cocos-si-vitamina-e-400ml-palmer-s-7793.jpg",
    desc: `Loțiune catifelată îmbogățită cu ulei de cocos și vitamina E. Oferă hidratare de durată și o aromă discretă, plăcută. Potrivită pentru toate tipurile de piele.`
  },
  {
    id: "facecream-01",
    name: "Cremă de față hidratantă – AquaBoost",
    price: 64, oldPrice: 79, badge: "Nou",
    features: ["Cu acid hialuronic", "Pentru ten uscat", "50 ml"],
    img: "https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/skn/skn01166/y/21.jpg",
    desc: `Cremă hidratantă bogată în acid hialuronic cu greutate moleculară mixtă pentru hidratare în profunzime. Lasă pielea suplă și luminoasă, excelentă ca bază pentru machiaj.`
  },
  {
    id: "mask-01",
    name: "Mască de păr reparatoare – KeratinFix",
    price: 49, oldPrice: 59, badge: "Top Rated",
    features: ["Repară părul degradat", "Cu keratină", "200 ml"],
    img: "https://hairjazz.ro/2514-medium_default/masca-intens-reparatoare-keratin-silk.jpg",
    desc: `Tratament intens pentru păr degradat. Keratina hidrolizată ajută la refacerea fibrei capilare, iar uleiurile vegetale conferă strălucire și elasticitate.`
  },
  {
    id: "oil-01",
    name: "Ulei esențial de lavandă",
    price: 29, oldPrice: 39, badge: "Nou",
    features: ["Relaxant", "100% natural", "30 ml"],
    img: "https://life-bio.ro/wp-content/uploads/2020/12/Ulei-esential-LAVANDA-OFFICINALE-10-ml-Generare-cu-FLORI-site.jpg",
    desc: `Ulei esențial pur de lavandă, cunoscut pentru proprietățile sale relaxante. Poate fi folosit în difuzor, baie sau diluat într-un ulei purtător pentru masaj.`
  }
];

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

function priceOf(id){ return PRODUCTS.find(p=>p.id===id)?.price || 0 }
function updateTotal(){ total.textContent = `Total: ${ priceOf(select.value) * Math.max(1, +qty.value||1) } lei` }
updateTotal();
qty.addEventListener('input', updateTotal);
select.addEventListener('change', updateTotal);

document.querySelectorAll('[data-open-checkout]').forEach(el=>{
  el.addEventListener('click', ()=>{
    ok.classList.add('hide');
    document.getElementById('order-form').reset();
    updateTotal();
    dlg.showModal();
  });
});

// Card → Comandă acum
document.querySelectorAll('[data-buy]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    select.value = btn.dataset.buy; updateTotal();
    ok.classList.add('hide');
    document.getElementById('order-form').reset();
    select.value = btn.dataset.buy; updateTotal();
    dlg.showModal();
  });
});

// Submit comandă (demo -> localStorage)
document.getElementById('submit-order').addEventListener('click',(e)=>{
  e.preventDefault();
  const name = document.getElementById('n').value.trim();
  const phone = document.getElementById('p').value.trim();
  const address = document.getElementById('a').value.trim();
  const pid = select.value; const qtyVal = Math.max(1, +qty.value||1);
  if(!name || !phone || !address){ alert('Te rugăm să completezi numele, telefonul și adresa.'); return; }
  const order = { id:'ord_'+Date.now(), name, phone, address, product:pid, qty:qtyVal, total:priceOf(pid)*qtyVal, createdAt:new Date().toISOString() };
  const prev = JSON.parse(localStorage.getItem('orders')||'[]');
  prev.push(order); localStorage.setItem('orders', JSON.stringify(prev));
  ok.classList.remove('hide');
});
document.querySelectorAll('button[value="close"]').forEach(b=>b.addEventListener('click',()=>dlg.close()));

// --- Modal Detalii produs (scrollable)
const pm = document.getElementById('product-modal');
const pmTitle = document.getElementById('pm-title');
const pmImg = document.getElementById('pm-img');
const pmBadge = document.getElementById('pm-badge');
const pmPrice = document.getElementById('pm-price');
const pmOld = document.getElementById('pm-old');
const pmFeatures = document.getElementById('pm-features');
const pmDesc = document.getElementById('pm-desc');
const pmClose = document.getElementById('pm-close');
const pmToCart = document.getElementById('pm-to-cart');

document.querySelectorAll('[data-details]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const p = PRODUCTS.find(x=>x.id===btn.dataset.details);
    if(!p) return;
    pmTitle.textContent = p.name;
    pmImg.src = p.img; pmImg.alt = p.name;
    pmBadge.textContent = p.badge || 'Produs';
    pmPrice.textContent = `${p.price} lei`;
    pmOld.textContent = p.oldPrice ? `${p.oldPrice} lei` : '';
    pmFeatures.innerHTML = p.features.map(f=>`<li>${f}</li>`).join('');
    pmDesc.textContent = p.desc || '';
    pm.showModal();
    pmToCart.onclick = ()=>{
      pm.close();
      // preselectează produsul în checkout
      select.value = p.id; updateTotal();
      dlg.showModal();
    };
  });
});
pmClose.addEventListener('click',()=>pm.close());

// Footer year
document.getElementById('y').textContent = new Date().getFullYear();
