'use strict';

/* ------------------------------------------------------------------
 * Catalogue: edit the boxes, menu and pricing here.
 * Everything on the page (box cards, menu, order form) is rendered
 * from this data. Visible text comes in { en, el } pairs; the rest of
 * the site's wording lives in i18n.js.
 * ------------------------------------------------------------------ */

const currencyFormats = new Map(); // one formatter per language
function fmt(amount) {
  if (!currencyFormats.has(lang)) {
    currencyFormats.set(lang, new Intl.NumberFormat(t('locale'), { style: 'currency', currency: 'EUR' }));
  }
  return currencyFormats.get(lang).format(amount);
}

const BOXES = [
  {
    id: 'kids',
    name: { en: 'Kids Box', el: 'Παιδικό κουτί' },
    short: { en: 'Kids', el: 'Παιδικό' },
    icon: '🧒',
    audience: { en: 'For kids', el: 'Για παιδιά' },
    price: 5,
    tagline: {
      en: 'A fun, filling meal sized just right for little ones.',
      el: 'Ένα διασκεδαστικό, χορταστικό γεύμα στο σωστό μέγεθος για τους μικρούς.',
    },
    // model: which 3D food the hero scene builds for this item (see hero3d.js)
    items: [
      { qty: 3, icon: '🍗', name: { en: 'Chicken nuggets', el: 'Κοτομπουκιές' }, model: 'nugget' },
      { qty: 1, icon: '🍔', name: { en: 'Mini burger', el: 'Μίνι μπέργκερ' }, model: 'burger' },
      { qty: 1, icon: '🍞', name: { en: 'Toast', el: 'Τοστ' }, model: 'toast' },
    ],
  },
  {
    id: 'lunch',
    name: { en: 'Lunch Box', el: 'Κουτί γεύματος' },
    short: { en: 'Lunch', el: 'Γεύμα' },
    icon: '🍱',
    audience: { en: 'For adults', el: 'Για ενήλικες' },
    price: 7,
    tagline: {
      en: 'A hearty mix of favourites for a proper lunch.',
      el: 'Ένας χορταστικός συνδυασμός αγαπημένων για ένα κανονικό μεσημεριανό.',
    },
    items: [
      { qty: 1, icon: '🍢', name: { en: 'Chicken kebab', el: 'Σουβλάκι κοτόπουλο' }, model: 'kebab' },
      { qty: 1, icon: '🍔', name: { en: 'Mini burger', el: 'Μίνι μπέργκερ' }, model: 'burger' },
      { qty: 1, icon: '🌭', name: { en: 'Mini hot dog', el: 'Μίνι χοτ ντογκ' }, model: 'hotdog' },
      { qty: 1, icon: '🥗', name: { en: 'Small Caesar salad', el: 'Μικρή σαλάτα Caesar' }, model: 'salad' },
    ],
  },
];

