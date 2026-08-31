# Quiz Libre V7.1 — Duel local 1v1

Date : 2026-08-31
Statut : design validé en conversation, en attente de relecture finale avant plan d’implémentation
Base : `main` après intégration V7 (1000 questions)
Branche : `v7-1-local-duel`

## 1. Objectif

Ajouter à Quiz Libre un premier mode multijoueur local inspiré du rythme d’un duel tour par tour, sans copier l’interface ni l’identité visuelle d’un jeu existant.

V7.1 doit permettre à deux téléphones Android proches de jouer un duel complet sans serveur Internet, tout en conservant le moteur solo, les 1000 questions et le fonctionnement offline déjà validés.

Le design réseau doit être suffisamment découplé du transport pour permettre plus tard :
- un vrai multijoueur Internet asynchrone ;
- des invitations / comptes / matchmaking ;
- une version iOS utilisant le même protocole logique.

## 2. Périmètre V7.1

### Inclus
- Android uniquement pour cette version.
- 2 joueurs exactement.
- Deux téléphones distincts.
- Connexion locale à proximité avec Google Nearby Connections.
- QCM uniquement en multijoueur.
- 6 manches.
- 3 questions par manche.
- 18 questions jouées par chaque joueur au maximum.
- Choix de catégorie alterné entre les joueurs.
- Trois catégories proposées au joueur qui a la main.
- Les mêmes trois questions pour les deux joueurs d’une manche.
- Score du premier joueur caché jusqu’à la fin du tour du second.
- Révélation du résultat de la manche uniquement après les trois réponses du second joueur.
- Score total cumulé sur 18 points maximum.
- Égalité autorisée en fin de partie, sans tie-break en V7.1.

### Hors périmètre
- Multijoueur Internet à distance.
- Comptes utilisateurs.
- Matchmaking public.
- Classements globaux.
- Notifications push.
- Chat entre joueurs.
- 3 ou 4 joueurs.
- Réponse libre ou mode mixte en multijoueur.
- Bonus de vitesse.
- Publicités / AdMob.
- iOS.

## 3. Expérience utilisateur

### 3.1 Accueil

L’écran d’accueil conserve le mode solo actuel et ajoute une entrée claire :

- `Solo`
- `Duel local`

Le duel local ne remplace ni ne modifie le comportement du solo.

### 3.2 Création d’un duel

Le joueur hôte :
1. ouvre `Duel local` ;
2. choisit `Créer un duel` ;
3. saisit ou confirme un pseudo local ;
4. le téléphone commence à annoncer la partie ;
5. un écran d’attente affiche le nom de la salle locale et attend le second joueur.

Le `serviceId` Nearby utilisera l’identifiant de l’application, `fr.electronlibre.quizlibre`.

### 3.3 Rejoindre un duel

Le second joueur :
1. ouvre `Duel local` ;
2. choisit `Rejoindre un duel` ;
3. l’application découvre les parties Quiz Libre proches ;
4. le joueur sélectionne la partie trouvée ;
5. les deux téléphones affichent un code de vérification identique ;
6. la connexion n’est acceptée qu’après confirmation de ce code.

### 3.4 Début de partie

Pour V7.1, l’hôte commence comme joueur ayant le choix de catégorie à la manche 1.

L’ordre alterne ensuite automatiquement :
- manche 1 : hôte choisit ;
- manche 2 : invité choisit ;
- manche 3 : hôte ;
- manche 4 : invité ;
- manche 5 : hôte ;
- manche 6 : invité.

Ce choix est déterministe et évite une étape supplémentaire de tirage au sort en V7.1.

## 4. Déroulement d’une manche

### Phase A — proposition de catégories

Le joueur qui a la main reçoit exactement 3 catégories parmi les 10 catégories Quiz Libre.

Règles de tirage :
- les trois catégories doivent être distinctes ;
- éviter de proposer exactement le même trio que la manche précédente ;
- favoriser l’alternance des catégories déjà proposées lorsque possible ;
- une catégorie reste néanmoins réutilisable dans la même partie ;
- aucune catégorie n’est définitivement bloquée après usage.

