#!/bin/bash
set -e

G='\033[0;32m' Y='\033[1;33m' R='\033[0;31m' B='\033[0;34m' N='\033[0m'

echo ""
echo -e "${B}  Androgenic — iOS Deploy${N}"
echo ""

# ── Auto-install EAS if missing ──
command -v eas &>/dev/null || { echo -e "${Y}Installing EAS CLI...${N}"; npm install -g eas-cli@latest; }

# ── Auto-login ──
eas whoami &>/dev/null || { echo -e "${Y}Login required:${N}"; eas login; }
echo -e "${G}Logged in as:${N} $(eas whoami)"

# ── Credentials (hardcoded — nothing to enter) ──
export APPLE_ID="adeelahmedrahman@gmail.com"
export APPLE_TEAM_ID="GNUU5L66BM"

# ── Version ──
VERSION=$(node -p "require('./app.json').expo.version")
echo -e "${G}Version:${N} $VERSION  ${G}Bundle:${N} com.androgenic.faceanalysis"
echo ""

# ── Mode ──
case "${1:-deploy}" in
  build)
    echo -e "${B}Building iOS (no submit)...${N}"
    eas build --platform ios --profile production --non-interactive
    ;;
  submit)
    echo -e "${B}Submitting latest build...${N}"
    eas submit --platform ios --profile production --non-interactive
    ;;
  update)
    echo -e "${B}Pushing OTA update...${N}"
    eas update --branch production --platform ios --message "v$VERSION update"
    echo -e "${G}OTA update pushed.${N}"
    exit 0
    ;;
  *)
    echo -e "${B}Building + submitting to App Store Connect...${N}"
    eas build --platform ios --profile production --auto-submit --non-interactive
    ;;
esac

echo ""
echo -e "${G}Done.${N} Check https://appstoreconnect.apple.com for your build."
echo ""
echo "  ./scripts/deploy-ios.sh          # Build + submit"
echo "  ./scripts/deploy-ios.sh build    # Build only"
echo "  ./scripts/deploy-ios.sh submit   # Submit existing build"
echo "  ./scripts/deploy-ios.sh update   # OTA update (JS only)"
echo ""
