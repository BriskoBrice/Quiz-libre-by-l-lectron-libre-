# Quiz Libre V6 — Release signée permanente

Date : 2026-08-18

## Objectif

Faire de l’APK Android Quiz Libre une base de distribution stable et mise à jour sans désinstallation, tout en conservant exactement le jeu V5 validé.

La V6 apporte uniquement :

- une signature Android release permanente ;
- un `versionCode` supérieur à la V5 ;
- une version release installable hors Play Store ;
- un léger ajustement vertical du hero pour remonter visuellement le titre `QUIZ LIBRE` sur téléphone ;
- une chaîne de build reproductible pour les futures mises à jour.

Aucun nouveau mode de jeu, aucune modification de la banque de 500 questions et aucun multijoueur dans cette passe.

## Transition V5 → V6

La V5 actuellement installée est une APK debug. La V6 utilisera une nouvelle clé release permanente.

Android ne considérera donc pas la V6 comme une mise à jour compatible de la V5 debug : il faudra désinstaller la V5 une dernière fois avant d’installer la V6.

À partir de la V6, toutes les versions suivantes doivent conserver :

- le même `applicationId` : `fr.electronlibre.quizlibre` ;
- le même certificat de signature release ;
- un `versionCode` strictement croissant.

Ainsi, V6.1, V7 et les versions suivantes pourront s’installer par-dessus l’application existante sans désinstallation normale.

## Identité et version

- Nom Android : `Quiz Libre`
- Application ID : `fr.electronlibre.quizlibre`
- `versionName` V6 : `1.1.0`
- `versionCode` V6 : `2`
- Orientation : portrait
- `compileSdk = 36`
- `targetSdk = 36`
- `minSdk = 24`

Les futurs builds augmentent toujours `versionCode` avant distribution.

## Signature permanente

Une seule clé de signature release est générée pour Quiz Libre.

Règles :

1. la clé n’est jamais commitée dans GitHub ;
2. le mot de passe et l’alias ne sont jamais commités dans GitHub ;
3. le dépôt public ne contient aucun secret de signature ;
4. la clé est conservée dans l’espace de fichiers privé de l’utilisateur sous un dossier dédié `Quiz Libre/Signing/` ;
5. les identifiants nécessaires à la signature sont conservés dans ce même espace privé, séparés du dépôt ;
6. une copie téléchargeable de sauvegarde est fournie à l’utilisateur lors de la création de la V6 ;
7. toutes les versions Android futures doivent utiliser exactement cette clé.

Perdre cette clé empêcherait de produire une mise à jour compatible avec les V6+ déjà installées. Elle est donc considérée comme un actif permanent du projet.

## Chaîne de build et de signature

Le dépôt GitHub reste la source de vérité du code.

La chaîne V6 est :

1. synchroniser les assets web vers `android/app/src/main/assets/www/` ;
2. lancer les tests statiques Android ;
3. compiler une APK release non signée avec GitHub Actions ;
4. récupérer l’artefact de build ;
5. signer cet APK hors du dépôt avec la clé permanente ;
6. vérifier cryptographiquement la signature du fichier final ;
7. livrer l’APK signée à l’utilisateur ;
8. conserver la branche V6 séparée de `main` jusqu’au test réel sur téléphone.

Cette méthode évite de placer le keystore ou ses mots de passe dans un dépôt GitHub public.

## Mise à jour Android

Le comportement cible après installation de la V6 est :

- une future APK portant le même `applicationId` ;
- signée avec le même certificat ;
- avec un `versionCode` plus élevé ;

peut être installée directement par-dessus la version existante.

Les données locales de l’application (`localStorage`) doivent rester présentes lors d’une mise à jour normale : statistiques, questions vues et progression ne sont pas réinitialisées par une simple mise à jour.

## Ajustement visuel du hero

Sur la capture Android V5, le bloc principal `QUIZ LIBRE / L’électron libre` paraît légèrement trop bas dans le grand hero.

La V6 remonte uniquement ce contenu sur les petits écrans, sans redessiner la page :

- réduire le padding supérieur mobile du hero d’environ 35 à 45 px ;
- conserver la hauteur globale, le décor entrepôt, les statistiques et les proportions actuelles ;
- ne pas coller le titre à la barre système ;
- ne pas modifier le layout desktop/PWA plus que nécessaire.

Le changement doit rester subtil : il s’agit d’un recalage, pas d’une nouvelle direction artistique.

## Play Protect

La signature release permanente ne garantit pas la disparition du message Google Play Protect lié à une application installée hors Play Store ou à un développeur encore inconnu de Google.

La V6 ne doit donc pas promettre de supprimer cet avertissement.

L’objectif de la signature permanente est :

- identité cryptographique stable de l’application ;
- mises à jour compatibles ;
- base correcte pour une éventuelle distribution Play Store ultérieure.

Le passage au Play Store ou à un canal de test Google Play pourra être traité séparément plus tard.

## APK release

Le fichier final doit être clairement nommé :

`quiz-libre-1.1.0-release.apk`

Il ne doit pas contenir le suffixe `debug` et doit être signé avec la clé permanente Quiz Libre.

## Tests obligatoires

### Tests de version

- `applicationId = fr.electronlibre.quizlibre` ;
- `versionCode = 2` ;
- `versionName = 1.1.0` ;
- aucune permission Internet ajoutée ;
- API 36 conservée.

### Tests du bundle

- 500 questions disponibles ;
- 10 catégories de 50 questions ;
- décor `warehouse-neon.jpg` embarqué ;
- aucune dépendance Vercel/CDN ;
- aucun service worker PWA actif dans la WebView Android.

### Tests de signature

- l’APK finale est signée ;
- le certificat de signature est inspectable et stable ;
- l’APK passe l’outil de vérification de signature utilisé lors de la génération ;
- le fingerprint SHA-256 du certificat est enregistré dans la documentation privée de signature afin de vérifier les futures releases.

### Test réel téléphone

Après désinstallation unique de la V5 debug :

1. installer `quiz-libre-1.1.0-release.apk` ;
2. lancer en mode avion ;
3. jouer une partie ;
4. fermer/réouvrir et vérifier les statistiques ;
5. vérifier le nouveau positionnement du hero.

Après validation V6, un build V6.1 de test avec `versionCode = 3` pourra être utilisé pour prouver qu’une mise à jour s’installe par-dessus la V6 sans désinstallation.

## Critères d’acceptation

La V6 est validée si :

1. la release compile ;
2. la release finale est signée avec la clé permanente ;
3. la clé n’est pas présente dans GitHub ;
4. l’APK fonctionne 100 % hors ligne ;
5. les 500 questions et tous les modes solo actuels fonctionnent ;
6. le titre du hero est légèrement mieux remonté sur mobile ;
7. la V6 s’installe après la transition unique depuis la V5 debug ;
8. une V6.1 signée avec la même clé et un `versionCode` supérieur peut être installée par-dessus la V6 ;
9. les statistiques persistent lors de cette mise à jour V6 → V6.1.

## Hors périmètre

- suppression garantie de l’avertissement Play Protect ;
- Play Store ;
- multijoueur ;
- comptes utilisateurs ;
- synchronisation cloud ;
- changement du moteur du quiz ;
- ajout de nouvelles questions dans cette passe.