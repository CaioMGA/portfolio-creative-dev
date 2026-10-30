// Idiomas da v4 (PT-BR e EN). O português é lido do próprio HTML (data-i18n), de projects-v2.js/projects-v4.js e de games-v4.js;
// aqui ficam só a tradução para o inglês e os textos que o JS escreve. Troca na hora, sem recarregar.
(function () {
  var EN = {
    title: 'Caio Amaral · Game & Interactive Developer',
    description: 'Game developer for 9 years: 2D and 3D games, simulators and serious games for brands, studios and companies, plus interactive products with AI in the workflow.',
    loading: 'Loading',
    pagerLabel: 'Screen navigation',
    brand: 'caio amaral <span class="role">/ game & interactive developer</span>',
    prev: '↑ Previous',
    next: 'Next ↓',
    navJogos: 'games',
    navIa: 'projects',
    navMetodo: 'how i work',
    navTrilha: 'journey',
    navContato: 'contact',
    h1: '<em>9 years</em> making games. Now also interactive products, with AI in my workflow.',
    heroP: '2D and 3D games, simulators and serious games for brands, studios and companies. I use AI to reach a testable prototype faster, with the judgment of someone who has been building professional software for 15 years.',
    hint: 'hover the objects · click to see the project',
    jogLabel: 'Games',
    jogTitle: 'Games I worked on',
    jogLead: 'Some of the games I have worked on since 2017, for brands, companies and studios.',
    iaLabel: 'Products and experiments',
    iaTitle: 'From prototype to live product',
    iaLead: 'My own projects and proposals for clients, all live. AI speeds things up; the product, design and architecture decisions are mine.',
    more: 'And more ↗',
    metLabel: 'How I work',
    metTitle: 'Senior judgment, AI speed',
    ph1k: '01 · define',
    ph1t: 'I define what matters',
    ph1p: 'The problem, the audience and what the player or user should feel. This is where experience makes the biggest difference.',
    ph2k: '02 · prototype',
    ph2t: 'I prototype to decide',
    ph2p: 'I test alternatives quickly, with AI, and choose based on what I have seen work and fail in 9 years of game projects.',
    ph3k: '03 · deliver',
    ph3t: 'I deliver with quality',
    ph3p: 'Architecture, a review of every line, tests and deployment following guidelines I write. The AI executes; the responsibility is mine.',
    triLabel: 'Journey',
    triTitle: 'How I got here',
    originK: 'the beginning',
    origin: 'Games since forever',
    originP: 'At 4, I got a video game out of a bag of potato chips. And I share my birthday with the PlayStation.',
    t2010: 'From IT intern to front-end',
    t2010p: 'IT intern in 2010; from 2015, consulting analyst and front-end developer for Grupo Amil and One Health.',
    t2017p: '2D and 3D games, simulators, serious games, fun games, streaming apps, licensed games and NFT games.',
    studios: 'Studios',
    t2023p: 'Besides programming, I started handling the game design of new projects, as game designer at i9Ação.',
    t2024: 'AI in the production workflow',
    t2024p: 'I brought AI into my process with my own design, code and deployment guidelines, written from that background.',
    conLabel: 'Contact',
    conTitle: 'Have a game or an interactive product in mind? Let’s talk.',
    copyHint: 'click to copy',
    mail: 'Send an email ↗',
    openSource: 'open source on GitHub',
    top: 'Back to top ↑',
  };
  // textos escritos pelo JS (cópia do e-mail, botão dos cards, tooltip da cena)
  var JS = {
    pt: { copied: 'copiado', copyFail: 'selecione e copie manualmente', viewProject: 'Ver projeto', spinTip: 'clique para girar', lampTip: 'clique para interagir' },
    en: { copied: 'copied', copyFail: 'select and copy it manually', viewProject: 'View project', spinTip: 'click to spin', lampTip: 'click to interact' },
  };
  // mesma ordem de PROJECTS (projects-v2.js + projects-v4.js): o índice casa os textos
  var PROJECTS_EN = [
    { title: 'BRCHAD Games', time: 'full product · back end, front end and UX', tag: 'Platform',
      desc: 'A complete platform for puzzle games: editors, an archive of 200+ crosswords, a publishing server, an embeddable player, analytics and a dashboard. I built it with AI and integrated it into Cruzadinha.com.br in the same timeframe.',
      alt: 'BRChad Games Admin game schedule: stats, filters by type and period, and a calendar of scheduled games.' },
    { title: 'Academia Paulista de Letras: new institutional website proposal', time: '2 design proposals · CMS with editorial workflow', tag: 'Institutional website',
      desc: 'An independent proposal for a new website for the APL (the São Paulo Academy of Letters): two design directions, Estante and Clássica, real content from the 40 chairs, 80 AI-generated biographies labeled as such, and an editing panel with roles for the staff and the academicians (in the full version).',
      alt: 'Home of the prototype’s Estante version: a news carousel over an ornamental background and the banner saying this is not the Academy’s official site.' },
    { title: 'the stained hanes show 24/7 unstoppable stream', time: 'everyone watches the same second · 3D TV in three.js', tag: 'Streaming',
      desc: 'A site that streams the stained hanes show 24 hours a day. Everyone watches the same episode at the same second, on a 3D TV built with three.js. The whole site was made with AI, and the episode quotes were extracted with AI.',
      alt: 'the stained hanes show on air: the 3D TV playing episode S01E01, next to the episode’s quotes panel.' },
    { title: 'First of October Radio', time: '24/7 radio with no server', tag: 'Audio',
      desc: 'A 24/7 radio with no backend, built on YouTube videos. The site’s algorithm controls playback: whoever tunes in hears the same song, at the same second, as every other listener.',
      alt: 'First of October Radio artwork: red signal circles on a dark background.' },
    { title: "Caio's Clocks", time: 'ongoing series of visual experiments', tag: 'Creative coding',
      desc: 'One new creative-coding clock at a time, between 2025 and 2026. Each one tests a different visual idea.',
      alt: "Clock 17 from Caio's Clocks: a game board with cards, a die and a pawn." },
    { title: 'Blog tomes', time: 'from 3 days to 5 minutes per book', tag: 'Automation',
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
    var saved = store('v4-lang');
    if (saved === 'pt' || saved === 'en') return saved;
    return 'en'; // padrão do portfólio: inglês, mesmo para quem está no Brasil
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

  window.v4lang = {
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
    // textos do jogo i (games-v4.js) no idioma atual
    game: function (i) { var g = (window.GAMES || [])[i] || {}; return g[lang] || g.pt || {}; },
  };

  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.lang === lang) return;
      store('v4-lang', b.dataset.lang);
      apply(b.dataset.lang);
    });
  });
  apply(initial());
})();
