# Google Play Store Screenshot & Asset Specifications

## Required Assets

### App Icon
- **Size:** 512 x 512 px
- **Format:** 32-bit PNG (with alpha)
- **Source:** `assets/icon.png` (used by EAS Build automatically)

### Feature Graphic
- **Size:** 1024 x 500 px
- **Format:** JPG or 24-bit PNG (no alpha)
- **Description:** Banner displayed at top of Play Store listing
- **Design Notes:**
  - Dark background (#0a0a0a to #1a1a2e gradient)
  - "Androgenic" logo text centered
  - Tagline: "AI-Powered Face Analysis"
  - Subtle face scan wireframe graphic
  - Gold accent (#FFD700) highlights
- **Save as:** `store-config/android/assets/feature-graphic.png`

### Screenshots (Phone)
- **Min:** 2 screenshots | **Max:** 8 screenshots
- **Size:** 1080 x 1920 px (16:9) or 1080 x 2400 px (20:9)
- **Format:** JPG or 24-bit PNG

#### Screenshot 1: Hero / Face Score
- **Header text:** "Your Face, Analyzed by AI"
- **Show:** Results screen with score ring, overall score, and photo
- **Background:** Dark gradient with gold accents

#### Screenshot 2: Category Breakdown
- **Header text:** "7 Detailed Categories"
- **Show:** Category cards with scores (jawline, eyes, cheekbones, etc.)
- **Background:** Dark with colored category icons

#### Screenshot 3: Personalized Tips
- **Header text:** "Personalized Action Plan"
- **Show:** AI Recommendations screen with improvement tips
- **Background:** Dark with purple/blue accents

#### Screenshot 4: Guides & Tutorials
- **Header text:** "Expert Guides & Tutorials"
- **Show:** Guides hub with category cards (Mewing, Skincare, Jawline, etc.)
- **Background:** Dark with green accents

#### Screenshot 5: Progress Tracking
- **Header text:** "Track Your Glow-Up"
- **Show:** Before/After screen with score improvement (5.8 → 7.2)
- **Background:** Dark with gold progress indicators

#### Screenshot 6: Glow-Up Report
- **Header text:** "Detailed Analysis Report"
- **Show:** Glow-Up Report screen with percentile rankings
- **Background:** Dark with gradient cards

#### Screenshot 7: Celebrity Matching
- **Header text:** "Celebrity Look-Alike"
- **Show:** Celebrity match section from Results screen
- **Background:** Dark with star accents

#### Screenshot 8: PRO Features
- **Header text:** "Unlock Your Full Potential"
- **Show:** ProFeatures comparison screen (Free vs PRO)
- **Background:** Gold gradient

### Screenshots (7-inch Tablet) — Optional
- **Size:** 1200 x 1920 px
- Same content as phone screenshots

### Screenshots (10-inch Tablet) — Optional
- **Size:** 1600 x 2560 px
- Same content as phone screenshots

---

## Screenshot Creation Tips

### Using Expo
```bash
# Run app on Android emulator
npx expo start --android

# Use Android Studio to capture screenshots
# Device: Pixel 7 Pro (1080 x 2400)
```

### Using Figma/Design Tool
1. Create frames at 1080 x 2400 px
2. Place device mockup or raw screenshot
3. Add header text with app branding
4. Export as PNG

### Screenshot Framing Template
```
┌──────────────────────┐
│   Header Text (bold) │  ← 200px top area
│   Subtext (lighter)  │
├──────────────────────┤
│                      │
│                      │
│   App Screenshot     │  ← Actual app content
│   (device mockup)    │
│                      │
│                      │
├──────────────────────┤
│   Background color   │  ← Gradient bg
└──────────────────────┘
```

---

## Promotional Video (Optional but Recommended)
- **Length:** 30 seconds to 2 minutes
- **Format:** YouTube URL
- **Content:**
  1. Quick face scan demo (5s)
  2. Score reveal with categories (5s)
  3. Personalized tips scroll (5s)
  4. Guides showcase (5s)
  5. Before/After transformation (5s)
  6. CTA: "Download Now" (5s)
