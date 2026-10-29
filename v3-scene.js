// Cena 3D da v3: um objeto por projeto de projects-v2.js, todos feitos com primitivas do three.js.
// No hero os objetos orbitam; no scroll, cada estação puxa o seu objeto para o foco;
// fora das estações eles recuam para o fundo (some na neblina) e no contato voltam a girar em volta do texto.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const root = document.documentElement;
const canvas = document.getElementById('scene');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer = null;

// ---------- helpers ----------
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const easeInOut = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .45, metalness: 0, ...o });
const rbox = (w, h, d, r, m) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), m);
const cyl = (r, len, m, seg = 32) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), m);
const DISPLAY = '"Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

// ---------- objetos ----------

// BRCHAD Games: uma cruzadinha 5x5 em cubos (CAIO, CRIAR, IDEIA, GAME); o IDEIA vertical está por preencher
// '#' é casa preta, '.' é casa branca sem letra
function makeGrid() {
  const g = new THREE.Group();
  const rows = ['CAIO#', 'R#.#G', 'IDEIA', 'A#.#M', 'R#.#E'];
  const clues = { '0,0': 1, '0,2': 2, '1,4': 3, '2,0': 4 };
  const s = .42, step = .47;
  const cubeGeo = new RoundedBoxGeometry(s, s, s, 3, .05);
  const letterGeo = new THREE.PlaneGeometry(s * .9, s * .9);
  const white = mat(0xf4f1ea, { roughness: .6 });
  const black = mat(0x1a1d26, { roughness: .3 });
  const cells = [];
  rows.forEach((row, r) => [...row].forEach((ch, c) => {
    const cell = new THREE.Group();
    cell.position.set((c - 2) * step, (2 - r) * step, 0);
    const blank = ch === '#';
    cell.add(new THREE.Mesh(cubeGeo, blank ? black : white));
    if (!blank && ch !== '.') {
      const map = canvasTex(128, 128, (x, w) => {
        x.fillStyle = '#12141a';
        x.font = `800 82px ${DISPLAY}`;
        x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText(ch, w / 2, w / 2 + 6);
        const n = clues[r + ',' + c];
        if (n) { x.font = `500 22px ${MONO}`; x.textAlign = 'left'; x.textBaseline = 'top'; x.fillText(n, 10, 8); }
      });
      const face = new THREE.Mesh(letterGeo, new THREE.MeshStandardMaterial({ map, transparent: true, roughness: .6 }));
      face.position.z = s / 2 + .002;
      cell.add(face);
    }
    cell.userData = { r, c, blank };
    g.add(cell); cells.push(cell);
  }));
  g.userData.tick = (t, dt, f) => {
    for (const cell of cells) {
      const { r, c, blank } = cell.userData;
      cell.position.z = blank ? -.08 : Math.sin(t * 2 - (r + c) * .6) * .05 * (.4 + f);
      // uma onda de cubos virando atravessa a grade na diagonal a cada 4 s
      const ph = ((t * .5 - (r + c) * .06) % 2 + 2) % 2;
      cell.rotation.x = blank || ph > .5 ? 0 : easeInOut(ph / .5) * Math.PI * 2;
    }
  };
  return g;
}

