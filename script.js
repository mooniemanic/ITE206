let cart = [];

// ====== MODAL ======
const openCartModal = (e) => {
  e?.preventDefault();
  document.getElementById('cart-modal').classList.add('active');
  document.getElementById('cart-backdrop').classList.add('active');
  displayCart();
};

const closeCartModal = () => {
  document.getElementById('cart-modal').classList.remove('active');
  document.getElementById('cart-backdrop').classList.remove('active');
};

document.addEventListener('keydown', (e) => e.key === 'Escape' && closeCartModal());

// ====== CART MANAGEMENT ======
const addToCart = (name, price) => {
  const item = cart.find(i => i.name === name);
  item ? item.quantity++ : cart.push({ name, price, quantity: 1 });
  updateCart();
  showNotification(`${name} added to cart!`);
};

const removeFromCart = name => {
  cart = cart.filter(i => i.name !== name);
  updateCart();
};

const updateCart = () => {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
};

const getCartTotal = () => cart.reduce((t, i) => t + (i.price * i.quantity), 0).toFixed(2);
const getCartItems = () => cart.reduce((t, i) => t + i.quantity, 0);
const updateCartCount = () => {
  const el = document.getElementById('cart-count');
  const floatingEl = document.getElementById('floating-cart-count');
  const count = getCartItems();
  if (el) el.textContent = count;
  if (floatingEl) floatingEl.textContent = count;
};

// ====== NOTIFICATIONS ======
const showNotification = msg => {
  const notif = document.createElement('div');
  notif.style.cssText = `position: fixed; top: 20px; right: 20px; background: #6b1e23; color: #f5e6d3; padding: 15px 25px; border-radius: 4px; border: 2px solid #d4af37; z-index: 2500; animation: slideIn 0.3s;`;
  notif.textContent = msg;
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
};

// ====== CART DISPLAY ======
const getProductInfo = btn => {
  const item = btn.closest('.product-item');
  return {
    name: item.querySelector('h3').textContent,
    price: parseFloat(item.querySelector('p').textContent.replace('$', ''))
  };
};

const displayCart = () => {
  const container = document.getElementById('cart-items-container');
  if (!cart.length) {
    container.innerHTML = `<div class="empty-cart"><p>🛒 Your cart is empty!</p><p>Add some items to get started.</p></div>`;
    return;
  }
  container.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="item-details">
        <h3>${item.name}</h3>
        <p class="item-price">$${item.price.toFixed(2)}</p>
      </div>
      <div class="item-quantity">
        <div class="quantity-controls">
          <button onclick="changeQty(${i}, -1)">−</button>
          <input type="number" value="${item.quantity}" onchange="changeQty(${i}, this.value)" min="1" class="qty-input">
          <button onclick="changeQty(${i}, 1)">+</button>
        </div>
      </div>
      <div>
        <p class="item-total">$${(item.price * item.quantity).toFixed(2)}</p>
        <button class="remove-item-btn" onclick="removeItem(${i})">✕</button>
      </div>
    </div>
  `).join('');
  updateOrderSummary();
};

const changeQty = (idx, change) => {
  const newQty = typeof change === 'string' ? parseInt(change) : cart[idx].quantity + change;
  if (newQty < 1) { showNotification('Quantity must be at least 1'); return; }
  cart[idx].quantity = newQty;
  updateCart();
  displayCart();
};

const removeItem = idx => {
  const name = cart[idx].name;
  cart.splice(idx, 1);
  updateCart();
  displayCart();
  showNotification(`${name} removed!`);
};

const updateOrderSummary = () => {
  const subtotal = cart.reduce((t, i) => t + (i.price * i.quantity), 0).toFixed(2);
  const tax = (subtotal * 0.1).toFixed(2);
  const total = (parseFloat(subtotal) + 10 + parseFloat(tax)).toFixed(2);
  
  document.getElementById('subtotal').textContent = `$${subtotal}`;
  document.getElementById('tax').textContent = `$${tax}`;
  document.getElementById('total').textContent = `$${total}`;
};

// ====== FORM VALIDATION ======
const validateForm = (name, email, msg) => {
  if (!name || name.length < 3) { showNotification('Name must be at least 3 characters'); return false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showNotification('Invalid email'); return false; }
  if (!msg || msg.length < 10) { showNotification('Message must be at least 10 characters'); return false; }
  return true;
};

// ====== CHECKOUT ======
const proceedToCheckout = () => {
  if (!cart.length) { showNotification('Cart is empty!'); return; }
  showNotification(`Proceeding to checkout. Total: ${document.getElementById('total').textContent}`);
  setTimeout(() => {
    showNotification('Order placed successfully!');
    cart = [];
    updateCart();
    displayCart();
    closeCartModal();
  }, 2000);
};

const continueShopping = () => {
  closeCartModal();
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
};

const clearCartConfirm = () => {
  if (confirm('Clear cart?')) { 
    cart = []; 
    updateCart(); 
    displayCart(); 
    showNotification('Cart cleared'); 
  }
};

// ====== PRODUCT DETAIL MODAL ======
let currentProduct = {};

const openProductDetail = (e) => {
  e.preventDefault();
  e.stopPropagation();
  const item = e.target.closest('.product-item');
  currentProduct = {
    name: item.dataset.name,
    price: parseFloat(item.dataset.price),
    image: item.dataset.image,
    description: item.dataset.description
  };
  
  document.getElementById('detail-image').src = currentProduct.image;
  document.getElementById('detail-name').textContent = currentProduct.name;
  document.getElementById('detail-description').textContent = currentProduct.description;
  document.getElementById('detail-price').textContent = `$${currentProduct.price.toFixed(2)}`;
  document.getElementById('detail-quantity').value = '1';
  
  document.getElementById('product-detail-modal').classList.add('active');
  document.getElementById('product-detail-backdrop').classList.add('active');
};

const closeProductDetail = () => {
  document.getElementById('product-detail-modal').classList.remove('active');
  document.getElementById('product-detail-backdrop').classList.remove('active');
};

const addFromDetail = () => {
  const qty = parseInt(document.getElementById('detail-quantity').value) || 1;
  for (let i = 0; i < qty; i++) {
    addToCart(currentProduct.name, currentProduct.price);
  }
  closeProductDetail();
};

const addToCartQuick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  const { name, price } = getProductInfo(e.target);
  addToCart(name, price);
};

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('cart');
  if (saved) cart = JSON.parse(saved);
  updateCartCount();

  // Only attach click handlers to "Add to Cart" buttons (not Details buttons)
  document.querySelectorAll('.product-item button').forEach(btn => {
    if (btn.textContent.trim() === 'Add to Cart') {
      btn.addEventListener('click', addToCartQuick);
    } else if (btn.textContent.trim() === 'Details') {
      btn.addEventListener('click', openProductDetail);
    }
  });

  const form = document.querySelector('.contact-us form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const msg = document.getElementById('message')?.value.trim();
      if (validateForm(name, email, msg)) {
        console.log('Form:', { name, email, msg });
        showNotification(`Thank you, ${name}! Message sent.`);
        form.reset();
      }
    });
  }

  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href?.startsWith('#') && href !== '#') {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
  `;
  document.head.appendChild(style);
});

