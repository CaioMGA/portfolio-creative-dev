// DOM da v4: jogos, estações dos projetos, ano e copiar e-mail. A cena 3D (v4-scene.js) lê as estações daqui.
(function () {
  document.getElementById('year').textContent = new Date().getFullYear();

  var list = document.getElementById('stations');
  var all = window.PROJECTS || [];
  var i18n = window.v4lang;
  var text = function (i) { return i18n ? i18n.project(i) : all[i]; };
  var fills = []; // um por card: reescreve os textos no idioma atual
  all.forEach(function (p, i) {
    var st = document.createElement('article');
    st.className = 'station';
    st.id = 'p' + (i + 1);
    st.dataset.i = i;
    var card = document.createElement('div'); card.className = 'card panel';
    var count = document.createElement('span'); count.className = 'mono count';
    var tag = document.createElement('b');
    var n = document.createElement('span');
    n.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(all.length).padStart(2, '0');
    count.append(tag, n);
    var h = document.createElement('h3');
    var tm = document.createElement('span'); tm.className = 'mono time';
    var d = document.createElement('p');
    var fig = document.createElement('figure');
    var img = document.createElement('img');
    img.src = p.img; img.loading = 'lazy';
    if (p.fit) img.className = p.fit;
    fig.append(img);
    var a = document.createElement('a'); a.className = 'btn'; a.href = p.href;
    a.target = '_blank'; a.rel = 'noopener noreferrer';
    fills.push(function () {
      var x = text(i);
      tag.textContent = x.tag; h.textContent = x.title; tm.textContent = x.time || ''; d.textContent = x.desc;
      img.alt = x.alt || x.title; a.textContent = (i18n ? i18n.t('viewProject') : 'Ver projeto') + ' ↗';
    });
    card.append(count, h, tm, d, fig, a);
    st.append(card);
    list.append(st);
  });
  // jogos (games-v4.js): sem jogos cadastrados, a seção e o link do menu saem da página
  var games = window.GAMES || [], grid = document.getElementById('games');
  if (!games.length) {
    var sec = document.getElementById('jogos'), link = document.querySelector('nav a[href="#jogos"]');
    if (sec) sec.remove();
    if (link) link.remove();
  } else games.forEach(function (g, i) {
    var el = document.createElement(g.href ? 'a' : 'article');
    el.className = 'game';
    if (g.href) { el.href = g.href; el.target = '_blank'; el.rel = 'noopener noreferrer'; }
    var fig = document.createElement('figure'), img = document.createElement('img');
    img.src = g.img; img.loading = 'lazy'; fig.append(img);
    var h = document.createElement('h3'), role = document.createElement('span'), tech = document.createElement('span'), res = document.createElement('p');
    role.className = 'mono'; tech.className = 'mono tech';
    el.append(fig, h, role, tech, res);
    grid.append(el);
    fills.push(function () {
      var x = i18n ? i18n.game(i) : (g.pt || {});
      h.textContent = x.title || ''; role.textContent = x.role || ''; tech.textContent = x.tech || '';
      res.textContent = x.result || ''; img.alt = x.alt || x.title || '';
    });
  });

  // arquivo (archive-v4.js): título com a contagem dos últimos 3 anos, filtros por tipo e a lista por ano
  var arq = window.ARCHIVE || [], arqList = document.getElementById('arqList');
  if (arqList && arq.length && i18n) (function () {
    var title = document.getElementById('arqTitle'), stats = document.getElementById('arqStats'), bar = document.getElementById('arqFilters');
    var t = i18n.t, now = new Date(), cur = now.getFullYear() * 12 + now.getMonth();
    function ago(d) { return /^\d{4}-\d{2}$/.test(d) ? cur - (+d.slice(0, 4) * 12 + (+d.slice(5, 7) - 1)) : null; }
    var n36 = arq.filter(function (p) { var m = ago(p.d); return m != null && m <= 36; }).length;
    var q3 = arq.filter(function (p) { var m = ago(p.d); return m != null && m <= 2; }).length;
    var clients = {}; arq.forEach(function (p) { if (p.c) clients[p.c] = 1; });
    var nClients = Object.keys(clients).length;
    var kinds = ['jogo', 'puzzle', 'web', 'ferramenta', 'musica', 'escrita'];
    var filter = 'all';
    function count(f) { return arq.filter(function (p) { return match(p, f); }).length; }
    function match(p, f) { return f === 'all' || (f === 'cliente' ? !!p.c : p.k === f); }
    function when(d, full) {
      if (!d) return t('arqOngoing');
      if (d.length === 4) return d;
      var m = t('arqMonths')[+d.slice(5, 7) - 1];
      return full ? m + ' ' + d.slice(0, 4) : m;
    }
    function chips() {
      bar.replaceChildren();
      ['all'].concat(kinds, ['cliente']).forEach(function (f) {
        var n = count(f); if (!n) return;
        var b = document.createElement('button'); b.type = 'button';
        b.setAttribute('aria-pressed', String(f === filter));
        b.append(f === 'all' ? t('arqAll') : f === 'cliente' ? t('arqClients') : t('arqKinds')[f]);
        var c = document.createElement('b'); c.textContent = n; b.append(c);
        b.addEventListener('click', function () { filter = f; render(); });
        bar.append(b);
      });
    }
    function render() {
      title.innerHTML = t('arqTitle').replace('{n}', n36); // modelo vem do dicionário, o número é nosso
      stats.textContent = t('arqStats').replace('{total}', arq.length).replace('{q}', q3).replace('{c}', nClients);
      chips();
      var groups = [], idx = {}, L = i18n.get();
      arq.forEach(function (p) {
        if (!match(p, filter)) return;
        var y = p.d && p.d.slice(0, 4) >= '2023' ? p.d.slice(0, 4) : 'antes';
        if (!(y in idx)) { idx[y] = groups.length; groups.push({ y: y, items: [] }); }
        groups[idx[y]].items.push(p);
      });
      arqList.replaceChildren();
      groups.forEach(function (g) {
        var box = document.createElement('div'); box.className = 'arq-year';
        var h = document.createElement('h3'); h.textContent = g.y === 'antes' ? t('arqEarlier') : g.y;
        var c = document.createElement('span'); c.className = 'mono'; c.textContent = g.items.length;
        h.append(c);
        var ul = document.createElement('ul'); ul.className = 'arq-grid';
        g.items.forEach(function (p) {
          var x = p[L] || p.pt, li = document.createElement('li');
          var meta = document.createElement('span'); meta.className = 'mono';
          meta.textContent = when(p.d, g.y === 'antes') + ' · ' + t('arqKind')[p.k];
          var h4 = document.createElement('h4');
          if (p.u && p.u.indexOf('https://') === 0) {
            var a = document.createElement('a'); a.href = p.u; a.target = '_blank'; a.rel = 'noopener noreferrer';
            a.textContent = x[0] + ' ↗'; h4.append(a);
          } else h4.textContent = x[0];
          var d = document.createElement('p'); d.textContent = x[1];
          li.append(meta, h4, d);
          if (p.c) { var cl = document.createElement('span'); cl.className = 'mono client'; cl.textContent = t('arqClient') + ' · ' + p.c; li.append(cl); }
          ul.append(li);
        });
        box.append(h, ul);
        arqList.append(box);
      });
    }
    fills.push(render);
  })();

  function fillAll() { fills.forEach(function (f) { f(); }); }
  fillAll();
  document.addEventListener('langchange', fillAll);

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
    // tela mais alta que a janela (trajetória no celular): rola por dentro dela antes de trocar de tela
    if (!busy && inside(dir)) {
      var r = list[i - dir].getBoundingClientRect(), step = innerHeight * .8;
      return animate(scrollY + dir * Math.min(step, dir > 0 ? r.bottom - innerHeight : -r.top), i - dir);
    }
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
  // Voltar ao topo aparece em todas as telas, menos no hero
  function markHero() { root.classList.toggle('at-hero', scrollY < innerHeight * .5); }
  addEventListener('scroll', markHero, { passive: true });
  addEventListener('resize', markHero);
  markHero();
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

  document.querySelectorAll('nav a[href^="#"], #top, .more a[href^="#"]').forEach(function (a) {
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
    var ok = function () { m.textContent = i18n ? i18n.t('copied') : 'copiado'; };
    var fail = function () { m.textContent = i18n ? i18n.t('copyFail') : 'selecione e copie manualmente'; };
    try { navigator.clipboard.writeText('caiomga@gmail.com').then(ok, fail); } catch (e) { fail(); }
  });
})();
