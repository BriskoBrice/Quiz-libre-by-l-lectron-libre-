# Quiz Libre V5 — APK Android autonome/offline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produire un APK Android debug autonome de Quiz Libre, jouable sans Internet dès le premier lancement, en réutilisant exactement le moteur web/PWA et les 500 questions validées.

**Architecture:** Ajouter un projet Android isolé dans `android/` avec une `MainActivity` Kotlin qui sert les assets web embarqués via `WebViewAssetLoader`. Un script de synchronisation recopie la webapp validée dans `android/app/src/main/assets/www/` et neutralise uniquement l’enregistrement du service worker dans la copie Android. Un workflow GitHub Actions construit l’APK debug et publie l’APK comme artefact.

**Tech Stack:** Kotlin, Android Gradle Plugin, Gradle Kotlin DSL, AndroidX WebKit, AndroidX Core SplashScreen, WebView, GitHub Actions.

## Global Constraints

- Application ID : `fr.electronlibre.quizlibre`.
- Version initiale : `1.0.0`, `versionCode = 1`.
- `compileSdk = 36`, `targetSdk = 36`, `minSdk = 24`.
- Orientation portrait.
- Aucune permission Internet requise pour le fonctionnement normal.
- Les 500 questions, QCM, réponse libre, mixte, stats et anti-répétition doivent rester inchangés.
- Les données Android restent locales à l’installation.
- Le multijoueur reste hors périmètre de V5.0.

---

### Task 1: Tests de structure Android et synchronisation des assets

**Files:**
- Create: `tests/android-v5.test.js`
- Create: `scripts/sync-android-assets.js`
- Create/Generate: `android/app/src/main/assets/www/**`

**Interfaces:**
- Consumes: fichiers web racine (`index.html`, CSS, JS, `assets/warehouse-neon.jpg`, `questions/*.js`).
- Produces: bundle Android dans `android/app/src/main/assets/www/`.

- [ ] **Step 1: Write the failing test**

