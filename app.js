'use strict';

/* ------------------------------------------------------------------
 * Catalogue: edit the boxes, menu and pricing here.
 * Everything on the page (box cards, menu, order form) is rendered
 * from this data.
 * ------------------------------------------------------------------ */

const currency = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });
const fmt = (amount) => currency.format(amount);

const BOXES = [
  {
    id: 'kids',
    name: 'Kids Box',
    short: 'Kids',
    icon: '🧒',
    audience: 'For kids',
    price: 5,
    tagline: 'A fun, filling meal sized just right for little ones.',
    // model: which 3D food the hero scene builds for this item (see hero3d.js)
    items: [
      { qty: 3, icon: '🍗', name: 'Chicken nuggets', model: 'nugget' },
      { qty: 1, icon: '🍔', name: 'Mini burger', model: 'burger' },
      { qty: 1, icon: '🍞', name: 'Toast', model: 'toast' },
    ],
  },
  {
    id: 'lunch',
    name: 'Lunch Box',
    short: 'Lunch',
    icon: '🍱',
    audience: 'For adults',
    price: 7,
    tagline: 'A hearty mix of favourites for a proper lunch.',
    items: [
      { qty: 1, icon: '🍢', name: 'Chicken kebab', model: 'kebab' },
      { qty: 1, icon: '🍔', name: 'Mini burger', model: 'burger' },
      { qty: 1, icon: '🌭', name: 'Mini hot dog', model: 'hotdog' },
      { qty: 1, icon: '🥗', name: 'Small Caesar salad', model: 'salad' },
    ],
  },
];

// Items sold separately, outside the boxes.
const MENU = [
  {
    id: 'burgers',
    name: 'Burgers',
    icon: '🍔',
    items: [
      { id: 'burger-chicken', name: 'Chicken burger', short: 'Chicken', price: 3.5 },
      { id: 'burger-beef', name: 'Beef burger', short: 'Beef', price: 3.5 },
    ],
  },
  {
    id: 'brioche',
    name: 'Brioche sandwiches',
    icon: '🥪',
    items: [
      { id: 'brioche-turkey', name: 'Brioche with turkey', short: 'Turkey', price: 2.5 },
      { id: 'brioche-tuna', name: 'Brioche with tuna salad', short: 'Tuna', price: 2.5 },
      { id: 'brioche-salami', name: 'Brioche with salami & cheese', short: 'Salami', price: 2.5 },
    ],
  },
  {
    id: 'hotdogs',
    name: 'Hot dogs',
    icon: '🌭',
    items: [
      { id: 'hotdog-frankfurter', name: 'Frankfurter hot dog', short: 'Frankfurter', price: 3.5 },
      { id: 'hotdog-special', name: 'Hot dog special', short: 'Special', price: 4 },
    ],
  },
  {
    id: 'salads',
    name: 'Salads',
    icon: '🥗',
    items: [
      { id: 'salad-caesar', name: 'Caesar salad', short: 'Caesar', price: 4 },
      { id: 'salad-chicken-penne', name: 'Chicken & penne salad', short: 'Penne', price: 4 },
      { id: 'salad-tuna', name: 'Tuna salad', short: 'Tuna', price: 4 },
    ],
  },
];

const ORDER_RULES = {
  minOrder: 20, // minimum order value (€), boxes and menu items combined
  suggestedBoxes: 10, // quantity pre-filled when clicking "Order <box>" on a card
  maxPerProduct: 500,
  boxDiscounts: [ // applied to the boxes only, highest threshold first
    { min: 50, rate: 0.15 },
    { min: 25, rate: 0.1 },
    { min: 10, rate: 0.05 },
  ],
  deliveryFee: 5,
  freeDeliveryFrom: 80,
};

/* ------------------------------------------------------------------ */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const percent = (rate) => `${Math.round(rate * 100)}%`;
const round2 = (n) => Math.round(n * 100) / 100;
const plural = (n, word, suffix = 's') => `${n} ${word}${n === 1 ? '' : suffix}`;

// Boxes and menu items share one order, keyed by product id.
const PRODUCTS = [
  ...BOXES.map((b) => ({ id: b.id, name: b.name, short: b.short, icon: b.icon, price: b.price, isBox: true })),
  ...MENU.flatMap((category) => category.items.map((item) => ({ ...item, icon: category.icon, isBox: false }))),
];
const quantities = Object.fromEntries(PRODUCTS.map((p) => [p.id, 0]));

