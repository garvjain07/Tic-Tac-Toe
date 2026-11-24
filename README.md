# Tic Tac Toe

A fast, accessible and responsive Tic Tac Toe web game built with HTML, CSS and vanilla JavaScript.

## Features

- Player vs AI mode
- Easy, medium and unbeatable hard AI
- Local two-player mode
- Persistent score tracking with `localStorage`
- Light and dark themes
- Winning-cell highlights and celebration effect
- Keyboard-accessible board controls
- Responsive mobile-first layout
- Reduced-motion support
- SEO metadata and VideoGame schema
- Static deployment with no runtime dependencies

## Run locally

From the repository root:

```bash
cd Tic_Tac_Toe_game
python -m http.server 3000
```

Open `http://localhost:3000/TTT.html`.

## Deploy to Vercel

### Vercel CLI

```bash
npm install -g vercel
cd Tic_Tac_Toe_game
vercel login
vercel
```

For a production deployment:

```bash
vercel --prod
```

### GitHub import

1. Push the project to GitHub.
2. Open [vercel.com/new](https://vercel.com/new).
3. Import the repository.
4. Set **Root Directory** to `Tic_Tac_Toe_game`.
5. Keep the framework preset as **Other** and deploy.
