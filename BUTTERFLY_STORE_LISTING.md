# Butterfly — App Store Submission Guide

## ⚠️ Read this first: naming & trademark

"Muzz" is a registered trademark of Muzz Ltd, and Apple rejects apps that
imitate another app's name, icon, or branding (App Review Guideline 4.1
"Copycats"). This project therefore ships as **Butterfly** with an original
icon and original listing copy. The *feature set and UX patterns* mirror the
Muzz experience (marriage-minded matching, selfie verification, Wali/
chaperone mode, religious filters, Instant Chat, Gold tier) — patterns and
features are not protectable, but names, logos, and written copy are. Do not
rename the app back to "Muzz" or reuse their logo/screenshots/description
when submitting.

## App identity (already configured in app.json)

| Field | Value |
|---|---|
| Display name | Butterfly: Muslim Marriage |
| iOS bundle ID | com.butterflyapp.muslimmarriage |
| Android package | com.butterflyapp.muslimmarriage |
| Version / build | 1.0.0 (1) |
| Scheme | butterflyapp |
| Category | Lifestyle (secondary: Social Networking) |
| Age rating | 17+ (dating/mature themes per Apple's questionnaire) |

## Listing copy (original — safe to use)

**Subtitle (30 chars):** `AI matchmaking. No swiping.`

**Promo text:** Meet your AI Butterfly — it learns who you are and brings
your best matches to you. Marriage-minded, verified, and built around your
values.

**Description:**

Tired of swiping? Let the Butterfly do the searching.

Butterfly is a marriage-minded matchmaking app built for Muslims. Instead
of endless swiping, your personal AI matchmaker — the Butterfly — learns
your interests, values, and deen, then automatically introduces you to the
people you're most compatible with, and tells you exactly why.

WHY BUTTERFLY
• AI auto-matching — no swiping needed; every pick comes with a real
  compatibility score and the reasons behind it
• Marriage-minded community — everyone states their intention up front
• Selfie verification — every profile is a real person
• Deen-aware matching — sect, prayer level, and halal practice are part
  of compatibility, not an afterthought
• Wali / chaperone mode — invite a guardian to observe your chats
• Photo privacy — keep your photos blurred until you match
• Instant Chat — skip matching and message someone directly (1 free daily)
• Icebreakers written for you by the Butterfly
• Community feed — share moments and get to know people beyond photos
• Voice notes, calls, and video calls to build trust before meeting

BUTTERFLY GOLD
Unlimited likes, see who likes you, extra chat slots, weekly boosts,
rematch, advanced filters, VIP badge, and invisible mode.

Your story starts with a flutter. 🦋

**Keywords:** muslim,marriage,halal,matchmaking,nikah,single,muslima,arab,
dating,match,butterfly,AI

## Pre-submission checklist

1. **App Store Connect**: create a new app record for
   `com.butterflyapp.muslimmarriage` (this is a new identity — the old
   Androgenic record cannot be reused).
2. **EAS**: `eas build --platform all --profile production` (the EAS project
   ID in app.json is account-level and still valid).
3. **IAP**: create the three Gold subscriptions (1m / 3m / 12m) in App Store
   Connect + Play Console and wire the product IDs into `src/config/iap.js`
   before enabling real purchases; the paywall currently simulates purchase
   locally.
4. **Screenshots**: capture from the running app (onboarding, Butterfly
   reveal, match screen, chat with chaperone bar, social feed, Gold paywall).
   6.7" (1290×2796) and 5.5" (1242×2208) sets for iOS.
5. **Privacy**: update PRIVACY_POLICY.md for dating-app data categories
   (profile data, photos, approximate location, messages) and host it at a
   public URL; fill Apple's privacy nutrition labels accordingly.
6. **Age gating**: the dating category requires 17+/18+; confirm in both
   store questionnaires.
7. **Demo account**: App Review requires a working login; the app currently
   runs fully on-device with local data, so note that in review notes.

## Current implementation status

- Fully functional on-device demo: onboarding → AI matching → match →
  chat → social feed → Gold paywall, with state persisted locally.
- No backend yet: profiles are seeded locally, chat replies are simulated,
  selfie verification is simulated. Production launch needs a real backend
  (accounts, real-time chat, verification vendor, push) — the UI and state
  layer are structured so the store (`src/muzz/store.js`) can be swapped to
  API calls without screen changes.