Le joueur choisit une des trois catégories.

### Phase B — sélection des questions

Le téléphone hôte est autoritaire sur l’état de partie et sélectionne les trois questions de la manche.

Contraintes :
- 3 questions distinctes ;
- catégorie identique à celle choisie ;
- QCM uniquement ;
- pas de question déjà jouée dans la même partie ;
- le même ordre de questions et le même ordre de réponses sont utilisés sur les deux appareils.

Pour éviter les problèmes de versions de banque, le message de manche contient un snapshot canonique des trois questions plutôt que seulement leurs IDs :
- `id` ;
- `cat` ;
- `diff` ;
- `q` ;
- `opts` ;
- `a` ;
- `ex`.

Ainsi, le téléphone hôte reste la source de vérité même si les deux installations ne possèdent pas exactement la même révision de la banque de questions.

### Phase C — premier joueur

Le joueur qui a choisi la catégorie répond aux trois questions.

Après chaque réponse :
- l’interface peut afficher immédiatement si sa propre réponse est correcte ou non, comme dans le solo ;
- le score de la manche adverse n’est évidemment pas disponible ;
- le résultat partiel du joueur n’est pas révélé à l’adversaire.

À la fin de sa troisième réponse :
- son résultat de manche est enregistré ;
- l’adversaire reçoit l’autorisation de jouer les mêmes trois questions ;
- le premier joueur voit un écran d’attente du type `À ton adversaire` ;
- son score 0/3 à 3/3 reste caché à l’autre joueur.

### Phase D — second joueur

Le second joueur répond aux mêmes trois questions, dans le même ordre.

Pendant ses trois réponses :
- il ne voit pas le score du premier joueur ;
- il ne voit pas les choix du premier joueur ;
- il ne reçoit aucun indice permettant de déduire son résultat.

### Phase E — révélation

Après la troisième réponse du second joueur uniquement, les deux téléphones affichent simultanément le résultat de la manche.

Exemple :

`Brice 2/3  ⚡  Aude 3/3`

Puis :
- score total cumulé de chaque joueur ;
- numéro de manche ;
- bouton / transition vers la manche suivante.

## 5. Score

Règle V7.1 :
- 1 bonne réponse = 1 point ;
- mauvaise réponse = 0 ;
- aucun bonus de rapidité ;
- aucun malus ;
- maximum : 18 points.

À la fin de la manche 6 :
- score le plus élevé = victoire ;
- scores égaux = égalité ;
- aucun tie-break dans cette version.

Les statistiques solo existantes ne doivent pas être modifiées par un duel local.

Le multijoueur dispose de son propre historique local minimal si nécessaire, mais V7.1 n’exige pas de statistiques multijoueur persistantes détaillées.

## 6. Architecture technique

### 6.1 Principe

Conserver le moteur HTML/JavaScript existant pour :
- écrans ;
- affichage des questions ;
- réponses QCM ;
- animations ;
- résultats.

Ajouter une couche Android Kotlin dédiée au transport et à l’état réseau.

### 6.2 Composants proposés

- `MainActivity.kt`
  - conserve la WebView actuelle ;
  - installe le bridge multijoueur sécurisé.

- `MultiplayerManager.kt`
  - encapsule Nearby Connections ;
  - annonce / découvre ;
  - établit et ferme les connexions ;
  - envoie / reçoit des messages ;
  - expose les événements nécessaires à la WebView.

- `DuelProtocol.kt`
  - modèles de messages ;
  - sérialisation / validation ;
  - `protocolVersion`.

- `multiplayer.js`
  - machine d’état du duel côté interface ;
  - dialogue avec le bridge Kotlin ;
  - ne contient aucune logique spécifique au transport Nearby.

- `multiplayer.css`
  - écrans duel ;
  - attente ;
  - lobby ;
  - révélation de manche ;
  - classement final.

### 6.3 Nearby Connections

Nearby Connections sera utilisé pour la connexion locale.

Pour V7.1 1v1, la stratégie recommandée est `P2P_POINT_TO_POINT` car la partie ne comporte que deux appareils et le protocole échange de très petits messages.

