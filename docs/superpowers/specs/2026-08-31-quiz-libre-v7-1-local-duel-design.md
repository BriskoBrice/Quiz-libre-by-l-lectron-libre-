# Quiz Libre V7.1 — Duel local 1v1

Date : 2026-08-31
Statut : design validé sur le principe, une décision UX reste à confirmer avant le plan d’implémentation
Base : `main` après intégration V7 (1000 questions)
Branche : `v7-1-local-duel`

## 1. Objectif

Ajouter à Quiz Libre un premier mode multijoueur local en duel tour par tour, avec notre propre identité visuelle et sans modifier le moteur solo déjà validé.

V7.1 doit permettre à deux téléphones Android proches de jouer sans serveur Internet. L’architecture doit séparer la logique du duel du transport afin de pouvoir remplacer plus tard Nearby par un backend Internet et réutiliser le même protocole sur iOS.

## 2. Périmètre V7.1

Inclus :
- Android uniquement ;
- 2 joueurs exactement, chacun sur son téléphone ;
- connexion locale via Google Nearby Connections ;
- QCM uniquement ;
- 6 manches ;
- 3 questions par manche ;
- 18 questions jouées par joueur sur une partie complète ;
- 3 catégories proposées au joueur qui a la main ;
- choix de catégorie alterné à chaque manche ;
- mêmes 3 questions, même ordre et mêmes options pour les deux joueurs ;
- résultat du premier joueur caché au second jusqu’à la troisième réponse de celui-ci ;
- 1 point par bonne réponse, 18 points maximum ;
- égalité autorisée, sans tie-break ;
- aucune modification des statistiques solo.

Hors périmètre :
- multijoueur Internet ;
- comptes, matchmaking, invitations à distance ;
- notifications push ;
- chat ;
- 3 ou 4 joueurs ;
- réponse libre / mode mixte ;
- bonus de vitesse ;
- publicités ;
- iOS.

## 3. Parcours utilisateur

L’accueil conserve le solo et ajoute `Duel local`.

### Créer

L’hôte :
1. ouvre `Duel local` ;
2. choisit `Créer un duel` ;
3. saisit ou confirme un pseudo local ;
4. annonce la partie via Nearby ;
5. attend un adversaire.

### Rejoindre

L’invité :
1. choisit `Rejoindre un duel` ;
2. découvre les parties Quiz Libre proches ;
3. sélectionne l’hôte ;
4. les deux appareils affichent un code de vérification identique ;
5. les deux joueurs confirment avant de lancer la partie.

Le `serviceId` Nearby utilisera `fr.electronlibre.quizlibre`.

## 4. Ordre des manches

L’hôte choisit la catégorie à la manche 1, puis le choix alterne :
- manche 1 : hôte ;
- manche 2 : invité ;
- manche 3 : hôte ;
- manche 4 : invité ;
- manche 5 : hôte ;
- manche 6 : invité.

Chaque joueur choisit donc exactement 3 manches sur une partie complète.

## 5. Choix de catégorie

Le joueur ayant la main voit exactement 3 catégories distinctes parmi les 10.

Règles :
- éviter de reproposer exactement le même trio que la manche précédente ;
- favoriser des catégories moins récemment proposées lorsque possible ;
- aucune catégorie n’est définitivement bloquée ;
- une catégorie peut revenir plus tard dans la partie.

Il n’y a aucun sélecteur de difficulté en multijoueur. Les questions sont tirées dans l’ensemble de la catégorie choisie, donc en difficulté mixte selon la composition réelle de la banque.

## 6. Questions d’une manche

L’hôte est autoritaire et sélectionne 3 QCM distincts de la catégorie choisie.

Contraintes :
- aucune question déjà utilisée dans la partie ;
- même ordre de questions sur les deux appareils ;
- même ordre des 4 options ;
- le second joueur doit recevoir strictement le même contenu.

Pour éviter les incompatibilités de versions de banque, l’hôte envoie un snapshot canonique des 3 questions plutôt que seulement leurs IDs. Chaque snapshot contient au minimum : `id`, `cat`, `diff`, `q`, `opts`, `a`, `ex`.

## 7. Déroulement d’une manche

### Premier joueur

Le joueur qui a choisi la catégorie répond aux 3 questions. Il peut voir après chaque réponse si sa propre réponse est correcte, mais rien n’est révélé à l’adversaire.

Après sa troisième réponse :
- son tour est verrouillé ;
- son résultat est conservé par l’hôte ;
- le second joueur reçoit l’autorisation de jouer ;
- le premier joueur passe sur un écran d’attente ;
- le score 0/3 à 3/3 reste caché au second.

### Second joueur

Le second répond aux mêmes 3 questions. Pendant ce tour, il ne reçoit :
- ni score du premier ;
- ni réponses choisies par le premier ;
- ni information permettant d’en déduire le résultat.

### Révélation

Après la troisième réponse du second uniquement, l’hôte envoie `ROUND_REVEAL` et les deux appareils affichent le même résultat de manche, par exemple :

`Brice 2/3  ⚡  Aude 3/3`

Puis les deux écrans montrent le score cumulé et passent à la manche suivante.

## 8. Score

- bonne réponse : +1 ;
- mauvaise réponse : 0 ;
- aucun bonus de rapidité ;
- aucun malus ;
- maximum : 18 points.

Après la manche 6 : victoire, défaite ou égalité.

Les clés et statistiques solo existantes restent totalement indépendantes du mode duel.

