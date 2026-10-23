'use strict';

/* ------------------------------------------------------------------
 * Language switching (English / Greek) via the flags in the header.
 * Static text in index.html is marked with data-i18n* attributes and
 * looked up here; catalogue text in app.js comes in { en, el } pairs.
 * Switching fires `lang:change` so the other scripts can redraw.
 * ------------------------------------------------------------------ */

const STRINGS = {
  en: {
    locale: 'en-IE',
    'meta.title': 'Nelson Catering — Boxed catering for every occasion',
    'lang.label': 'Language',

    'nav.label': 'Main',
    'nav.how': 'How it works',
    'nav.boxes': 'Boxes',
    'nav.menu': 'Menu',
    'nav.faq': 'FAQ',
    'nav.order': 'Order now',

    'hero.eyebrow': 'Boxed catering · Delivered to your door',
    'hero.title': 'Every guest gets their own <em>tasty box</em>.',
    'hero.lead': 'Individually packed boxes for kids and adults, perfect for parties, meetings and events. Add burgers, brioche sandwiches, hot dogs and salads from our menu.',
    'hero.seeBoxes': 'See the boxes',
    'hero.browseMenu': 'Browse the menu',
    'hero.audiences': 'Kids & adults',
    'hero.boxOptions': 'box options',
    'hero.extras': 'extras',
    'hero.onMenu': 'on the menu',

    'how.eyebrow': 'How it works',
    'how.title': 'Catering in three easy steps',
    'how.step1Title': 'Pick boxes & extras',
    'how.step1Text': 'Choose Kids or Lunch boxes, then add burgers, sandwiches, hot dogs or salads.',
    'how.step2Title': 'Tell us when & where',
    'how.step2Text': 'Set the date, time and address, and add any dietary requirements.',
    'how.step3Title': 'We deliver, you enjoy',
    'how.step3Text': 'Everything arrives fresh, labelled and ready to hand out.',

    'boxes.eyebrow': 'Our boxes',
    'boxes.title': 'One box per guest, no fuss',
    'boxes.lead': 'A box for the little ones and a heartier one for adults, both packed and ready to hand out.',
    'box.contents': "What's inside",
    'box.order': (name) => `Order ${name}`,

    'menu.eyebrow': 'À la carte',
    'menu.title': 'Add extras from the menu',
    'menu.lead': 'Order any of these on their own or alongside your boxes.',
    'menu.add': '+ Add',
    'menu.added': '✓ Added',
    'menu.addLabel': (name) => `Add ${name} to order`,

    'price.perBox': 'per box',
    'price.each': (price) => `${price} each`,
    'price.from': (price) => `From ${price}`,

    'order.eyebrow': 'Order',
    'order.title': 'Build your catering order',
    'order.lead': 'Mix boxes and menu items however you like.',
    'order.boxes': '1. Boxes',
    'order.extras': '2. Extras from the menu',
    'order.details': '3. Delivery details',

    'perks.min': (price) => `Minimum order ${price}`,
    'perks.discount': (rate, min) => `${rate} off ${min}+ boxes`,
    'perks.freeDelivery': (price) => `Free delivery over ${price}`,

    'line.less': (name) => `One less ${name}`,
    'line.more': (name) => `One more ${name}`,
    'line.qty': (name) => `Quantity of ${name}`,
    'line.boxDetail': (price, contents) => `${price} per box · ${contents}`,

    'form.name': 'Full name',
    'form.company': 'Company',
    'form.optional': '(optional)',
    'form.email': 'Email',
    'form.phone': 'Phone',
    'form.date': 'Delivery date',
    'form.time': 'Delivery time',
    'form.address': 'Delivery address',
    'form.notes': 'Dietary requirements & notes',
    'form.notesPlaceholder': 'e.g. 2 kids with nut allergies, deliver to reception on floor 3',

    'summary.title': 'Your order',
    'summary.boxes': 'Boxes',
    'summary.extras': 'Menu items',
    'summary.subtotal': 'Subtotal',
    'summary.discount': 'Box discount',
    'summary.delivery': 'Delivery',
    'summary.total': 'Total',
    'summary.free': 'Free',
    'summary.empty': 'Nothing added yet.',
    'summary.submit': 'Place order',
    'summary.demo': 'This is a demo site. No real order or payment is processed.',
    'discount.label': (rate) => `Box discount (${rate})`,

    'hint.empty': 'Add boxes or menu items to start your order.',
    'hint.min': (missing, min) => `Add ${missing} more to reach our ${min} minimum order.`,
    'hint.discount': (n, rate) => `Add ${n} ${n === 1 ? 'box' : 'boxes'} to get ${rate} off your boxes.`,
    'hint.delivery': (missing) => `Spend ${missing} more for free delivery.`,
    'hint.done': 'Great choice! You have free delivery.',

    'tray.empty': 'Your tray is empty',
    'tray.emptySub': 'Add a box or something from the menu',
    'meter.delivery': 'Free delivery',
    'meter.discount': 'Box discount',
    'meter.tick': (min, rate) => `${min}+ · ${rate} off`,
    'meter.over': (price) => `Over ${price}`,
    'meter.unlocked': 'Unlocked! 🎉',
    'meter.toGo': (price) => `${price} to go`,
    'meter.discountOn': (rate) => `${rate} off unlocked`,
    'meter.fromBoxes': (n) => `From ${n} boxes`,
    'meter.moreFor': (n, rate) => `${n} more for ${rate} off`,

    'hero3d.label': 'Interactive 3D view of our catering boxes',
    'hero3d.hint': 'Drag to spin · Tap the food to make it jump',
    'hero3d.choose': 'Choose a box to view',
    'hero3d.order': 'Order this box',

    'faq.eyebrow': 'FAQ',
    'faq.title': 'Good to know',
    'faq.q1': 'Is there a minimum order?',
    'faq.a1': 'Yes. The minimum order is <span data-min-order></span>, made up of any mix of boxes and menu items.',
    'faq.q2': 'Can I order menu items without boxes?',
    'faq.a2': 'Of course. Burgers, brioche sandwiches, hot dogs and salads can be ordered on their own or added to any box order.',
    'faq.q3': 'Can you cater for dietary requirements?',
    'faq.a3': "Let us know about allergies or dietary needs in the notes field and we'll do our best to accommodate them.",
    'faq.q4': 'How far in advance should I order?',
    'faq.a4': "Orders need at least one day's notice. For 50+ boxes we recommend ordering three days ahead.",
    'faq.q5': 'Do I get a discount for large orders?',
    'faq.a5': 'Yes. Volume discounts on boxes apply automatically in the order summary, and delivery is free above a certain order value.',

    'footer.tagline': 'Boxed catering, freshly made every morning.',
    'footer.contact': 'Contact',
    'footer.hours': 'Kitchen hours',
    'footer.hoursValue': 'Mon–Sat · 07:00–21:00',
    'footer.demo': 'Demo website',

    'confirm.title': 'Order received!',
    'confirm.thanks': (name, date, time) => `Thanks, ${name}! We'll deliver your order on ${date} at ${time}.`,
    'confirm.ref': 'Reference:',
    'confirm.demo': 'Demo only. Nothing was sent or charged.',
    'confirm.done': 'Done',
  },

  el: {
    locale: 'el-GR',
    'meta.title': 'Nelson Catering — Catering σε κουτιά για κάθε περίσταση',
    'lang.label': 'Γλώσσα',

    'nav.label': 'Κύριο μενού',
    'nav.how': 'Πώς δουλεύει',
    'nav.boxes': 'Κουτιά',
    'nav.menu': 'Μενού',
    'nav.faq': 'Ερωτήσεις',
    'nav.order': 'Παραγγελία',

    'hero.eyebrow': 'Catering σε κουτιά · Παράδοση στην πόρτα σας',
    'hero.title': 'Κάθε καλεσμένος παίρνει το δικό του <em>νόστιμο κουτί</em>.',
    'hero.lead': 'Ατομικά συσκευασμένα κουτιά για παιδιά και ενήλικες, ιδανικά για πάρτι, συναντήσεις και εκδηλώσεις. Προσθέστε μπέργκερ, σάντουιτς μπριός, χοτ ντογκ και σαλάτες από το μενού μας.',
    'hero.seeBoxes': 'Δείτε τα κουτιά',
    'hero.browseMenu': 'Δείτε το μενού',
    'hero.audiences': 'Παιδιά & ενήλικες',
    'hero.boxOptions': 'επιλογές κουτιών',
    'hero.extras': 'επιλογές',
    'hero.onMenu': 'στο μενού',

    'how.eyebrow': 'Πώς δουλεύει',
    'how.title': 'Catering σε τρία εύκολα βήματα',
    'how.step1Title': 'Διαλέξτε κουτιά & επιπλέον πιάτα',
    'how.step1Text': 'Επιλέξτε παιδικά κουτιά ή κουτιά γεύματος και προσθέστε μπέργκερ, σάντουιτς, χοτ ντογκ ή σαλάτες.',
    'how.step2Title': 'Πείτε μας πότε & πού',
    'how.step2Text': 'Ορίστε ημερομηνία, ώρα και διεύθυνση και προσθέστε τυχόν διατροφικές απαιτήσεις.',
    'how.step3Title': 'Εμείς παραδίδουμε, εσείς απολαμβάνετε',
    'how.step3Text': 'Όλα φτάνουν φρέσκα, με ετικέτα και έτοιμα να μοιραστούν.',

    'boxes.eyebrow': 'Τα κουτιά μας',
    'boxes.title': 'Ένα κουτί για κάθε καλεσμένο, χωρίς κόπο',
    'boxes.lead': 'Ένα κουτί για τους μικρούς κι ένα πιο χορταστικό για τους μεγάλους, συσκευασμένα και έτοιμα να μοιραστούν.',
    'box.contents': 'Τι περιέχει',
    'box.order': (name) => `Παραγγείλτε το ${name}`,

    'menu.eyebrow': 'À la carte',
    'menu.title': 'Προσθέστε επιπλέον πιάτα από το μενού',
    'menu.lead': 'Παραγγείλτε τα μεμονωμένα ή μαζί με τα κουτιά σας.',
    'menu.add': '+ Προσθήκη',
    'menu.added': '✓ Προστέθηκε',
    'menu.addLabel': (name) => `Προσθήκη στην παραγγελία: ${name}`,

    'price.perBox': 'ανά κουτί',
    'price.each': (price) => `${price} το τεμάχιο`,
    'price.from': (price) => `Από ${price}`,

    'order.eyebrow': 'Παραγγελία',
    'order.title': 'Φτιάξτε την παραγγελία σας',
    'order.lead': 'Συνδυάστε κουτιά και πιάτα του μενού όπως θέλετε.',
    'order.boxes': '1. Κουτιά',
    'order.extras': '2. Επιπλέον από το μενού',
    'order.details': '3. Στοιχεία παράδοσης',

    'perks.min': (price) => `Ελάχιστη παραγγελία ${price}`,
    'perks.discount': (rate, min) => `${rate} έκπτωση για ${min}+ κουτιά`,
    'perks.freeDelivery': (price) => `Δωρεάν παράδοση άνω των ${price}`,

    'line.less': (name) => `Ένα λιγότερο: ${name}`,
    'line.more': (name) => `Ένα ακόμη: ${name}`,
    'line.qty': (name) => `Ποσότητα: ${name}`,
    'line.boxDetail': (price, contents) => `${price} ανά κουτί · ${contents}`,

    'form.name': 'Ονοματεπώνυμο',
    'form.company': 'Εταιρεία',
    'form.optional': '(προαιρετικό)',
    'form.email': 'Email',
    'form.phone': 'Τηλέφωνο',
    'form.date': 'Ημερομηνία παράδοσης',
    'form.time': 'Ώρα παράδοσης',
    'form.address': 'Διεύθυνση παράδοσης',
    'form.notes': 'Διατροφικές απαιτήσεις & σημειώσεις',
    'form.notesPlaceholder': 'π.χ. 2 παιδιά με αλλεργία στους ξηρούς καρπούς, παράδοση στη ρεσεψιόν του 3ου ορόφου',

    'summary.title': 'Η παραγγελία σας',
    'summary.boxes': 'Κουτιά',
    'summary.extras': 'Πιάτα μενού',
    'summary.subtotal': 'Υποσύνολο',
    'summary.discount': 'Έκπτωση κουτιών',
    'summary.delivery': 'Παράδοση',
    'summary.total': 'Σύνολο',
    'summary.free': 'Δωρεάν',
    'summary.empty': 'Δεν έχετε προσθέσει τίποτα ακόμη.',
    'summary.submit': 'Ολοκλήρωση παραγγελίας',
    'summary.demo': 'Αυτή είναι μια ιστοσελίδα επίδειξης. Δεν γίνεται πραγματική παραγγελία ή πληρωμή.',
    'discount.label': (rate) => `Έκπτωση κουτιών (${rate})`,

    'hint.empty': 'Προσθέστε κουτιά ή πιάτα του μενού για να ξεκινήσετε την παραγγελία σας.',
    'hint.min': (missing, min) => `Προσθέστε ακόμη ${missing} για να φτάσετε την ελάχιστη παραγγελία των ${min}.`,
    'hint.discount': (n, rate) => `Προσθέστε ${n} ${n === 1 ? 'κουτί' : 'κουτιά'} ακόμη για ${rate} έκπτωση στα κουτιά σας.`,
    'hint.delivery': (missing) => `Ξοδέψτε ακόμη ${missing} για δωρεάν παράδοση.`,
    'hint.done': 'Τέλεια επιλογή! Έχετε δωρεάν παράδοση.',

    'tray.empty': 'Ο δίσκος σας είναι άδειος',
    'tray.emptySub': 'Προσθέστε ένα κουτί ή κάτι από το μενού',
    'meter.delivery': 'Δωρεάν παράδοση',
    'meter.discount': 'Έκπτωση κουτιών',
    'meter.tick': (min, rate) => `${min}+ · −${rate}`,
    'meter.over': (price) => `Άνω των ${price}`,
    'meter.unlocked': 'Ξεκλειδώθηκε! 🎉',
    'meter.toGo': (price) => `Ακόμη ${price}`,
    'meter.discountOn': (rate) => `Έκπτωση ${rate} ενεργή`,
    'meter.fromBoxes': (n) => `Από ${n} κουτιά`,
    'meter.moreFor': (n, rate) => `Ακόμη ${n} για ${rate} έκπτωση`,

    'hero3d.label': 'Διαδραστική τρισδιάστατη προβολή των κουτιών μας',
    'hero3d.hint': 'Σύρετε για περιστροφή · Πατήστε το φαγητό για να χοροπηδήσει',
    'hero3d.choose': 'Επιλέξτε κουτί για προβολή',
    'hero3d.order': 'Παραγγείλτε αυτό το κουτί',

    'faq.eyebrow': 'Συχνές ερωτήσεις',
    'faq.title': 'Καλό να ξέρετε',
    'faq.q1': 'Υπάρχει ελάχιστη παραγγελία;',
    'faq.a1': 'Ναι. Η ελάχιστη παραγγελία είναι <span data-min-order></span>, με οποιονδήποτε συνδυασμό κουτιών και πιάτων του μενού.',
    'faq.q2': 'Μπορώ να παραγγείλω από το μενού χωρίς κουτιά;',
    'faq.a2': 'Φυσικά. Μπέργκερ, σάντουιτς μπριός, χοτ ντογκ και σαλάτες παραγγέλνονται μεμονωμένα ή μαζί με οποιαδήποτε παραγγελία κουτιών.',
    'faq.q3': 'Καλύπτετε ειδικές διατροφικές ανάγκες;',
    'faq.a3': 'Ενημερώστε μας για αλλεργίες ή διατροφικές ανάγκες στο πεδίο των σημειώσεων και θα κάνουμε ό,τι καλύτερο μπορούμε.',
    'faq.q4': 'Πόσο νωρίτερα πρέπει να παραγγείλω;',
    'faq.a4': 'Οι παραγγελίες γίνονται τουλάχιστον μία ημέρα νωρίτερα. Για 50+ κουτιά προτείνουμε να παραγγείλετε τρεις ημέρες πριν.',
    'faq.q5': 'Υπάρχει έκπτωση για μεγάλες παραγγελίες;',
    'faq.a5': 'Ναι. Οι εκπτώσεις ποσότητας στα κουτιά εφαρμόζονται αυτόματα στη σύνοψη της παραγγελίας, και η παράδοση είναι δωρεάν πάνω από ένα ποσό.',

    'footer.tagline': 'Catering σε κουτιά, φρεσκοφτιαγμένο κάθε πρωί.',
    'footer.contact': 'Επικοινωνία',
    'footer.hours': 'Ωράριο κουζίνας',
    'footer.hoursValue': 'Δευ–Σάβ · 07:00–21:00',
    'footer.demo': 'Ιστοσελίδα επίδειξης',

    'confirm.title': 'Η παραγγελία σας ελήφθη!',
    'confirm.thanks': (name, date, time) => `Ευχαριστούμε, ${name}! Η παραγγελία σας θα παραδοθεί ${date}, στις ${time}.`,
    'confirm.ref': 'Κωδικός:',
    'confirm.demo': 'Μόνο για επίδειξη. Τίποτα δεν στάλθηκε ούτε χρεώθηκε.',
    'confirm.done': 'Εντάξει',
  },
};

