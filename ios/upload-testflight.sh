#!/bin/bash
# RVC → TestFlight in one go: archive, sign (automatic) and upload to App Store Connect.
# Run on a Mac with Xcode, logged in (Xcode → Settings → Accounts) to team RJM9YLY3Z4.
# Usage:  bash upload-testflight.sh [build-number]     (default: current time, always unique)
set -euo pipefail
cd "$(dirname "$0")/App"
TEAM=RJM9YLY3Z4
BUILD="${1:-$(date +%Y%m%d%H%M)}"
OUT=build
rm -rf "$OUT" && mkdir -p "$OUT"

cat > "$OUT/ExportOptions.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>upload</string>
  <key>teamID</key><string>$TEAM</string>
  <key>signingStyle</key><string>automatic</string>
  <key>manageAppVersionAndBuildNumber</key><false/>
</dict></plist>
PLIST

echo "▸ Archiving RVC (build $BUILD)…"
xcodebuild -project App.xcodeproj -scheme App -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$OUT/App.xcarchive" \
  -allowProvisioningUpdates DEVELOPMENT_TEAM=$TEAM CODE_SIGN_STYLE=Automatic \
  CURRENT_PROJECT_VERSION="$BUILD" archive -quiet

echo "▸ Uploading to App Store Connect…"
xcodebuild -exportArchive -archivePath "$OUT/App.xcarchive" \
  -exportOptionsPlist "$OUT/ExportOptions.plist" -exportPath "$OUT/export" \
  -allowProvisioningUpdates -quiet

echo "✅ Uploaded build $BUILD. It shows up under TestFlight in App Store Connect in ~10–30 min."