// Top-down drawing of the box: one compartment per item, two rows.
// With an odd number of items, the first one gets a double-height compartment.
function boxVisual(box) {
  const n = box.items.length;
  const cells = box.items.map((item, i) => {
    const classes = ['cell'];
    if (n % 2 === 1 && i === 0) classes.push('cell-tall');
    if (item.qty > 1) classes.push('cell-multi');
    const pieces = item.qty > 1 ? `<span>${item.icon}</span>`.repeat(item.qty) : item.icon;
    return `<span class="${classes.join(' ')}" title="${item.qty} × ${item.name}">${pieces}</span>`;
  }).join('');
  return `<div class="box-visual tier-${box.id}" style="--cols:${Math.ceil(n / 2)}">${cells}</div>`;
}

/* ---------- Static sections ---------- */

function renderHero() {
  $('#hero-visual').innerHTML = `
    <div class="hero-stack">
      ${BOXES.map((box) => `
        <div class="stack-item">
          ${boxVisual(box)}
          <span class="stack-label">${box.name}</span>
        </div>`).join('')}
    </div>`;
}

function renderBoxCards() {
  $('#box-grid').innerHTML = BOXES.map((box) => `
    <article class="box-card tier-${box.id}">
      ${boxVisual(box)}
      <p class="tier-level">${box.audience}</p>
      <h3>${box.name}</h3>
      <p class="tagline">${box.tagline}</p>
      <p class="price">${fmt(box.price)} <span>per box</span></p>
      <p class="contents-title">What's inside</p>
      <ul class="contents">
        ${box.items.map((item) => `
          <li>
            <span class="item-icon" aria-hidden="true">${item.icon}</span>
            <span class="item-text">${item.name}</span>
            <span class="qty-pill">${item.qty} ×</span>
          </li>`).join('')}
      </ul>
      <button type="button" class="btn btn-primary" data-choose="${box.id}">Order ${box.name}</button>
    </article>`).join('');
}

function renderMenu() {
  $('#menu-grid').innerHTML = MENU.map((category) => {
    const prices = category.items.map((i) => i.price);
    const lowest = Math.min(...prices);
    const priceNote = prices.every((p) => p === lowest) ? `${fmt(lowest)} each` : `From ${fmt(lowest)}`;

    return `
      <article class="menu-card">
        <header class="menu-card-head">
          <span class="menu-icon" aria-hidden="true">${category.icon}</span>
          <div>
            <h3>${category.name}</h3>
            <p>${priceNote}</p>
          </div>
        </header>
        <ul class="menu-items">
          ${category.items.map((item) => `
            <li>
              <span class="menu-item-name">${item.name}</span>
              <span class="menu-item-price">${fmt(item.price)}</span>
              <button type="button" class="btn-add" data-add="${item.id}" aria-label="Add ${item.name} to order">+ Add</button>
            </li>`).join('')}
        </ul>
      </article>`;
  }).join('');
}

function renderRuleText() {
  const fromPrice = Math.min(...BOXES.map((b) => b.price));
  $$('[data-from-price]').forEach((el) => { el.textContent = `From ${fmt(fromPrice)}`; });
  $$('[data-menu-count]').forEach((el) => { el.textContent = PRODUCTS.filter((p) => !p.isBox).length; });
  $$('[data-min-order]').forEach((el) => { el.textContent = fmt(ORDER_RULES.minOrder); });

  const discounts = [...ORDER_RULES.boxDiscounts].reverse()
    .map((d) => `<li>${percent(d.rate)} off ${d.min}+ boxes</li>`).join('');
  $('#perks').innerHTML = `
    <li>Minimum order ${fmt(ORDER_RULES.minOrder)}</li>
    ${discounts}
    <li>Free delivery over ${fmt(ORDER_RULES.freeDeliveryFrom)}</li>`;

  $('#year').textContent = new Date().getFullYear();
}

/* ---------- Order builder ---------- */

function orderLine(product, detail, extraClass = '') {
  return `
    <div class="order-line ${extraClass}" data-line="${product.id}">
      <div class="order-line-info">
        <strong>${product.name}</strong>
        <span>${detail}</span>
      </div>
      <div class="stepper">
        <button type="button" data-step="-1" data-product="${product.id}" aria-label="One less ${product.name}">−</button>
        <input type="number" min="0" max="${ORDER_RULES.maxPerProduct}" inputmode="numeric" value="0"
               data-qty="${product.id}" aria-label="Quantity of ${product.name}">
        <button type="button" data-step="1" data-product="${product.id}" aria-label="One more ${product.name}">+</button>
      </div>
      <span class="line-total" data-line-total="${product.id}">${fmt(0)}</span>
    </div>`;
}

