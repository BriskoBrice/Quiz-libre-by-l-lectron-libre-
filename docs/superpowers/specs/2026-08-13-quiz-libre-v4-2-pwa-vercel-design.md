# Quiz Libre V4.2 — PWA + déploiement Vercel

Date : 2026-08-13
Branche : `v4-2-pwa-vercel`
Base : `v4-1-game-results-neon`

## Objectif

Transformer Quiz Libre V4.1 en application web installable (PWA), utilisable en plein écran et hors ligne après une première visite, puis préparer un déploiement Vercel de test sans modifier le moteur du quiz ni la banque de 500 questions.

## Décision d’architecture

La V4.2 reste une application HTML/CSS/JavaScript statique. Aucun framework, backend ou système de compte n’est ajouté. La PWA repose uniquement sur un manifeste web, un service worker de cache statique, des icônes d’application et l’enregistrement du service worker dans la page principale.

Le déploiement Vercel sert d’hébergement HTTPS pour rendre l’installation PWA possible sur Android. Un déploiement de test est privilégié avant toute publication plus large ou conversion APK.

## Base fonctionnelle à préserver

La V4.2 conserve intégralement la V4.1 :

- 500 questions ;
- 10 catégories, 50 questions par catégorie ;
- QCM, réponse libre et mixte ;
- tolérance B pour la réponse libre ;
- anti-répétition ;
- statistiques et progression en localStorage ;
- DA entrepôt néon sur accueil, jeu et résultats ;
- fonctionnement mobile-first ;
- aucune dépendance serveur pour jouer.

## PWA

### Manifeste

Créer `manifest.webmanifest` avec :

- nom : `Quiz Libre` ;
- nom court : `Quiz Libre` ;
- description courte liée au quiz de culture générale ;
- `start_url` : `/` ;
- `scope` : `/` ;
- `display` : `standalone` ;
- orientation : `portrait-primary` ;
- couleur de thème cohérente avec l’entrepôt néon ;
- couleur de fond sombre ;
- icônes 192×192 et 512×512 ;
- icône maskable au minimum en 512×512.

La page `index.html` référence le manifeste, la couleur de thème et une icône Apple touch.

### Service worker

Créer `service-worker.js` avec une stratégie simple et robuste :

1. pré-cacher le shell de l’application et tous les fichiers nécessaires au jeu ;
2. utiliser un nom de cache versionné ;
3. supprimer les anciens caches lors de l’activation ;
4. pour les requêtes de navigation, servir le réseau si disponible puis retomber sur `index.html` en cas d’échec ;
5. pour les assets statiques déjà connus, privilégier le cache ;
6. ne jamais mettre en cache des requêtes externes inutiles.

Le cache doit inclure au minimum :

- `index.html` ;
- `styles.css` ;
- `v3.css` ;
- `v4.css` ;
- `v4-1.css` ;
- `app.js` ;
- `answer-utils.js` ;
- `assets/warehouse-neon.jpg` ;
- `questions/index.js` ;
- les 10 packs de questions ;
- les icônes PWA.

### Enregistrement

Ajouter un enregistrement du service worker dans l’application sans bloquer le démarrage du quiz. Si l’enregistrement échoue, le jeu continue normalement en ligne.

## Icône

L’icône reprend l’identité déjà utilisée dans l’application : fond sombre violet/cyan et éclair central. Elle doit rester lisible à petite taille et ne doit pas dépendre d’un asset externe.

Fichiers cibles :

- `icons/icon-192.png` ;
- `icons/icon-512.png` ;
- `icons/icon-maskable-512.png`.

## Offline

Critère attendu : après une première visite réussie et activation du service worker, l’utilisateur peut relancer l’application sans connexion et :

- voir l’accueil ;
- lancer une partie ;
- charger les questions ;
- répondre en QCM ou libre ;
- terminer une partie ;
- conserver les statistiques locales.

Le mode hors ligne ne doit pas dépendre d’un fichier HTML autonome séparé.

## Déploiement Vercel

La V4.2 est déployée comme site statique, sans build framework obligatoire.

Approche :

- utiliser le dépôt GitHub existant ;
- servir la racine du projet ;
- conserver les chemins d’assets relatifs compatibles Vercel ;
- produire d’abord un déploiement de test ;
- vérifier le manifeste, le service worker, l’installation Android et le fonctionnement hors ligne ;
- ne promouvoir en version de référence qu’après validation utilisateur.

Si le connecteur Vercel reste temporairement indisponible, la branche et les fichiers PWA restent finalisés et testables localement ; le déploiement est simplement repris dès que le service répond.

## Tests

La V4.2 doit vérifier au minimum :

1. les 500 questions sont toujours présentes et valides ;
2. `manifest.webmanifest` est un JSON valide et contient les champs requis ;
3. les trois icônes existent et ont les dimensions attendues ;
4. `index.html` référence le manifeste et enregistre le service worker ;
5. le service worker pré-cache toutes les dépendances nécessaires ;
6. aucun ancien fichier V4/V4.1 indispensable n’est oublié du cache ;
7. la première navigation fonctionne en ligne ;
8. une seconde navigation fonctionne après passage hors ligne ;
9. QCM, réponse libre et mixte fonctionnent encore ;
10. aucun débordement horizontal à 360 px et 393 px ;
11. aucune erreur JavaScript bloquante dans le navigateur ;
12. le site répond en HTTPS sur Vercel avant test d’installation PWA.

## Hors périmètre

La V4.2 n’ajoute pas :

- APK native ;
- compte utilisateur ;
- backend ;
- synchronisation cloud ;
- notifications push ;
- classement en ligne ;
- nouvelles questions au-delà des 500 existantes.

Ces sujets seront traités après validation de la PWA et du déploiement.

## Critère de réussite

La V4.2 est réussie lorsque Quiz Libre V4.1 est accessible sur une URL HTTPS, installable sur Android comme application autonome, jouable hors ligne après une première visite, et conserve exactement le comportement du quiz validé avant la transformation PWA.