## 9. Architecture

Le HTML/JavaScript continue de gérer l’interface et le gameplay. Kotlin gère uniquement les capacités Android et le transport local.

Composants prévus :
- `MainActivity.kt` : WebView et raccordement sécurisé ;
- `MultiplayerManager.kt` : Nearby, découverte, connexion, envoi/réception, cycle de vie ;
- `DuelProtocol.kt` : modèles, validation et version du protocole ;
- `multiplayer.js` : machine d’état du duel indépendante de Nearby ;
- `multiplayer.css` : lobby, catégories, attente, révélation, résultat final.

## 10. Nearby Connections

Pour V7.1 1v1, utiliser `Strategy.P2P_POINT_TO_POINT`. Le protocole n’échange que de petits messages JSON, transportés par payloads `BYTES`.

L’hôte annonce, l’invité découvre. Advertising et discovery sont arrêtés dès qu’ils ne servent plus.

La connexion doit être vérifiée par le code fourni par Nearby avant d’accepter une partie.

Si une future version locale passe à plus de 2 joueurs, le transport pourra migrer vers une stratégie `STAR` sans modifier le protocole logique du duel.

## 11. Pont WebView sécurisé

Le bridge ne doit être disponible que pour le contenu local de confiance servi depuis :

`https://appassets.androidplatform.net/assets/www/`

Préférence d’implémentation : utiliser un mécanisme de message WebView avec liste d’origines autorisées, par exemple `WebViewCompat.addWebMessageListener`, plutôt qu’exposer un objet Android générique à tout contenu Web.

Le bridge ne transporte que les commandes nécessaires au duel : création, découverte, connexion, confirmation, message de protocole et déconnexion.

Kotlin renvoie les événements à une entrée JS unique du type `window.QuizLibreMultiplayer.onNativeEvent(...)`.

Aucun accès au système de fichiers, à des URL arbitraires ou à d’autres fonctions Android n’est exposé.

## 12. Protocole

Chaque message contient :
- `protocolVersion` ;
- `matchId` ;
- `type` ;
- `sequence` ;
- `senderPlayerId` ;
- `payload`.

Types minimum :
`HELLO`, `CONNECTION_VERIFIED`, `PLAYER_READY`, `MATCH_START`, `CATEGORY_OPTIONS`, `CATEGORY_SELECTED`, `ROUND_QUESTIONS`, `TURN_COMPLETE`, `ROUND_REVEAL`, `NEXT_ROUND`, `MATCH_END`, `PLAYER_LEFT`, `ERROR`.

Le protocole ne dépend pas de Nearby. Une future implémentation Internet pourra transporter les mêmes messages via un backend.

## 13. Autorité et anti-désynchronisation

L’hôte est la source de vérité pour : match, manche, tour actif, catégories proposées, catégorie choisie, questions, réponses, scores et fin de partie.

Le client ne calcule jamais le score officiel.

`sequence` est croissant. Les messages dupliqués, trop anciens, incompatibles avec `protocolVersion` ou impossibles dans l’état courant sont rejetés.

Exigence centrale : aucun message nécessaire au tour du second ne contient le score du premier. Le score n’est envoyé que dans `ROUND_REVEAL` après `TURN_COMPLETE` du second.

## 14. Permissions et erreurs

Les permissions Nearby sont demandées uniquement lorsque l’utilisateur entre dans `Duel local`, jamais au démarrage de Quiz Libre.

Si elles sont refusées, le solo continue normalement.

En cas de déconnexion :
- la partie se met en pause ;
- aucune progression divergente n’est autorisée ;
- une courte tentative de reconnexion peut être faite ;
- en cas d’échec, la partie est abandonnée proprement.

La reprise persistante après fermeture complète de l’app est hors périmètre V7.1.

## 15. Versionnement

Proposition :
- `versionCode = 5` ;
- `versionName = 1.3.0` ;
- `protocolVersion = 1`.

Conserver impérativement :
- `applicationId = fr.electronlibre.quizlibre` ;
- la clé de signature permanente existante.

## 16. Tests et critères d’acceptation

Les tests doivent couvrir au minimum :
- 3 catégories distinctes et alternées raisonnablement ;
- alternance hôte/invité sur 6 manches ;
- 3 questions distinctes sans répétition dans la partie ;
- snapshot identique des deux côtés ;
- score du premier impossible à lire avant la fin du second ;
- révélation après exactement 3 réponses du second ;
- score final identique sur les deux appareils ;
- victoire / défaite / égalité ;
- protocole incompatible rejeté ;
- messages hors ordre rejetés ;
- nettoyage des ressources Nearby ;
- build Android release ;
- 1000 questions toujours embarquées ;
- solo fonctionnel sans permission multi ;
- mise à jour depuis V7 sans désinstallation ;
- statistiques solo conservées ;
- test réel complet sur deux téléphones.

## 17. Évolution future

### Internet

Conserver la machine d’état et le protocole, remplacer le transport Nearby par un backend. Cela permettra les parties différées, comptes, invitations, notifications et matchmaking. Supabase reste une option possible, sans être verrouillé dans V7.1.

### iOS

Réutiliser le contenu HTML/JS et le protocole dans une coque Swift/WKWebView. Le transport pourra être Nearby en local ou le backend Internet.

## 18. Décision restante avant le plan

Le design ne fixe pas encore une limite de temps par question. Ce choix doit être confirmé avant l’implémentation, car il influence la machine d’état, les tests et l’expérience de duel.
