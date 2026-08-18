# Quiz Libre V6 Signed Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `quiz-libre-1.1.0-release.apk`, permanently signed for future in-place Android updates, while keeping the validated V5 game intact and subtly moving the Android hero upward.

**Architecture:** Keep the existing Kotlin/WebView shell and shared web game. GitHub Actions produces an unsigned release APK from branch `v6-signed-release`; signing happens outside the public repository with one permanent JKS key, then the final APK is verified with Android `apksigner`. Android-only visual overrides are generated during asset sync so the PWA/web layout is not changed.

**Tech Stack:** Kotlin, Android Gradle Plugin, Gradle 8.13, Android API 36, AndroidX WebKit, Node.js asset-sync tests, Java `keytool`, Android SDK `zipalign`/`apksigner`, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-08-18-quiz-libre-v6-signed-release-design.md`

## Global Constraints

- `applicationId = "fr.electronlibre.quizlibre"` must never change.
- `compileSdk = 36`, `targetSdk = 36`, `minSdk = 24`.
- V6 uses `versionCode = 2`, `versionName = "1.1.0"`.
- No Internet permission.
- 500 questions and all current solo modes remain unchanged.
- The permanent signing key and passwords never enter the public GitHub repository.
- The final APK is named `quiz-libre-1.1.0-release.apk`.
- The Android hero moves upward by about 40 px without changing the PWA layout.
- V5 debug → V6 release requires one final uninstall; V6+ updates use the same certificate and strictly increasing `versionCode` values.

---

### Task 1: Lock V6 versioning and release build contract

**Files:**
- Modify: `android/app/build.gradle.kts`
- Create: `tests/android-v6.test.js`

**Interfaces:**
- Consumes: existing Android project configuration.
- Produces: release metadata `versionCode=2`, `versionName=1.1.0`, and static checks used by CI.

- [ ] **Step 1: Write the failing V6 static test**

Create `tests/android-v6.test.js` that reads `android/app/build.gradle.kts`, `AndroidManifest.xml`, `scripts/sync-android-assets.js`, and the release workflow. It must assert:

```js
assert(gradle.includes('applicationId = "fr.electronlibre.quizlibre"'));
assert(gradle.includes('versionCode = 2'));
assert(gradle.includes('versionName = "1.1.0"'));
assert(gradle.includes('compileSdk = 36'));
assert(gradle.includes('targetSdk = 36'));
assert(gradle.includes('minSdk = 24'));
assert(!manifest.includes('android.permission.INTERNET'));
```

It must also require an Android-only hero override containing `padding-top` equal to 245–250 px under the current max-width 480 px mobile rule, and require the release workflow to run `assembleRelease` and upload `app-release-unsigned.apk`.

- [ ] **Step 2: Run test and verify RED**

Run:

```bash
node tests/android-v6.test.js
```

Expected: FAIL because V6 version metadata, Android-only hero override, and release workflow do not yet exist.

- [ ] **Step 3: Update version metadata**

Change only:

```kotlin
versionCode = 2
versionName = "1.1.0"
```

Keep package and API levels unchanged.

- [ ] **Step 4: Re-run test**

Expected: still FAIL only on Android hero/release-workflow assertions.

- [ ] **Step 5: Commit**

```bash
git add android/app/build.gradle.kts tests/android-v6.test.js
git commit -m "test: lock V6 Android release contract"
```

### Task 2: Add Android-only hero position override

**Files:**
- Modify: `scripts/sync-android-assets.js`
- Test: `tests/android-v6.test.js`

**Interfaces:**
- Consumes: root `v4.css` and copied Android web assets.
- Produces: Android `assets/www/v4.css` with a mobile-only override; root/PWA `v4.css` remains byte-for-byte unchanged.

- [ ] **Step 1: Extend the failing test**

Require `scripts/sync-android-assets.js` to append this exact Android-only CSS to the copied `v4.css`:

```css
@media(max-width:480px){.cleanHero{padding-top:245px}}
```

- [ ] **Step 2: Verify RED**

Run `node tests/android-v6.test.js` and confirm failure references the missing Android-only hero override.

- [ ] **Step 3: Implement the sync override**

In the `v4.css` copy branch of `sync-android-assets.js`, read the source text and append:

```js
css += '\n/* Android shell V6: lift hero content without changing PWA */\n@media(max-width:480px){.cleanHero{padding-top:245px}}\n';
```

Write only to `android/app/src/main/assets/www/v4.css`.

- [ ] **Step 4: Sync and verify GREEN for visual contract**

Run:

```bash
node scripts/sync-android-assets.js
node tests/android-v6.test.js
```

Expected: V6 test now fails only if release workflow is not yet present.

- [ ] **Step 5: Commit**

```bash
git add scripts/sync-android-assets.js tests/android-v6.test.js
git commit -m "feat: lift Android hero content for V6"
```

### Task 3: Build unsigned release APK in GitHub Actions

**Files:**
- Create: `.github/workflows/android-release.yml`
- Test: `tests/android-v6.test.js`

**Interfaces:**
- Consumes: Android project and asset sync.
- Produces: GitHub Actions artifact `quiz-libre-1.1.0-release-unsigned` containing `app-release-unsigned.apk`.

- [ ] **Step 1: Keep release workflow assertion RED**

Require the workflow to contain:

```text
node scripts/sync-android-assets.js
node tests/android-v5.test.js
node tests/android-v6.test.js
gradle -p android :app:assembleRelease --stacktrace
app-release-unsigned.apk
```

- [ ] **Step 2: Create workflow**

Use Java 17 and Gradle 8.13, trigger on pushes to `v6-signed-release` plus `workflow_dispatch`, run both V5 and V6 static tests, execute `assembleRelease`, and upload:

```text
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

