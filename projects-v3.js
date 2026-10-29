// v3: a lista da v2 (projects-v2.js) com a APL em 2º. A v2 continua lendo só o arquivo original.
// "obj" escolhe o objeto 3D em v3-scene.js; os textos em inglês estão em v3-i18n.js, no mesmo índice.
window.PROJECTS.splice(1, 0, {
  title: "Academia Paulista de Letras: proposta de novo site",
  desc: "Protótipo independente de um novo site para a APL. Com IA, fiz em 8 horas duas propostas de design, Estante e Clássica, já implementadas: conteúdo real das 40 cadeiras e dos acadêmicos, 80 biografias escritas com IA para complementar o site e painel de edição com papéis para a secretaria e os acadêmicos (na versão completa).",
  tag: "Ver Live Demo",
  img: "assets/apl-estante.jpg",
  alt: "Home da versão Estante do protótipo: carrossel de notícias sobre fundo de ornamentos e a faixa avisando que não é o site oficial da Academia.",
  href: "https://apl-estante.pages.dev/",
  obj: "lamp",
});
// Mixtape fica fora da v3 (continua na v2); remover também a entrada de PROJECTS_EN em v3-i18n.js
window.PROJECTS = window.PROJECTS.filter(function (p) { return p.title !== "Mixtape"; });

// Logline de tempo gasto (PT); a versão em inglês está em PROJECTS_EN (v3-i18n.js).
var TIMES = {
  "BRCHAD Games": "feito em 9 dias",
  "Academia Paulista de Letras: proposta de novo site": "feito em 8 horas · 2 variações",
  "the stained hanes show 24/7 unstoppable stream": "feito em 10 horas",
  "First of October Radio": "feito em 3 dias",
  "Caio's Clocks": "cada relógio em 1 a 8 horas",
  "Tomos do blog": "feito em 50 minutos",
};
window.PROJECTS.forEach(function (p) { p.time = TIMES[p.title]; });
