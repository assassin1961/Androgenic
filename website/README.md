# Androgenic — Website

A premium, zero-build marketing site for **Androgenic** (AI face analysis & looksmaxxing),
mixing the marketing storytelling of androgenic.net with a faithful in-page recreation of
the androgenic.app product UI.

## Files
- `index.html` — full single-page site (hero, analysis, how-it-works, app showcase, testimonials, pricing, FAQ, CTA, footer)
- `styles.css` — design system + fluid animations (aurora background, glassmorphism, gradients)
- `script.js` — scroll reveals, animated counters, SVG score rings, magnetic buttons, card tilt/spotlight, cursor glow, parallax phone, nav, pricing toggle

## Highlights
- Brand gradient (blue → purple → pink) and dark theme pulled from the app
- Animated aurora background, scroll progress bar, shimmering gradient headlines
- IntersectionObserver-driven reveals + count-up stats + ring fills
- Magnetic CTAs, 3D tilt cards, mouse-parallax phone mockup, custom cursor glow
- Fully responsive (desktop → mobile) with a slide-in mobile menu
- Respects `prefers-reduced-motion`; no dependencies, no build step

## Run / deploy
Open `index.html` directly, or serve the folder:

```bash
npx serve website
```

Deploy by hosting the `website/` folder on any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).