// the stained hanes show: TV de tubo com o episódio no ar, com scanlines e uma faixa rolando
function makeTV() {
  const g = new THREE.Group();
  const shell = mat(0xd8d3c6, { roughness: .5 });
  const dark = mat(0x16181f, { roughness: .35 });
  const metal = mat(0x9aa0ab, { metalness: 1, roughness: .25 });
  const body = rbox(2.5, 2, 1.5, .18, shell); body.position.z = -.25; g.add(body);
  const back = rbox(1.7, 1.4, 1, .2, shell); back.position.z = -1.1; g.add(back);
  const bezel = rbox(1.9, 1.5, .1, .05, dark); bezel.position.set(-.22, .05, .52); g.add(bezel);

  const tex = new THREE.TextureLoader().load('assets/tshs-stream.jpg');
  tex.colorSpace = THREE.SRGBColorSpace;
  // recorte da tela da TV dentro do print do site (1568x750)
  const crop = new THREE.Vector4(158 / 1568, 1 - 522 / 750, 515 / 1568, 392 / 750);
  const screenMat = new THREE.ShaderMaterial({
    uniforms: { map: { value: tex }, crop: { value: crop }, time: { value: 0 }, on: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `
      uniform sampler2D map; uniform vec4 crop; uniform float time; uniform float on;
      varying vec2 vUv;
      void main(){
        vec2 cc = vUv - .5;
        vec2 uv = .5 + cc * (1. + dot(cc, cc) * .18);
        if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) { gl_FragColor = vec4(0., 0., 0., 1.); return; }
        vec3 col = texture2D(map, crop.xy + uv * crop.zw).rgb;
        col *= .82 + .18 * sin(uv.y * 520.);
        col += .07 * (1. - smoothstep(0., .06, abs(fract(uv.y - time * .18) - .5)));
        float n = fract(sin(dot(uv * (time + 1.), vec2(12.9898, 78.233))) * 43758.5453);
        col += (n - .5) * .04;
        col *= smoothstep(.75, .25, length(cc)) * (.75 + .45 * on);
        gl_FragColor = vec4(col, 1.);
        #include <colorspace_fragment>
      }`,
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.74, 1.34), screenMat);
  screen.position.set(-.22, .05, .575);
  g.add(screen);

  [.45, .1].forEach(y => {
    const k = cyl(.11, .12, dark); k.rotation.x = Math.PI / 2; k.position.set(.9, y, .55); g.add(k);
  });
  for (let i = 0; i < 5; i++) {
    const slot = rbox(.34, .035, .03, .012, dark); slot.position.set(.9, -.28 - i * .09, .51); g.add(slot);
  }
  [-.45, .45].forEach(a => {
    const rod = cyl(.016, 1.5, metal, 8);
    rod.position.set(Math.sin(a) * .75, 1 + Math.cos(a) * .75, -.6);
    rod.rotation.z = -a;
    g.add(rod);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 8), metal);
    tip.position.set(Math.sin(a) * 1.5, 1 + Math.cos(a) * 1.5, -.6);
    g.add(tip);
  });
  [-.8, .8].forEach(x => { const foot = rbox(.4, .12, .9, .04, dark); foot.position.set(x, -1.03, -.25); g.add(foot); });

  g.userData.tick = (t, dt, f) => { screenMat.uniforms.time.value = t; screenMat.uniforms.on.value = f; };
  return g;
}

// First of October Radio: rádio vermelho, sintonia andando e ondas saindo da antena
function makeRadio() {
  const g = new THREE.Group();
  const inner = new THREE.Group(); inner.position.y = -.35; g.add(inner);
  const red = mat(0xc8322f, { roughness: .35 });
  const dark = mat(0x1d1f27, { roughness: .4 });
  const metal = mat(0xc4c8d0, { metalness: 1, roughness: .3 });
  inner.add(rbox(2.6, 1.5, .8, .14, red));
  const front = rbox(2.4, 1.25, .06, .03, dark); front.position.z = .4; inner.add(front);

  const holeGeo = new THREE.CylinderGeometry(.035, .035, .02, 10).rotateX(Math.PI / 2);
  const holes = new THREE.InstancedMesh(holeGeo, metal, 132);
  const m4 = new THREE.Matrix4();
  let k = 0;
  for (let r = 0; r < 11; r++) for (let c = 0; c < 12; c++) {
    holes.setMatrixAt(k++, m4.makeTranslation(-1.08 + c * .085 + (r % 2) * .042, -.45 + r * .09, .44));
  }
  inner.add(holes);

  const dial = canvasTex(512, 240, (x, w, h) => {
    const grad = x.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#ffd88a'); grad.addColorStop(1, '#ffad42');
    x.fillStyle = grad; x.fillRect(0, 0, w, h);
    x.strokeStyle = x.fillStyle = '#3a1c06';
    x.lineWidth = 3;
    for (let i = 0; i <= 40; i++) {
      const px = 36 + i * (w - 72) / 40;
      x.beginPath(); x.moveTo(px, 150); x.lineTo(px, i % 5 ? 168 : 182); x.stroke();
    }
    x.font = `500 30px ${MONO}`; x.textAlign = 'center';
    [88, 92, 96, 100, 104, 108].forEach((fm, i) => x.fillText(fm, 36 + i * (w - 72) / 5, 130));
    x.font = `800 44px ${DISPLAY}`; x.textAlign = 'left';
    x.fillText('FOO', 36, 64);
    x.font = `500 24px ${MONO}`; x.textAlign = 'right';
    x.fillText('FM 24/7', w - 36, 60);
  });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1, .47),
    new THREE.MeshStandardMaterial({ map: dial, emissiveMap: dial, emissive: 0xffffff, emissiveIntensity: .55, roughness: .3 }));
  glass.position.set(.6, .22, .44); inner.add(glass);
  const needle = rbox(.025, .4, .02, .008, mat(0xd8261e)); needle.position.set(.6, .22, .46); inner.add(needle);
  [.32, .86].forEach(x => {
    const knob = cyl(.16, .14, metal, 40); knob.rotation.x = Math.PI / 2; knob.position.set(x, -.3, .48); inner.add(knob);
  });
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.8, .05, 12, 48, Math.PI), dark);
  handle.position.y = .72; inner.add(handle);

  // antena inclinada; as ondas nascem na ponta
  const a = -.35, len = 1.5, base = new THREE.Vector3(1.05, .75, -.2);
  const dir = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
  const rod = cyl(.02, len, metal, 8);
  rod.position.copy(base).addScaledVector(dir, len / 2); rod.rotation.z = a; inner.add(rod);
  const tipPos = base.clone().addScaledVector(dir, len);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xff4d4d, transparent: true, depthWrite: false });
  const rings = [0, 1, 2].map(() => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.25, .018, 8, 64), ringMat.clone());
    ring.position.copy(tipPos); inner.add(ring); return ring;
  });
  g.userData.tick = (t, dt, f) => {
    needle.position.x = .6 + Math.sin(t * .35) * .38;
    rings.forEach((ring, i) => {
      const p = (t * (.35 + .25 * f) + i / 3) % 1;
      ring.scale.setScalar(.2 + p * 4);
      ring.material.opacity = (1 - p) * (.25 + .75 * f);
    });
  };
  return g;
}

