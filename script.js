/* =========================================
   GR!M's LAIR — script.js
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAVBAR: scroll effect + active link ── */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    backTopBtn.classList.toggle('visible', window.scrollY > 400);
    highlightNav();
    countUpObserver();
  });

  function highlightNav() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  /* ── HAMBURGER / MOBILE MENU ── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  document.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  /* ── HERO SLIDESHOW ── */
  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.getElementById('heroDots');
  let currentSlide = 0;
  let slideTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  function goToSlide(n) {
    slides[currentSlide].classList.remove('active');
    dotsContainer.children[currentSlide].classList.remove('active');
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dotsContainer.children[currentSlide].classList.add('active');
    clearInterval(slideTimer);
    slideTimer = setInterval(() => goToSlide(currentSlide + 1), 5500);
  }

  slideTimer = setInterval(() => goToSlide(currentSlide + 1), 5500);

  /* ── GAME FILTER ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const gameCards = document.querySelectorAll('.game-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      gameCards.forEach(card => {
        const show = filter === 'all' || card.dataset.cat === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  /* ── WISHLIST BUTTONS ── */
  document.querySelectorAll('.btn-wishlist').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.classList.toggle('wishlisted');
      const icon = btn.querySelector('i');
      icon.classList.toggle('far');
      icon.classList.toggle('fas');
      showToast(btn.classList.contains('wishlisted') ? '❤️ Added to wishlist!' : '🤍 Removed from wishlist');
    });
  });

  /* ── CART ── */
  let cart = [];
  const cartSidebar = document.getElementById('cartSidebar');
  const cartBadge = document.getElementById('cartBadge');
  const cartItemsEl = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotal = document.getElementById('cartTotal');
  const overlay = document.getElementById('overlay');

  function openCart() {
    cartSidebar.classList.add('open');
    overlay.classList.add('active');
  }
  function closeCart() {
    cartSidebar.classList.remove('open');
    if (!document.getElementById('loginModal').classList.contains('open')) {
      overlay.classList.remove('active');
    }
  }

  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  overlay.addEventListener('click', () => { closeCart(); closeModal(); });

  function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ name, price: parseFloat(price), qty: 1 });
    }
    renderCart();
    showToast(`🛒 "${name}" added to cart!`);
  }

  function renderCart() {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const count = cart.reduce((s, i) => s + i.qty, 0);
    cartBadge.textContent = count;
    cartTotal.textContent = '$' + total.toFixed(2);
    cartFooter.style.display = cart.length ? '' : 'none';

    if (cart.length === 0) {
      cartItemsEl.innerHTML = `
        <div class="cart-empty">
          <i class="fas fa-ghost"></i>
          <p>Your cart is haunted by emptiness.</p>
        </div>`;
      return;
    }

    cartItemsEl.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-qty">
          <button onclick="changeQty(${idx}, -1)">-</button>
          ${item.qty}
          <button onclick="changeQty(${idx}, 1)">+</button>
        </div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
      </div>`).join('');
  }

  window.changeQty = (idx, delta) => {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    renderCart();
  };

  // Store buy buttons
  document.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const price = btn.dataset.price;
      addToCart(name, price);
    });
  });

  // Game card "Add to Cart"
  document.querySelectorAll('.btn-card-buy').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.closest('.game-card-overlay').querySelector('h3').textContent;
      addToCart(name, (Math.random() * 40 + 19.99).toFixed(2));
    });
  });

  document.querySelector('.btn-checkout')?.addEventListener('click', () => {
    showToast('✅ Redirecting to checkout…');
  });

  /* ── LOGIN MODAL ── */
  const loginModal = document.getElementById('loginModal');
  const loginBtn = document.getElementById('loginBtn');
  const modalClose = document.getElementById('modalClose');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  function openModal() {
    loginModal.classList.add('open');
    overlay.classList.add('active');
  }
  function closeModal() {
    loginModal.classList.remove('open');
    if (!cartSidebar.classList.contains('open')) {
      overlay.classList.remove('active');
    }
  }

  loginBtn.addEventListener('click', openModal);
  modalClose.addEventListener('click', closeModal);

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // Password toggle
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.querySelector('i').className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
    });
  });

  /* ── STORE CAROUSEL ── */
  const storeTrack = document.getElementById('storeTrack');
  const scrollAmt = 300;

  document.getElementById('storeLeft').addEventListener('click', () => {
    storeTrack.scrollBy({ left: -scrollAmt, behavior: 'smooth' });
  });
  document.getElementById('storeRight').addEventListener('click', () => {
    storeTrack.scrollBy({ left: scrollAmt, behavior: 'smooth' });
  });

  /* ── SEARCH ── */
  const gameData = [
    { name: 'Ghost of Tsushima', tag: 'Action', id: 'games' },
    { name: 'Elden Ring', tag: 'RPG', id: 'games' },
    { name: 'Sekiro', tag: 'Action', id: 'games' },
    { name: "Baldur's Gate 3", tag: 'RPG', id: 'games' },
    { name: 'Spider-Man 2', tag: 'Action', id: 'games' },
    { name: 'Alan Wake 2', tag: 'Horror', id: 'games' },
    { name: 'The Witcher 3', tag: 'RPG', id: 'games' },
    { name: 'God of War', tag: 'Action', id: 'games' },
    { name: 'Hades', tag: 'Indie', id: 'games' },
    { name: 'Resident Evil 4', tag: 'Horror', id: 'games' },
    { name: 'Hollow Knight', tag: 'Indie', id: 'games' },
    { name: 'Celeste', tag: 'Indie', id: 'games' },
    { name: "Ghost of Yōtei", tag: 'News', id: 'newswire' },
    { name: 'Cyberpunk 2', tag: 'News', id: 'newswire' },
    { name: 'Silent Hill 4 Vinyl', tag: 'Store', id: 'store' },
    { name: 'Hollow Knight Figurines', tag: 'Store', id: 'store' },
    { name: 'Chthonic Gods Poster', tag: 'Store', id: 'store' },
  ];

  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const iconMap = { Action: 'fa-bolt', RPG: 'fa-dragon', Horror: 'fa-ghost',
    Indie: 'fa-star', News: 'fa-newspaper', Store: 'fa-shopping-bag' };

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { searchResults.classList.remove('open'); return; }

    const matches = gameData.filter(g => g.name.toLowerCase().includes(q)).slice(0, 6);
    if (!matches.length) {
      searchResults.innerHTML = `<div class="search-result-item"><i class="fas fa-times"></i> No results found</div>`;
    } else {
      searchResults.innerHTML = matches.map(m => `
        <div class="search-result-item" data-id="${m.id}">
          <i class="fas ${iconMap[m.tag] || 'fa-gamepad'}"></i>
          ${m.name} <span style="margin-left:auto;font-size:0.75rem;color:var(--text-mute)">${m.tag}</span>
        </div>`).join('');
      searchResults.querySelectorAll('.search-result-item[data-id]').forEach(item => {
        item.addEventListener('click', () => {
          document.getElementById(item.dataset.id)?.scrollIntoView({ behavior: 'smooth' });
          searchInput.value = '';
          searchResults.classList.remove('open');
        });
      });
    }
    searchResults.classList.add('open');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#searchWrap')) searchResults.classList.remove('open');
  });

  /* ── SCROLL REVEAL ── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ── STAT COUNTER ── */
  const statNums = document.querySelectorAll('.stat-num');
  let statsTriggered = false;

  function countUpObserver() {
    if (statsTriggered) return;
    const section = document.getElementById('community');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.8) {
      statsTriggered = true;
      statNums.forEach(el => countUp(el, parseInt(el.dataset.target)));
    }
  }

  function countUp(el, target) {
    const duration = 2000;
    const start = performance.now();
    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(ease * target);
      el.textContent = value >= 1000 ? (value / 1000).toFixed(value >= 10000 ? 0 : 1) + 'K' : value;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target >= 1000 ? (target / 1000).toFixed(target >= 10000 ? 0 : 1) + 'K' : target;
    }
    requestAnimationFrame(update);
  }

  /* ── BACK TO TOP ── */
  const backTopBtn = document.getElementById('backTop');
  backTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── TOAST ── */
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
  }

  /* ── KEYBOARD: close modal on Escape ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); closeCart(); }
  });

  /* Initial render */
  renderCart();
});