with retention 14 days.

- [ ] **Step 3: Run static tests locally**

Run:

```bash
node scripts/sync-android-assets.js
node tests/android-v5.test.js
node tests/android-v6.test.js
```

Expected: both PASS.

- [ ] **Step 4: Commit and wait for CI**

```bash
git add .github/workflows/android-release.yml tests/android-v6.test.js
git commit -m "ci: build unsigned V6 Android release"
```

Expected CI: asset sync PASS, V5/V6 static tests PASS, `assembleRelease` PASS, artifact upload PASS.

### Task 4: Create and preserve permanent signing identity

**Files outside GitHub:**
- Create: `/mnt/data/quiz-libre-signing/quiz-libre-release.jks`
- Create: `/mnt/data/quiz-libre-signing/signing-info.txt`
- Create: `/mnt/data/quiz-libre-signing/quiz-libre-release-cert.pem`

**Interfaces:**
- Consumes: Java `keytool` and secure random passwords generated in-session.
- Produces: permanent signing JKS, public certificate, alias, certificate SHA-256 fingerprint.

- [ ] **Step 1: Generate random credentials**

Use cryptographically random values for the keystore/key password. Never echo them into GitHub or source files.

- [ ] **Step 2: Generate the JKS**

Run `keytool -genkeypair` with:

```text
alias: quizlibre
algorithm: RSA
keysize: 4096
validity: 10000 days
DN CN: Quiz Libre
```

- [ ] **Step 3: Export certificate and fingerprint**

Use `keytool -exportcert -rfc` to create the PEM certificate and `keytool -list -v` to record the SHA-256 fingerprint.

- [ ] **Step 4: Verify no key material exists in repository**

Search branch tree/content for `.jks`, `.keystore`, passwords, or the generated secret values. Expected: zero matches.

- [ ] **Step 5: Save signing backup privately**

Upload the JKS, certificate, and signing-info file to the private file library under `Quiz Libre/Signing/`. The signing-info file records alias, passwords, certificate SHA-256 fingerprint, app ID, and the rule to reuse the same key for all future V6+ releases.

### Task 5: Sign and cryptographically verify V6 APK

**Files:**
- Input: unsigned CI artifact `app-release-unsigned.apk`
- Output: `/mnt/data/quiz-libre-1.1.0-release.apk`

**Interfaces:**
- Consumes: unsigned release APK and permanent JKS.
- Produces: final signed release APK.

- [ ] **Step 1: Download CI artifact and extract APK**

Confirm artifact belongs to current `v6-signed-release` head commit and successful workflow run.

- [ ] **Step 2: Align APK before signing**

Run Android `zipalign -p -f 4` to create an aligned intermediate APK.

- [ ] **Step 3: Sign with permanent key**

Run Android `apksigner sign --ks quiz-libre-release.jks --ks-key-alias quizlibre` on the aligned APK, writing `quiz-libre-1.1.0-release.apk`.

- [ ] **Step 4: Verify signature**

Run:

```bash
apksigner verify --verbose --print-certs quiz-libre-1.1.0-release.apk
```

Expected: verification succeeds and signer certificate SHA-256 equals the fingerprint stored in `signing-info.txt`.

- [ ] **Step 5: Inspect bundle**

Open APK as ZIP and confirm `assets/www/` contains all 10 question packs plus `warehouse-neon.jpg`; scan text entries for `vercel.app` and `cdn.jsdelivr.net`, expecting zero hits.

### Task 6: Prove future update compatibility with V6.1 probe

**Files outside release branch delivery:**
- Build metadata probe: same app ID/signing key, temporary `versionCode = 3`, `versionName = "1.1.1-test"`.

**Interfaces:**
- Consumes: V6 source and permanent signing key.
- Produces: an optional signed compatibility probe APK solely to test update installation on the phone.

- [ ] **Step 1: Create probe from same source**

Change only `versionCode` and `versionName` on a temporary probe branch or transient build copy.

- [ ] **Step 2: Build and sign with the same JKS**

Use the exact same certificate as V6.

- [ ] **Step 3: Verify certificate equality**

Run `apksigner verify --print-certs` on V6 and probe; SHA-256 fingerprints must match exactly.

- [ ] **Step 4: Deliver only after V6 phone validation**

Install V6 first, create some stats, then install probe over V6 without uninstalling. Confirm Android offers an update and local stats remain.

### Task 7: Final verification and handoff

- [ ] **Step 1: Re-run source/static validation**

```bash
node scripts/sync-android-assets.js
node tests/android-v5.test.js
node tests/android-v6.test.js
```

Expected: PASS, 0 failures.

- [ ] **Step 2: Verify release workflow result**

Confirm latest V6 workflow conclusion is `success` and artifact is present.

- [ ] **Step 3: Verify signed APK one final time**

Run `apksigner verify --verbose --print-certs` on the exact delivered APK and compare certificate SHA-256 with the private signing record.

- [ ] **Step 4: Handoff**

Provide `quiz-libre-1.1.0-release.apk` plus a separate backup of the signing bundle. Explicitly instruct that V5 debug must be uninstalled once before installing V6; future V6+ updates must not be signed with any other key.
