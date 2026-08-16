# Quiz Libre V4.1 — Game & Results Neon Design

Date : 2026-08-12
Branche : `v4-1-game-results-neon`
Base : `main` (V4 — entrepôt néon + 500 questions)

## Objectif

Prolonger la direction visuelle entrepôt néon validée sur l’accueil jusque dans les écrans de jeu et de résultat, sans modifier les règles du quiz ni la banque de 500 questions.

## Approches envisagées

1. **Refonte lourde avec nouvelles vues et nouveau moteur d’animation** : plus spectaculaire, mais risque inutile de régression.
2. **Habillage immersif des vues existantes** — retenu : conserver les IDs et le flux JavaScript, enrichir le HTML de quelques éléments décoratifs et ajouter un CSS V4.1 ciblé.
3. **Nouvelle image différente pour chaque écran** : plus photoréaliste mais plus lourd, plus fragile hors ligne et moins cohérent.

L’approche 2 est retenue : elle donne une vraie continuité visuelle tout en protégeant le moteur existant.

## Écran de question

- Réutiliser `assets/warehouse-neon.jpg` uniquement comme couche atmosphérique, jamais comme UI incrustée.
- Donner au `gameScreen` un décor sombre avec halo violet/cyan, texture légère et profondeur.
- Transformer l’en-tête de partie en barre compacte façon HUD : compteur, progression néon, score.
- Transformer la carte de question en panneau verre/métal sombre, avec liserés cyan/violet et glow subtil.
- Conserver `categoryBadge`, `answerTypeBadge`, `difficultyBadge`, `questionText`, `answers`, `freeAnswerWrap`, `feedback`, `nextBtn`, `streak` et tous les IDs attendus par `app.js`.
- Les réponses QCM deviennent des plaques tactiles plus lisibles sur mobile ; bonne réponse = cyan/vert lumineux, mauvaise = rose/rouge lumineux.
- La réponse libre utilise la même identité visuelle.

## Feedback et micro-animations

- Apparition douce de la question et des réponses.
- Petit pulse lumineux lors d’une bonne réponse.
- Secousse très courte et légère lors d’une mauvaise réponse.
- Le streak reçoit un halo animé quand il est actif.
- Respecter `prefers-reduced-motion` pour désactiver les animations non essentielles.
- Pas de son dans V4.1 : on garde la passe concentrée sur le visuel et on évite d’ajouter une préférence audio avant la PWA.

## Écran de résultat

- Réutiliser l’ambiance entrepôt avec une composition différente de l’accueil : fond assombri, halo central et faisceaux néon.
- Le score devient l’élément principal, très lisible.
- Les trois statistiques restent présentes sous forme de modules lumineux.
- Le résultat s’adapte au pourcentage via les éléments existants (`resultIcon`, `resultMessage`) sans changer le calcul du score.
- Les boutons Rejouer / Accueil gardent les IDs et comportements actuels.

## Architecture

- `index.html` : ajout de classes et de quelques wrappers décoratifs uniquement.
- `v4-1.css` : nouveau fichier responsable exclusivement de l’habillage des écrans jeu/résultat et des animations.
- `app.js` : changement minimal, uniquement pour appliquer des classes de feedback (`is-correct`, `is-wrong`, `is-entering`) si nécessaire. Aucun changement de sélection des questions, score, réponse libre ou anti-répétition.
- `scripts/build-standalone.js` : inclure `v4-1.css` dans le build autonome.

## Contraintes

- 500 questions inchangées.
- 10 catégories inchangées.
- QCM, réponse libre et mixte inchangés.
- Tolérance B inchangée.
- Anti-répétition et statistiques locales inchangés.
- Aucun débordement horizontal à 360 px et 393 px.
- Fonctionnement hors ligne conservé.
- Aucun nouveau framework ou dépendance runtime.
- Le décor ne doit jamais contenir de texte ou UI pré-incrustés.

## Validation

1. Self-test V4 reste `ok` avec 500 questions.
2. Test QCM : bonne et mauvaise réponses visibles et fonctionnelles.
3. Test réponse libre : validation Enter/bouton et feedback fonctionnels.
4. Test mixte : les deux modes apparaissent dans une même partie.
5. Résultat : score, pourcentage, meilleure série et points corrects.
6. Largeurs 360 px et 393 px sans débordement horizontal.
7. Aucun ID moteur supprimé.
8. Aucune erreur JavaScript console.
9. `prefers-reduced-motion` neutralise les animations décoratives.

## Hors périmètre

- sons et réglages audio ;
- nouvelles règles de jeu ;
- niveaux/XP/succès ;
- PWA/APK ;
- nouvelle banque de questions.

## Critère de réussite

Quand on quitte l’accueil pour répondre à une question puis consulter le résultat, l’utilisateur doit avoir la sensation de rester dans le même univers « Quiz Libre — L’électron libre » sans perdre la lisibilité ni la fluidité mobile de la V4.
