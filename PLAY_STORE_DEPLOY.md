# Androgenic - Google Play Store Deployment Guide

## Prerequisites

1. **Google Play Developer Account** ($25 one-time) - https://play.google.com/console
2. **EAS CLI** installed: `npm install -g eas-cli`
3. **Expo account** - https://expo.dev
4. **Google Cloud Service Account** for automated uploads

---

## Step 1: EAS Project Setup

```bash
# Login to Expo
eas login

# Initialize project (if not done already)
eas init
# This gives you a project ID → update app.json extra.eas.projectId
```

## Step 2: Google Play Console Setup

### 2a. Create App
1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill in:
   - **App name:** Androgenic - Face Analysis AI
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free
4. Accept declarations and create

### 2b. Store Listing
1. Go to **Main store listing**
2. Use content from `store-config/android/listing.json`:
   - **Short description** (80 chars max): AI looksmax face score, jawline analysis, glow-up guides & improvement tips
   - **Full description** (4000 chars max): Copy from listing.json
3. Upload graphics:
   - **App icon:** 512x512 PNG (auto-generated from `assets/icon.png` or upload manually)
   - **Feature graphic:** 1024x500 (see `store-config/android/SCREENSHOTS.md`)
   - **Phone screenshots:** At least 2, up to 8 (1080x1920 or 1080x2400)

### 2c. Content Rating
1. Go to **Content rating**
2. Start questionnaire
3. Answer:
   - Violence: No
   - Sexual content: No
   - Language: No
   - Controlled substance: No
   - Miscellaneous: No
4. Result should be: **Everyone** or **PEGI 3**

### 2d. Data Safety
1. Go to **Data safety**
2. Follow answers from `store-config/android/DATA_SAFETY.md`
3. Key answers:
   - App does NOT collect user data (except photos processed on-device)
   - No data shared with third parties
   - Users can request deletion
   - Link privacy policy: https://androgenic.app/privacy

### 2e. Target Audience
1. Go to **Target audience**
2. Select: **13 and above** (NOT targeting children)
3. Confirm you don't target children under 13

---

## Step 3: Set Up Google Play Service Account

This is needed for automated AAB uploads via `eas submit`.

### 3a. Create Service Account
1. Go to **Google Cloud Console** → https://console.cloud.google.com
2. Create or select a project
3. Go to **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**
   - Name: `play-store-publisher`
   - Description: "Automated Play Store uploads via EAS"
5. Click **Create and Continue**
6. Skip role assignment for now
7. Click **Done**

### 3b. Create Key
1. Click on the service account you created
2. Go to **Keys** tab
3. **Add Key** → **Create new key** → **JSON**
4. Download the JSON file
5. **IMPORTANT:** Save as `google-services.json` in your project root
6. This file is already in `.gitignore` — never commit it

### 3c. Grant Access in Play Console
1. Go to **Google Play Console** → **Users and permissions**
2. Click **Invite new users**
3. Enter the service account email (from the JSON file: `client_email`)
4. Grant permissions:
   - **App access:** Select your app
   - **Permissions:** Release to production, Manage store listing
5. Click **Invite user**
6. **Wait 24-48 hours** for permissions to propagate

---

## Step 4: Configure In-App Purchases

### 4a. Create Subscription Group
1. Go to **Monetize** → **Subscriptions**
2. Create subscription group: **Androgenic PRO**

### 4b. Add Subscription Products
| Product ID | Name | Billing Period | Price | Free Trial |
|---|---|---|---|---|
| `com.androgenic.faceanalysis.pro.weekly` | PRO Weekly | 1 week | $4.99 | 3 days |
| `com.androgenic.faceanalysis.pro.monthly` | PRO Monthly | 1 month | $9.99 | 3 days |
| `com.androgenic.faceanalysis.pro.yearly` | PRO Yearly | 1 year | $39.99 | 3 days |

### 4c. Add One-Time Product (Lifetime)
1. Go to **Monetize** → **In-app products**
2. Create product:
   - **Product ID:** `com.androgenic.faceanalysis.pro.lifetime`
   - **Name:** PRO Lifetime
   - **Price:** $79.99

### 4d. Activate Products
- Set each product status to **Active**
- Products won't work until the app is published (at least to internal testing)

---

## Step 5: Build for Play Store