const LANG_KEY = 'nelson-lang';

function initialLang() {
  let saved = null;
  try { saved = localStorage.getItem(LANG_KEY); } catch { /* storage blocked */ }
  if (STRINGS[saved]) return saved;
  return (navigator.language || '').toLowerCase().startsWith('el') ? 'el' : 'en';
}

let lang = initialLang();

// t('key') for plain text, t('key', ...args) for text with values filled in.
function t(key, ...args) {
  const entry = STRINGS[lang][key] ?? STRINGS.en[key];
  return typeof entry === 'function' ? entry(...args) : entry;
}

// Picks the current language from a catalogue { en, el } pair.
const loc = (value) => (value && typeof value === 'object' ? value[lang] ?? value.en : value);

function applyStaticText() {
  const each = (selector, fn) => document.querySelectorAll(selector).forEach(fn);
  document.documentElement.lang = lang;
  document.title = t('meta.title');
  each('[data-i18n]', (el) => { el.textContent = t(el.dataset.i18n); });
  each('[data-i18n-html]', (el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  each('[data-i18n-placeholder]', (el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  each('[data-i18n-aria-label]', (el) => { el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel)); });
  each('[data-lang]', (button) => { button.setAttribute('aria-pressed', String(button.dataset.lang === lang)); });
}

function setLang(next) {
  if (next === lang || !STRINGS[next]) return;
  lang = next;
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* storage blocked */ }
  applyStaticText();
  document.dispatchEvent(new CustomEvent('lang:change', { detail: lang }));
}

document.addEventListener('click', (e) => {
  const flag = e.target.closest('[data-lang]');
  if (flag) setLang(flag.dataset.lang);
});

applyStaticText();
