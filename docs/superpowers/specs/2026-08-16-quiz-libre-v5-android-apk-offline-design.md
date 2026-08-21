# Quiz Libre V5 — APK Android autonome/offline

Date : 2026-08-16

## Objectif

Transformer Quiz Libre V4.2 en une vraie application Android installable au format APK, sans réécrire le moteur du quiz et sans dépendre d’Internet pour jouer.

La version Android doit conserver exactement l’expérience validée :

- direction visuelle entrepôt néon ;
- 500 questions ;
- QCM, réponse libre et mode mixte ;
- catégories et difficultés existantes ;
- statistiques et anti-répétition stockés localement ;
- fonctionnement 100 % hors ligne dès le premier lancement.

Le multijoueur est explicitement hors périmètre de cette première version Android. Il fera l’objet d’une évolution séparée après stabilisation de l’APK solo.

## Approche retenue

Créer une petite coque Android native en Kotlin qui héberge le Quiz Libre existant dans une WebView.

Le contenu web n’est pas téléchargé depuis Vercel : les fichiers HTML, CSS, JavaScript, images et banques de questions sont copiés dans les assets de l’APK au moment du build.

Le chargement local passe par AndroidX `WebViewAssetLoader` et le domaine réservé `https://appassets.androidplatform.net/`, plutôt que par des URL `file://`.

Cette architecture permet de garder un seul moteur de jeu tout en obtenant une application Android autonome.

## Structure du dépôt

Le projet Android sera isolé dans un sous-dossier `android/` afin de ne pas perturber la PWA/webapp existante.

Structure cible :

```text
android/
  settings.gradle.kts
  build.gradle.kts
  gradle.properties
  app/
    build.gradle.kts
    src/main/
      AndroidManifest.xml
      java/fr/electronlibre/quizlibre/MainActivity.kt
      res/
        drawable/
        mipmap-*/
        values/
      assets/www/
        index.html
        styles.css
        v3.css
        v4.css
        v4-1.css
        app.js
        answer-utils.js
        assets/warehouse-neon.jpg
        questions/*.js
```

Les assets web sont une copie de la version validée du projet. Ils ne doivent pas être modifiés manuellement dans deux endroits sans contrôle : le plan d’implémentation doit prévoir une étape de synchronisation reproductible depuis la racine du projet vers `android/app/src/main/assets/www/`.

## Identité Android

- Nom : `Quiz Libre`
- Application ID : `fr.electronlibre.quizlibre`
- Version initiale : `1.0.0`
- `versionCode` initial : `1`
- Orientation : portrait
- Icône : identité éclair / Quiz Libre déjà utilisée par la PWA, adaptée aux mipmaps Android
- Splash screen : fond sombre de la DA avec l’icône Quiz Libre, via l’API Android SplashScreen/compat

## Configuration Android

- Kotlin
- Gradle Kotlin DSL
- `compileSdk = 36`
- `targetSdk = 36`
- `minSdk = 24`
- AndroidX WebKit pour `WebViewAssetLoader`
- AndroidX Core SplashScreen

Le choix API 36 aligne la compilation et la cible sur Android 16. Le `minSdk` 24 garde une compatibilité large sans ajouter de complexité inutile à cette application.

## WebView et sécurité

La WebView doit :

- activer JavaScript ;
- activer le DOM storage afin que le `localStorage` existant continue à stocker scores, progression et questions vues ;
- charger `https://appassets.androidplatform.net/assets/www/index.html` ;
- résoudre les sous-ressources avec `WebViewAssetLoader.AssetsPathHandler` ;
- désactiver l’accès `file://` et l’accès universel depuis les fichiers ;
- ne pas activer de mixed content permissif ;
- ne pas exposer de pont JavaScript natif inutile ;
- rester limitée aux ressources embarquées pour la V1 Android.

Aucune permission Internet n’est requise pour le fonctionnement normal de l’APK autonome.

## Service worker et PWA dans l’APK

L’APK n’a pas besoin du service worker PWA pour fonctionner hors ligne, puisque les fichiers sont déjà embarqués.

Pour éviter une couche de cache inutile dans la WebView Android, la copie destinée à `assets/www/` peut neutraliser l’enregistrement du service worker tout en laissant la version web/PWA racine inchangée.

Le moteur du quiz et les données ne changent pas.

## Navigation Android

Le bouton Retour Android doit suivre cet ordre :

1. si le quiz est dans un écran interne pouvant revenir à l’accueil, retourner à l’accueil du Quiz Libre ;
2. sinon, laisser Android fermer l’activité.

Le comportement doit éviter d’empiler artificiellement des pages WebView puisque Quiz Libre est une SPA légère.

## Données locales

Les clés `localStorage` existantes restent inchangées pour conserver le comportement du moteur :

- statistiques ;
- progression ;
- anti-répétition.

Les données sont propres à l’installation Android et ne sont pas synchronisées avec la PWA web.

Une désinstallation Android supprime naturellement ces données locales.

## Build et APK de test

Première cible : un APK `debug` installable directement sur le Xiaomi de test.

Le build doit produire un fichier clairement nommé, par exemple :

`quiz-libre-1.0.0-debug.apk`

Après validation fonctionnelle sur appareil réel, une étape séparée préparera une release signée stable. La clé de signature ne doit jamais être committée dans GitHub.

## Critères d’acceptation

L’APK de test est validé si :

1. il s’installe et se lance sur Android 16 ;
2. il affiche directement l’interface entrepôt néon ;
3. il fonctionne en mode avion dès le premier lancement ;
4. les 500 questions sont disponibles ;
5. QCM, réponse libre et mixte fonctionnent ;
6. les statistiques et l’anti-répétition persistent après fermeture/réouverture ;
7. aucune ressource du jeu ne dépend de Vercel ou d’un CDN ;
8. le bouton Retour Android est cohérent ;
9. aucune erreur JavaScript bloquante n’apparaît dans la WebView ;
10. l’APK est reproductible à partir du dépôt.

## Tests prévus

### Tests statiques

- présence de tous les assets web nécessaires dans l’arborescence Android ;
- absence d’URL CDN/Vercel dans le bundle Android ;
- présence des 500 questions ;
- manifest Android avec package/orientation corrects ;
- vérification que la permission Internet n’est pas requise ;
- vérification des réglages WebView de sécurité.

### Tests build

- `assembleDebug` doit réussir ;
- APK présent dans les outputs Gradle ;
- inspection sommaire de l’APK pour confirmer l’embarquement de `assets/www/`.

### Test appareil réel

- installation sur le téléphone ;
- premier lancement en mode avion ;
- partie QCM ;
- partie réponse libre ;
- partie mixte ;
- fermeture/réouverture et contrôle de persistance.

## Hors périmètre de V5.0

- multijoueur local ou en ligne ;
- comptes utilisateurs ;
- synchronisation cloud ;
- classement mondial ;
- notifications push ;
- publication Play Store ;
- achats intégrés ;
- mise à jour distante de la banque de questions.

Ces éléments peuvent être ajoutés ensuite sans remettre en cause la coque Android si l’architecture reste centrée sur le moteur web partagé.
