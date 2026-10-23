# 🍔 The Journey of a Krabby Patty

An interactive, bottom-to-top underwater bubble odyssey documenting the dramatic lore of a single Krabby Patty through Bikini Bottom.

---

## 🌊 Overview

Built as a bottom-to-top scroll experience:
- **Bottom-to-Top Storyline**: The journey starts at the bottom where the patty is forged, and scrolling upward travels through Bikini Bottom encounters up to the final zenith.
- **Bubble Architecture**: Spherical viewport containers with chromatic aberration sheen, glassmorphism refraction, and organic floating physics.
- **Dual-Layer Asset Backups**: All assets resolve locally (`memes/`) with an automatic real-time fallback to public CDN links (`https://files.catbox.moe/...`) if local files are missing.
- **Procedural Web Audio Engine**: Deep underwater drone synthesized with sine/triangle oscillators and dynamic grill sizzle via pink noise buffer filters (unmuted on toggle).
- **Interactive Particle Canvas**: Ambient rising bubbles that react to scroll velocity and viewport movement.

---

## 🚀 Quick Start

### Option 1: Live Server / Static Hosting
No build step or dependencies required. Run directly with any static server:

```bash
# Python
python3 -m http.server 5173

# Or with Node
npx serve .
```

### Option 2: Vite Dev Server
```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build
```

---

## 📁 Project Structure

```text
BobaBash/
├── index.html          # Main HTML structure with bottom-to-top story stream & error fallbacks
├── style.css           # Styling, bubble capsules, animations, and non-repeating backgrounds
├── script.js           # Procedural Web Audio, bubble canvas, and scroll interactions
├── image_links.json    # Dual backup mapping (local file paths + public CDN URLs)
├── memes/              # Local meme assets and graphic elements
└── dist/               # Production build output
```

---

## 🛠️ Key Controls & Features

- **Scroll Up**: Navigate backwards in time / upward towards the culmination of the journey.
- **Sound Toggle (🔊/🔇)**: Click the floating speaker bubble in the bottom-right corner to toggle the synthesized underwater ambient drone and grill sizzle.
- **Asset Fallback**: Images automatically recover via `image_links.json` mapping if any asset is missing.
