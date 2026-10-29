// Idiomas da v3 (PT-BR e EN). O português é lido do próprio HTML (data-i18n) e de projects-v2.js;
// aqui ficam só a tradução para o inglês e os textos que o JS escreve. Troca na hora, sem recarregar.
(function () {
  var EN = {
    title: 'Caio Amaral · Creative Developer',
    description: 'Creative developer with 9 years in games. 2D and 3D games, simulators and serious games, plus creative projects built with AI in days.',
    loading: 'Loading',
    pagerLabel: 'Screen navigation',
    brand: 'caio amaral / creative developer',
    prev: '↑ Previous',
    next: 'Next ↓',
    navIa: 'with ai',
    navMetodo: 'how i work',
    navTrilha: 'journey',
    navContato: 'contact',
    h1: 'I get ideas off the ground in <em>days</em>, with AI.',
    heroP: '15 years building software, 9 building games. Now focused on creative solutions with AI.',
    hint: 'hover the objects · click to see the project',
    iaLabel: 'Made with AI',
    iaTitle: 'Creative projects that got off the ground',
    iaLead: 'Ideas that become products in a few days.',
    more: 'And more ↗',
    metLabel: 'How I work with AI',
    metTitle: 'From creative challenge to tested solution',
    ph1k: '01 · challenge',
    ph1t: 'I understand the problem',
    ph1p: 'I define the creative challenge I want to solve and what the player or user should feel.',
    ph2k: '02 · design',
    ph2t: 'I refine it with AI',
    ph2p: 'I explore alternatives with AI and refine the design, following guidelines I write from my experience.',
    ph3k: '03 · solution',
    ph3t: 'I build and test it with AI',
    ph3p: 'The AI implements and tests following my implementation and deployment guidelines. When a problem comes up that it can’t solve, I solve it.',
    triLabel: 'Journey',
    triTitle: 'How I got here',
    t2010: 'IT intern',
    t2010p: 'I started out as an IT intern.',
    t2015: 'Consulting analyst and front-end developer',
    t2015p: 'Grupo Amil and One Health.',
    t2017p: '2D and 3D games, simulators, serious games, fun games, streaming apps, licensed games and NFT games.',
    t2023p: 'Besides programming, I started handling the game design of new projects.',
    t2024: 'Creating with AI',
    t2024p: 'Today I write design, implementation and deployment guidelines from that background. AI lets me create at an absurd speed, with very high quality.',
    conLabel: 'Contact',
    conTitle: 'Got a game or an idea to get off the ground? Tell me.',
    copyHint: 'click to copy',
    made: 'made with AI',
    top: 'Back to top ↑',
  };
  // textos escritos pelo JS (cópia do e-mail, tooltip da cena, etiqueta da fita)
  var JS = {
    pt: { copied: 'copiado', copyFail: 'selecione e copie manualmente', spinTip: 'clique para girar', lampTip: 'clique para puxar a cordinha' },
    en: { copied: 'copied', copyFail: 'select and copy it manually', spinTip: 'click to spin', lampTip: 'click to pull the cord' },
  };
  // mesma ordem de PROJECTS (projects-v2.js + projects-v3.js): o índice casa os textos
  var PROJECTS_EN = [
    { title: 'BRCHAD Games', tag: 'Learn More',
      desc: 'A complete platform for puzzle games: editors, an archive of 200+ crosswords, a publishing server, an embeddable player, analytics and a dashboard. I built it with AI and integrated it into Cruzadinha.com.br in the same timeframe.',
      alt: 'BRChad Games Admin game schedule: stats, filters by type and period, and a calendar of scheduled games.' },
    { title: 'Academia Paulista de Letras: new institutional website proposal', tag: 'See Live Demo',
      desc: 'An independent prototype of a new website for the APL (the São Paulo Academy of Letters). With AI, I built two design proposals in 8 hours, Estante and Clássica, both fully implemented: real content from the 40 chairs and the academicians, 80 AI-written biographies to supplement the site, and an editing panel with roles for the staff and the academicians (in the full version).',
      alt: 'Home of the prototype’s Estante version: a news carousel over an ornamental background and the banner saying this is not the Academy’s official site.' },
    { title: 'the stained hanes show 24/7 unstoppable stream', tag: '24/7 Streaming',
      desc: 'A site that streams the stained hanes show 24 hours a day. Everyone watches the same episode at the same second, on a 3D TV built with three.js. The whole site was made with AI, and the episode quotes were extracted with AI.',
      alt: 'the stained hanes show on air: the 3D TV playing episode S01E01, next to the episode’s quotes panel.' },
    { title: 'First of October Radio', tag: '24/7 Radio',
      desc: 'A 24/7 radio with no backend, built on YouTube videos. The site’s algorithm controls playback: whoever tunes in hears the same song, at the same second, as every other listener.',
      alt: 'First of October Radio artwork: red signal circles on a dark background.' },
    { title: "Caio's Clocks", tag: 'See the Clocks',
      desc: 'One new creative-coding clock at a time, between 2025 and 2026. Each one tests a different visual idea.',
      alt: "Clock 17 from Caio's Clocks: a game board with cards, a die and a pawn." },
    { title: 'Blog tomes', tag: 'Automating the boring part',
      desc: 'I automated compiling my daily posts into books. Each tome took 3 to 4 days of manual work; now it takes 2 to 5 minutes, and the time saved goes back into writing.',
      alt: 'Mascot of the Desenvolvedor Criativo newsletter: a blue 3D fish.' },
  ];

  var root = document.documentElement;
  var desc = document.querySelector('meta[name="description"]');
  var PT = { title: document.title, description: desc.content };
  document.querySelectorAll('[data-i18n]').forEach(function (el) { PT[el.dataset.i18n] = el.innerHTML; });
  document.querySelectorAll('[data-i18n-aria]').forEach(function (el) { PT[el.dataset.i18nAria] = el.getAttribute('aria-label'); });
  var DICT = { pt: PT, en: EN };

  function store(k, v) { try { v === undefined ? (v = localStorage.getItem(k)) : localStorage.setItem(k, v); } catch (e) { v = null; } return v; }
  function initial() {
    var q = (new URLSearchParams(location.search).get('lang') || '').toLowerCase();
    if (q === 'pt' || q === 'en') return q;
    var saved = store('v3-lang');
    if (saved === 'pt' || saved === 'en') return saved;
    var langs = navigator.languages || [navigator.language || ''];
    return langs.some(function (l) { return /^pt/i.test(l); }) ? 'pt' : 'en';
  }

  var lang = 'pt';
  function apply(next) {
    lang = next;
    var d = DICT[lang];
    root.lang = lang === 'pt' ? 'pt-BR' : 'en';
    document.title = d.title;
    desc.content = d.description;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { if (d[el.dataset.i18n] != null) el.innerHTML = d[el.dataset.i18n]; });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', d[el.dataset.i18nAria]); });
    document.querySelectorAll('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === lang); });
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }

  window.v3lang = {
    get: function () { return lang; },
    t: function (k) { return JS[lang][k]; },
    // textos do projeto i no idioma atual; links e imagens vêm sempre de projects-v2.js
    project: function (i) {
      var p = (window.PROJECTS || [])[i] || {};
      if (lang === 'pt') return p;
      var e = PROJECTS_EN[i] || {}, o = {};
      for (var k in p) o[k] = p[k];
      for (k in e) o[k] = e[k];
      return o;
    },
  };

  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.lang === lang) return;
      store('v3-lang', b.dataset.lang);
      apply(b.dataset.lang);
    });
  });
  apply(initial());
})();