Créer `tests/android-v5.test.js` vérifiant : présence du projet Android, présence de tous les assets web nécessaires, absence d’URL Vercel/CDN dans la copie Android, absence de `serviceWorker.register` dans l’`index.html` Android, présence de `QUESTIONS.length===500` dans le moteur/self-test et présence des 10 packs de questions.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/android-v5.test.js`
Expected: FAIL car `android/` et le script de synchronisation n’existent pas encore.

- [ ] **Step 3: Write minimal implementation**

Créer `scripts/sync-android-assets.js` qui :
1. supprime/recrée `android/app/src/main/assets/www/` ;
2. copie `index.html`, `styles.css`, `v3.css`, `v4.css`, `v4-1.css`, `app.js`, `answer-utils.js`, `assets/warehouse-neon.jpg`, `questions/*.js` ;
3. retire uniquement le bloc d’enregistrement `navigator.serviceWorker.register(...)` de la copie Android de `index.html` ;
4. échoue si un fichier requis manque.

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/sync-android-assets.js && node tests/android-v5.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add scripts/sync-android-assets.js tests/android-v5.test.js android/app/src/main/assets/www && git commit -m "feat: sync Quiz Libre assets for Android"`

### Task 2: Coque Android Kotlin/WebView

**Files:**
- Create: `android/settings.gradle.kts`
- Create: `android/build.gradle.kts`
- Create: `android/gradle.properties`
- Create: `android/app/build.gradle.kts`
- Create: `android/app/src/main/AndroidManifest.xml`
- Create: `android/app/src/main/java/fr/electronlibre/quizlibre/MainActivity.kt`
- Create: `android/app/src/main/res/values/strings.xml`
- Create: `android/app/src/main/res/values/themes.xml`
- Create: `android/app/src/main/res/drawable/ic_launcher_foreground.xml`
- Create: `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
- Create: `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`

**Interfaces:**
- Consumes: `assets/www/index.html` produit par Task 1.
- Produces: activité Android qui charge `https://appassets.androidplatform.net/assets/www/index.html`.

- [ ] **Step 1: Extend the failing test**

Ajouter à `tests/android-v5.test.js` des assertions sur `applicationId`, SDK 36/36/24, absence de permission INTERNET, orientation portrait, `WebViewAssetLoader`, JavaScript + DOM storage activés, accès fichier désactivé et URL `appassets.androidplatform.net`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/android-v5.test.js`
Expected: FAIL sur fichiers/config Android absents.

- [ ] **Step 3: Write minimal implementation**

Créer le projet Android Kotlin DSL. `MainActivity` doit :
- initialiser `WebViewAssetLoader` avec `/assets/` + `AssetsPathHandler` ;
- intercepter les requêtes via `WebViewClientCompat.shouldInterceptRequest` ;
- activer `javaScriptEnabled` et `domStorageEnabled` ;
- désactiver `allowFileAccess`, `allowContentAccess`, `allowFileAccessFromFileURLs`, `allowUniversalAccessFromFileURLs` ;
- charger l’URL locale HTTPS ;
- utiliser `OnBackPressedDispatcher` pour revenir à l’accueil du quiz via `window.showScreen('home')` si un écran interne est actif, sinon fermer l’activité.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/android-v5.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add android tests/android-v5.test.js && git commit -m "feat: add offline Android WebView shell"`

### Task 3: Icône, splash et expérience plein écran

**Files:**
- Modify: `android/app/src/main/res/values/themes.xml`
- Create: `android/app/src/main/res/values/colors.xml`
- Create: `android/app/src/main/res/drawable/splash_icon.xml`
- Modify: `android/app/src/main/AndroidManifest.xml`
- Modify: `android/app/src/main/java/fr/electronlibre/quizlibre/MainActivity.kt`

**Interfaces:**
- Consumes: identité néon/éclair de Quiz Libre.
- Produces: lancement visuellement cohérent en portrait et edge-to-edge.

- [ ] **Step 1: Extend the failing test**

Vérifier thème de splash, couleur de fond sombre, icône de splash et appel `installSplashScreen()`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/android-v5.test.js`
Expected: FAIL sur les ressources de splash.

- [ ] **Step 3: Write minimal implementation**

Ajouter Core SplashScreen, thème sombre `#02040B`, icône éclair vectorielle, edge-to-edge et couleur de barre système cohérente.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/android-v5.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add android tests/android-v5.test.js && git commit -m "feat: add Quiz Libre Android splash and icon"`

### Task 4: Build automatisé GitHub Actions et artefact APK

**Files:**
- Create: `.github/workflows/android-debug.yml`
- Modify: `.gitignore` si nécessaire uniquement pour les outputs Android.

**Interfaces:**
- Consumes: projet `android/` et script `scripts/sync-android-assets.js`.
- Produces: artefact `quiz-libre-1.0.0-debug.apk`.

- [ ] **Step 1: Extend the failing test**

Vérifier que le workflow exécute `node scripts/sync-android-assets.js`, installe Java 17, configure Gradle, exécute `gradle -p android :app:assembleDebug`, renomme l’APK et l’upload comme artefact.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/android-v5.test.js`
Expected: FAIL car workflow absent.

- [ ] **Step 3: Write minimal implementation**

Créer `.github/workflows/android-debug.yml` déclenché sur push de `v5-android-apk-offline` et `workflow_dispatch`, avec Java 17, Gradle installé/configuré, synchronisation assets, tests Node, build debug et upload de l’APK.

- [ ] **Step 4: Run static test to verify it passes**

Run: `node scripts/sync-android-assets.js && node tests/android-v5.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

`git add .github/workflows/android-debug.yml .gitignore && git commit -m "ci: build Quiz Libre Android debug APK"`

### Task 5: Vérification réelle du build et livraison

**Files:**
- No source changes unless the build exposes a real defect.

**Interfaces:**
- Consumes: GitHub Actions run from Task 4.
- Produces: APK debug téléchargeable et rapport de vérification.

- [ ] **Step 1: Inspect workflow run**

Vérifier que le workflow est `success`; en cas d’échec, lire le job/log, corriger la cause racine et relancer.

- [ ] **Step 2: Fetch artifact**

Télécharger l’artefact GitHub Actions, extraire `quiz-libre-1.0.0-debug.apk` et confirmer sa présence/taille non nulle.

- [ ] **Step 3: Inspect APK**

Vérifier que l’archive APK contient `assets/www/index.html`, `assets/www/questions/` et `assets/www/assets/warehouse-neon.jpg`.

- [ ] **Step 4: Deliver device test**

Fournir l’APK au testeur Android avec le protocole : installation, mode avion avant premier lancement, QCM, libre, mixte, fermeture/réouverture, stats persistantes, bouton Retour.

- [ ] **Step 5: Keep branch isolated**

Ne pas fusionner `v5-android-apk-offline` dans `main` avant validation sur appareil réel.
