# Androgenic - App Store Deployment Guide

## Prerequisites

1. **Apple Developer Account** ($99/year) - https://developer.apple.com
2. **EAS CLI** installed globally: `npm install -g eas-cli`
3. **Expo account** - https://expo.dev (free)

---

## Step 1: EAS Project Setup

```bash
# Login to your Expo account
eas login

# Initialize EAS in the project (creates project on Expo servers)
eas init

# This will give you a project ID - update app.json:
# - extra.eas.projectId
# - updates.url
```

## Step 2: Update Configuration

### app.json
Replace these placeholders with your actual values:
- `YOUR_EAS_PROJECT_ID` → Your Expo project ID from `eas init`
- `owner` → Your Expo username

### eas.json
Replace these placeholders:
- `YOUR_APPLE_ID@email.com` → Your Apple ID email
- `YOUR_APP_STORE_CONNECT_APP_ID` → Your App Store Connect app ID
- `YOUR_APPLE_TEAM_ID` → Your Apple Developer Team ID

## Step 3: App Store Connect Setup

1. Go to https://appstoreconnect.apple.com
2. Create a new app:
   - **Bundle ID:** `com.androgenic.faceanalysis`
   - **Name:** Androgenic - Face Analysis AI
   - **Primary Language:** English (U.S.)
   - **SKU:** `androgenic-face-analysis`

3. Fill in app information from `STORE_LISTING.md`
4. Upload your privacy policy (from `PRIVACY_POLICY.md` or host at your domain)

## Step 4: Configure In-App Purchases

In App Store Connect > Your App > Subscriptions:

1. Create Subscription Group: **"Androgenic PRO"**

2. Add subscriptions:
   | Product ID | Reference Name | Duration | Price |
   |---|---|---|---|
   | `com.androgenic.faceanalysis.pro.weekly` | PRO Weekly | 1 Week | $4.99 |
   | `com.androgenic.faceanalysis.pro.monthly` | PRO Monthly | 1 Month | $9.99 |
   | `com.androgenic.faceanalysis.pro.yearly` | PRO Yearly | 1 Year | $39.99 |

3. Add non-consumable purchase:
   | Product ID | Reference Name | Price |
   |---|---|---|
   | `com.androgenic.faceanalysis.pro.lifetime` | PRO Lifetime | $79.99 |

4. For each subscription:
   - Enable **Free Trial: 3 days**
   - Add localized display name and description
   - Set subscription prices for all territories

## Step 5: App Privacy (App Store Connect)

In App Store Connect > App Privacy:

Select the following data types:
- **Data Not Collected** - Androgenic processes all data on-device

If asked about specific categories:
- Photos: Used for app functionality only, not linked to identity, not tracked
- Usage Data: Stored on device only

## Step 6: Build for App Store

```bash
# Build production iOS binary
npm run build:ios
# or
eas build --platform ios --profile production

# This will:
# 1. Create/use iOS distribution certificate
# 2. Create/use provisioning profile
# 3. Build the .ipa file in the cloud
# 4. Return a download link
```

## Step 7: Submit to App Store

```bash
# Submit the latest build to App Store Connect
npm run submit:ios
# or
eas submit --platform ios --profile production

# This uploads the .ipa to App Store Connect automatically
```

## Step 8: App Store Review Preparation

### Screenshots Required
- 6.7" (iPhone 15 Pro Max): 1290 x 2796px - Required
- 6.5" (iPhone 14 Plus): 1284 x 2778px - Required
- 5.5" (iPhone 8 Plus): 1242 x 2208px - Optional
- 12.9" iPad Pro: 2048 x 2732px - If supporting tablet

### Review Notes
Include in App Store Connect review notes:
> This app performs facial analysis using on-device algorithms. No photos are uploaded to external servers. The app includes a 3-day free trial for premium features. Demo credentials are not required as the app works without account creation.

### Common Rejection Reasons to Avoid
1. **Guideline 5.6.1** - Ensure subscription terms are clear before purchase
2. **Guideline 3.1.2** - Subscriptions must have a "Restore Purchases" button
3. **Guideline 5.1.1** - Privacy policy URL must be accessible
4. **Guideline 2.1** - App must be complete and functional

## Step 9: Android (Google Play) - Optional

```bash
# Build production Android bundle
npm run build:android

# Submit to Google Play
npm run submit:android
```

For Google Play, you'll need:
1. Google Play Developer account ($25 one-time)
2. Service account JSON key for automated uploads
3. App listing with screenshots and descriptions

---

## Post-Launch Checklist

- [ ] Monitor crash reports in App Store Connect
- [ ] Respond to user reviews
- [ ] Set up EAS Update for OTA patches: `eas update`
- [ ] Monitor subscription metrics
- [ ] Plan v1.1 features based on user feedback

## OTA Updates (No App Store Review Needed)

For JavaScript-only changes (no native code changes):

```bash
# Push an OTA update to all users
eas update --branch production --message "Bug fixes and improvements"
```

This bypasses App Store review and delivers updates instantly.
