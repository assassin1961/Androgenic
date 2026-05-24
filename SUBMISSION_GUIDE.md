# Androgenic — App Store Submission Guide

## Quick Start

```bash
# 1. Install EAS CLI (if not installed)
npm install -g eas-cli@latest

# 2. Login to Expo
eas login

# 3. Build + auto-submit to App Store Connect
./scripts/deploy-ios.sh
```

That's it. The script handles everything. When prompted for ASC_APP_ID, enter
your App Store Connect app ID (the number from the URL after `/app/`).

---

## Step-by-Step (if you prefer manual)

### 1. Build for iOS

```bash
eas build --platform ios --profile production
```

First time: EAS will ask to create/register the Bundle ID `com.androgenic.faceanalysis`
automatically — say **Yes** to everything.

### 2. Submit to App Store Connect

```bash
eas submit --platform ios --profile production
```

Or combine both:
```bash
eas build --platform ios --profile production --auto-submit
```

### 3. App Store Connect Setup

Go to https://appstoreconnect.apple.com

#### App Information
| Field | Value |
|-------|-------|
| App Name | Androgenic — AI Face Analysis |
| Subtitle | Looksmaxxing & Face Score |
| Bundle ID | com.androgenic.faceanalysis |
| Primary Category | Health & Fitness |
| Secondary Category | Lifestyle |
| Age Rating | 12+ |
| Copyright | © 2026 Androgenic |

#### Screenshots (1284x2778px — iPhone 6.7")
Upload these 13 from `store/screenshots/` — recommended order for App Store:

1. `12-onboarding.png` — Welcome screen (first impression)
2. `01-home.png` — Home with scan button & stats
3. `02-results.png` — Face analysis results (8.2 score)
4. `09-compare.png` — Before/after progress comparison
5. `03-routine.png` — Daily looksmaxxing routine
6. `04-leaderboard.png` — Competitive leaderboard
7. `06-guides.png` — 23+ expert guides
8. `07-chat.png` — AI advisor (ANDRO)
9. `08-history.png` — Scan history & progress
10. `05-profile.png` — Profile with stats
11. `10-paywall.png` — PRO subscription
12. `11-settings.png` — Settings & customization
13. `13-guides-pro.png` — PRO masterclasses

App Store allows **up to 10 screenshots** — use the first 10 for best impact.

#### Description & Keywords
Copy from `store/ios/metadata.json`:
- **Promotional Text** — shown above description, can update without review
- **Description** — full app description
- **Keywords** — comma-separated, max 100 characters

#### What's New
Copy from `store/ios/metadata.json` → `whats_new` field.

#### URLs
| Field | Value |
|-------|-------|
| Support URL | https://androgenic.app/support |
| Marketing URL | https://androgenic.app |
| Privacy Policy URL | https://androgenic.app/privacy |

### 4. In-App Purchases Setup

In App Store Connect → Your App → Monetization → Subscriptions:

Create a **Subscription Group** called "Androgenic PRO", then add these products:

| Reference Name | Product ID | Price | Duration |
|---------------|-----------|-------|----------|
| PRO Weekly | com.androgenic.faceanalysis.pro.weekly | $4.99 | 1 Week |
| PRO Monthly | com.androgenic.faceanalysis.pro.monthly | $9.99 | 1 Month |
| PRO Yearly | com.androgenic.faceanalysis.pro.yearly | $39.99 | 1 Year |
| PRO Lifetime | com.androgenic.faceanalysis.pro.lifetime | $79.99 | Non-Renewing |

Each subscription needs:
- Display Name: e.g. "Androgenic PRO Weekly"
- Description: e.g. "Unlimited scans, all categories, 23+ guides, progress tracking"
- Localization: English (U.S.)

### 5. App Review Notes

Paste this in the "Notes for Reviewer" field:

```
Androgenic uses the device camera to scan the user's face and provide
an AI-powered facial aesthetics analysis. The app scores facial features
across categories like jawline, symmetry, skin quality, etc.

No login is required to use the free features. Free users get 3 scans
and can see 2 of 7 categories. PRO subscription unlocks all features.

To test PRO features, use a Sandbox Apple ID.

The AI analysis is powered by on-device processing and does not
store photos on any server unless the user explicitly opts in.
```

### 6. App Privacy

In App Store Connect → App Privacy, declare:

**Data Collected:**
- Photos (Camera/Photo Library) — Used for face analysis, not linked to identity
- Usage Data — Analytics, not linked to identity
- Identifiers — Device ID for analytics, not linked to identity

**Data NOT Collected:**
- Location, contacts, health data, financial data, browsing history

### 7. Submit for Review

1. Go to App Store tab → select your build
2. Fill in all fields above
3. Click "Add for Review"
4. Click "Submit to App Review"

Review typically takes **24-48 hours**.

---

## OTA Updates (no new build needed)

For JavaScript-only changes:
```bash
./scripts/deploy-ios.sh update
# or directly:
eas update --branch production --platform ios --message "v2.0.1 fixes"
```

## Credentials

| Field | Value |
|-------|-------|
| Apple ID | adeelahmedrahman@gmail.com |
| Team ID | GNUU5L66BM |
| Bundle ID | com.androgenic.faceanalysis |
| EAS Project | ecd7fa1d-cb25-4636-9623-a050339bf1fe |