function renderOrderLines() {
  $('#order-boxes').innerHTML = BOXES.map((box) => {
    const contents = box.items.map((i) => (i.qty > 1 ? `${i.qty} ${i.name.toLowerCase()}` : i.name.toLowerCase())).join(', ');
    return orderLine(box, `${fmt(box.price)} per box · ${contents}`, `tier-${box.id}`);
  }).join('');

  $('#order-extras').innerHTML = MENU.map((category) => `
    <div class="order-group">
      <h4>${category.icon} ${category.name}</h4>
      ${category.items.map((item) => orderLine(item, `${fmt(item.price)} each`, 'compact')).join('')}
    </div>`).join('');
}

function setQuantity(id, value, { syncInput = true } = {}) {
  const n = Math.min(ORDER_RULES.maxPerProduct, Math.max(0, Math.floor(Number(value)) || 0));
  quantities[id] = n;
  if (syncInput) $(`[data-qty="${id}"]`).value = n;
  updateSummary();
}

function calculateOrder() {
  const count = (list) => list.reduce((sum, p) => sum + quantities[p.id], 0);
  const value = (list) => round2(list.reduce((sum, p) => sum + quantities[p.id] * p.price, 0));
  const boxProducts = PRODUCTS.filter((p) => p.isBox);
  const menuProducts = PRODUCTS.filter((p) => !p.isBox);

  const boxes = count(boxProducts);
  const extras = count(menuProducts);
  const subtotal = value(PRODUCTS);
  const tierDiscount = ORDER_RULES.boxDiscounts.find((d) => boxes >= d.min);
  const discountRate = tierDiscount ? tierDiscount.rate : 0;
  const discount = round2(value(boxProducts) * discountRate);
  const discounted = round2(subtotal - discount);
  const empty = boxes + extras === 0;
  const delivery = empty || discounted >= ORDER_RULES.freeDeliveryFrom ? 0 : ORDER_RULES.deliveryFee;

  return { boxes, extras, empty, subtotal, discountRate, discount, discounted, delivery, total: round2(discounted + delivery) };
}

function orderHint(order) {
  const { minOrder, boxDiscounts, freeDeliveryFrom } = ORDER_RULES;
  if (order.empty) return { ok: false, text: 'Add boxes or menu items to start your order.' };
  if (order.subtotal < minOrder) {
    return { ok: false, text: `Add ${fmt(minOrder - order.subtotal)} more to reach our ${fmt(minOrder)} minimum order.` };
  }

  const tips = [];
  const nextDiscount = [...boxDiscounts].reverse().find((d) => order.boxes < d.min);
  if (order.boxes > 0 && nextDiscount) {
    tips.push(`Add ${plural(nextDiscount.min - order.boxes, 'box', 'es')} to get ${percent(nextDiscount.rate)} off your boxes.`);
  }
  if (order.discounted < freeDeliveryFrom) {
    tips.push(`Spend ${fmt(freeDeliveryFrom - order.discounted)} more for free delivery.`);
  }
  return { ok: true, text: tips.length ? tips.join(' ') : 'Great choice! You have free delivery.' };
}

function updateSummary() {
  const order = calculateOrder();
  const chosen = PRODUCTS.filter((p) => quantities[p.id] > 0);

  PRODUCTS.forEach((p) => {
    $(`[data-line-total="${p.id}"]`).textContent = fmt(quantities[p.id] * p.price);
  });

  $('#summary-items').innerHTML = chosen.length
    ? chosen.map((p) => `<li><span>${quantities[p.id]} × ${p.name}</span><span>${fmt(quantities[p.id] * p.price)}</span></li>`).join('')
    : '<li class="empty">Nothing added yet.</li>';

  $('#sum-boxes').textContent = order.boxes;
  $('#sum-extras').textContent = order.extras;
  $('#sum-subtotal').textContent = fmt(order.subtotal);
  $('#sum-discount-row').hidden = order.discount === 0;
  $('#sum-discount-rate').textContent = percent(order.discountRate);
  $('#sum-discount').textContent = `−${fmt(order.discount)}`;
  $('#sum-delivery').textContent = order.empty ? '—' : order.delivery === 0 ? 'Free' : fmt(order.delivery);
  $('#sum-total').textContent = fmt(order.total);

  const hint = orderHint(order);
  const hintEl = $('#summary-hint');
  hintEl.textContent = hint.text;
  hintEl.classList.toggle('ok', hint.ok);

  const cartCount = $('#cart-count');
  cartCount.textContent = order.boxes + order.extras;
  cartCount.hidden = order.empty;

  $('#submit-btn').disabled = order.subtotal < ORDER_RULES.minOrder;

  document.dispatchEvent(new CustomEvent('order:change', { detail: orderSnapshot() }));
}