// Mixtape: fita cassete vermelha com os carretéis girando atrás da janela da etiqueta
function makeTape() {
  const g = new THREE.Group();
  const red = mat(0xe8433f, { roughness: .35 });
  const dark = mat(0x1d1f27, { roughness: .5 });
  g.add(rbox(2.8, 1.75, .3, .08, red));
  const label = canvasTex(768, 320, (x, w, h) => {
    x.fillStyle = '#f3ecdc'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#e8433f'; x.fillRect(0, 0, w, 14);
    x.fillStyle = '#12141a';
    x.font = `800 40px ${DISPLAY}`; x.fillText('MIXTAPE', 28, 54);
    x.font = `500 22px ${MONO}`; x.textAlign = 'right'; x.fillText('LADO A', w - 28, 50);
    x.strokeStyle = '#c9bfa8'; x.lineWidth = 2;
    for (const y of [278, 304]) { x.beginPath(); x.moveTo(28, y); x.lineTo(w - 28, y); x.stroke(); }
    x.textAlign = 'left'; x.font = `500 20px ${MONO}`; x.fillStyle = '#566074'; x.fillText('remix · share · 90 min', 28, 272);
    // janela recortada: os carretéis aparecem por aqui
    x.clearRect(80, 74, w - 160, 176);
  });
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1), new THREE.MeshStandardMaterial({ map: label, alphaTest: .5, roughness: .7 }));
  lab.position.set(0, .2, .156); g.add(lab);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.9, .55), dark); win.position.set(0, .2, .151); g.add(win);

  const reelMat = mat(0xf4f1ea, { roughness: .4 });
  const tapeMat = mat(0x3b2418, { roughness: .8 });
  const reels = [-.62, .62].map((x, i) => {
    const spool = cyl(i ? .24 : .27, .02, tapeMat, 40); spool.rotation.x = Math.PI / 2; spool.position.set(x, .2, .153); g.add(spool);
    const reel = new THREE.Group(); reel.position.set(x, .2, .165);
    const hub = cyl(.13, .02, reelMat, 32); hub.rotation.x = Math.PI / 2; reel.add(hub);
    for (let j = 0; j < 6; j++) {
      const tooth = rbox(.035, .07, .03, .01, dark);
      const ang = j / 6 * Math.PI * 2;
      tooth.position.set(Math.cos(ang) * .07, Math.sin(ang) * .07, .01); tooth.rotation.z = ang; reel.add(tooth);
    }
    g.add(reel); return reel;
  });
  const bottom = rbox(1.9, .36, .06, .025, mat(0xb8302c, { roughness: .4 })); bottom.position.set(0, -.68, .16); g.add(bottom);
  [-.55, .55].forEach(x => { const hole = cyl(.06, .02, dark, 20); hole.rotation.x = Math.PI / 2; hole.position.set(x, -.68, .2); g.add(hole); });
  const screwMat = mat(0x9aa0ab, { metalness: 1, roughness: .3 });
  [[-1.28, .76], [1.28, .76], [-1.28, -.76], [1.28, -.76], [0, -.5]].forEach(([x, y]) => {
    const sc = cyl(.04, .02, screwMat, 12); sc.rotation.x = Math.PI / 2; sc.position.set(x, y, .16); g.add(sc);
  });
  g.userData.tick = (t, dt, f) => { for (const r of reels) r.rotation.z -= dt * (.8 + 4 * f); };
  return g;
}

