WaveTune - Android Development Workflow

This document contains the daily development workflow for the WaveTune project. It is focused only on Android development using Expo Dev Client.

⸻

Prerequisites

Before starting development, ensure that:

* Android Studio is installed.
* Android SDK is configured.
* USB Debugging is enabled on your Android device.
* The device has already authorized your computer.
* The WaveTune app has been installed at least once using expo run:android.

⸻

Daily Development Workflow

⸻

1. Connect your Android device

Connect your phone using a USB cable.

or 
for wireless use this

adb connect 192.168.1.11:45587
⸻

2. Verify the device connection

adb devices

Expected output:

List of devices attached
R9XXXXXXXXXXXX    device

If the device shows:

unauthorized

Unlock your phone and accept the USB Debugging permission.

⸻

3. If the device is not detected

Restart the ADB server.

adb kill-server
adb start-server
adb devices

⸻

4. Start the Metro Bundler

npx expo start --dev-client

Keep this terminal running throughout development.

⸻

5. Open WaveTune

If the application is already installed, simply launch WaveTune from your phone.

Fast Refresh will automatically update changes.

⸻

When to Rebuild the Application

A rebuild is NOT required for:

* UI changes
* NativeWind styling
* Zustand store changes
* TypeScript changes
* JavaScript changes
* React component changes

Simply save the file and Fast Refresh will update the app.

⸻

A rebuild IS REQUIRED after:

* Installing a new native package
* Removing a native package
* Updating Expo SDK
* Editing app.json or app.config.ts
* Changing Android configuration
* Running expo prebuild --clean

Rebuild using:

npx expo run:android

⸻

After Installing or Removing Dependencies

Install packages:

npm install

Regenerate native Android files:

npx expo prebuild --clean

Build and install the application:

npx expo run:android

⸻

Cleaning Metro Cache

If Metro behaves unexpectedly:

npx expo start --dev-client --clear

⸻

Cleaning Gradle

If Gradle cache becomes corrupted:

cd android
./gradlew clean
cd ..
npx expo run:android

⸻

Complete Clean Installation

If dependencies become corrupted:

rm -rf node_modules
rm -f package-lock.json
npm cache clean --force
npm install
npx expo prebuild --clean
npx expo run:android

⸻

Useful Commands

Check connected device

adb devices

⸻

Restart ADB

adb kill-server
adb start-server
adb devices

⸻

Start Metro

npx expo start --dev-client

⸻

Build and install Android application

npx expo run:android

⸻

Clean Metro cache

npx expo start --dev-client --clear

⸻

Clean Gradle

cd android
./gradlew clean
cd ..
npx expo run:android

⸻

Regenerate native Android project

npx expo prebuild --clean

⸻

Recommended Daily Workflow

Open Terminal
↓
cd ~/Other/WaveTune
↓
Connect Android Device
↓
adb devices
↓
npx expo start --dev-client
↓
Open WaveTune on the device
↓
Start Developing 🚀

⸻

Workflow After Native Changes

Install Package
↓
npm install
↓
npx expo prebuild --clean
↓
npx expo run:android
↓
Continue Development