// Current order as plain data, for the visual layers (orderviz.js).
function orderSnapshot() {
  const lines = PRODUCTS
    .filter((p) => quantities[p.id] > 0)
    .map((p) => ({ ...p, qty: quantities[p.id], value: round2(quantities[p.id] * p.price) }));
  return { lines, order: calculateOrder() };
}

function flashLine(id) {
  const line = $(`[data-line="${id}"]`);
  line.classList.add('flash');
  setTimeout(() => line.classList.remove('flash'), 1400);
}

function chooseBox(id) {
  if (quantities[id] === 0) setQuantity(id, ORDER_RULES.suggestedBoxes);
  $('#order').scrollIntoView({ behavior: 'smooth' });
  flashLine(id);
}

const addTimers = new Map();
function addMenuItem(id, button) {
  setQuantity(id, quantities[id] + 1);
  button.textContent = '✓ Added';
  button.classList.add('added');
  clearTimeout(addTimers.get(button));
  addTimers.set(button, setTimeout(() => {
    button.textContent = '+ Add';
    button.classList.remove('added');
  }, 900));
}

function setMinDeliveryDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const pad = (n) => String(n).padStart(2, '0');
  $('#f-date').min = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
}

function showConfirmation(form) {
  const order = calculateOrder();
  const data = new FormData(form);
  const date = new Date(`${data.get('date')}T00:00`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  // User input goes in via textContent, never innerHTML.
  $('#confirm-text').textContent = `Thanks, ${data.get('name')}! We'll deliver your order on ${date} at ${data.get('time')}.`;

  const list = $('#confirm-items');
  list.innerHTML = '';
  const addRow = (label, amount) => {
    const li = document.createElement('li');
    li.innerHTML = '<span></span><strong></strong>';
    li.children[0].textContent = label;
    li.children[1].textContent = amount;
    list.append(li);
  };
  PRODUCTS.filter((p) => quantities[p.id] > 0).forEach((p) => addRow(`${quantities[p.id]} × ${p.name}`, fmt(quantities[p.id] * p.price)));
  if (order.discount) addRow(`Box discount (${percent(order.discountRate)})`, `−${fmt(order.discount)}`);
  addRow('Delivery', order.delivery ? fmt(order.delivery) : 'Free');
  addRow('Total', fmt(order.total));

  $('#confirm-ref').textContent = `NC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  $('#confirm-dialog').showModal();
}

/* ---------- Events ---------- */

function bindEvents() {
  document.addEventListener('click', (e) => {
    const choose = e.target.closest('[data-choose]');
    if (choose) return chooseBox(choose.dataset.choose);

    const add = e.target.closest('[data-add]');
    if (add) return addMenuItem(add.dataset.add, add);

    const step = e.target.closest('[data-step]');
    if (step) setQuantity(step.dataset.product, quantities[step.dataset.product] + Number(step.dataset.step));
  });

  const form = $('#order-form');
  // While typing, don't rewrite the field (so it can be briefly empty); normalise on change.
  form.addEventListener('input', (e) => {
    if (e.target.dataset.qty) setQuantity(e.target.dataset.qty, e.target.value, { syncInput: false });
  });
  form.addEventListener('change', (e) => {
    if (e.target.dataset.qty) setQuantity(e.target.dataset.qty, e.target.value);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (calculateOrder().subtotal < ORDER_RULES.minOrder) return;
    showConfirmation(form);
  });

  $('#confirm-dialog').addEventListener('close', () => {
    form.reset();
    PRODUCTS.forEach((p) => setQuantity(p.id, 0));
  });
}

renderHero();
renderBoxCards();
renderMenu();
renderRuleText();
renderOrderLines();
setMinDeliveryDate();
bindEvents();
updateSummary();