// Caio's Clocks: relógio de parede com a hora de verdade
function makeClock() {
  const g = new THREE.Group();
  const brass = mat(0xc9a45c, { metalness: 1, roughness: .28 });
  const dark = mat(0x12141a, { roughness: .4 });
  const body = cyl(1.15, .2, mat(0x1d1f27, { roughness: .5 }), 64); body.rotation.x = Math.PI / 2; g.add(body);
  const face = canvasTex(512, 512, (x, w) => {
    const c = w / 2;
    x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, w, w);
    x.strokeStyle = x.fillStyle = '#12141a';
    for (let i = 0; i < 60; i++) {
      const a = i / 60 * Math.PI * 2, big = i % 5 === 0;
      x.lineWidth = big ? 6 : 2;
      x.beginPath();
      x.moveTo(c + Math.sin(a) * (c - 18), c - Math.cos(a) * (c - 18));
      x.lineTo(c + Math.sin(a) * (c - (big ? 54 : 34)), c - Math.cos(a) * (c - (big ? 54 : 34)));
      x.stroke();
    }
    x.font = `800 46px ${DISPLAY}`; x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) {
      const a = i / 12 * Math.PI * 2;
      x.fillText(i, c + Math.sin(a) * (c - 96), c - Math.cos(a) * (c - 96) + 3);
    }
    x.font = `500 18px ${MONO}`; x.fillStyle = '#566074';
    x.fillText("CAIO'S CLOCKS", c, c - 70);
  });
  const dial = new THREE.Mesh(new THREE.CircleGeometry(1.06, 64), new THREE.MeshStandardMaterial({ map: face, roughness: .6 }));
  dial.position.z = .101; g.add(dial);
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(1.12, .08, 16, 80), brass); bezel.position.z = .1; g.add(bezel);
  const hand = (w, len, m, z) => {
    const geo = new RoundedBoxGeometry(w, len, .025, 2, Math.min(w, .025) / 2 - .001).translate(0, len / 2 - .1, 0);
    const h = new THREE.Mesh(geo, m); h.position.z = z; g.add(h); return h;
  };
  const hh = hand(.08, .6, dark, .13), mh = hand(.055, .88, dark, .16), sh = hand(.022, 1, mat(0xff5c8a), .19);
  const cap = cyl(.06, .05, brass, 20); cap.rotation.x = Math.PI / 2; cap.position.z = .2; g.add(cap);
  g.userData.tick = () => {
    const d = new Date();
    const s = d.getSeconds() + d.getMilliseconds() / 1000, m = d.getMinutes() + s / 60, h = d.getHours() % 12 + m / 60;
    sh.rotation.z = -s / 60 * Math.PI * 2;
    mh.rotation.z = -m / 60 * Math.PI * 2;
    hh.rotation.z = -h / 12 * Math.PI * 2;
  };
  return g;
}

