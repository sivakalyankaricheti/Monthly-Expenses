# Part Time Earnings — Store Release Guide

## Prepared application

- App name: `Part Time Earnings`
- Provisional application/bundle ID: `com.parttimeearnings.app`
- Version: `1.0` (`versionCode` / build number `1`)
- Android project: `android/`
- iOS project: `ios/`
- Production service: `https://part-time-earnings.onrender.com/tracker`
- Privacy policy: `https://part-time-earnings.onrender.com/privacy`
- Account deletion information: `https://part-time-earnings.onrender.com/account-deletion`

Do not create the Play Console or App Store Connect app record until the bundle ID has been confirmed. After first publication, treat it as permanent.

## Syncing web/native changes

```powershell
pnpm install
.\node_modules\.bin\cap.CMD sync
```

## Google Play release

1. Install Android Studio (or Android SDK platform 36 and build-tools).
2. Open `android/` in Android Studio.
3. Create and securely back up an upload keystore. Never commit it to Git.
4. Configure release signing in Android Studio, then generate a signed Android App Bundle (`.aab`).
5. Create a Google Play Console account and complete identity/contact verification.
6. Create the app using package name `com.parttimeearnings.app`.
7. Complete App access with a dedicated active reviewer login.
8. Complete Data safety using the data inventory below.
9. Add the privacy-policy and account-deletion URLs above.
10. Upload phone screenshots, the store icon, feature graphic, description, category, content rating, and signed `.aab`.
11. Complete the required testing track for the account, then submit production release for review.

## Apple App Store release

Final iOS signing and upload require macOS with Xcode 16 or later.

1. Enroll in the Apple Developer Program and accept current agreements.
2. Register bundle ID `com.parttimeearnings.app` and create the app record in App Store Connect.
3. On a Mac, open `ios/App/App.xcodeproj` in Xcode.
4. Select the developer Team, enable automatic signing, and confirm version/build numbers.
5. Test on a physical iPhone and upload an Archive to App Store Connect.
6. Add the privacy-policy URL, App Privacy answers, screenshots, description, support URL, age rating, category, and review login.
7. Test with TestFlight and submit the selected build for App Review.

## Data inventory for store disclosures

The app stores data supplied by the user: name, email, optional phone, city and address; shifts, employers/stores, working times, delivery counts, notes, earnings, expenses, payments and settings. It also stores authentication sessions and password-reset records. Data is used for app functionality, account management, synchronization, backup/restore and requested password-reset emails. It is not sold and is not used for third-party advertising or tracking.

Third-party processors: Render (application/database hosting) and Resend (requested password-reset email delivery).

## Required human-owned items

- Confirm final bundle ID and developer/store display name.
- Google Play developer account and verified identity/contact details.
- Apple Developer account, App Store Connect access, Mac and Xcode.
- Android upload keystore and its private passwords.
- Store descriptions, support contact, countries, pricing and category choices.
- Dedicated reviewer login that remains active throughout review.
- Final screenshots from Android and iPhone devices.
