// DOM da v3: estações dos projetos, ano e copiar e-mail. A cena 3D (v3-scene.js) lê as estações daqui.
(function () {
  document.getElementById('year').textContent = new Date().getFullYear();

  var list = document.getElementById('stations');
  var all = window.PROJECTS || [];
  all.forEach(function (p, i) {
    var st = document.createElement('article');
    st.className = 'station';
    st.id = 'p' + (i + 1);
    st.dataset.i = i;
    var card = document.createElement('div'); card.className = 'card panel';
    var count = document.createElement('span'); count.className = 'mono count';
    var tag = document.createElement('b'); tag.textContent = p.tag;
    var n = document.createElement('span');
    n.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(all.length).padStart(2, '0');
    count.append(tag, n);
    var h = document.createElement('h3'); h.textContent = p.title;
    var d = document.createElement('p'); d.textContent = p.desc;
    var fig = document.createElement('figure');
    var img = document.createElement('img');
    img.src = p.img; img.alt = p.alt || p.title; img.loading = 'lazy';
    if (p.fit) img.className = p.fit;
    fig.append(img);
    var a = document.createElement('a'); a.className = 'btn'; a.href = p.href; a.textContent = p.tag + ' ↗';
    a.target = '_blank'; a.rel = 'noopener noreferrer';
    card.append(count, h, d, fig, a);
    st.append(card);
    list.append(st);
  });

  // se o three.js não carregou (CDN fora, navegador antigo), mostra a versão sem 3D
  addEventListener('load', function () {
    var c = document.documentElement.classList;
    if (!c.contains('gl')) c.add('no-gl');
  });

  // "Entre outros" fecha a tela do último projeto
  var last = list.lastElementChild, more = document.querySelector('.more');
  if (last && more) { last.classList.add('last'); last.append(more); }

  // uma tela por rolada: roda do mouse e teclado vão para a tela seguinte ou anterior.
  // No toque fica o scroll-snap do CSS. Telas mais altas que a janela rolam por dentro antes de passar.
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var busy = false, quiet = true, acc = 0, lastWheel = 0;
  var anim = 0, target = -1; // animação em curso e a tela para onde ela vai
  var prev = document.getElementById('prev'), next = document.getElementById('next');
  function screens() { return [].slice.call(document.querySelectorAll('.hero,.screen,.station')); }
  function topOf(el) { return el.getBoundingClientRect().top + scrollY; }
  function current(list) {
    var i = 0;
    list.forEach(function (el, k) { if (topOf(el) <= scrollY + 4) i = k; });
    return i;
  }
  // uma nova animação cancela a anterior e parte de onde a página está: o último input vence
  function animate(to, index) {
    to = Math.max(0, Math.min(to, root.scrollHeight - innerHeight));
    var from = scrollY, d = to - from, id = ++anim;
    target = index == null ? -1 : index;
    if (Math.abs(d) < 2) { finish(); return; }
    busy = true; quiet = false;
    root.style.scrollSnapType = 'none'; // o snap do CSS brigaria com os passos intermediários
    var dur = reduce ? 0 : Math.min(1100, 650 + Math.abs(d) * .12), t0 = performance.now();
    sync();
    (function step(now) {
      if (id !== anim) return;
      var p = dur ? Math.min(1, (now - t0) / dur) : 1;
      var e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      scrollTo({ top: from + d * e, behavior: 'instant' });
      if (p < 1) return requestAnimationFrame(step);
      finish();
    })(t0);
  }
  function finish() {
    root.style.scrollSnapType = '';
    busy = false; target = -1;
    sync();
  }
  // durante uma transição, conta a partir da tela de destino (dois cliques em Próximo andam duas telas)
  function base(list) { return busy && target >= 0 ? target : current(list); }
  // vai para a tela vizinha; subindo para uma tela alta, para no fim dela
  function go(dir) {
    var list = screens(), i = base(list) + dir;
    if (i < 0 || i >= list.length) return;
    var el = list[i], top = topOf(el);
    if (dir < 0 && el.offsetHeight > innerHeight + 2) top += el.offsetHeight - innerHeight;
    animate(top, i);
  }
  function sync() {
    var list = screens(), i = base(list);
    prev.disabled = i <= 0;
    next.disabled = i >= list.length - 1;
  }
  // deixa a tela atual rolar por dentro se ela for mais alta que a janela
  function inside(dir) {
    var list = screens(), r = list[current(list)].getBoundingClientRect();
    if (r.height <= innerHeight + 2) return false;
    return dir > 0 ? r.bottom > innerHeight + 2 : r.top < -2;
  }
  window.goTo = function (el) { animate(topOf(el), screens().indexOf(el)); };
  prev.addEventListener('click', function () { go(-1); });
  next.addEventListener('click', function () { go(1); });
  addEventListener('scroll', function () { if (!busy) sync(); }, { passive: true });
  sync();

  addEventListener('wheel', function (e) {
    if (root.classList.contains('loading')) return e.preventDefault();
    if (e.ctrlKey || root.classList.contains('no-gl')) return;
    var now = performance.now(), gap = now - lastWheel;
    lastWheel = now;
    var dy = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1);
    if (!dy) return;
    var dir = dy > 0 ? 1 : -1;
    if (!busy && inside(dir)) return;
    e.preventDefault();
    // a inércia do trackpad continua mandando eventos: só aceita um gesto novo depois de uma pausa
    if (gap > 180) { quiet = true; acc = 0; }
    if (busy || !quiet) return;
    acc += dy;
    if (Math.abs(acc) < 24) return;
    acc = 0;
    go(dir);
  }, { passive: false });

  addEventListener('keydown', function (e) {
    if (root.classList.contains('loading') || root.classList.contains('no-gl') || e.altKey || e.ctrlKey || e.metaKey) return;
    if (/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(e.target.tagName) && e.key === ' ') return;
    var dir = { ArrowDown: 1, PageDown: 1, ' ': e.shiftKey ? -1 : 1, ArrowUp: -1, PageUp: -1 }[e.key];
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      var list = screens();
      return e.key === 'Home' ? animate(0, 0) : animate(topOf(list[list.length - 1]), list.length - 1);
    }
    if (!dir || inside(dir)) return;
    e.preventDefault();
    if (!busy) go(dir);
  });

  document.querySelectorAll('nav a[href^="#"], #top').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var el = document.querySelector(a.getAttribute('href'));
      if (!el || root.classList.contains('no-gl')) return;
      e.preventDefault();
      window.goTo(el);
      history.replaceState(null, '', a.getAttribute('href'));
    });
  });

  // tela de loading: fica no ar pelo menos 4 s desde a abertura e até a cena 3D desenhar o primeiro quadro
  // (ou o site cair na versão sem 3D); 12 s é o limite, para nunca prender a página
  var MIN_LOADER = 4000, MAX_LOADER = 12000;
  var loader = document.getElementById('loader'), pct = document.getElementById('pct');
  var ring = loader.querySelector('.orbit'), dot = loader.querySelector('.dot');
  function sceneReady() { return root.classList.contains('scene-ready') || root.classList.contains('no-gl'); }
  (function tick(now) {
    var p = Math.min(1, now / MIN_LOADER);
    if (!sceneReady()) p = Math.min(p, .96);
    pct.textContent = Math.floor(p * 100) + '%';
    var a = reduce ? -Math.PI / 2 : now / 1000 * 2.4, rx = ring.clientWidth / 2, ry = ring.clientHeight / 2;
    dot.style.transform = 'translate(' + (rx + Math.cos(a) * rx) + 'px,' + (ry + Math.sin(a) * ry) + 'px)';
    if ((p >= 1 && sceneReady()) || now > MAX_LOADER) {
      root.classList.remove('loading');
      root.classList.add('loaded', 'leaving');
      setTimeout(function () { root.classList.remove('leaving'); }, 800);
      return;
    }
    requestAnimationFrame(tick);
  })(performance.now());

  var b = document.getElementById('copy'), m = document.getElementById('msg');
  b.addEventListener('click', function () {
    var ok = function () { m.textContent = 'copiado'; };
    var fail = function () { m.textContent = 'selecione e copie manualmente'; };
    try { navigator.clipboard.writeText('caiomga@gmail.com').then(ok, fail); } catch (e) { fail(); }
  });
})();
