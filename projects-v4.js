// v4: a lista da v2 (projects-v2.js) com Biomas do Brasil em 1º, a APL em seguida, BRCHAD Games por último e sem Mixtape nem Tomos do blog. A v2 continua lendo só o arquivo original.
// "obj" escolhe o objeto 3D em v4-scene.js; os textos em inglês estão em v4-i18n.js, no mesmo índice.
window.PROJECTS.splice(1, 0, {
  title: "Academia Paulista de Letras: proposta de novo site",
  desc: "Proposta independente de um novo site para a APL: duas linhas de design, Estante e Clássica, conteúdo real das 40 cadeiras, 80 biografias geradas com IA e marcadas como tal, e painel de edição com papéis para a secretaria e os acadêmicos (na versão completa).",
  img: "assets/apl-estante.jpg",
  alt: "Home da versão Estante do protótipo: carrossel de notícias sobre fundo de ornamentos e a faixa avisando que não é o site oficial da Academia.",
  href: "https://apl-estante.pages.dev/",
  obj: "lamp",
});
window.PROJECTS.unshift({
  title: "Biomas do Brasil",
  desc: "Um atlas interativo dos biomas brasileiros: mapa 3D com relevo real e camadas (divisas, rios, capitais), uma página para cada bioma com mapa temático, fotos de licença livre e quiz, e um passaporte que ganha um carimbo a cada quiz vencido. Dados do IBGE e de outras fontes públicas, citadas em cada mapa.",
  img: "assets/biomas.jpg",
  alt: "Home do Biomas do Brasil: mapa 3D com relevo dos biomas sobre a América do Sul, a lista dos biomas, as camadas e o painel com os números do Brasil.",
  href: "https://biomas-brasil.pages.dev/",
});
// fora da v4: Mixtape e Tomos do blog (continuam na v2)
window.PROJECTS = window.PROJECTS.filter(function (p) { return p.title !== "Mixtape" && p.title !== "Tomos do blog"; });
// BRCHAD Games vai para o fim; a ordem final tem que casar com PROJECTS_EN (v4-i18n.js)
window.PROJECTS = window.PROJECTS.filter(function (p) { return p.title !== "BRCHAD Games"; })
  .concat(window.PROJECTS.filter(function (p) { return p.title === "BRCHAD Games"; }));

// Na v4 a etiqueta é só a categoria (o botão diz "Ver projeto"), e a linha abaixo do título
// diz o que foi feito, não quanto tempo levou. Inglês em PROJECTS_EN (v4-i18n.js).
var EXTRA = {
  "BRCHAD Games": ["Plataforma", "produto completo · back-end, front-end e UX"],
  "Academia Paulista de Letras: proposta de novo site": ["Site institucional", "2 propostas de design · CMS com fluxo editorial"],
  "the stained hanes show 24/7 unstoppable stream": ["Streaming", "streaming 24/7 de vídeos do YouTube · web 3D"],
  "First of October Radio": ["Áudio", "rádio 24/7 sem servidor"],
  "Caio's Clocks": ["Creative coding", "programação criativa em forma de relógio"],
  "Biomas do Brasil": ["Atlas interativo", "mapa 3D com relevo real · dados abertos"],
};
window.PROJECTS.forEach(function (p) { var x = EXTRA[p.title] || []; p.tag = x[0] || p.tag; p.time = x[1]; });

// textos que mudam só na v4 (a v2 continua com o de projects-v2.js)
var BRCHAD = window.PROJECTS.filter(function (p) { return p.title === "BRCHAD Games"; })[0];
if (BRCHAD) BRCHAD.desc = "Uma plataforma completa de jogos de raciocínio: editores, servidor de publicação, player para embutir em outros sites, analytics e dashboard. Criei quase 800 jogos, que podem ser jogados nos sites de acervo. Fiz com IA.";
