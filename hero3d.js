'use strict';

/* ------------------------------------------------------------------
 * Playful 3D hero: an open catering box with food built from three.js
 * primitives. Drag to spin, tap food to make it jump, switch boxes.
 *
 * Progressive enhancement: if WebGL or the CDN is unavailable, the
 * CSS box illustration rendered by app.js simply stays in place.
 * Reads BOXES, fmt and chooseBox from app.js, and t / loc from i18n.js.
 * ------------------------------------------------------------------ */

(async function initHero3D() {
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
  const container = document.getElementById('hero-visual');
  if (!container || !window.WebGLRenderingContext) return;

  let THREE;
  let renderer;
  try {
    THREE = await import(THREE_URL);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (err) {
    console.warn('3D hero unavailable, keeping the illustration.', err);
    return;
  }

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scene ---------- */

  const BOX_W = 3.6;
  const BOX_D = 2.7;
  const BOX_H = 0.5; // low walls so the front compartments stay visible
  const WALL = 0.07;
  const DIVIDER_H = 0.32;
  const LID_OPEN = -1.95; // radians around the back hinge

  const BOX_COLORS = {
    kids: { outer: '#f2b630', inner: '#fbe3a1', label: '#e9a923' },
    lunch: { outer: '#c99d63', inner: '#ead5b0', label: '#d9733b' },
  };

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  const lookAt = new THREE.Vector3(0, 0.8, 0);
  const CAMERA_Y = 6;

  scene.add(new THREE.HemisphereLight('#fff6e8', '#c9a06a', 1.6));
  const sun = new THREE.DirectionalLight('#fff1dc', 2.4);
  sun.position.set(3, 7, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 20 });
  sun.shadow.radius = 4;
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.ShadowMaterial({ opacity: 0.16 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Everything that spins with the drag lives in `stage`.
  const stage = new THREE.Group();
  scene.add(stage);

  /* ---------- Materials & geometry helpers ---------- */

  const materials = new Map();
  function mat(color, { flat = false, side = THREE.FrontSide } = {}) {
    const key = `${color}|${flat}|${side}`;
    if (!materials.has(key)) {
      materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, flatShading: flat, side }));
    }
    return materials.get(key);
  }

  function mesh(geometry, material, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x, y, z);
    return m;
  }

  const cyl = (rTop, rBottom, h, color, y = 0, segments = 24) =>
    mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments), mat(color), 0, y, 0);

  // Lumpy, deterministic jitter (same position -> same offset, so faces stay closed).
  function lumpy(geometry, amount) {
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const n = Math.sin(x * 12.9 + y * 78.2 + z * 37.7) * 43758.5;
      const f = 1 + (n - Math.floor(n) - 0.5) * amount;
      pos.setXYZ(i, x * f, y * f, z * f);
    }
    geometry.computeVertexNormals();
    return geometry;
  }

  /* ---------- Food models (origin at the bottom centre, ~1 unit wide) ---------- */

  const FOOD = {
    nugget() {
      const g = new THREE.Group();
      const body = mesh(lumpy(new THREE.IcosahedronGeometry(0.3, 1), 0.35), mat('#d9953b', { flat: true }), 0, 0.17, 0);
      body.scale.set(1.25, 0.6, 0.95);
      g.add(body);
      return g;
    },

    burger() {
      const g = new THREE.Group();
      g.add(cyl(0.36, 0.33, 0.12, '#d9954a', 0.06));
      g.add(cyl(0.39, 0.39, 0.12, '#5a3726', 0.18));
      const cheese = mesh(new THREE.BoxGeometry(0.62, 0.025, 0.62), mat('#f5c242'), 0, 0.25, 0);
      cheese.rotation.y = Math.PI / 4;
      g.add(cheese);
      g.add(cyl(0.42, 0.42, 0.035, '#6fae3f', 0.28));
      const top = mesh(new THREE.SphereGeometry(0.37, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat('#e3a352'), 0, 0.29, 0);
      top.scale.y = 0.75;
      g.add(top);
      const seedGeo = new THREE.SphereGeometry(0.022, 6, 4);
      for (let i = 0; i < 10; i++) {
        const a = i * 2.4;
        const r = 0.08 + (i % 3) * 0.08;
        const seed = mesh(seedGeo, mat('#fff4d6'), Math.cos(a) * r, 0.29 + 0.75 * Math.sqrt(0.37 ** 2 - r ** 2), Math.sin(a) * r);
        seed.scale.set(1, 0.5, 1.7);
        seed.rotation.y = -a;
        g.add(seed);
      }
      return g;
    },

    toast() {
      const g = new THREE.Group();
      const shape = new THREE.Shape();
      shape.moveTo(-0.32, -0.34);
      shape.lineTo(0.32, -0.34);
      shape.lineTo(0.32, 0.08);
      shape.absarc(0, 0.08, 0.32, 0, Math.PI, false);
      shape.lineTo(-0.32, -0.34);
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.11, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 18,
      });
      const slice = mesh(geo, [mat('#f3d79b'), mat('#c27c35')], 0, 0.03, 0);
      slice.rotation.x = -Math.PI / 2;
      g.add(slice);
      const butter = mesh(new THREE.BoxGeometry(0.2, 0.05, 0.15), mat('#fff0a0'), 0.04, 0.18, 0.02);
      butter.rotation.y = 0.4;
      g.add(butter);
      return g;
    },

    kebab() {
      const g = new THREE.Group();
      const pita = cyl(0.5, 0.5, 0.04, '#ecc98a', 0.02, 28);
      pita.scale.z = 0.62;
      g.add(pita);
      const stick = cyl(0.02, 0.02, 1.2, '#d6b47e', 0.17, 8);
      stick.rotation.z = Math.PI / 2;
      g.add(stick);
      ['#e0ad6a', '#d4432f', '#e0ad6a', '#f1e4d8', '#e0ad6a', '#6fae3f'].forEach((color, i) => {
        const chicken = color === '#e0ad6a';
        const piece = mesh(new THREE.DodecahedronGeometry(chicken ? 0.14 : 0.11, 0), mat(color, { flat: true }), -0.45 + i * 0.18, 0.17, 0);
        piece.rotation.set(i, i * 1.3, 0);
        g.add(piece);
      });
      return g;
    },

    hotdog() {
      const g = new THREE.Group();
      const bun = mesh(new THREE.CapsuleGeometry(0.17, 0.6, 6, 16), mat('#e2a45a'), 0, 0.13, 0);
      bun.rotation.z = Math.PI / 2;
      bun.scale.set(0.75, 1, 1.35);
      g.add(bun);
      const sausage = mesh(new THREE.CapsuleGeometry(0.1, 0.76, 6, 16), mat('#b9472d'), 0, 0.24, 0);
      sausage.rotation.z = Math.PI / 2;
      g.add(sausage);
      const zigzag = Array.from({ length: 13 }, (_, i) => new THREE.Vector3(-0.38 + i * (0.76 / 12), 0.335, i % 2 ? 0.05 : -0.05));
      g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(zigzag), 64, 0.02, 6), mat('#f2c230')));
      return g;
    },

    salad() {
      const g = new THREE.Group();
      const profile = [[0.001, 0], [0.22, 0], [0.3, 0.05], [0.4, 0.16], [0.46, 0.28], [0.44, 0.29], [0.38, 0.18], [0.28, 0.08], [0.001, 0.06]]
        .map(([x, y]) => new THREE.Vector2(x, y));
      g.add(mesh(new THREE.LatheGeometry(profile, 32), mat('#fbf8f2', { side: THREE.DoubleSide })));
      const greens = ['#7cb342', '#5d9a35', '#9ccc65'];
      for (let i = 0; i < 11; i++) {
        const a = i * 2.2;
        const r = i === 0 ? 0 : 0.12 + (i % 3) * 0.08;
        const leaf = mesh(lumpy(new THREE.IcosahedronGeometry(0.12, 0), 0.4), mat(greens[i % 3], { flat: true }),
          Math.cos(a) * r, 0.2 + (i % 2) * 0.05, Math.sin(a) * r);
        leaf.scale.y = 0.55;
        leaf.rotation.set(a, a * 0.7, 0);
        g.add(leaf);
      }
      for (let i = 0; i < 5; i++) {
        const a = i * 1.3 + 0.4;
        const crouton = mesh(new THREE.BoxGeometry(0.08, 0.07, 0.08), mat('#d9a35a', { flat: true }), Math.cos(a) * 0.2, 0.3, Math.sin(a) * 0.2);
        crouton.rotation.set(a, a, a);
        g.add(crouton);
      }
      for (let i = 0; i < 4; i++) {
        const a = i * 1.7;
        const shaving = mesh(new THREE.BoxGeometry(0.13, 0.01, 0.05), mat('#f6eed3'), Math.cos(a) * 0.12, 0.33, Math.sin(a) * 0.12);
        shaving.rotation.y = a;
        g.add(shaving);
      }
      return g;
    },
  };

  /* ---------- Interactive food (hover lift, tap to jump) ---------- */

  const interactive = [];

  function makeInteractive(root, { baseY, scale, popIn = true }) {
    root.userData = {
      interactive: true, baseY, scale, pop: popIn ? 0 : 1,
      lift: 0, liftV: 0, jumpY: 0, jumpV: 0, spin: 0, spinV: 0,
      baseRotY: root.rotation.y, phase: Math.random() * Math.PI * 2, hovered: false,
    };
    root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    interactive.push(root);
    return root;
  }

  function updateFood(root, dt, t) {
    const s = root.userData;
    const target = s.hovered ? 0.18 : 0;
    s.liftV += ((target - s.lift) * 120 - s.liftV * 14) * dt;
    s.lift += s.liftV * dt;
    if (s.jumpY > 0 || s.jumpV !== 0) {
      s.jumpV -= 14 * dt;
      s.jumpY += s.jumpV * dt;
      if (s.jumpY <= 0) {
        s.jumpY = 0;
        s.jumpV = Math.abs(s.jumpV) > 1 ? -s.jumpV * 0.35 : 0;
      }
    }
    s.spin += s.spinV * dt;
    s.spinV *= Math.exp(-2.5 * dt);
    const bob = reduceMotion ? 0 : Math.sin(t * 2 + s.phase) * 0.015;
    const wobble = s.hovered && !reduceMotion ? Math.sin(t * 9) * 0.08 : 0;
    root.position.y = s.baseY + s.lift + s.jumpY + bob;
    root.rotation.y = s.baseRotY + s.spin;
    root.rotation.z = wobble;
    root.scale.setScalar(Math.max(0.0001, s.scale * s.pop));
  }

  function jump(root) {
    const s = root.userData;
    if (s.jumpY > 0.05) return;
    s.jumpV = reduceMotion ? 0 : 4.2;
    s.spinV += (Math.random() < 0.5 ? -1 : 1) * 10;
  }

  /* ---------- The box ---------- */

  // Same layout rule as the CSS illustration: two rows; with an odd count the first item is double height.
  function cellLayout(n) {
    const cols = Math.ceil(n / 2);
    const tallFirst = n % 2 === 1;
    const start = tallFirst ? 1 : 0;
    const cells = [];
    for (let i = 0; i < n; i++) {
      if (tallFirst && i === 0) {
        cells.push({ col: 0, row: 0, rows: 2 });
      } else {
        const k = i - start;
        cells.push({ col: start + (k % (cols - start)), row: Math.floor(k / (cols - start)), rows: 1 });
      }
    }
    return { cols, cells, tallFirst };
  }

  function labelTexture(box, colors) {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fffaf2';
    ctx.beginPath();
    ctx.roundRect(24, 24, 720, 464, 48);
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = colors.label;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1f3d2b';
    ctx.font = '700 64px Fraunces, Georgia, serif';
    ctx.fillText('Nelson Catering', 384, 150);
    ctx.font = '120px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.fillText(box.items.map((i) => i.icon).join(''), 384, 300);
    ctx.fillStyle = colors.label;
    const caption = `${loc(box.name)} · ${fmt(box.price)}`;
    const font = (size) => `700 ${size}px Inter, "Segoe UI", sans-serif`;
    ctx.font = font(58);
    ctx.font = font(Math.min(58, Math.floor((58 * 660) / ctx.measureText(caption).width))); // shrink longer names to fit
    ctx.fillText(caption, 384, 420);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }

  function buildBox(box) {
    const colors = BOX_COLORS[box.id] || BOX_COLORS.lunch;
    const group = new THREE.Group();
    const outer = mat(colors.outer);
    const inner = mat(colors.inner);
    const innerW = BOX_W - WALL * 2;
    const innerD = BOX_D - WALL * 2;

    const add = (geo, material, x, y, z) => {
      const m = mesh(geo, material, x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
      return m;
    };

    // Tray
    add(new THREE.BoxGeometry(BOX_W, WALL, BOX_D), inner, 0, WALL / 2, 0);
    add(new THREE.BoxGeometry(BOX_W, BOX_H, WALL), outer, 0, BOX_H / 2, BOX_D / 2 - WALL / 2);
    add(new THREE.BoxGeometry(BOX_W, BOX_H, WALL), outer, 0, BOX_H / 2, -BOX_D / 2 + WALL / 2);
    add(new THREE.BoxGeometry(WALL, BOX_H, innerD), outer, BOX_W / 2 - WALL / 2, BOX_H / 2, 0);
    add(new THREE.BoxGeometry(WALL, BOX_H, innerD), outer, -BOX_W / 2 + WALL / 2, BOX_H / 2, 0);

    // Compartments
    const { cols, cells, tallFirst } = cellLayout(box.items.length);
    const cellW = innerW / cols;
    const cellD = innerD / 2;
    for (let c = 1; c < cols; c++) {
      add(new THREE.BoxGeometry(WALL * 0.7, DIVIDER_H, innerD), inner, -innerW / 2 + c * cellW, DIVIDER_H / 2, 0);
    }
    for (let c = tallFirst ? 1 : 0; c < cols; c++) {
      add(new THREE.BoxGeometry(cellW, DIVIDER_H, WALL * 0.7), inner, -innerW / 2 + (c + 0.5) * cellW, DIVIDER_H / 2, 0);
    }

    // Food, one interactive piece per item unit (3 nuggets jump separately)
    const foods = [];
    box.items.forEach((item, i) => {
      const cell = cells[i];
      const cx = -innerW / 2 + (cell.col + 0.5) * cellW;
      const cz = -innerD / 2 + (cell.row + cell.rows / 2) * cellD;
      const depth = cellD * cell.rows;
      const scale = Math.min(cellW, cellD) * 0.78;
      for (let q = 0; q < item.qty; q++) {
        const build = FOOD[item.model] || FOOD.nugget;
        const root = build();
        const spread = item.qty > 1 ? (q - (item.qty - 1) / 2) * (depth / item.qty) * 0.95 : 0;
        root.position.set(cx + (item.qty > 1 ? (q % 2 ? 0.08 : -0.08) : 0), WALL, cz + spread);
        root.rotation.y = item.model === 'kebab' ? 0.35 : (q * 1.7 + i) * 0.6;
        const s = item.qty > 1 ? scale * 0.82 : scale;
        group.add(makeInteractive(root, { baseY: WALL, scale: s }));
        foods.push(root);
      }
    });

    // Lid, hinged at the back edge; the label sits on its underside so it faces you when open
    const lid = new THREE.Group();
    lid.position.set(0, BOX_H, -BOX_D / 2);
    const panel = mesh(new THREE.BoxGeometry(BOX_W + 0.04, WALL, BOX_D + 0.04), outer, 0, WALL / 2, BOX_D / 2);
    panel.castShadow = true;
    lid.add(panel);
    const texture = labelTexture(box, colors);
    const label = mesh(new THREE.PlaneGeometry(BOX_W * 0.72, BOX_W * 0.48), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9 }), 0, -0.002, BOX_D / 2);
    label.rotation.x = Math.PI / 2;
    lid.add(label);
    group.add(lid);

    return { box, group, lid, label, foods, texture };
  }

  function disposeBox(built) {
    stage.remove(built.group);
    built.group.traverse((o) => { if (o.isMesh) o.geometry.dispose(); });
    built.texture.dispose();
    built.label.material.dispose();
    built.foods.forEach((f) => interactive.splice(interactive.indexOf(f), 1));
  }

  /* ---------- Floating extras from the menu ---------- */

  // Positions are in stage space (before the stage's default yaw of -0.5 rad).
  const floaters = [
    { model: 'burger', pos: [-2.0, 3.0, -0.6], scale: 0.7 },
    { model: 'hotdog', pos: [1.8, 2.7, -1.5], scale: 0.75 },
    { model: 'salad', pos: [2.75, 0.7, -0.15], scale: 0.65 },
    { model: 'nugget', pos: [-2.15, 1.2, 1.5], scale: 0.85 },
  ].map(({ model, pos, scale }, i) => {
    const root = FOOD[model]();
    root.position.set(...pos);
    root.rotation.set(0.3, i, 0.2);
    stage.add(makeInteractive(root, { baseY: pos[1], scale, popIn: false }));
    root.traverse((o) => { o.castShadow = false; }); // floating, so no ground shadow
    return root;
  });

  /* ---------- Tiny tween helper ---------- */

  let elapsed = 0;
  const tweens = new Set();
  const ease = {
    linear: (p) => p,
    inCubic: (p) => p * p * p,
    outBack: (p) => 1 + 2.4 * (p - 1) ** 3 + 1.4 * (p - 1) ** 2,
    outElastic: (p) => (p === 0 || p === 1 ? p : 2 ** (-10 * p) * Math.sin((p * 10 - 0.75) * (2 * Math.PI / 3)) + 1),
  };
  function tween(duration, easing, update) {
    const d = reduceMotion ? 0 : duration;
    return new Promise((resolve) => tweens.add({ start: elapsed, duration: d, easing, update, resolve }));
  }
  const wait = (s) => tween(s, ease.linear, () => {});
  function runTweens() {
    tweens.forEach((tw) => {
      const p = tw.duration ? Math.min(1, (elapsed - tw.start) / tw.duration) : 1;
      tw.update(tw.easing(p));
      if (p === 1) {
        tweens.delete(tw);
        tw.resolve();
      }
    });
  }

  /* ---------- Box switching ---------- */

  let current = null;
  let currentId = null;
  let busy = false;
  let pendingId = null; // a box requested while an animation was running

  async function openBox(built) {
    const tasks = [tween(0.9, ease.outBack, (p) => { built.lid.rotation.x = LID_OPEN * p; })];
    built.foods.forEach((food, i) => {
      tasks.push(wait(0.25 + i * 0.09).then(() => tween(0.7, ease.outElastic, (p) => { food.userData.pop = p; })));
    });
    await Promise.all(tasks);
  }

  async function closeBox(built) {
    const startAngle = built.lid.rotation.x;
    await Promise.all([
      tween(0.4, ease.inCubic, (p) => { built.lid.rotation.x = startAngle * (1 - p); }),
      ...built.foods.map((food) => tween(0.25, ease.inCubic, (p) => { food.userData.pop = 1 - p; })),
    ]);
  }

  async function showBox(id) {
    if (busy) {
      pendingId = id;
      return;
    }
    const box = BOXES.find((b) => b.id === id);
    if (!box || id === currentId) return;
    busy = true;
    currentId = id;
    updateChips();

    if (current) {
      await closeBox(current);
      // Little hop as the closed box changes
      await tween(0.18, ease.linear, (p) => { current.group.position.y = Math.sin(p * Math.PI) * 0.25; });
      disposeBox(current);
    }
    current = buildBox(box);
    stage.add(current.group);
    await openBox(current);
    busy = false;

    if (pendingId) {
      const next = pendingId;
      pendingId = null;
      showBox(next);
    }
  }

  /* ---------- UI overlay ---------- */

  container.innerHTML = '';
  container.classList.add('is-3d');
  const canvas = renderer.domElement;
  canvas.className = 'hero3d-canvas';
  canvas.setAttribute('role', 'img');
  container.append(canvas);

  const ui = document.createElement('div');
  ui.className = 'hero3d-ui';
  container.append(ui);
  container.removeAttribute('aria-hidden');

  function renderUi() {
    canvas.setAttribute('aria-label', t('hero3d.label'));
    ui.innerHTML = `
      <p class="hero3d-hint">${t('hero3d.hint')}</p>
      <div class="hero3d-actions">
        <div class="chip-group" role="group" aria-label="${t('hero3d.choose')}">
          ${BOXES.map((b) => `<button type="button" class="chip" data-show-box="${b.id}" aria-pressed="false">${b.icon} ${loc(b.name)} · ${fmt(b.price)}</button>`).join('')}
        </div>
        <button type="button" class="btn btn-primary btn-sm hero3d-order">${t('hero3d.order')}</button>
      </div>`;
    updateChips();
  }

  function updateChips() {
    ui.querySelectorAll('[data-show-box]').forEach((chip) => {
      const active = chip.dataset.showBox === currentId;
      chip.classList.toggle('active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
  }

  renderUi();

  let lastInteraction = -Infinity;
  ui.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-show-box]');
    if (chip) {
      lastInteraction = performance.now();
      showBox(chip.dataset.showBox);
    }
    if (e.target.closest('.hero3d-order') && currentId) chooseBox(currentId);
  });

  /* ---------- Pointer: drag to spin, hover & tap food ---------- */

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const parallax = { x: 0, y: 0 };
  let yaw = 0;
  let yawV = 0;
  let pitch = 0;
  let drag = null;
  let hovered = null;

  function foodAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(interactive, true)[0];
    let o = hit && hit.object;
    while (o && !o.userData.interactive) o = o.parent;
    return o || null;
  }

  function setHovered(food) {
    if (hovered === food) return;
    if (hovered) hovered.userData.hovered = false;
    hovered = food;
    if (hovered) hovered.userData.hovered = true;
    canvas.style.cursor = drag && drag.moved ? 'grabbing' : hovered ? 'pointer' : 'grab';
  }

  canvas.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY, moved: false };
    canvas.setPointerCapture(e.pointerId);
    lastInteraction = performance.now();
  });

  canvas.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    parallax.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    parallax.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    if (drag) {
      const dx = e.clientX - drag.lastX;
      const dy = e.clientY - drag.lastY;
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 5) drag.moved = true;
      if (drag.moved) {
        yaw += dx * 0.012;
        yawV = dx * 0.6;
        pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, -0.25, 0.3);
        setHovered(null);
      }
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
    } else {
      setHovered(foodAt(e.clientX, e.clientY));
    }
  });

  canvas.addEventListener('pointerup', (e) => {
    if (drag && !drag.moved) {
      const food = foodAt(e.clientX, e.clientY);
      if (food) jump(food);
    }
    drag = null;
    lastInteraction = performance.now();
    setHovered(e.pointerType === 'mouse' ? foodAt(e.clientX, e.clientY) : null);
  });

  // The browser took over the gesture (e.g. vertical page scroll on touch)
  canvas.addEventListener('pointercancel', () => { drag = null; });

  canvas.addEventListener('pointerleave', () => {
    parallax.x = 0;
    parallax.y = 0;
    if (!drag) setHovered(null);
  });

  /* ---------- Sizing, visibility & render loop ---------- */

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull the camera back on narrow screens so the box and floaters still fit
    const distance = camera.aspect >= 1.1 ? 9 : (9 * 1.1) / camera.aspect;
    camera.userData.distance = distance;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(container);
  resize();

  let visible = true;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    renderer.setAnimationLoop(visible ? frame : null);
  }).observe(container);

  const clock = new THREE.Clock();
  const baseYaw = -0.5;

  function frame() {
    const dt = Math.min(clock.getDelta(), 1 / 20);
    elapsed += dt;
    runTweens();

    // Spin: drag inertia, then drift back to a gentle sway
    if (!drag) {
      yaw += yawV * dt;
      yawV *= Math.exp(-3 * dt);
      if (Math.abs(yawV) < 0.4) yaw += (0 - yaw) * (1 - Math.exp(-0.8 * dt));
      pitch += (0 - pitch) * (1 - Math.exp(-2 * dt));
    }
    const sway = reduceMotion ? 0 : Math.sin(elapsed * 0.45) * 0.22;
    stage.rotation.y = baseYaw + sway + yaw;
    stage.rotation.x = pitch;

    interactive.forEach((food) => updateFood(food, dt, elapsed));
    if (!reduceMotion) {
      // Floating extras drift and turn slowly
      floaters.forEach((f, i) => {
        f.userData.baseRotY += dt * (0.25 + i * 0.08);
        f.position.y += Math.sin(elapsed * 1.2 + i * 1.7) * 0.15;
      });
    }

    const distance = camera.userData.distance || 9;
    const px = reduceMotion ? 0 : parallax.x * 0.35;
    const py = reduceMotion ? 0 : -parallax.y * 0.2;
    camera.position.set(px, CAMERA_Y + py, distance);
    camera.lookAt(lookAt);
    renderer.render(scene, camera);
  }

  document.addEventListener('visibilitychange', () => {
    renderer.setAnimationLoop(!document.hidden && visible ? frame : null);
    clock.getDelta();
  });

  // Auto-play between boxes until the visitor takes over
  setInterval(() => {
    if (reduceMotion || busy || !visible || document.hidden) return;
    if (performance.now() - lastInteraction < 10000) return;
    const next = BOXES[(BOXES.findIndex((b) => b.id === currentId) + 1) % BOXES.length];
    showBox(next.id);
  }, 6500);

  // Redraw the lid label once the web fonts are in, and when the language changes
  function refreshLabel() {
    if (!current) return;
    current.texture.dispose();
    current.texture = labelTexture(current.box, BOX_COLORS[current.box.id] || BOX_COLORS.lunch);
    current.label.material.map = current.texture;
    current.label.material.needsUpdate = true;
  }
  document.fonts.ready.then(refreshLabel);

  document.addEventListener('lang:change', () => {
    renderUi();
    refreshLabel();
  });

  renderer.setAnimationLoop(frame);
  showBox(BOXES[0].id);
})();
