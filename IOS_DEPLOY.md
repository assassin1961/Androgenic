# iOS App Store Deployment Guide

## Prerequisites

1. **Apple Developer Account** — $99/year at https://developer.apple.com
2. **EAS CLI** — `npm install -g eas-cli`
3. **Expo Account** — https://expo.dev (already configured: `adeelahmedrahman`)

---

## Step 1: Update Apple Credentials in eas.json

Open `eas.json` and replace the placeholders in `submit.production.ios`:

```json
"ios": {
  "appleId": "your-actual-apple-id@email.com",
  "ascAppId": "1234567890",
  "appleTeamId": "ABCDE12345"
}
```

**How to find these:**
- `appleId` — Your Apple Developer account email
- `appleTeamId` — https://developer.apple.com/account → Membership → Team ID
- `ascAppId` — Create the app in App Store Connect first (Step 2), then copy the Apple ID from App Information

---

## Step 2: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Androgenic - Face Analysis AI
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: `com.androgenic.faceanalysis`
   - **SKU**: `androgenic-face-analysis`
4. Copy the **Apple ID** number from App Information → paste into eas.json as `ascAppId`

---

## Step 3: Configure In-App Purchases

In App Store Connect → Your App → Monetization → Subscriptions:

1. **Create Subscription Group**: "Androgenic PRO"
2. **Add Subscriptions**:

   | Product ID | Duration | Price |
   |-----------|----------|-------|
   | `com.androgenic.faceanalysis.pro.weekly` | 1 Week | $4.99 |
   | `com.androgenic.faceanalysis.pro.monthly` | 1 Month | $9.99 |
   | `com.androgenic.faceanalysis.pro.yearly` | 1 Year | $39.99 |

3. **Add Non-Consumable** (In-App Purchases section):

   | Product ID | Price |
   |-----------|-------|
   | `com.androgenic.faceanalysis.pro.lifetime` | $79.99 |

4. For each subscription:
   - Set display name and description
   - Add **Subscription Price** for all territories
   - Enable **Free Trial**: 3 days for weekly/monthly
   - Set **Grace Period**: 16 days

---

## Step 4: App Privacy

In App Store Connect → Your App → App Privacy:

Select **"Data Not Collected"** — our app:
- Processes photos on-device only
- Uses AsyncStorage for local data only
- No analytics SDKs
- No tracking
- No third-party data sharing

---

## Step 5: Build for iOS

```bash
# Login to EAS (first time only)
eas login

# Build production iOS archive
npm run build:ios
# or: eas build --platform ios --profile production

# EAS will prompt you to:
# 1. Generate a new iOS Distribution Certificate (yes)
# 2. Generate a new Provisioning Profile (yes)
# These are managed by EAS automatically
```

Wait for the build to complete (~15-25 minutes).

---

## Step 6: Submit to App Store

```bash
# Submit the latest build to App Store Connect
npm run submit:ios
# or: eas submit --platform ios --profile production

# EAS will prompt for your Apple ID password or App-Specific Password
# Generate an app-specific password at: https://appleid.apple.com/account/manage
```

---

## Step 7: App Store Connect Setup

After the build uploads, go to App Store Connect:

### Version Information
- **What's New**: Copy from STORE_LISTING.md → What's New section
- **Description**: Copy from STORE_LISTING.md → Description section
- **Keywords**: `looksmax,face score,face analysis,jawline,mewing,glow up,facial,attractiveness,face rating,ai face`
- **Support URL**: `https://androgenic.app/support`
- **Marketing URL**: `https://androgenic.app`

### Screenshots
Upload for these device sizes (required):
- **iPhone 6.7" (iPhone 15 Pro Max)**: 1290×2796px — REQUIRED
- **iPhone 6.5" (iPhone 11 Pro Max)**: 1242×2688px — REQUIRED
- **iPad Pro 12.9"**: 2048×2732px — if supportsTablet is true

Tip: Take screenshots using Expo Go on a simulator:
```bash
xcrun simctl io booted screenshot screenshot1.png
```

### App Review Information
- **Contact**: Your name, email, phone
- **Notes**: Copy the "App Review Notes" from STORE_LISTING.md
- **Demo Account**: Not required

### Age Rating
- Select: **12+**
- Medical/Treatment Information: Infrequent/Mild

---

## Step 8: Submit for Review

1. In App Store Connect → your app version
2. Select the build you uploaded
3. Click **Add for Review**
4. Click **Submit to App Review**

Review typically takes 24-48 hours.

---

## Quick Reference Commands

```bash
# Build iOS production
eas build --platform ios --profile production

# Build iOS preview (for TestFlight internal testing)
eas build --platform ios --profile preview

# Submit to App Store
eas submit --platform ios --profile production

# Push OTA update (no new build needed)
eas update --branch production --message "Bug fixes and improvements"

# Check build status
eas build:list --platform ios --limit 5
```

---

## Troubleshooting

### "Missing Compliance" warning in App Store Connect
Already handled — `ITSAppUsesNonExemptEncryption` is set to `false` in app.json.

### "Missing Privacy Manifest" rejection
Already handled — `privacyManifests` is configured in app.json with all required API types.

### IAP not working in TestFlight
- Ensure Sandbox Test Account is configured in App Store Connect → Users and Access → Sandbox
- Sign out of App Store on device, sign in with sandbox account
- IAP can take up to 24 hours to propagate after creation

### Build fails with signing error
```bash
# Clear EAS credentials cache and regenerate
eas credentials --platform ios
```

### "This app has crashed" on launch
- Check that all native modules are properly linked via plugins in app.json
- Ensure `react-native-iap` plugin is listed
- Run a preview build first to test on a real device
