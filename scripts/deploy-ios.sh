#!/bin/bash
set -e

# ============================================================
#  Androgenic — iOS Deployment Script
#  Run: ./scripts/deploy-ios.sh
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🚀 Androgenic iOS Deploy Script        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# ---------- Pre-flight checks ----------
echo -e "${YELLOW}[1/6] Pre-flight checks...${NC}"

if ! command -v eas &> /dev/null; then
    echo -e "${RED}✗ EAS CLI not found. Installing...${NC}"
    npm install -g eas-cli@latest
fi
echo -e "${GREEN}✓ EAS CLI found: $(eas --version)${NC}"

if ! command -v expo &> /dev/null; then
    echo -e "${RED}✗ Expo CLI not found. Installing...${NC}"
    npm install -g expo-cli
fi
echo -e "${GREEN}✓ Expo CLI available${NC}"

# Check login
if ! eas whoami &> /dev/null; then
    echo -e "${YELLOW}→ Not logged in to EAS. Logging in...${NC}"
    eas login
fi
echo -e "${GREEN}✓ Logged in as: $(eas whoami)${NC}"

# ---------- Environment variables ----------
echo ""
echo -e "${YELLOW}[2/6] Checking Apple credentials...${NC}"

if [ -z "$APPLE_ID" ]; then
    echo -e "${YELLOW}→ APPLE_ID not set.${NC}"
    read -p "  Enter your Apple ID (email): " APPLE_ID
    export APPLE_ID
fi
echo -e "${GREEN}✓ Apple ID: $APPLE_ID${NC}"

if [ -z "$ASC_APP_ID" ]; then
    echo -e "${YELLOW}→ ASC_APP_ID not set.${NC}"
    echo "  Find it at: https://appstoreconnect.apple.com → Your App → General → App Information"
    read -p "  Enter your App Store Connect App ID: " ASC_APP_ID
    export ASC_APP_ID
fi
echo -e "${GREEN}✓ ASC App ID: $ASC_APP_ID${NC}"

if [ -z "$APPLE_TEAM_ID" ]; then
    echo -e "${YELLOW}→ APPLE_TEAM_ID not set.${NC}"
    echo "  Find it at: https://developer.apple.com/account → Membership Details"
    read -p "  Enter your Apple Team ID: " APPLE_TEAM_ID
    export APPLE_TEAM_ID
fi
echo -e "${GREEN}✓ Apple Team ID: $APPLE_TEAM_ID${NC}"

# ---------- Install deps ----------
echo ""
echo -e "${YELLOW}[3/6] Installing dependencies...${NC}"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Dependencies installed${NC}"

# ---------- Version info ----------
echo ""
echo -e "${YELLOW}[4/6] Build info${NC}"
VERSION=$(node -p "require('./app.json').expo.version")
BUILD=$(node -p "require('./app.json').expo.ios.buildNumber")
echo -e "  Version: ${GREEN}$VERSION${NC}"
echo -e "  Build:   ${GREEN}$BUILD${NC}"
echo -e "  Bundle:  ${GREEN}com.androgenic.faceanalysis${NC}"

# ---------- Build ----------
echo ""
echo -e "${YELLOW}[5/6] Building for iOS (production)...${NC}"
echo -e "  This will build on EAS servers and auto-submit to App Store Connect."
echo ""

MODE=${1:-"build-and-submit"}

if [ "$MODE" = "build-only" ]; then
    echo -e "${BLUE}→ Building only (no auto-submit)${NC}"
    eas build --platform ios --profile production --non-interactive
elif [ "$MODE" = "submit-only" ]; then
    echo -e "${BLUE}→ Submitting latest build...${NC}"
    eas submit --platform ios --profile production --non-interactive
elif [ "$MODE" = "update" ]; then
    echo -e "${BLUE}→ Pushing OTA update (no new build needed)...${NC}"
    eas update --branch production --platform ios --message "v$VERSION update"
    echo -e "${GREEN}✓ OTA update pushed!${NC}"
    exit 0
else
    echo -e "${BLUE}→ Building + auto-submitting to App Store Connect${NC}"
    eas build --platform ios --profile production --auto-submit --non-interactive
fi

# ---------- Done ----------
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ Deploy complete!                     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Go to https://appstoreconnect.apple.com"
echo "  2. Select 'Androgenic' → App Store tab"
echo "  3. The build will appear under 'TestFlight' first (processing takes ~15 min)"
echo "  4. Once processed, add it to your App Store version"
echo "  5. Fill in screenshots, description (see store/ios/metadata.json)"
echo "  6. Submit for review"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  ./scripts/deploy-ios.sh build-only    # Build without submitting"
echo "  ./scripts/deploy-ios.sh submit-only   # Submit an existing build"
echo "  ./scripts/deploy-ios.sh update        # Push OTA update (JS changes only)"
echo ""