// Tomos do blog: posts voando para uma pilha de livros
function makeBooks() {
  const g = new THREE.Group();
  const pagesMat = mat(0xf3eee2, { roughness: .9 });
  const specs = [
    { w: 2.1, t: .34, d: 1.45, color: '#2f4bff', ink: '#ffffff', n: 'I' },
    { w: 1.95, t: .28, d: 1.4, color: '#ff5c8a', ink: '#14060b', n: 'II' },
    { w: 2.05, t: .38, d: 1.45, color: '#f2c14e', ink: '#12141a', n: 'III' },
    { w: 1.85, t: .3, d: 1.35, color: '#1d1f27', ink: '#f4f1ea', n: 'IV' },
  ];
  let y = -.65;
  const books = specs.map((b, i) => {
    const book = new THREE.Group();
    const cover = mat(b.color, { roughness: .55 });
    const top = rbox(b.w, .04, b.d, .015, cover); top.position.y = b.t / 2 - .02; book.add(top);
    const bot = rbox(b.w, .04, b.d, .015, cover); bot.position.y = -b.t / 2 + .02; book.add(bot);
    const spine = rbox(b.w, b.t, .05, .02, cover); spine.position.z = b.d / 2 - .025; book.add(spine);
    const pages = new THREE.Mesh(new THREE.BoxGeometry(b.w - .08, b.t - .07, b.d - .06), pagesMat);
    pages.position.z = -.03; book.add(pages);
    const tex = canvasTex(512, Math.round(512 * b.t / b.w), (x, w, h) => {
      x.fillStyle = b.color; x.fillRect(0, 0, w, h);
      x.fillStyle = b.ink; x.textBaseline = 'middle';
      x.font = `800 ${Math.round(h * .42)}px ${DISPLAY}`; x.fillText('TOMO ' + b.n, 26, h / 2 + 2);
      x.font = `500 ${Math.round(h * .2)}px ${MONO}`; x.textAlign = 'right'; x.fillText('DEV CRIATIVO', w - 26, h / 2);
    });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(b.w - .04, b.t - .02), new THREE.MeshStandardMaterial({ map: tex, roughness: .6 }));
    plate.position.z = b.d / 2 + .002; book.add(plate);
    y += b.t / 2;
    book.userData = { y, rot: (i % 2 ? 1 : -1) * (.05 + i * .03) };
    book.position.set((i % 2 ? .06 : -.05), y, 0);
    book.rotation.y = book.userData.rot;
    y += b.t / 2 + .01;
    g.add(book); return book;
  });
  const stackTop = y;

  const sheet = canvasTex(128, 168, (x, w, h) => {
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ff5c8a'; x.fillRect(14, 16, 64, 10);
    x.fillStyle = '#c5cbd7';
    for (let r = 0; r < 9; r++) x.fillRect(14, 40 + r * 13, r % 3 === 2 ? 70 : 100, 5);
  });
  const sheetGeo = new THREE.PlaneGeometry(.34, .44);
  const posts = Array.from({ length: 9 }, (_, i) => {
    const p = new THREE.Mesh(sheetGeo, new THREE.MeshStandardMaterial({ map: sheet, side: THREE.DoubleSide, transparent: true, roughness: .8 }));
    const a = i / 9 * Math.PI * 2;
    p.userData.from = new THREE.Vector3(Math.cos(a) * 1.7, .9 + Math.sin(a * 3) * .4, Math.sin(a) * 1.2);
    p.position.set(0, stackTop, 0);
    g.add(p); return p;
  });
  const to = new THREE.Vector3(0, stackTop + .05, 0);
  g.userData.tick = (t, dt, f) => {
    books.forEach((b, i) => {
      b.position.y = b.userData.y + f * i * .14 + Math.sin(t * 1.4 + i) * .02 * f;
      b.rotation.y = b.userData.rot * (1 + f * 1.5);
    });
    // cada post voa em arco até o topo da pilha, girando e encolhendo
    posts.forEach((p, i) => {
      const k = ((t * .3 + i / posts.length) % 1 + 1) % 1;
      p.visible = f > .05;
      p.position.lerpVectors(p.userData.from, to, easeInOut(k));
      p.position.y += Math.sin(k * Math.PI) * .35;
      p.rotation.set(k * 5 + i, k * 3, k * 2);
      p.scale.setScalar(f * (1 - k * .85));
      p.material.opacity = Math.min(1, (1 - k) * 4) * f;
    });
  };
  return g;
}

const MAKERS = {
  'BRCHAD Games': makeGrid,
  'the stained hanes show 24/7 unstoppable stream': makeTV,
  'First of October Radio': makeRadio,
  'Mixtape': makeTape,
  "Caio's Clocks": makeClock,
  'Tomos do blog': makeBooks,
};