Le transport utilisera des payloads `BYTES`, adaptés aux messages courts / métadonnées.

Le téléphone hôte annonce la partie ; le second téléphone découvre puis demande la connexion.

La vérification de connexion doit être visible par l’utilisateur. Une connexion non vérifiée ne doit pas lancer la partie.

### 6.4 Bridge WebView

Le bridge natif doit être minimal et strictement limité au contenu local de confiance servi depuis :

`https://appassets.androidplatform.net/assets/www/`

Interface JS vers Kotlin envisagée :
- `createDuel(playerName)` ;
- `discoverDuels(playerName)` ;
- `joinDuel(endpointId)` ;
- `confirmConnection()` ;
- `rejectConnection()` ;
- `sendDuelMessage(json)` ;
- `leaveDuel()`.

Kotlin vers JS :
- événements sérialisés via une fonction unique telle que `window.QuizLibreMultiplayer.onNativeEvent(...)`.

Aucun bridge générique donnant accès au système de fichiers, à des URL arbitraires ou à des fonctions Android non nécessaires ne doit être exposé.

## 7. Protocole de duel

Chaque message contient au minimum :
- `protocolVersion` ;
- `matchId` ;
- `type` ;
- `sequence` ;
- `senderPlayerId` ;
- `payload`.

Types minimum :
- `HELLO`
- `CONNECTION_VERIFIED`
- `PLAYER_READY`
- `MATCH_START`
- `CATEGORY_OPTIONS`
- `CATEGORY_SELECTED`
- `ROUND_QUESTIONS`
- `TURN_COMPLETE`
- `ROUND_REVEAL`
- `NEXT_ROUND`
- `MATCH_END`
- `PLAYER_LEFT`
- `ERROR`

Le protocole est volontairement indépendant de Nearby. À terme, les mêmes objets pourront être transportés via un backend Internet.

## 8. Autorité et anti-désynchronisation

Le téléphone hôte est la source de vérité pour :
- `matchId` ;
- numéro de manche ;
- joueur dont c’est le tour ;
- catégories proposées ;
- catégorie choisie ;
- snapshot des questions ;
- réponses reçues ;
- scores de manche ;
- scores cumulés ;
- fin de partie.

Le client ne décide jamais du score officiel.

Chaque message porte un numéro `sequence` croissant. Les messages anciens, dupliqués ou incompatibles avec l’état courant sont ignorés / rejetés.

## 9. Confidentialité du score pendant la manche

Exigence centrale : le second joueur ne doit pas connaître le résultat du premier avant d’avoir terminé ses trois questions.

Donc :
- le téléphone hôte peut connaître techniquement les réponses du premier joueur ;
- l’interface du second téléphone ne reçoit pas de `ROUND_REVEAL` avant `TURN_COMPLETE` du second ;
- aucun champ de score du premier joueur n’est envoyé dans les messages nécessaires au tour du second ;
- le score de manche est révélé via un message distinct après verrouillage des deux tours.

Cette séparation doit être couverte par des tests de protocole.

## 10. Permissions et cycle de vie Android

V7.1 ajoute les dépendances Google Play services nécessaires à Nearby Connections.

Les permissions exactes doivent suivre la documentation Android/Nearby correspondant au niveau API ciblé au moment de l’implémentation.

Principes UX :
- demander les permissions uniquement à l’entrée du mode `Duel local` ;
- expliquer brièvement qu’elles servent à trouver l’autre téléphone ;
- si une permission est refusée, le solo continue de fonctionner normalement ;
- aucun écran de permission au lancement de l’application.

Nearby advertising / discovery doivent être arrêtés dès qu’ils ne sont plus utiles afin de limiter batterie et exposition radio.

## 11. Déconnexion / erreurs

V7.1 privilégie un comportement simple et sûr.

Si un joueur quitte volontairement :
- message `PLAYER_LEFT` lorsque possible ;
- retour au lobby / accueil ;
- partie locale abandonnée.

Si la connexion tombe pendant une partie :
- afficher `Connexion perdue` ;
- ne jamais continuer localement avec des états divergents ;
- V7.1 peut proposer une courte tentative automatique de reconnexion ;
- si la reconnexion n’aboutit pas, la partie est abandonnée proprement.

