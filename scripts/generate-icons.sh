#!/bin/bash
# Generate all required App Store icon sizes from the base icon
# Requires: ImageMagick (brew install imagemagick)
# Usage: ./scripts/generate-icons.sh

set -e

ICON_SOURCE="assets/icon.png"
OUTPUT_DIR="assets/ios-icons"

mkdir -p "$OUTPUT_DIR"

echo "Generating iOS app icons from $ICON_SOURCE..."

# Required iOS icon sizes (as of 2026)
# App Store: 1024x1024 (required)
convert "$ICON_SOURCE" -resize 1024x1024 "$OUTPUT_DIR/icon-1024.png"

# iPhone app icons
convert "$ICON_SOURCE" -resize 180x180 "$OUTPUT_DIR/icon-60@3x.png"
convert "$ICON_SOURCE" -resize 120x120 "$OUTPUT_DIR/icon-60@2x.png"

# iPhone Spotlight
convert "$ICON_SOURCE" -resize 120x120 "$OUTPUT_DIR/icon-40@3x.png"
convert "$ICON_SOURCE" -resize 80x80 "$OUTPUT_DIR/icon-40@2x.png"

# iPhone Settings
convert "$ICON_SOURCE" -resize 87x87 "$OUTPUT_DIR/icon-29@3x.png"
convert "$ICON_SOURCE" -resize 58x58 "$OUTPUT_DIR/icon-29@2x.png"

# iPhone Notification
convert "$ICON_SOURCE" -resize 60x60 "$OUTPUT_DIR/icon-20@3x.png"
convert "$ICON_SOURCE" -resize 40x40 "$OUTPUT_DIR/icon-20@2x.png"

# iPad app icons
convert "$ICON_SOURCE" -resize 167x167 "$OUTPUT_DIR/icon-83.5@2x.png"
convert "$ICON_SOURCE" -resize 152x152 "$OUTPUT_DIR/icon-76@2x.png"

echo "Done! Icons generated in $OUTPUT_DIR/"
echo ""
echo "Note: EAS Build handles icon generation automatically from the"
echo "1024x1024 icon specified in app.json. These are only needed if"
echo "you're building with bare workflow."
