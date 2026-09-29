const products = [
  { id: 'sol-01', name: 'Lola', shape: 'classique', label: 'LA PETITE CLASSIQUE', color: 'Écaille & miel', price: 89, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=85', tag: 'BEST-SELLER' },
  { id: 'sol-02', name: 'Milo', shape: 'audacieux', label: 'UN PEU DE CÔTÉ', color: 'Noir profond', price: 95, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85', tag: 'NOUVEAU' },
  { id: 'sol-03', name: 'Jeanne', shape: 'classique', label: 'L’ALLURE TRANQUILLE', color: 'Vert olive', price: 89, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85', tag: '' },
  { id: 'sol-04', name: 'Rio', shape: 'sport', label: 'JAMAIS À L’ARRÊT', color: 'Orange solaire', price: 99, image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=900&q=85', tag: 'UV400' },
  { id: 'sol-05', name: 'Simone', shape: 'audacieux', label: 'FAIT SON EFFET', color: 'Rouge cerise', price: 105, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85', tag: '' },
  { id: 'sol-06', name: 'Oscar', shape: 'sport', label: 'PRENDRE LE LARGE', color: 'Bleu minéral', price: 99, image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=900&q=85', tag: 'UV400' }
];

const productGrid = document.querySelector('.product-grid');
const filterButtons = document.querySelectorAll('.filter-button');
const searchInput = document.querySelector('.search-input');
const resultCount = document.querySelector('.result-count');
const emptyState = document.querySelector('.empty-state');
const cartPanel = document.querySelector('.cart-panel');
const cartBackdrop = document.querySelector('.cart-backdrop');
const cartItems = document.querySelector('.cart-items');
const cartEmpty = document.querySelector('.cart-empty');
const cartFooter = document.querySelector('.cart-footer');
const cartCount = document.querySelector('.cart-count');
const cartHeadingCount = document.querySelector('.cart-heading-count');
const toast = document.querySelector('.toast');
let activeFilter = 'tous';
let cart = loadCart();
let toastTimer;

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('soleil-cart') || '[]');
    return Array.isArray(saved) ? saved.filter(item => products.some(product => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0) : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem('soleil-cart', JSON.stringify(cart));
}

function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
}

function renderProducts() {
  const search = searchInput.value.trim().toLocaleLowerCase('fr');
  const visibleProducts = products.filter(product => {
    const matchesFilter = activeFilter === 'tous' || product.shape === activeFilter;
    const matchesSearch = `${product.name} ${product.label} ${product.color}`.toLocaleLowerCase('fr').includes(search);
    return matchesFilter && matchesSearch;
  });

  productGrid.innerHTML = visibleProducts.map((product, index) => `
    <article class="product-card" style="animation-delay:${index * 55}ms">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="Lunettes de soleil ${product.name}, ${product.color}" loading="lazy">
        ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}
        <button class="add-button" type="button" data-add="${product.id}" aria-label="Ajouter ${product.name} au panier">+</button>
      </div>
      <div class="product-info">
        <div><h3 class="product-name">${product.name} <span aria-hidden="true">—</span> ${product.label}</h3><p class="product-detail">${product.color} · Verres UV400</p></div>
        <span class="product-price">${formatPrice(product.price)}</span>
      </div>
    </article>
  `).join('');

  resultCount.textContent = `${visibleProducts.length} modèle${visibleProducts.length > 1 ? 's' : ''}`;
  emptyState.hidden = visibleProducts.length > 0;
}

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + products.find(product => product.id === item.id).price * item.quantity, 0);
  cartCount.textContent = totalItems;
  cartHeadingCount.textContent = `(${totalItems})`;
  document.querySelector('.cart-trigger').setAttribute('aria-label', `Ouvrir le panier, ${totalItems} article${totalItems > 1 ? 's' : ''}`);
  cartEmpty.hidden = totalItems > 0;
  cartFooter.hidden = totalItems === 0;
  document.querySelector('.cart-total').textContent = formatPrice(totalPrice);

  cartItems.innerHTML = cart.map(item => {
    const product = products.find(entry => entry.id === item.id);
    return `
      <article class="cart-item">
        <img src="${product.image}" alt="" loading="lazy">
        <div><h3>${product.name} — ${product.label}</h3><p>${product.color}</p>
          <div class="quantity-control" aria-label="Quantité pour ${product.name}">
            <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Retirer une unité">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Ajouter une unité">+</button>
          </div>
        </div>
        <span class="cart-item-price">${formatPrice(product.price * item.quantity)}</span>
      </article>
    `;
  }).join('');
}

function setCartOpen(isOpen) {
  cartPanel.classList.toggle('is-open', isOpen);
  cartBackdrop.hidden = !isOpen;
  cartPanel.setAttribute('aria-hidden', String(!isOpen));
  cartPanel.inert = !isOpen;
  document.body.classList.toggle('cart-open', isOpen);
  if (isOpen) document.querySelector('.cart-close').focus();
  else document.querySelector('.cart-trigger').focus();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach(filter => {
      const isActive = filter === button;
      filter.classList.toggle('is-active', isActive);
      filter.setAttribute('aria-pressed', String(isActive));
    });
    renderProducts();
  });
});

searchInput.addEventListener('input', renderProducts);
productGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const product = products.find(item => item.id === button.dataset.add);
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) existingItem.quantity += 1;
  else cart.push({ id: product.id, quantity: 1 });
  saveCart();
  renderCart();
  showToast(`${product.name} a rejoint votre panier`);
});

cartItems.addEventListener('click', event => {
  const button = event.target.closest('[data-quantity]');
  if (!button) return;
  const item = cart.find(entry => entry.id === button.dataset.quantity);
  item.quantity += Number(button.dataset.change);
  if (item.quantity <= 0) cart = cart.filter(entry => entry !== item);
  saveCart();
  renderCart();
});

document.querySelector('.cart-trigger').addEventListener('click', () => setCartOpen(true));
document.querySelector('.cart-close').addEventListener('click', () => setCartOpen(false));
cartBackdrop.addEventListener('click', () => setCartOpen(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && cartPanel.classList.contains('is-open')) setCartOpen(false);
});
document.querySelector('.checkout-button').addEventListener('click', () => {
  document.querySelector('.checkout-message').textContent = 'Merci ! Le paiement en ligne sera bientôt disponible.';
});

renderProducts();
renderCart();
