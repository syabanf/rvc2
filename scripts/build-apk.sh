#!/usr/bin/env bash
# Debug APK of the app: static export → Capacitor sync → Gradle.
# Needs JDK 21 (~/.local/jdk/jdk-21*) and the Android SDK (~/Android/Sdk).
set -euo pipefail
cd "$(dirname "$0")/.."
export JAVA_HOME="${JAVA_HOME:-$(ls -d "$HOME"/.local/jdk/jdk-21* | head -1)}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export PATH="$JAVA_HOME/bin:$PATH"
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
npm run build
npx cap sync android
(cd android && ./gradlew assembleDebug --no-daemon -q)
cp android/app/build/outputs/apk/debug/app-debug.apk rvc-debug.apk
echo "APK: $(pwd)/rvc-debug.apk"
