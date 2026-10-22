'use strict';

/* ------------------------------------------------------------------
 * Playful d3 layer for the order:
 *  - a "tray" where each line of the order is a food bubble
 *    (bubble area ~ line value) that you can drag and toss around;
 *  - meters towards free delivery and the next box discount, with a
 *    confetti pop when a perk unlocks;
 *  - menu items fly into the header "Order now" button when added.
 * The summary list and hint text remain the accessible equivalent.
 * Reads PRODUCTS, ORDER_RULES, fmt, percent and orderSnapshot from app.js.
 * ------------------------------------------------------------------ */

(function initOrderViz() {
  if (!window.d3 || typeof orderSnapshot !== 'function') return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ms = (n) => (reduceMotion ? 0 : n);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const CONFETTI_COLORS = ['#d9733b', '#e9a923', '#6b8f71', '#1f3d2b', '#f4c65a'];

  let lastSnapshot = orderSnapshot();

  /* ---------- Tray of food bubbles ---------- */

  const TRAY_H = 200;
  const GAP = 2;
  const tray = d3.select('#order-tray');
  let trayW = tray.node().clientWidth || 320;

  const svg = tray.append('svg').attr('class', 'tray-svg').attr('height', TRAY_H);
  const plate = svg.append('rect').attr('class', 'tray-plate').attr('rx', 18).attr('height', TRAY_H);
  const empty = svg.append('g').attr('class', 'tray-empty');
  empty.append('text').attr('class', 'tray-empty-icon').attr('y', -22).text('🍽️');
  empty.append('text').attr('class', 'tray-empty-text').attr('y', 18).text('Your tray is empty');
  empty.append('text').attr('class', 'tray-empty-sub').attr('y', 40).text('Add a box or something from the menu');
  const layer = svg.append('g');
  const tip = tray.append('div').attr('class', 'tray-tip').attr('hidden', true);

  const nodes = new Map(); // product id -> simulation node, kept across updates so bubbles don't jump
  const simulation = d3.forceSimulation()
    .force('x', d3.forceX(trayW / 2).strength(0.05))
    .force('y', d3.forceY(TRAY_H / 2).strength(0.09))
    .force('collide', d3.forceCollide((d) => d.r + GAP).iterations(3))
    .alphaDecay(0.03)
    .on('tick', tick);
  simulation.stop();

  const dragBehaviour = d3.drag()
    .on('start', (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      hideTip();
    })
    .on('drag', (event, d) => {
      d.fx = clamp(event.x, d.r, trayW - d.r);
      d.fy = clamp(event.y, d.r, TRAY_H - d.r);
    })
    .on('end', (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });

  function sizeTray() {
    trayW = tray.node().clientWidth || trayW;
    svg.attr('width', trayW);
    plate.attr('width', trayW);
    empty.attr('transform', `translate(${trayW / 2},${TRAY_H / 2})`);
    simulation.force('x').x(trayW / 2);
  }

  function updateTray(lines) {
    const total = d3.sum(lines, (l) => l.value);
    // Bubble area is proportional to the line's value; together they fill ~36% of the tray.
    const k = total ? Math.sqrt((0.36 * trayW * TRAY_H) / (Math.PI * total)) : 0;
    const maxR = TRAY_H * 0.36;
    const present = new Set();

    lines.forEach((line) => {
      present.add(line.id);
      let node = nodes.get(line.id);
      if (!node) {
        // New lines drop in from the top of the tray
        node = { id: line.id, x: trayW * (0.3 + Math.random() * 0.4), y: 0, r: 0, qty: 0 };
        nodes.set(line.id, node);
      }
      const targetR = clamp(k * Math.sqrt(line.value), 20, maxR);
      if (!reduceMotion && line.qty > node.qty && node.r > 0) node.r *= 1.18; // little "pop" when it grows
      Object.assign(node, { line, qty: line.qty, targetR, leaving: false });
    });
    nodes.forEach((node, id) => {
      if (!present.has(id)) Object.assign(node, { leaving: true, targetR: 0 });
    });

    empty.transition().duration(ms(250)).style('opacity', lines.length ? 0 : 1);

    if (reduceMotion) {
      nodes.forEach((node, id) => {
        if (node.leaving) nodes.delete(id);
        else node.r = node.targetR;
      });
      renderBubbles();
      simulation.nodes([...nodes.values()]).stop().tick(200);
      tick();
    } else {
      renderBubbles();
      simulation.nodes([...nodes.values()]).alpha(0.8).restart();
    }
  }

  function tick() {
    let removed = false;
    let growing = false;
    nodes.forEach((n, id) => {
      if (!reduceMotion) n.r += (n.targetR - n.r) * 0.18;
      if (Math.abs(n.targetR - n.r) > 0.5) growing = true;
      if (n.leaving && n.r < 0.6) {
        nodes.delete(id);
        removed = true;
        return;
      }
      n.x = clamp(n.x, n.r + GAP, trayW - n.r - GAP);
      n.y = clamp(n.y, n.r + GAP, TRAY_H - n.r - GAP);
    });
    if (removed) {
      simulation.nodes([...nodes.values()]);
      renderBubbles();
    }
    if (growing || removed) {
      // forceCollide caches radii, so refresh them while bubbles grow or shrink
      simulation.force('collide').radius((d) => d.r + GAP);
      if (simulation.alpha() < 0.05) simulation.alpha(0.1);
    }
    layer.selectAll('g.bubble')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .each(drawBubble);
  }

  function renderBubbles() {
    const bubbles = layer.selectAll('g.bubble').data([...nodes.values()], (d) => d.id);
    bubbles.exit().remove();
    const enter = bubbles.enter().append('g')
      .attr('class', 'bubble')
      .on('pointerenter', (event, d) => showTip(d))
      .on('pointerleave', hideTip)
      .call(dragBehaviour);
    enter.append('circle').attr('class', 'bubble-disc');
    enter.append('text').attr('class', 'bubble-icon');
    enter.append('text').attr('class', 'bubble-label');
    const badge = enter.append('g').attr('class', 'bubble-qty');
    badge.append('rect').attr('rx', 9).attr('height', 18).attr('y', -9);
    badge.append('text');
  }

  function drawBubble(d) {
    const g = d3.select(this);
    const r = Math.max(0, d.r);
    const name = d.line.short || d.line.name;
    const showLabel = r >= 30 && name.length * 6.4 < r * 1.7; // only when it fits inside the bubble
    g.select('.bubble-disc').attr('r', r);
    g.select('.bubble-icon')
      .attr('y', showLabel ? -r * 0.16 : 0)
      .style('font-size', `${r * (showLabel ? 0.72 : 0.92)}px`)
      .text(d.line.icon);
    g.select('.bubble-label')
      .attr('y', r * 0.5)
      .style('display', showLabel ? null : 'none')
      .text(name);
    const qty = `×${d.qty}`;
    const w = 10 + qty.length * 6.5;
    g.select('.bubble-qty')
      .attr('transform', `translate(${r * 0.7},${r * 0.7})`)
      .style('display', r > 10 ? null : 'none');
    g.select('.bubble-qty rect').attr('x', -w / 2).attr('width', w);
    g.select('.bubble-qty text').text(qty);
  }

  function showTip(d) {
    tip.attr('hidden', null).html('');
    tip.append('strong').text(`${d.qty} × ${d.line.name}`);
    tip.append('span').text(fmt(d.line.value));
    tip.style('left', `${clamp(d.x, 80, trayW - 80)}px`).style('top', `${d.y - d.r - 6}px`);
  }

  function hideTip() {
    tip.attr('hidden', true);
  }

  /* ---------- Perk meters ---------- */

  const metersRoot = d3.select('#perk-meters');

  function createMeter({ icon, title, ticks = [] }) {
    const root = metersRoot.append('div').attr('class', 'meter');
    const head = root.append('div').attr('class', 'meter-head');
    head.append('span').attr('class', 'meter-title').text(`${icon} ${title}`);
    const status = head.append('span').attr('class', 'meter-status');
    const height = ticks.length ? 40 : 24;
    const meterSvg = root.append('svg').attr('class', 'meter-svg').attr('height', height);
    const trackY = 12;
    const track = meterSvg.append('rect').attr('class', 'meter-track').attr('y', trackY - 5).attr('height', 10).attr('rx', 5);
    const fill = meterSvg.append('rect').attr('class', 'meter-fill').attr('y', trackY - 5).attr('height', 10).attr('rx', 5).attr('width', 0);
    const tickLayer = meterSvg.append('g');
    const rider = meterSvg.append('text').attr('class', 'meter-rider').attr('y', trackY).text(icon);
    return { root, status, svg: meterSvg, track, fill, tickLayer, rider, trackY, ticks, value: 0, reached: 0 };
  }

  const deliveryMeter = createMeter({ icon: '🚚', title: 'Free delivery' });
  const discountMeter = createMeter({ icon: '📦', title: 'Box discount', ticks: [...ORDER_RULES.boxDiscounts].reverse() });

  function renderMeter(m, { value, max, status, reachedLevel, animate }) {
    const w = m.svg.node().clientWidth || 280;
    const pad = 10; // keeps the rider emoji inside the card at both ends
    const x = d3.scaleLinear().domain([0, max]).range([pad, w - pad]).clamp(true);
    const duration = animate ? ms(750) : 0;
    const easing = value >= m.value ? d3.easeBackOut.overshoot(1.3) : d3.easeCubicOut;

    m.track.attr('x', pad).attr('width', w - pad * 2);
    m.fill.attr('x', pad).transition().duration(duration).ease(easing)
      .attr('width', Math.max(0, x(value) - pad));
    m.rider.transition().duration(duration).ease(easing).attr('x', x(value));

    const tickSel = m.tickLayer.selectAll('g.meter-tick-group').data(m.ticks, (t) => t.min);
    const tickEnter = tickSel.enter().append('g').attr('class', 'meter-tick-group');
    tickEnter.append('circle').attr('class', 'meter-tick').attr('r', 5).attr('cy', m.trackY);
    tickEnter.append('text').attr('class', 'meter-tick-label').attr('y', m.trackY + 22);
    tickSel.merge(tickEnter).each(function (t, i) {
      const g = d3.select(this);
      const last = i === m.ticks.length - 1;
      g.select('circle').attr('cx', x(t.min)).classed('reached', value >= t.min);
      g.select('text')
        .attr('x', last ? w - pad + 4 : x(t.min))
        .attr('text-anchor', last ? 'end' : 'middle')
        .text(`${t.min}+ · ${percent(t.rate)} off`);
    });

    m.status.text(status).classed('reached', reachedLevel > 0);
    if (animate && reachedLevel > m.reached) {
      setTimeout(() => confetti(m, x(value)), duration * 0.6);
    }
    m.value = value;
    m.reached = reachedLevel;
  }

  function updateMeters(order, animate) {
    const { freeDeliveryFrom, boxDiscounts } = ORDER_RULES;
    const freeDelivery = !order.empty && order.discounted >= freeDeliveryFrom;
    renderMeter(deliveryMeter, {
      value: order.discounted,
      max: freeDeliveryFrom,
      status: order.empty ? `Over ${fmt(freeDeliveryFrom)}` : freeDelivery ? 'Unlocked! 🎉' : `${fmt(freeDeliveryFrom - order.discounted)} to go`,
      reachedLevel: freeDelivery ? 1 : 0,
      animate,
    });

    const ascending = [...boxDiscounts].reverse();
    const next = ascending.find((d) => order.boxes < d.min);
    const level = ascending.filter((d) => order.boxes >= d.min).length;
    let status;
    if (order.discountRate > 0) status = `${percent(order.discountRate)} off unlocked`;
    else if (order.boxes === 0) status = `From ${ascending[0].min} boxes`;
    else status = `${next.min - order.boxes} more for ${percent(next.rate)} off`;
    renderMeter(discountMeter, {
      value: order.boxes,
      max: ascending[ascending.length - 1].min,
      status,
      reachedLevel: level,
      animate,
    });
  }

  function confetti(meter, x) {
    if (reduceMotion) return;
    const host = meter.root;
    const svgNode = meter.svg.node();
    const originX = svgNode.offsetLeft + x;
    const originY = svgNode.offsetTop + meter.trackY;
    d3.range(20).forEach((i) => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
      const distance = 28 + Math.random() * 42;
      host.append('span')
        .attr('class', 'confetti')
        .style('left', `${originX}px`)
        .style('top', `${originY}px`)
        .style('background', CONFETTI_COLORS[i % CONFETTI_COLORS.length])
        .style('transform', 'translate(0px, 0px) rotate(0deg)')
        .transition()
        .duration(900 + Math.random() * 400)
        .ease(d3.easeCubicOut)
        .style('transform', `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance + 18}px) rotate(${Math.random() * 540}deg)`)
        .style('opacity', 0)
        .remove();
    });
  }

  /* ---------- Fly-to-cart ---------- */

  const cartButton = document.querySelector('.site-header .btn-primary');

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add]');
    if (!button || reduceMotion || !cartButton) return;
    const product = PRODUCTS.find((p) => p.id === button.dataset.add);
    const from = button.getBoundingClientRect();
    const to = cartButton.getBoundingClientRect();
    const x0 = from.left + from.width / 2;
    const y0 = from.top + from.height / 2;
    const x1 = to.left + to.width / 2;
    const y1 = to.top + to.height / 2;
    const cx = (x0 + x1) / 2 + 80;
    const cy = Math.max(20, Math.min(y0, y1) - 160);

    d3.select('body').append('span')
      .attr('class', 'flyer')
      .attr('aria-hidden', 'true')
      .text(product.icon)
      .transition()
      .duration(850)
      .ease(d3.easeCubicInOut)
      .tween('fly', function () {
        // Quadratic Bézier arc from the button to the cart
        return (t) => {
          const u = 1 - t;
          const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
          const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
          this.style.transform = `translate(${x}px, ${y}px) scale(${1.4 - 0.8 * t}) rotate(${t * 360}deg)`;
        };
      })
      .on('end', function () {
        this.remove();
        cartButton.classList.remove('bump');
        void cartButton.offsetWidth; // restart the CSS animation
        cartButton.classList.add('bump');
      });
  });

  /* ---------- Wiring ---------- */

  function update(snapshot, { animate = true } = {}) {
    lastSnapshot = snapshot;
    updateTray(snapshot.lines);
    updateMeters(snapshot.order, animate);
  }

  document.addEventListener('order:change', (event) => update(event.detail));

  // Only re-lay out on width changes; the card's height changes with every order update.
  let observedWidth = 0;
  new ResizeObserver(([entry]) => {
    const width = Math.round(entry.contentRect.width);
    if (width === observedWidth) return;
    observedWidth = width;
    sizeTray();
    updateTray(lastSnapshot.lines);
    updateMeters(lastSnapshot.order, false);
  }).observe(document.querySelector('.summary'));

  sizeTray();
  update(lastSnapshot, { animate: false });
})();
