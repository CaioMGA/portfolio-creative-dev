# portfolio-creative-dev

Source code of my creative-developer portfolio, live at **https://portfolio.caiomga.com**.

This site was designed and coded in less than 8 hours, with AI. The git history is public, with every branch, to show how it was built.

## What's in here

Plain static HTML/CSS/JS, no build step, no backend.

| File | What it is |
|---|---|
| `index.html` | v1, the first version |
| `v2.html` | v2, the 2D version (copy and projects in `projects-v2.js`) |
| `v3.html` | v3, the 3D version served at the link above: a three.js scene with one procedural object per project |
| `v3.js`, `v3-scene.js`, `v3.css` | v3 DOM/scroll logic, three.js scene, styles |
| `v3-i18n.js`, `projects-v3.js` | EN/PT-BR strings and the v3 project list |
| `v4.html` + `v4*.js`, `v4.css`, `projects-v4.js`, `games-v4.js` | v4, a copy of v3 repositioned around game development: games section (data in `games-v4.js`; empty list hides it), cards without hour counts, rewritten method/journey/contact |

Branches: `main` (current), `v3` (where the 3D version was built), `v4` (repositioning around games), `hero-simples` (hero experiments).

## Run locally

```sh
python3 -m http.server
# open http://localhost:8000/v3.html
```

three.js (0.160) and the fonts load from CDNs (jsdelivr and Google Fonts), so you need internet access.

## License

Code: MIT, see [LICENSE](LICENSE). Texts, images and screenshots are not licensed for reuse.
