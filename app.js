const app = document.querySelector("#app");
const cartCount = document.querySelector("#cartCount");
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");
const toast = document.querySelector("#toast");
const confettiCanvas = document.querySelector("#confettiCanvas");
const currency = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

let cart = JSON.parse(localStorage.getItem("westbergCart") || "[]");
let selectedCategory = "all";

const categoryLabels = {
  all: "Alle Produkte",
  herren: "Herren",
  damen: "Damen",
  unisex: "Unisex",
  accessoires: "Accessoires",
};

function formatPrice(price) {
  return currency.format(price);
}

function saveCart() {
  localStorage.setItem("westbergCart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = total;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function closeMobileNav() {
  mainNav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}

function productById(id) {
  return WESTBERG_PRODUCTS.find((product) => product.id === id);
}

function filteredProducts(category = "all") {
  if (category === "all") return WESTBERG_PRODUCTS;
  if (category === "damen") {
    return WESTBERG_PRODUCTS.filter((product) => product.category === "unisex" || product.category === "accessoires");
  }
  return WESTBERG_PRODUCTS.filter((product) => product.category === category || product.category === "unisex");
}

function productCard(product) {
  return `
    <article class="product-card">
      <a class="product-image" href="#product/${product.id}" aria-label="${product.name} Details ansehen">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </a>
      <div class="product-body">
        <div class="product-meta">
          <h3>${product.name}</h3>
          <span class="price">${formatPrice(product.price)}</span>
        </div>
        <p>${product.description}</p>
        <a class="link-button" href="#product/${product.id}">Details</a>
      </div>
    </article>
  `;
}

function productGrid(products) {
  return `<div class="product-grid">${products.map(productCard).join("")}</div>`;
}

function renderHome() {
  const newProducts = WESTBERG_PRODUCTS.slice(0, 4);
  const popularProducts = [productById("tshirt"), productById("jogginganzug"), productById("cap"), productById("jeanshose-kurz")];
  const denimHero = productById("jeanshose-lang").image;
  const tracksuitHero = productById("jogginganzug").image;
  const tshirtHero = productById("tshirt").image;

  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Neue WESTBERG Kollektion</p>
        <h1>Designed for Everyday Adventures</h1>
        <p>Minimalistische Essentials, klare Schnitte und Premium-Basics für Schule, Stadt und Freizeit.</p>
        <div class="hero-actions">
          <a class="btn" href="#collection">Kollektion ansehen</a>
          <a class="btn btn-secondary" href="#product/jogginganzug">Signature Set</a>
        </div>
      </div>
      <div class="hero-media" aria-label="WESTBERG Kampagnenbilder">
        <img src="${tracksuitHero}" alt="WESTBERG Jogginganzug Kampagnenbild" />
        <img src="${tshirtHero}" alt="WESTBERG T-Shirt Kampagnenbild" />
      </div>
    </section>

    <section class="section" id="new">
      <div class="section-header">
        <div>
          <p class="eyebrow">Drop 01</p>
          <h2>Neue Kollektion</h2>
        </div>
        <a class="link-button" href="#collection">Alle Produkte</a>
      </div>
      ${productGrid(newProducts)}
    </section>

    <section class="editorial-band">
      <img src="${denimHero}" alt="WESTBERG Denim Look" loading="lazy" />
      <div class="editorial-copy">
        <p class="eyebrow">Everyday Uniform</p>
        <h2>Premium Basics mit entspannter Silhouette.</h2>
        <p class="muted">WESTBERG verbindet cleane Farben, komfortable Fits und moderne Streetwear-Details.</p>
        <div class="action-row">
          <a class="btn" href="#category/herren">Herren</a>
          <a class="btn btn-alternate" href="#category/damen">Damen</a>
        </div>
      </div>
    </section>

    <section class="section" id="popular">
      <div class="section-header">
        <div>
          <p class="eyebrow">Favorites</p>
          <h2>Beliebte Produkte</h2>
        </div>
      </div>
      ${productGrid(popularProducts)}
    </section>

    ${renderNewsletter()}
    ${renderAboutContact()}
  `;
}

function renderCollection(category = "all") {
  selectedCategory = category;
  const products = filteredProducts(category);
  app.innerHTML = `
    <section class="section section-tight">
      <div class="section-header">
        <div>
          <p class="eyebrow">WESTBERG Store</p>
          <h1>${categoryLabels[category] || "Kollektion"}</h1>
          <p class="muted">${products.length} ausgewählte Pieces für moderne Everyday-Looks.</p>
        </div>
        <div class="toolbar" aria-label="Produktfilter">
          ${["all", "herren", "damen", "unisex", "accessoires"]
            .map(
              (filter) => `
                <button class="pill ${filter === selectedCategory ? "active" : ""}" type="button" data-filter="${filter}">
                  ${categoryLabels[filter]}
                </button>
              `
            )
            .join("")}
        </div>
      </div>
      ${productGrid(products)}
    </section>
  `;

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      location.hash = button.dataset.filter === "all" ? "#collection" : `#category/${button.dataset.filter}`;
    });
  });
}

