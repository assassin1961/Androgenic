# Androgenic — Google Play Store Deployment Guide

Production-ready deployment checklist for **dominating** Play Store search and trending.

---

## Status: READY TO DEPLOY

| Item | Status |
|------|--------|
| Android package id | `com.androgenic.faceanalysis` |
| Version | `1.1.0` (versionCode `6`) |
| Target SDK | 35 (Android 15) |
| Min SDK | 24 (Android 7.0+) |
| App Bundle | Configured for AAB |
| ProGuard / R8 | Enabled in release |
| Permissions | Camera, photos, biometric, billing — all justified |
| Blocked permissions | Location, audio, contacts, calendar, SMS — explicitly denied |
| Deep links | `androgenic://` + `https://androgenic.app/` (verified) |
| In-app purchases | `com.android.vending.BILLING` enabled |
| Notifications | `POST_NOTIFICATIONS` for Android 13+ |
| Edge-to-edge | Enabled |
| Adaptive icon | Configured (foreground + background + monochrome) |
| Privacy manifest | Complete |
| Encryption declaration | Not exempt (no encryption used) |

---

## Step 1: Pre-flight Checks

```bash
cd Androgenic
npm install
npx expo-doctor
```

If `expo-build-properties` is missing:
```bash
npx expo install expo-build-properties
```

---

## Step 2: EAS Setup (one-time)

```bash
npm install -g eas-cli
eas login
eas init   # if projectId in app.json doesn't already exist
```

The `eas.json` is pre-configured with these profiles:
- `development` — debug APK with dev client
- `preview` — release APK for direct install/testing
- `preview:internal-testing` — AAB for Play Console internal track
- `production` — production AAB for Play Store
- `production:android` — Android-only production AAB

---

## Step 3: Google Play Console Setup

### 3a. Create the app

1. https://play.google.com/console → **Create app**
2. Fill in:
   - **App name:** Androgenic — AI Face Analysis & Looksmax
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free
3. Accept declarations and create.

### 3b. Service account for automated submits

1. https://console.cloud.google.com → create or select project
2. Enable **Google Play Android Developer API**
3. **IAM & Admin → Service Accounts** → create service account, role **Service Account User**
4. Create JSON key, save as `google-services.json` in project root
5. In Play Console: **Setup → API access** → link service account, grant permissions

### 3c. Subscriptions (PRO IAP)

In Play Console → **Monetize → Subscriptions**, create:

| Product ID | Base plan | Price | Free trial |
|------------|-----------|-------|------------|
| `androgenic_pro_monthly` | monthly | $9.99 | 7 days |
| `androgenic_pro_yearly` | yearly | $59.99 | 7 days |
| `androgenic_pro_lifetime` | one-time | $149.99 | — |

Activate each. Product IDs **must exactly match** `src/config/iap.js`.

### 3d. Store listing

Use content from `STORE_LISTING.md`:

- **Short description (80 chars):** AI looksmax face score, jawline analysis, glow-up guides & improvement tips
- **Full description (4000 chars):** copy from STORE_LISTING.md
- **App icon:** 512×512 PNG (auto from `assets/icon.png`)
- **Feature graphic:** 1024×500 — see `store-config/android/SCREENSHOTS.md`
- **Phone screenshots:** 4–8 at 1080×2400 (or 1080×1920)
- **Promo video** (optional but boosts CVR)

### 3e. Content rating

Category: **Health & Fitness**. Answer questionnaire:
Violence: No · Sexual content: No · Profanity: No · Controlled substances: No · Gambling: No · UGC: Yes (forum, declare moderation policy)

### 3f. Data safety

- Photos / videos — used on-device only (face analysis), not uploaded
- App activity — usage analytics
- Device ID — for IAP
- Email (optional, for accounts)

All data: **encrypted in transit**, **users can request deletion**.

### 3g. Target audience

Target age: **17+** (looksmaxxing content, peptide info)

---

## Step 4: Build & Submit

### Internal testing (recommended first)

```bash
npm run build:android-internal
npm run submit:android-internal
```

Add yourself + ~10 testers via Play Console **Internal testing** track.

### Open beta (optional)

```bash
eas build --platform android --profile production:android
eas submit --platform android --profile open-testing
```

### Production release

```bash
npm run build:android
npm run submit:android
```

The submit job:
1. Uploads AAB to Play Console
2. Sets release status to `completed`
3. Rolls out to 100% (change to staged rollout in `eas.json` if preferred)

---

## Step 5: Domination Strategy

### ASO (App Store Optimization)
- **Title:** "Androgenic — AI Face Analysis" packs core keywords without spam
- **Short desc:** front-loads "AI looksmax face score, jawline analysis"
- **Full desc:** mentions mewing, jawline, looksmax, glow-up, AI, face shape, face score, masculinity, attractiveness — all high-volume search terms
- **Tags:** Health & Fitness primary, Lifestyle secondary

### Reviews & ratings
- In-app review prompt at high-engagement moments (after first scan + 3-day streak)
- Aim for **4.5+ stars** before scaling ads
- Respond to every 1–3★ review within 24h

### Featured placement
Submit at https://play.google.com/console/u/0/about/programs. Best chance: announce a major update with accessibility/inclusive design improvements.

### Conversion levers (already in-app)
- 7-day free trial → drives subscription start rate
- Social proof carousel on PaywallScreen (3 testimonials with score deltas)
- Limited-offer urgency banner (animated)
- Featured glass cards on Home drive deep engagement

---

## Step 6: Post-Launch

### Monitor
- **Crashes:** Play Console → Quality → Android vitals
- **ANRs:** target < 0.47%
- **Crash-free users:** target > 99.9%
- **Subscription conversion:** Play Console → Monetization → Subscriptions

### Update cadence
- OTA JS updates via EAS Update: `npm run update -- "fix: typo on paywall"`
- Major updates: bump version + versionCode, build, submit

---

## Troubleshooting

### "Version code already exists"
Bump `android.versionCode` in `app.json` (currently 6).

### "App rejected for permissions"
We block all sensitive permissions Google flags. If rejection still occurs, check for transitive deps adding them: `npx expo prebuild` then inspect `android/app/src/main/AndroidManifest.xml`.

### "googleServicesFile not found"
Optional — only needed for Firebase. Remove `googleServicesFile` from `app.json` android section if unused.

### Build fails with "newArchEnabled" error
Reanimated v4 requires the new arch. We have `newArchEnabled: true`. If a third-party lib breaks, set `newArchEnabled: false` (loses some performance).

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run build:android` | Production AAB |
| `npm run build:android-preview` | Preview APK |
| `npm run build:android-internal` | Internal testing AAB |
| `npm run submit:android` | Submit to production |
| `npm run submit:android-internal` | Submit to internal track |
| `npm run submit:android-beta` | Submit to open beta |
| `npm run update -- "msg"` | OTA JS update |

---

**Built for domination. Ship it.**
