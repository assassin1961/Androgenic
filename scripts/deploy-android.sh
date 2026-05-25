#!/bin/bash
set -e

G='\033[0;32m' Y='\033[1;33m' B='\033[0;34m' N='\033[0m'

echo ""
echo -e "${B}  Androgenic — Android Deploy${N}"
echo ""

command -v eas &>/dev/null || { echo -e "${Y}Installing EAS CLI...${N}"; npm install -g eas-cli@latest; }
eas whoami &>/dev/null || { echo -e "${Y}Login required:${N}"; eas login; }
echo -e "${G}Logged in as:${N} $(eas whoami)"

VERSION=$(node -p "require('./app.json').expo.version")
echo -e "${G}Version:${N} $VERSION  ${G}Package:${N} com.androgenic.faceanalysis"
echo ""

case "${1:-deploy}" in
  build)
    echo -e "${B}Building Android (no submit)...${N}"
    eas build --platform android --profile production --non-interactive
    ;;
  submit)
    echo -e "${B}Submitting latest build to Play Store...${N}"
    eas submit --platform android --profile production --non-interactive
    ;;
  internal)
    echo -e "${B}Building for internal testing...${N}"
    eas build --platform android --profile preview:internal-testing --non-interactive
    ;;
  update)
    echo -e "${B}Pushing OTA update...${N}"
    eas update --branch production --platform android --message "v$VERSION update"
    echo -e "${G}OTA update pushed.${N}"
    exit 0
    ;;
  *)
    echo -e "${B}Building + submitting to Play Store...${N}"
    eas build --platform android --profile production --auto-submit --non-interactive
    ;;
esac

echo ""
echo -e "${G}Done.${N} Check https://play.google.com/console for your build."
echo ""
echo "  ./scripts/deploy-android.sh            # Build + submit"
echo "  ./scripts/deploy-android.sh build      # Build only"
echo "  ./scripts/deploy-android.sh submit     # Submit existing build"
echo "  ./scripts/deploy-android.sh internal   # Internal test build"
echo "  ./scripts/deploy-android.sh update     # OTA update (JS only)"
echo ""