function renderProductDetail(id) {
  const product = productById(id);
  if (!product) {
    renderNotFound();
    return;
  }

  const defaultColor = product.colors[0];
  app.innerHTML = `
    <section class="detail" data-product-detail="${product.id}">
      <div class="gallery">
        <div class="thumbs">
          ${product.images
            .map(
              (image, index) => `
              <button class="thumb ${index === 0 ? "active" : ""}" type="button" data-gallery-image="${image}">
                <img src="${image}" alt="${product.name} Ansicht ${index + 1}" />
              </button>
            `
            )
            .join("")}
        </div>
        <div class="main-product-image">
          <img id="mainProductImage" src="${product.images[0]}" alt="${product.name}" />
        </div>
      </div>

      <div class="detail-panel">
        <p class="eyebrow">${categoryLabels[product.category] || "WESTBERG"}</p>
        <h1>${product.name}</h1>
        <p class="price">${formatPrice(product.price)}</p>
        <p class="muted">${product.description}</p>

        <div class="selector-group">
          <div class="selector-title"><span>Größe</span><span id="selectedSizeLabel">${product.sizes[0]}</span></div>
          <div class="option-row" id="sizeOptions">
            ${product.sizes
              .map(
                (size, index) => `<button class="size-option ${index === 0 ? "active" : ""}" type="button" data-size="${size}">${size}</button>`
              )
              .join("")}
          </div>
        </div>

        <div class="selector-group">
          <div class="selector-title"><span>Farbe</span><span id="selectedColorLabel">${defaultColor.name}</span></div>
          <div class="option-row" id="colorOptions">
            ${product.colors
              .map(
                (color, index) => `
                <button class="color-option ${index === 0 ? "active" : ""}" type="button" data-color="${color.name}" data-color-image="${color.image || ""}">
                  <span class="swatch" style="background:${color.value}"></span>${color.name}
                </button>
              `
              )
              .join("")}
          </div>
        </div>

        <div class="selector-group">
          <div class="selector-title"><span>Menge</span><span>${product.stock} verfügbar</span></div>
          <div class="quantity">
            <button type="button" data-qty-minus aria-label="Menge verringern">-</button>
            <input id="quantityInput" type="number" min="1" max="${product.stock}" value="1" inputmode="numeric" />
            <button type="button" data-qty-plus aria-label="Menge erhöhen">+</button>
          </div>
        </div>

        <div class="action-row">
          <button class="btn" type="button" id="addToCartButton">In den Warenkorb</button>
          <button class="btn btn-secondary" type="button" id="wishlistButton">Zur Wunschliste</button>
        </div>

        <div class="info-list">
          <span><strong>Material:</strong> ${product.material}</span>
          <span><strong>Kategorie:</strong> ${categoryLabels[product.category] || product.category}</span>
          <span><strong>Hinweis:</strong> Schulprojekt, keine echte Kaufabwicklung.</span>
        </div>
      </div>
    </section>
  `;

  bindProductDetail(product);
}

function bindProductDetail(product) {
  let selectedSize = product.sizes[0];
  let selectedColor = product.colors[0].name;
  const mainImage = document.querySelector("#mainProductImage");
  const quantityInput = document.querySelector("#quantityInput");

  document.querySelectorAll("[data-gallery-image]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".thumb").forEach((thumb) => thumb.classList.remove("active"));
      button.classList.add("active");
      mainImage.src = button.dataset.galleryImage;
    });
  });

  document.querySelectorAll("[data-size]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedSize = button.dataset.size;
      document.querySelectorAll(".size-option").forEach((option) => option.classList.remove("active"));
      button.classList.add("active");
      document.querySelector("#selectedSizeLabel").textContent = selectedSize;
    });
  });

  document.querySelectorAll("[data-color]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedColor = button.dataset.color;
      document.querySelectorAll(".color-option").forEach((option) => option.classList.remove("active"));
      button.classList.add("active");
      document.querySelector("#selectedColorLabel").textContent = selectedColor;
      if (button.dataset.colorImage) mainImage.src = button.dataset.colorImage;
    });
  });

  document.querySelector("[data-qty-minus]").addEventListener("click", () => {
    quantityInput.value = Math.max(1, Number(quantityInput.value) - 1);
  });

  document.querySelector("[data-qty-plus]").addEventListener("click", () => {
    quantityInput.value = Math.min(product.stock, Number(quantityInput.value) + 1);
  });

  document.querySelector("#wishlistButton").addEventListener("click", () => {
    showToast(`${product.name} wurde zur Wunschliste hinzugefügt.`);
  });

  document.querySelector("#addToCartButton").addEventListener("click", () => {
    const quantity = Math.max(1, Math.min(product.stock, Number(quantityInput.value) || 1));
    addToCart(product, selectedSize, selectedColor, quantity);
    fireConfetti();
    playAddSound();
  });
}