La reprise persistante d’une partie après fermeture complète de l’application est hors périmètre V7.1.

## 12. Compatibilité et versionnement

Version Android proposée :
- `versionCode = 5`
- `versionName = 1.3.0`

Conserver impérativement :
- `applicationId = fr.electronlibre.quizlibre`
- la même clé de signature permanente que V6/V6.1/V7.

Le protocole possède son propre numéro :
- `protocolVersion = 1` pour V7.1.

Si deux installations ont des versions de protocole incompatibles, la connexion doit être refusée avec un message utilisateur clair plutôt que de lancer une partie potentiellement désynchronisée.

## 13. Tests obligatoires

### Tests JavaScript / logique
- alternance correcte du joueur qui choisit la catégorie ;
- trois catégories distinctes ;
- évitement du trio précédent ;
- trois questions distinctes ;
- absence de question rejouée dans la partie ;
- même snapshot de questions des deux côtés ;
- score du premier masqué tant que le second n’a pas terminé ;
- révélation après exactement trois réponses du second ;
- score cumulé correct ;
- six manches ;
- fin sur victoire / défaite / égalité.

### Tests Kotlin / protocole
- sérialisation / désérialisation ;
- rejet d’un `protocolVersion` incompatible ;
- rejet des messages hors ordre ;
- validation des champs obligatoires ;
- rôle hôte autoritaire ;
- aucun score adverse divulgué avant `ROUND_REVEAL` ;
- fermeture propre des ressources Nearby.

### Tests Android / CI
- build release ;
- versionCode / versionName ;
- applicationId inchangé ;
- les 1000 questions toujours embarquées ;
- le solo toujours disponible sans permissions Nearby ;
- assets du multijoueur embarqués offline ;
- absence de dépendance à un serveur pour V7.1.

### Tests réels sur téléphones
- installation en mise à jour depuis V7 sans désinstallation ;
- conservation des statistiques solo ;
- création / découverte du duel ;
- vérification du code ;
- partie complète 6 manches ;
- score caché puis révélé au bon moment ;
- mise en veille / retour application raisonnable ;
- coupure Bluetooth/Wi-Fi pendant une partie ;
- abandon volontaire ;
- fonctionnement du solo après refus des permissions multi.

## 14. Évolution future — multijoueur Internet

Le futur mode à distance ne doit pas être une réécriture du duel.

Le plan cible :
- conserver la machine d’état ;
- conserver les messages du protocole ;
- remplacer `NearbyTransport` par un transport réseau/backend ;
- stocker les parties côté serveur ;
- permettre un tour différé de plusieurs minutes / heures / jours ;
- comptes / pseudos durables ;
- invitations ;
- notifications ;
- matchmaking éventuel.

Un backend de type Supabase est une option naturelle, mais il n’est pas choisi définitivement dans V7.1.

## 15. Évolution future — iOS

Le protocole ne doit utiliser aucun concept spécifique à Kotlin.

La version iOS pourra :
- réutiliser le contenu HTML/JS et la banque de questions ;
- utiliser une coque Swift / WKWebView ;
- implémenter le même protocole ;
- utiliser Nearby Connections en local ou le futur backend pour les duels Internet.

## 16. Critères d’acceptation V7.1

V7.1 est considérée comme prête à valider lorsque :
1. deux téléphones Android peuvent se connecter localement ;
2. la connexion est explicitement vérifiée par les joueurs ;
3. une partie complète de 6 manches fonctionne ;
4. chaque manche propose 3 catégories au joueur qui a la main ;
5. le choix de catégorie alterne ;
6. les deux joueurs reçoivent exactement les mêmes 3 QCM ;
7. le résultat du premier reste invisible au second jusqu’à sa troisième réponse ;
8. la révélation de manche est identique sur les deux téléphones ;
9. le score final est cohérent sur les deux appareils ;
10. le mode solo n’a aucune régression ;
11. les statistiques solo existantes sont conservées après mise à jour ;
12. l’APK release reste signée avec la clé permanente existante.
