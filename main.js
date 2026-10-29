(function () {
  var START = new Date(2017, 8, 1); // setembro de 2017
  var now = new Date();
  var years = Math.floor((now - START) / (365.25 * 24 * 3600 * 1000));
  document.getElementById('years').textContent = years + '+';
  document.getElementById('year').textContent = now.getFullYear();

  var list = document.getElementById('projects');
  (window.PROJECTS || []).forEach(function (p) {
    var a = document.createElement('a');
    a.className = 'proj';
    a.href = p.href || '#';
    if (/^https?:/.test(a.href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    var fig = document.createElement('figure');
    var img = document.createElement('img');
    img.src = p.img; img.alt = p.alt || p.title; img.loading = 'lazy';
    if (p.fit) img.className = p.fit;
    fig.append(img);
    var info = document.createElement('div'); info.className = 'info';
    var h = document.createElement('h3'); h.textContent = p.title;
    var d = document.createElement('p'); d.textContent = p.desc;
    info.append(h, d);
    var y = document.createElement('span'); y.className = 'mono go'; y.textContent = p.tag + ' ↗';
    a.append(fig, info, y);
    list.append(a);
  });

  var cv = document.getElementById('field'), ctx = cv.getContext('2d');
  var chars = ' .:-=+*#%@', cell = 14, cols, rows, w, h, mx = -1e3, my = -1e3, t = 0, fill = '#888';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function readColor() {
    fill = getComputedStyle(document.documentElement).getPropertyValue('--field').trim();
  }
  function size() {
    var dpr = window.devicePixelRatio || 1, r = cv.getBoundingClientRect();
    w = r.width; h = r.height;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(w / cell); rows = Math.ceil(h / cell);
    ctx.font = '500 12px ' + getComputedStyle(document.body).getPropertyValue('--mono');
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    readColor();
  }
  function frame() {
    t += reduce ? 0 : 0.012;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = fill;
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var px = x * cell + cell / 2, py = y * cell + cell / 2;
      var v = (Math.sin(x * .21 + t * 2) + Math.sin(y * .27 - t * 1.6) + Math.sin((x + y) * .12 + t) + 3) / 6;
      var dx = px - mx, dy = py - my;
      v = Math.min(1, v + Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 150) * 1.1);
      var i = Math.floor(v * (chars.length - 1));
      if (i < 1) continue;
      ctx.globalAlpha = .12 + .55 * v;
      ctx.fillText(chars[i], px, py);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  var hero = cv.parentNode;
  hero.addEventListener('pointermove', function (e) {
    var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
  });
  hero.addEventListener('pointerleave', function () { mx = my = -1e3; });
  addEventListener('resize', size);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readColor);
  // fontes carregadas mudam a métrica; refaz o tamanho depois
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
  size(); frame();

  var b = document.getElementById('copy'), m = document.getElementById('msg');
  b.addEventListener('click', function () {
    var ok = function () { m.textContent = 'copiado'; };
    var fail = function () { m.textContent = 'selecione e copie manualmente'; };
    try { navigator.clipboard.writeText('caiomga@gmail.com').then(ok, fail); } catch (e) { fail(); }
  });
})();