function addToCart(product, size, color, quantity) {
  const key = `${product.id}-${size}-${color}`;
  const current = cart.find((item) => item.key === key);
  if (current) {
    current.quantity += quantity;
  } else {
    cart.push({
      key,
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      color,
      quantity,
    });
  }
  saveCart();
  showToast(`${product.name} liegt im Warenkorb.`);
}

function renderCart() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  app.innerHTML = `
    <section class="cart-layout">
      <div>
        <p class="eyebrow">Shopping Bag</p>
        <h1>Warenkorb</h1>
        ${
          cart.length
            ? `<div class="cart-items">${cart.map(cartItemTemplate).join("")}</div>`
            : `<div class="empty-state"><h2>Dein Warenkorb ist leer.</h2><p class="muted">Entdecke die neue WESTBERG Kollektion.</p><a class="btn" href="#collection">Jetzt shoppen</a></div>`
        }
      </div>
      <aside class="summary" aria-label="Warenkorb Zusammenfassung">
        <h3>Zusammenfassung</h3>
        <div class="summary-row"><span>Zwischensumme</span><strong>${formatPrice(subtotal)}</strong></div>
        <div class="summary-row"><span>Versand</span><span>Kostenlos</span></div>
        <div class="summary-row total"><span>Gesamt</span><span>${formatPrice(subtotal)}</span></div>
        <a class="btn btn-full ${cart.length ? "" : "disabled"}" href="${cart.length ? "#checkout" : "#collection"}">Zur Kasse</a>
      </aside>
    </section>
  `;

  document.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      cart = cart.filter((item) => item.key !== button.dataset.remove);
      saveCart();
      renderCart();
      showToast("Produkt wurde entfernt.");
    });
  });

  document.querySelectorAll("[data-cart-qty]").forEach((input) => {
    input.addEventListener("change", () => {
      const item = cart.find((entry) => entry.key === input.dataset.cartQty);
      if (!item) return;
      item.quantity = Math.max(1, Number(input.value) || 1);
      saveCart();
      renderCart();
    });
  });
}

function cartItemTemplate(item) {
  return `
    <article class="cart-item">
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <h3>${item.name}</h3>
        <p class="muted">Größe: ${item.size} | Farbe: ${item.color}</p>
        <p>Einzelpreis: <strong>${formatPrice(item.price)}</strong></p>
      </div>
      <div class="cart-controls">
        <label>
          <span class="selector-title">Menge</span>
          <input class="field" type="number" min="1" value="${item.quantity}" data-cart-qty="${item.key}" />
        </label>
        <strong>${formatPrice(item.price * item.quantity)}</strong>
        <button class="link-button" type="button" data-remove="${item.key}">Entfernen</button>
      </div>
    </article>
  `;
}

function renderCheckout() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  app.innerHTML = `
    <section class="checkout-layout">
      <div class="checkout-card">
        <p class="eyebrow">Demo Checkout</p>
        <h1>Kasse</h1>
        <p class="muted">Diese Kassenseite simuliert nur das Design. Es werden keine Bestellungen oder Zahlungen verarbeitet.</p>
        <form>
          <input class="field" type="text" placeholder="Vorname und Nachname" />
          <input class="field" type="email" placeholder="E-Mail" />
          <input class="field" type="text" placeholder="Adresse" />
          <div class="two-cols">
            <input class="field" type="text" placeholder="PLZ" />
            <input class="field" type="text" placeholder="Stadt" />
          </div>
          <div class="two-cols">
            <input class="field" type="text" placeholder="Kartennummer" />
            <input class="field" type="text" placeholder="MM/JJ" />
          </div>
          <button class="btn" type="button" id="demoCheckoutButton">Bestellung simulieren</button>
        </form>
      </div>
      <aside class="summary">
        <h3>Deine Auswahl</h3>
        ${cart.map((item) => `<div class="summary-row"><span>${item.quantity}x ${item.name}</span><strong>${formatPrice(item.price * item.quantity)}</strong></div>`).join("")}
        <div class="summary-row total"><span>Gesamt</span><span>${formatPrice(subtotal)}</span></div>
      </aside>
    </section>
  `;

  document.querySelector("#demoCheckoutButton").addEventListener("click", () => {
    showToast("Demo abgeschlossen. Keine echte Bestellung wurde erstellt.");
    fireConfetti();
  });
}