// Items sold separately, outside the boxes.
const MENU = [
  {
    id: 'burgers',
    name: { en: 'Burgers', el: 'Μπέργκερ' },
    icon: '🍔',
    items: [
      { id: 'burger-chicken', name: { en: 'Chicken burger', el: 'Μπέργκερ κοτόπουλο' }, short: { en: 'Chicken', el: 'Κοτόπουλο' }, price: 3.5 },
      { id: 'burger-beef', name: { en: 'Beef burger', el: 'Μπέργκερ μοσχαρίσιο' }, short: { en: 'Beef', el: 'Μοσχάρι' }, price: 3.5 },
    ],
  },
  {
    id: 'brioche',
    name: { en: 'Brioche sandwiches', el: 'Σάντουιτς μπριός' },
    icon: '🥪',
    items: [
      { id: 'brioche-turkey', name: { en: 'Brioche with turkey', el: 'Μπριός με γαλοπούλα' }, short: { en: 'Turkey', el: 'Γαλοπούλα' }, price: 2.5 },
      { id: 'brioche-tuna', name: { en: 'Brioche with tuna salad', el: 'Μπριός με τονοσαλάτα' }, short: { en: 'Tuna', el: 'Τόνος' }, price: 2.5 },
      { id: 'brioche-salami', name: { en: 'Brioche with salami & cheese', el: 'Μπριός με σαλάμι & τυρί' }, short: { en: 'Salami', el: 'Σαλάμι' }, price: 2.5 },
    ],
  },
  {
    id: 'hotdogs',
    name: { en: 'Hot dogs', el: 'Χοτ ντογκ' },
    icon: '🌭',
    items: [
      { id: 'hotdog-frankfurter', name: { en: 'Frankfurter hot dog', el: 'Χοτ ντογκ με λουκάνικο Φρανκφούρτης' }, short: { en: 'Frankfurter', el: 'Φρανκφούρτης' }, price: 3.5 },
      { id: 'hotdog-special', name: { en: 'Hot dog special', el: 'Χοτ ντογκ σπέσιαλ' }, short: { en: 'Special', el: 'Σπέσιαλ' }, price: 4 },
    ],
  },
  {
    id: 'salads',
    name: { en: 'Salads', el: 'Σαλάτες' },
    icon: '🥗',
    items: [
      { id: 'salad-caesar', name: { en: 'Caesar salad', el: 'Σαλάτα Caesar' }, short: { en: 'Caesar', el: 'Caesar' }, price: 4 },
      { id: 'salad-chicken-penne', name: { en: 'Chicken & penne salad', el: 'Σαλάτα με κοτόπουλο & πένες' }, short: { en: 'Penne', el: 'Πένες' }, price: 4 },
      { id: 'salad-tuna', name: { en: 'Tuna salad', el: 'Τονοσαλάτα' }, short: { en: 'Tuna', el: 'Τόνος' }, price: 4 },
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
    return `<span class="${classes.join(' ')}" title="${item.qty} × ${loc(item.name)}">${pieces}</span>`;
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
          <span class="stack-label">${loc(box.name)}</span>
        </div>`).join('')}
    </div>`;
}

function renderBoxCards() {
  $('#box-grid').innerHTML = BOXES.map((box) => `
    <article class="box-card tier-${box.id}">
      ${boxVisual(box)}
      <p class="tier-level">${loc(box.audience)}</p>
      <h3>${loc(box.name)}</h3>
      <p class="tagline">${loc(box.tagline)}</p>
      <p class="price">${fmt(box.price)} <span>${t('price.perBox')}</span></p>
      <p class="contents-title">${t('box.contents')}</p>
      <ul class="contents">
        ${box.items.map((item) => `
          <li>
            <span class="item-icon" aria-hidden="true">${item.icon}</span>
            <span class="item-text">${loc(item.name)}</span>
            <span class="qty-pill">${item.qty} ×</span>
          </li>`).join('')}
      </ul>
      <button type="button" class="btn btn-primary" data-choose="${box.id}">${t('box.order', loc(box.name))}</button>
    </article>`).join('');
}

function renderMenu() {
  $('#menu-grid').innerHTML = MENU.map((category) => {
    const prices = category.items.map((i) => i.price);
    const lowest = Math.min(...prices);
    const priceNote = prices.every((p) => p === lowest) ? t('price.each', fmt(lowest)) : t('price.from', fmt(lowest));

    return `
      <article class="menu-card">
        <header class="menu-card-head">
          <span class="menu-icon" aria-hidden="true">${category.icon}</span>
          <div>
            <h3>${loc(category.name)}</h3>
            <p>${priceNote}</p>
          </div>
        </header>
        <ul class="menu-items">
          ${category.items.map((item) => `
            <li>
              <span class="menu-item-name">${loc(item.name)}</span>
              <span class="menu-item-price">${fmt(item.price)}</span>
              <button type="button" class="btn-add" data-add="${item.id}" aria-label="${t('menu.addLabel', loc(item.name))}">${t('menu.add')}</button>
            </li>`).join('')}
        </ul>
      </article>`;
  }).join('');
}

function renderRuleText() {
  const fromPrice = Math.min(...BOXES.map((b) => b.price));
  $$('[data-from-price]').forEach((el) => { el.textContent = t('price.from', fmt(fromPrice)); });
  $$('[data-menu-count]').forEach((el) => { el.textContent = PRODUCTS.filter((p) => !p.isBox).length; });
  $$('[data-min-order]').forEach((el) => { el.textContent = fmt(ORDER_RULES.minOrder); });

  const discounts = [...ORDER_RULES.boxDiscounts].reverse()
    .map((d) => `<li>${t('perks.discount', percent(d.rate), d.min)}</li>`).join('');
  $('#perks').innerHTML = `
    <li>${t('perks.min', fmt(ORDER_RULES.minOrder))}</li>
    ${discounts}
    <li>${t('perks.freeDelivery', fmt(ORDER_RULES.freeDeliveryFrom))}</li>`;

  $('#year').textContent = new Date().getFullYear();
}

/* ---------- Order builder ---------- */

function orderLine(product, detail, extraClass = '') {
  const name = loc(product.name);
  return `
    <div class="order-line ${extraClass}" data-line="${product.id}">
      <div class="order-line-info">
        <strong>${name}</strong>
        <span>${detail}</span>
      </div>
      <div class="stepper">
        <button type="button" data-step="-1" data-product="${product.id}" aria-label="${t('line.less', name)}">−</button>
        <input type="number" min="0" max="${ORDER_RULES.maxPerProduct}" inputmode="numeric" value="${quantities[product.id]}"
               data-qty="${product.id}" aria-label="${t('line.qty', name)}">
        <button type="button" data-step="1" data-product="${product.id}" aria-label="${t('line.more', name)}">+</button>
      </div>
      <span class="line-total" data-line-total="${product.id}">${fmt(0)}</span>
    </div>`;
}

function renderOrderLines() {
  $('#order-boxes').innerHTML = BOXES.map((box) => {
    const contents = box.items.map((i) => {
      const name = loc(i.name).toLowerCase();
      return i.qty > 1 ? `${i.qty} ${name}` : name;
    }).join(', ');
    return orderLine(box, t('line.boxDetail', fmt(box.price), contents), `tier-${box.id}`);
  }).join('');

  $('#order-extras').innerHTML = MENU.map((category) => `
    <div class="order-group">
      <h4>${category.icon} ${loc(category.name)}</h4>
      ${category.items.map((item) => orderLine(item, t('price.each', fmt(item.price)), 'compact')).join('')}
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
  if (order.empty) return { ok: false, text: t('hint.empty') };
  if (order.subtotal < minOrder) {
    return { ok: false, text: t('hint.min', fmt(minOrder - order.subtotal), fmt(minOrder)) };
  }

  const tips = [];
  const nextDiscount = [...boxDiscounts].reverse().find((d) => order.boxes < d.min);
  if (order.boxes > 0 && nextDiscount) {
    tips.push(t('hint.discount', nextDiscount.min - order.boxes, percent(nextDiscount.rate)));
  }
  if (order.discounted < freeDeliveryFrom) {
    tips.push(t('hint.delivery', fmt(freeDeliveryFrom - order.discounted)));
  }
  return { ok: true, text: tips.length ? tips.join(' ') : t('hint.done') };
}

function updateSummary() {
  const order = calculateOrder();
  const chosen = PRODUCTS.filter((p) => quantities[p.id] > 0);

  PRODUCTS.forEach((p) => {
    $(`[data-line-total="${p.id}"]`).textContent = fmt(quantities[p.id] * p.price);
  });

  $('#summary-items').innerHTML = chosen.length
    ? chosen.map((p) => `<li><span>${quantities[p.id]} × ${loc(p.name)}</span><span>${fmt(quantities[p.id] * p.price)}</span></li>`).join('')
    : `<li class="empty">${t('summary.empty')}</li>`;

  $('#sum-boxes').textContent = order.boxes;
  $('#sum-extras').textContent = order.extras;
  $('#sum-subtotal').textContent = fmt(order.subtotal);
  $('#sum-discount-row').hidden = order.discount === 0;
  $('#sum-discount-rate').textContent = percent(order.discountRate);
  $('#sum-discount').textContent = `−${fmt(order.discount)}`;
  $('#sum-delivery').textContent = order.empty ? '—' : order.delivery === 0 ? t('summary.free') : fmt(order.delivery);
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
  button.textContent = t('menu.added');
  button.classList.add('added');
  clearTimeout(addTimers.get(button));
  addTimers.set(button, setTimeout(() => {
    button.textContent = t('menu.add');
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
  const date = new Date(`${data.get('date')}T00:00`).toLocaleDateString(t('locale'), {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  // User input goes in via textContent, never innerHTML.
  $('#confirm-text').textContent = t('confirm.thanks', data.get('name'), date, data.get('time'));

  const list = $('#confirm-items');
  list.innerHTML = '';
  const addRow = (label, amount) => {
    const li = document.createElement('li');
    li.innerHTML = '<span></span><strong></strong>';
    li.children[0].textContent = label;
    li.children[1].textContent = amount;
    list.append(li);
  };
  PRODUCTS.filter((p) => quantities[p.id] > 0).forEach((p) => addRow(`${quantities[p.id]} × ${loc(p.name)}`, fmt(quantities[p.id] * p.price)));
  if (order.discount) addRow(t('discount.label', percent(order.discountRate)), `−${fmt(order.discount)}`);
  addRow(t('summary.delivery'), order.delivery ? fmt(order.delivery) : t('summary.free'));
  addRow(t('summary.total'), fmt(order.total));

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

  // Redraw everything rendered from the catalogue; the order itself is kept.
  document.addEventListener('lang:change', () => {
    if (!$('#hero-visual').classList.contains('is-3d')) renderHero(); // hero3d.js handles its own text
    renderBoxCards();
    renderMenu();
    renderRuleText();
    renderOrderLines();
    updateSummary();
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
