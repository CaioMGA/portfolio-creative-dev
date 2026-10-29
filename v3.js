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

  var b = document.getElementById('copy'), m = document.getElementById('msg');
  b.addEventListener('click', function () {
    var ok = function () { m.textContent = 'copiado'; };
    var fail = function () { m.textContent = 'selecione e copie manualmente'; };
    try { navigator.clipboard.writeText('caiomga@gmail.com').then(ok, fail); } catch (e) { fail(); }
  });
})();
