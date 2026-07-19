WaveTune - Development Setup

This guide explains how to set up and run the WaveTune project locally.

Prerequisites

Before getting started, make sure the following are installed:

* Node.js (LTS)
* npm
* Git
* Android Studio
* Android SDK
* Java JDK 17 or later
* An Android Emulator or a physical Android device with USB debugging enabled

Verify your installation:

node -v
npm -v
java -version
adb --version

⸻

Clone the Repository

git clone <repository-url>
cd WaveTune

⸻

Install Dependencies

npm install

⸻

Install Expo Dependencies

If dependencies have changed or you’ve pulled new updates, run:

npx expo install

⸻

Run the Application

Start the Expo development server:

npx expo start

Run the app on Android:

npx expo run:android

Alternatively, launch the development server directly on a connected Android device or emulator:

npx expo start --android

⸻

Build the App

Preview Build

eas build --profile preview --platform android

Production Build

eas build --profile production --platform android

⸻

Useful Commands

Check dependency compatibility

npx expo install --check

Diagnose project issues

npx expo-doctor

Clear the Metro cache

npx expo start --clear

Clean Android build

cd android
./gradlew clean

⸻

Project Structure

WaveTune
├── app/
├── assets/
├── components/
├── helpers/
├── hooks/
├── modules/
├── providers/
├── services/
├── store/
├── types/
├── utils/
├── global.css
├── package.json
├── tsconfig.json
├── metro.config.js
├── babel.config.js
└── tailwind.config.js

⸻

Tech Stack

* React Native
* Expo
* Expo Router
* TypeScript
* NativeWind
* Zustand
* Expo Audio

⸻

Notes

* WaveTune is currently an Android-only application.
* Android permissions are required to scan and play local audio files.
* If native dependencies are added or updated, regenerate the native project when necessary:

npx expo prebuild

* After updating dependencies, it’s recommended to run:

npx expo install --check