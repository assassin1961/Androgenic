# Google Play Data Safety Declaration
# Use this when filling out the Data Safety form in Google Play Console

## Overview
Androgenic processes all data locally on-device. No data is collected, shared, or transmitted to external servers.

---

## Data Safety Form Answers

### Does your app collect or share any of the required user data types?
**No**

### Is all of the user data collected by your app encrypted in transit?
**N/A** — No data is transmitted. All processing is local.

### Do you provide a way for users to request that their data is deleted?
**Yes** — Users can delete all data from Settings > Privacy & Data Management > Clear All Data

---

## Data Types Declaration

### Location
- [ ] Approximate location — NOT COLLECTED
- [ ] Precise location — NOT COLLECTED

### Personal Info
- [ ] Name — NOT COLLECTED
- [ ] Email address — NOT COLLECTED
- [ ] Personal identifiers — NOT COLLECTED

### Financial Info
- [ ] Purchase history — NOT COLLECTED (handled by Google Play)
- [ ] Credit card info — NOT COLLECTED

### Photos and Videos
- [x] Photos — **COLLECTED**
  - **Purpose:** App functionality (facial analysis)
  - **Is data processed ephemerally?** YES — Photos are analyzed on-device and not stored permanently unless saved to history
  - **Is this data required or optional?** Required for core functionality
  - **Is data shared with third parties?** NO
  - **Is data transferred off device?** NO

### Health and Fitness
- [ ] Health info — NOT COLLECTED
- [ ] Fitness info — NOT COLLECTED

### App Activity
- [ ] App interactions — NOT COLLECTED
- [ ] In-app search history — NOT COLLECTED

### Device or Other IDs
- [ ] Device identifiers — NOT COLLECTED

---

## Security Practices

### Is data encrypted in transit?
N/A — No data leaves the device

### Can users request data deletion?
Yes — In-app delete all data option

### Is data collected from children compliant with COPPA?
App is not targeted at children under 13

---

## Summary for Google Play Console

When filling out the Data Safety section in Google Play Console:
1. Select "My app does not collect or share any user data types"
2. Exception: Photos — declare as "collected for app functionality, processed on-device only, not shared"
3. Confirm encryption and deletion practices
4. Link privacy policy: https://androgenic.app/privacy
