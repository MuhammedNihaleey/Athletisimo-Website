# Sadiq Ali — Athletisimo International

Static portfolio site (no build step). Online coaching worldwide, in-person training in the UAE.

## Run locally
    python3 -m http.server 4173   # then open http://localhost:4173

## Deploy to Vercel
- **CLI:** `npm i -g vercel` → `vercel` (preview) → `vercel --prod`
- **Git:** push this folder to GitHub → "Add New Project" on vercel.com → Framework preset: **Other**, no build command, output directory: `./`

The raw photo folders (`Images and Videos/`, `Trainer photo/`) are excluded from deploys and git. The site uses the optimised copies in `assets/img/`.

## Editing
- Copy & sections: `index.html`
- Styles / colours (`:root` tokens): `assets/css/style.css`
- Animations, chart data, contact number/email: `assets/js/main.js`
