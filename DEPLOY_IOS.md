# iOS Deployment — Androgenic v2.0

## Prerequisites (one-time setup)

### 1. Apple Developer Account
- Go to https://developer.apple.com/account
- Enroll in the Apple Developer Program ($99/year)
- Note your **Team ID** from Membership Details

### 2. App Store Connect App
- Go to https://appstoreconnect.apple.com
- Click **+** → **New App**
  - Platform: **iOS**
  - Name: **Androgenic — AI Face Analysis**
  - Bundle ID: `com.androgenic.faceanalysis`
  - SKU: `androgenic-face-analysis`
- Note the **App ID** (number in the URL after `/app/`)

### 3. EAS CLI
```bash
npm install -g eas-cli@latest
eas login
```

### 4. Set your credentials
Add these to your shell profile (`~/.zshrc` or `~/.bashrc`):
```bash
export APPLE_ID="your@email.com"
export ASC_APP_ID="1234567890"       # From App Store Connect URL
export APPLE_TEAM_ID="XXXXXXXXXX"    # From developer.apple.com
```
Then run `source ~/.zshrc`

---

## Deploy (one command)

### Full build + submit to App Store:
```bash
./scripts/deploy-ios.sh
```

### Build only (no submit):
```bash
./scripts/deploy-ios.sh build-only
```

### Submit an existing build:
```bash
./scripts/deploy-ios.sh submit-only
```

### OTA update (JS-only changes, no review needed):
```bash
./scripts/deploy-ios.sh update
```

---

## After the build

1. Build runs on EAS cloud servers (~15-20 min)
2. Auto-submitted to App Store Connect
3. Go to **App Store Connect** → **Androgenic**
4. Wait for the build to finish processing (~15 min)
5. Go to **App Store** tab → select the new version
6. Add the build under **Build** section
7. Fill in:
   - **Screenshots** (6.7" and 6.5" required, 5.5" optional)
   - **Description** — copy from `store/ios/metadata.json`
   - **Keywords** — copy from `store/ios/metadata.json`
   - **What's New** — copy from `store/ios/metadata.json`
   - **Promotional Text** — copy from `store/ios/metadata.json`
8. Click **Submit for Review**

Review typically takes **24-48 hours**.

---

## In-App Purchases Setup

Before submitting, set up your subscriptions in App Store Connect:

1. Go to **App Store Connect** → **Androgenic** → **Subscriptions**
2. Create a **Subscription Group**: "Androgenic PRO"
3. Add these products:

| Reference Name | Product ID | Price | Duration |
|---|---|---|---|
| Weekly | `com.androgenic.faceanalysis.pro.weekly` | $4.99 | 1 Week |
| Monthly | `com.androgenic.faceanalysis.pro.monthly` | $9.99 | 1 Month |
| Yearly | `com.androgenic.faceanalysis.pro.yearly` | $39.99 | 1 Year |

4. For lifetime, go to **In-App Purchases** (non-consumable):

| Reference Name | Product ID | Price |
|---|---|---|
| Lifetime | `com.androgenic.faceanalysis.pro.lifetime` | $79.99 |

5. Fill in display names and descriptions for each
6. Submit for review alongside the app

---

## Quick Reference

| Command | What it does |
|---|---|
| `npm run deploy:ios` | Build + auto-submit |
| `npm run build:ios` | Build only |
| `npm run submit:ios` | Submit existing build |
| `npm run update:ios "message"` | OTA update |
| `./scripts/deploy-ios.sh` | Interactive deploy script |

---

## Troubleshooting

**"No Apple credentials"** — Set APPLE_ID, ASC_APP_ID, APPLE_TEAM_ID env vars

**"Code signing error"** — EAS handles this automatically. On first build, it will ask you to log in and will create certificates/provisioning profiles for you.

**"Build failed"** — Run `eas build --platform ios --profile production` without `--non-interactive` to see the full error

**"Missing compliance"** — Already handled. `ITSAppUsesNonExemptEncryption` is set to `false` in app.json.

**Screenshots needed** — Use the iOS Simulator or a real device to capture:
  - 6.7" (iPhone 15 Pro Max): 1290 x 2796
  - 6.5" (iPhone 14 Plus): 1284 x 2778
  - 5.5" (iPhone 8 Plus): 1242 x 2208 (optional)