// ---------- cena ----------
function start() {
  const projects = window.PROJECTS || [];
  const stations = [...document.querySelectorAll('.station')];
  const hero = document.getElementById('hero');
  const contact = document.getElementById('contato');
  const tip = document.getElementById('tip');

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  const CAM_Z = 12;
  camera.position.z = CAM_Z;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), .04).texture;
  scene.fog = new THREE.Fog(0x000000, 11, 22);
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(4, 6, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.4); rim.position.set(-6, 3, -5); scene.add(rim);

  // a neblina tem a cor do fundo da página, então os objetos do fundo "somem" nela
  const dotColor = new THREE.Color(), tmpDot = new THREE.Vector3();
  function readTheme() {
    const css = getComputedStyle(root);
    scene.fog.color.set(css.getPropertyValue('--bg').trim());
    rim.color.set(css.getPropertyValue('--accent').trim());
    dotColor.set(css.getPropertyValue('--muted').trim());
  }
  readTheme();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readTheme);
  new MutationObserver(readTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  const holders = projects.map((p, i) => {
    const obj = (MAKERS[p.title] || makeBooks)();
    // normaliza: todo objeto cabe numa caixa de ~2,6 e fica centrado no próprio holder
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
    const s = 2.6 / Math.max(size.x, size.y);
    obj.scale.setScalar(s);
    obj.position.copy(center).multiplyScalar(-s);
    const h = new THREE.Group();
    h.add(obj);
    h.scale.setScalar(.001);
    h.userData = { i, title: p.title, tag: p.tag, tick: obj.userData.tick, yaw: 0, pitch: 0, spin: 0, spinFrom: 0, spinTo: 0, spinT: 1, hover: 0, focus: 0, shown: false };
    scene.add(h);
    return h;
  });
  const n = holders.length;

  let halfW = 1, halfH = 1, narrow = false;
  function resize() {
    const w = innerWidth, h = innerHeight;
    narrow = w <= 800;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = narrow ? 45 : 35;
    camera.updateProjectionMatrix();
    halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * CAM_Z;
    halfW = halfH * camera.aspect;
  }
  resize();
  addEventListener('resize', resize);

  // posições de fundo, em fração da tela; a profundidade aumenta para a neblina engolir aos poucos
  const BG = [[-.75, .55, -7], [.8, -.5, -9], [-.35, -.7, -11], [.55, .72, -12], [-.9, -.1, -14], [.15, .2, -16]];
  const bgPos = (i, t, out) => {
    const [nx, ny, z] = BG[i % BG.length], k = (CAM_Z - z) / CAM_Z;
    return out.set(nx * halfW * k, ny * halfH * k + Math.sin(t * .4 + i) * .4, z);
  };
  // elipse da órbita do hero; os objetos e a linha pontilhada usam a mesma
  const orbitPoint = (ang, out) => narrow
    ? out.set(Math.cos(ang) * halfW * .62, halfH * .28 - Math.sin(ang) * 1.6, Math.sin(ang) * 1.6)
    : out.set(halfW * .5 + Math.cos(ang) * Math.min(halfW * .36, 3.3), -.1 - Math.sin(ang) * 1.5, Math.sin(ang) * 1.8);
  const clusterPos = (i, a, t, out) => {
    orbitPoint(a + i / n * Math.PI * 2, out);
    out.y += Math.sin(t + i) * (narrow ? .1 : .12);
    return out;
  };

  // linha pontilhada da órbita: pontos redondos que andam junto com os objetos e somem fora do hero
  const DOTS = 160;
  const dotsGeo = new THREE.BufferGeometry();
  dotsGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(DOTS * 3), 3));
  const dotTex = canvasTex(32, 32, (x, w) => { x.fillStyle = '#fff'; x.beginPath(); x.arc(w / 2, w / 2, w / 2 - 2, 0, Math.PI * 2); x.fill(); });
  const dotsMat = new THREE.PointsMaterial({ size: .085, map: dotTex, transparent: true, depthWrite: false });
  dotsMat.color = dotColor; // mesma instância que readTheme atualiza
  const dots = new THREE.Points(dotsGeo, dotsMat);
  dots.frustumCulled = false;
  // os pontos ficam numa cena própria, desenhada antes da principal e sem profundidade: os objetos sempre os cobrem
  const backScene = new THREE.Scene();
  backScene.add(dots);
  renderer.autoClear = false;
  function updateDots(a, w) {
    dots.visible = w > .01;
    if (!dots.visible) return;
    dotsMat.opacity = w * .85;
    const pos = dotsGeo.attributes.position;
    for (let k = 0; k < DOTS; k++) {
      orbitPoint(a + k / DOTS * Math.PI * 2, tmpDot);
      pos.setXYZ(k, tmpDot.x, tmpDot.y, tmpDot.z);
    }
    pos.needsUpdate = true;
  }
  const ringPos = (i, a, out) => {
    const ang = -a * .6 + i / n * Math.PI * 2, k = (CAM_Z + 2) / CAM_Z;
    return out.set(Math.cos(ang) * halfW * .8 * k, Math.sin(ang) * halfH * .72 * k, -2);
  };
  const focusPos = out => narrow ? out.set(0, halfH * .36, 0) : out.set(halfW * .48, 0, 0);
  const focusScale = () => narrow ? Math.min(1.25, halfW * .56) : Math.min(1.35, halfW * .26);

  // ponteiro: parallax da câmera, hover e clique nos objetos
  const pointer = { x: 0, y: 0, sx: 0, sy: 0, ndc: new THREE.Vector2(9, 9), touch: false, onCanvas: false, cx: 0, cy: 0 };
  const ray = new THREE.Raycaster();
  let hovered = null;
  addEventListener('pointermove', e => {
    pointer.x = e.clientX / innerWidth * 2 - 1;
    pointer.y = -(e.clientY / innerHeight * 2 - 1);
    pointer.touch = e.pointerType === 'touch';
    pointer.onCanvas = e.target === canvas;
    pointer.cx = e.clientX; pointer.cy = e.clientY;
    pointer.ndc.set(pointer.x, pointer.y);
  });
  document.addEventListener('pointerleave', () => { pointer.onCanvas = false; });
  canvas.addEventListener('click', e => {
    pointer.ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1));
    const h = pick();
    if (!h) return;
    const u = h.userData;
    if (u.focus > .5) spin(u); // o objeto em foco dá uma volta
    else if (stations[u.i]) window.goTo ? window.goTo(stations[u.i]) : stations[u.i].scrollIntoView({ block: 'start' });
  });
  // giro de 360° com duração fixa; se pedir outro no meio, emenda a partir de onde está
  const SPIN_DUR = 1.2, SPIN_LEAD = .3; // o giro começa 0,3 s antes de o objeto assentar
  function spin(u) {
    if (reduce) return;
    u.spinFrom = u.spin;
    u.spinTo += Math.PI * 2;
    u.spinT = 0;
  }
  function pick() {
    ray.setFromCamera(pointer.ndc, camera);
    const hit = ray.intersectObjects(holders, true)[0];
    if (!hit) return null;
    let o = hit.object;
    while (o.parent && o.parent !== scene) o = o.parent;
    return o;
  }

  const tmp = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), f = new THREE.Vector3();
  const clock = new THREE.Clock();
  let t = 0, orbit = 0, orbitSpeed = .12, reveal = 0; // reveal: 0 enquanto a tela de loading está no ar

  function frame() {
    const dt = Math.min(clock.getDelta(), .05);
    if (!reduce) t += dt;
    const vh = innerHeight;

    // pesos de scroll: hero, cada estação e contato
    const heroW = smooth(.35, .85, hero.getBoundingClientRect().bottom / vh);
    const cr = contact.getBoundingClientRect();
    const contactW = 1 - smooth(.2, .9, Math.abs((cr.top + cr.height / 2 - vh / 2) / vh));
    const centered = [];
    const weights = stations.map((st, i) => {
      const r = st.getBoundingClientRect();
      const off = Math.abs((r.top + r.height / 2 - vh / 2) / vh);
      centered[i] = off < .02; // a rolagem até a estação terminou
      const w = 1 - smooth(.3, .62, off);
      st.classList.toggle('active', w > .5);
      return w;
    });

    hovered = pointer.onCanvas && !pointer.touch ? pick() : null;
    document.body.classList.toggle('hovering', !!hovered);
    if (hovered) {
      tip.textContent = hovered.userData.focus > .5 ? 'clique para girar' : hovered.userData.title;
      tip.style.left = pointer.cx + 'px'; tip.style.top = pointer.cy + 'px';
    }
    tip.classList.toggle('on', !!hovered);

    // para quase na hora sob o ponteiro (para dar para clicar) e retoma devagar
    orbitSpeed += ((hovered || reduce ? 0 : .12) - orbitSpeed) * (1 - Math.exp(-dt * (hovered ? 14 : 1.5)));
    orbit += orbitSpeed * dt;
    const k = 1 - Math.exp(-dt * (reduce ? 12 : 3.2));
    focusPos(f);
    let fs = focusScale();
    const cs = narrow ? .55 : .72;
    // celular: o objeto em foco ocupa o espaço livre entre o topo da tela e o card da estação
    if (narrow) {
      const best = weights.indexOf(Math.max(...weights));
      if (best >= 0 && weights[best] > 0) {
        const top = Math.max(stations[best].firstChild.getBoundingClientRect().top, vh * .3);
        const avail = top / vh * 2 * halfH;
        f.y = halfH - avail / 2;
        fs = Math.min(fs, avail * .8 / 2.6);
      }
    }

    camera.position.x += (pointer.x * .35 - camera.position.x) * k;
    camera.position.y += (pointer.y * .2 - camera.position.y) * k;
    camera.lookAt(0, 0, 0);
    const loaded = root.classList.contains('loaded');
    reveal += ((loaded ? 1 : 0) - reveal) * (1 - Math.exp(-dt * 3));
    updateDots(orbit, heroW * reveal);

    holders.forEach((h, i) => {
      const u = h.userData, w = weights[i] || 0;
      bgPos(i, t, a); clusterPos(i, orbit, t, b); ringPos(i, orbit, c);
      tmp.copy(a).lerp(b, heroW).lerp(c, contactW).lerp(f, w);
      // o objeto em foco chega mais firme, para assentar logo e poder girar
      const rate = 3.2 + 3.3 * w;
      const kf = reduce ? k : 1 - Math.exp(-dt * rate);
      h.position.lerp(tmp, kf);
      u.focus += (w - u.focus) * k;
      u.hover += ((hovered === h ? 1 : 0) - u.hover) * k * 1.5;
      let s = .9 + (cs - .9) * heroW;
      s += (.6 - s) * contactW;
      s += (fs - s) * w;
      s *= 1 + u.hover * .14;
      if (!loaded) s = .001; // os objetos crescem na órbita quando o loading sai
      h.scale.setScalar(h.scale.x + (s - h.scale.x) * kf);

      // em foco o objeto encara a câmera e segue o ponteiro; fora dele balança sozinho
      const idleYaw = Math.sin(t * .3 + i * 1.7) * .6 + pointer.x * .4;
      const idlePitch = Math.sin(t * .23 + i) * .18 - pointer.y * .15;
      const focYaw = pointer.x * .55 + Math.sin(t * .4) * .12 - (narrow ? 0 : .3);
      const focPitch = -pointer.y * .3 + .1;
      u.yaw += (idleYaw + (focYaw - idleYaw) * w - u.yaw) * k;
      u.pitch += (idlePitch + (focPitch - idlePitch) * w - u.pitch) * k;
      // a estação entrou na tela: o objeto dá uma volta logo antes de assentar na posição e na escala do foco.
      // A aproximação é exponencial, então dá para estimar quanto falta para assentar (erro < 0,06 e < 2%).
      const settle = Math.log(Math.max(1, h.position.distanceTo(tmp) / .06, Math.abs(h.scale.x - s) / (s * .02))) / rate;
      if (centered[i] && !u.shown && settle <= SPIN_LEAD) { u.shown = true; spin(u); }
      if (w < .2) u.shown = false;
      u.spinT = Math.min(1, u.spinT + dt / SPIN_DUR);
      u.spin = u.spinFrom + (u.spinTo - u.spinFrom) * easeInOut(u.spinT);
      h.rotation.set(u.pitch, u.yaw + u.spin, 0);
      u.tick?.(t, dt, Math.max(u.focus, u.hover * .6));
    });
    renderer.clear();
    renderer.render(backScene, camera);
    renderer.render(scene, camera);
    if (!root.classList.contains('scene-ready')) root.classList.add('scene-ready');
  }

  renderer.setAnimationLoop(frame);
  document.addEventListener('visibilitychange', () => {
    renderer.setAnimationLoop(document.hidden ? null : frame);
    clock.getDelta();
  });
}

// ---------- início ----------
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch (e) {
  root.classList.add('no-gl');
}
if (renderer) {
  root.classList.add('gl');
  // as texturas de canvas usam as fontes da página; espera carregarem (no máximo 1,5 s)
  await Promise.race([
    Promise.all([
      document.fonts.load('800 100px "Bricolage Grotesque"'),
      document.fonts.load('500 40px "IBM Plex Mono"'),
    ]).catch(() => {}),
    new Promise(r => setTimeout(r, 1500)),
  ]);
  start();
}