```bash
# Build production Android App Bundle (.aab)
npm run build:android
# or
eas build --platform android --profile production

# This will:
# 1. Generate a signing keystore (first time) or use existing
# 2. Build the .aab in the cloud
# 3. Return a download link

# IMPORTANT: EAS manages your signing keystore automatically
# The keystore is stored securely on Expo's servers
```

### First Build Notes
- EAS will ask to generate a new Android keystore on first build
- Choose **Yes** — EAS securely stores and manages the keystore
- You can download your keystore later: `eas credentials`

---

## Step 6: Upload App Signing Key

Google Play requires you to enroll in **Play App Signing**:

1. Build your first AAB: `eas build --platform android --profile production`
2. Download the keystore: `eas credentials --platform android`
3. In Play Console → **App signing**, upload the upload key certificate
4. Or: Use EAS Submit which handles this automatically

---

## Step 7: Submit to Play Store

### Option A: Automated via EAS Submit
```bash
# Submit to internal testing first (recommended)
eas submit --platform android --profile internal-testing

# After testing, submit to production
npm run submit:android
# or
eas submit --platform android --profile production
```

### Option B: Manual Upload
1. Build: `eas build --platform android --profile production`
2. Download the `.aab` file from the build URL
3. Go to Play Console → **Production** → **Create new release**
4. Upload the `.aab` file
5. Add release notes
6. Review and start rollout

---

## Step 8: Testing Tracks (Recommended Flow)

### Internal Testing (Up to 100 testers)
```bash
eas build --platform android --profile preview:internal-testing
eas submit --platform android --profile internal-testing
```
- Instant approval (no review)
- Share opt-in link with testers

### Closed Testing (Alpha)
```bash
eas submit --platform android --profile closed-testing
```
- Requires review (~hours to days)
- Invite specific testers via email

### Open Testing (Beta)
```bash
eas submit --platform android --profile open-testing
```
- Anyone can join via Play Store link
- Good for final validation

### Production
```bash
npm run submit:android
```
- Full Play Store review
- Usually 1-3 days for first submission

---

## Step 9: Release Notes (v1.0.0)

```
Introducing Androgenic — AI-Powered Face Analysis!

What's new:
• AI face analysis with 7 scoring categories
• Personalized improvement recommendations
• 8 comprehensive self-improvement guides (Mewing, Skincare, Jawline, Hair, and more)
• Celebrity look-alike matching
• Progress tracking & transformation tools
• Beautiful dark mode UI with smooth animations
• PRO subscription with unlimited features

Start your glow-up journey today!
```

---

## Common Issues & Solutions

### "You need to upload an AAB signed with the correct key"
- EAS manages your keystore. Run `eas credentials --platform android` to verify
- If migrating from a different build system, you may need to reset the upload key

### "Subscription products not found"
- Products must be Active in Play Console
- App must be published to at least Internal Testing track first
- Wait a few hours after creating products before testing

### "App not reviewed yet"
- First submission takes 1-7 days for review
- Subsequent updates are usually faster (hours to 1 day)
- Ensure all policy declarations are complete

### Build fails
```bash
# Clear EAS cache and rebuild
eas build --platform android --profile production --clear-cache
```

---

## Post-Launch

### OTA Updates (No Play Store Review)
```bash
# Push JS-only updates directly to users
eas update --branch production --message "Bug fixes"
```

### Monitor Performance
- **Play Console** → **Statistics** for installs, ratings, revenue
- **Android Vitals** for crash rates and ANR
- **Revenue** → **Financial reports** for subscription metrics

### Staged Rollout
- Production releases can be rolled out to a percentage of users
- Start at 10%, monitor crashes, then increase to 100%

---

## Checklist Before Submission

- [ ] Store listing complete (title, descriptions, screenshots, feature graphic)
- [ ] Content rating questionnaire completed
- [ ] Data safety form filled out
- [ ] Privacy policy URL accessible: https://androgenic.app/privacy
- [ ] Target audience configured (13+)
- [ ] App pricing set to Free with In-App Purchases
- [ ] In-app products created and activated
- [ ] Service account key downloaded as `google-services.json`
- [ ] Service account granted Play Console access
- [ ] App signing enrolled
- [ ] AAB built and uploaded
- [ ] Release notes written
- [ ] Tested on physical Android device