function renderNewsletter() {
  return `
    <section class="section" id="contact">
      <div class="newsletter">
        <div>
          <p class="eyebrow">Newsletter</p>
          <h2>Neue Drops zuerst sehen.</h2>
          <p class="muted">Erhalte Updates zu WESTBERG Kollektionen, Styling-Ideen und kommenden Releases.</p>
        </div>
        <form class="newsletter-form">
          <input class="field" type="email" placeholder="E-Mail-Adresse" aria-label="E-Mail-Adresse" />
          <button class="btn" type="button" id="newsletterButton">Anmelden</button>
        </form>
      </div>
    </section>
  `;
}

function renderAboutContact() {
  return `
    <section class="section" id="about">
      <div class="about-grid">
        <img src="${productById("cap").colors.find((color) => color.name === "Blue")?.image || productById("cap").image}" alt="WESTBERG Cap in Blau" loading="lazy" />
        <div>
          <p class="eyebrow">Über WESTBERG</p>
          <h2>Junge Fashion Brand für klare Alltagslooks.</h2>
          <p class="muted">WESTBERG steht für reduzierte Formen, hochwertige Basics und Pieces, die sich leicht kombinieren lassen. Der Prototyp zeigt eine mögliche Shop-Struktur für ein Schulprojekt.</p>
          <div class="action-row">
            <a class="btn" href="#collection">Shop ansehen</a>
            <a class="btn btn-secondary" href="#contact">Kontakt</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

function bindGlobalButtons() {
  const newsletterButton = document.querySelector("#newsletterButton");
  if (newsletterButton) {
    newsletterButton.addEventListener("click", () => showToast("Danke für deine Anmeldung."));
  }
}

function renderNotFound() {
  app.innerHTML = `
    <section class="section">
      <div class="empty-state">
        <h1>Produkt nicht gefunden</h1>
        <p class="muted">Dieses WESTBERG Piece ist gerade nicht verfügbar.</p>
        <a class="btn" href="#collection">Zur Kollektion</a>
      </div>
    </section>
  `;
}

function fireConfetti() {
  const context = confettiCanvas.getContext("2d");
  const pixelRatio = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  confettiCanvas.width = width * pixelRatio;
  confettiCanvas.height = height * pixelRatio;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const colors = ["#0A2E6D", "#111111", "#ffffff", "#9fd0ff", "#d4b98c"];
  const pieces = Array.from({ length: 115 }, () => ({
    x: width / 2 + (Math.random() - 0.5) * 90,
    y: height * 0.34,
    size: Math.random() * 7 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedX: (Math.random() - 0.5) * 9,
    speedY: Math.random() * -8 - 3,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 14,
    gravity: 0.24 + Math.random() * 0.06,
    life: 95 + Math.random() * 35,
  }));

  function animate() {
    context.clearRect(0, 0, width, height);
    pieces.forEach((piece) => {
      piece.x += piece.speedX;
      piece.y += piece.speedY;
      piece.speedY += piece.gravity;
      piece.rotation += piece.rotationSpeed;
      piece.life -= 1;

      context.save();
      context.translate(piece.x, piece.y);
      context.rotate((piece.rotation * Math.PI) / 180);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.62);
      context.restore();
    });

    if (pieces.some((piece) => piece.life > 0 && piece.y < height + 40)) {
      requestAnimationFrame(animate);
    } else {
      context.clearRect(0, 0, width, height);
    }
  }

  animate();
}

function playAddSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(540, audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audio.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, audio.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.18);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.2);
  } catch (error) {
    // Audio ist optional und kann je nach Browser-Einstellung blockiert sein.
  }
}

function router() {
  closeMobileNav();
  const hash = location.hash || "#home";
  const [route, param] = hash.replace("#", "").split("/");
  let anchorTarget = null;

  if (route === "home" || route === "") renderHome();
  else if (route === "collection") renderCollection("all");
  else if (route === "category") renderCollection(param || "all");
  else if (route === "product") renderProductDetail(param);
  else if (route === "cart") renderCart();
  else if (route === "checkout") renderCheckout();
  else if (route === "about") {
    renderHome();
    anchorTarget = "#about";
  } else if (route === "contact") {
    renderHome();
    anchorTarget = "#contact";
  } else renderNotFound();

  bindGlobalButtons();
  app.focus({ preventScroll: true });
  if (anchorTarget) {
    requestAnimationFrame(() => document.querySelector(anchorTarget)?.scrollIntoView({ behavior: "smooth" }));
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

window.addEventListener("hashchange", router);
updateCartCount();
router();
