# Quiz Libre V4 — Entrepôt néon + 500 questions

Date : 2026-08-11
Branche : `v4-entrepot-500q`
Base : `v3-answer-modes-180q`

## Objectif

Faire de la version visuelle validée « entrepôt néon » la nouvelle base officielle de Quiz Libre, tout en faisant passer la banque de 180 à 500 questions sans casser les modes QCM, réponse libre, mixte, la progression locale ni l’anti-répétition.

## Direction visuelle validée

- Ambiance : entrepôt industriel abandonné, sombre, violet/cyan, humide et nocturne.
- Le décor utilisé à l’accueil doit être une image réellement vierge : aucun texte, aucune statistique, aucun bouton et aucun élément d’interface ne doit être pré-incrusté dans l’image.
- Tous les textes, statistiques, boutons, sélecteurs et cartes restent de vrais éléments HTML/CSS au-dessus du décor.
- Conserver l’identité « Quiz Libre / L’électron libre » et le style néon validé lors du test utilisateur.
- Conserver une interface mobile-first, lisible sur petit écran et sans débordement horizontal.
- Les écrans de question et de résultat conservent la cohérence violet/cyan de la V3 ; la refonte porte surtout sur l’intégration propre de l’accueil validé, sans réécriture inutile du moteur.

## Banque de questions

Total cible : **500 questions**.

Quiz Libre conserve ses 10 catégories actuelles :

1. Histoire
2. Géographie
3. Sciences
4. Cinéma & séries
5. Jeux vidéo
6. Musique
7. Tech
8. Sport
9. Années 90/2000
10. Insolite

Le mode « Culture générale » reste un mode transversal qui mélange toutes les catégories ; ce n’est pas une catégorie supplémentaire.

Chaque catégorie contient exactement **50 questions** :

- 12 Facile
- 14 Normal
- 14 Difficile
- 10 Expert

Total : 50 × 10 = 500 questions.

## Formats de réponse

Conserver les trois modes de la V3 :

- **QCM** : quatre propositions, une bonne réponse.
- **Réponse libre** : saisie texte avec tolérance B.
- **Mixte** : alternance automatisée des deux formats dans une partie.

Tolérance B :

- casse ignorée ;
- accents ignorés ;
- ponctuation et tirets normalisés ;
- variantes explicitement autorisées acceptées ;
- pas de correspondance floue large qui accepterait une réponse incorrecte seulement parce qu’elle ressemble à la bonne.

## Structure des données

Les 500 questions doivent être réparties en **10 fichiers de catégorie**, un par catégorie, afin d’éviter un fichier monolithique et de faciliter les futures extensions vers 1000 questions ou davantage.

Structure cible indicative :

```text
questions/
  histoire.js
  geographie.js
  sciences.js
  cinema.js
  jeux.js
  musique.js
  tech.js
  sport.js
  retro.js
  insolite.js
```

Chaque pack expose ou ajoute ses questions à la banque globale selon le mécanisme retenu dans le plan d’implémentation. Le moteur doit pouvoir continuer à travailler avec une collection globale `QUESTIONS` sans dépendre de la manière dont les packs sont organisés physiquement.

## Compatibilité moteur

À préserver :

- sélection Culture générale / Par catégorie ;
- choix de difficulté ;
- choix 5 / 10 / 20 questions ;
- QCM / réponse libre / mixte ;
- score, série et statistiques locales ;
- historique des questions vues ;
- anti-répétition ;
- nouveau cycle lorsqu’un stock est épuisé ;
- absence de doublon dans une même partie ;
- explication après réponse ;
- fonctionnement hors ligne.

## Anti-répétition

Le système continue d’utiliser un identifiant unique par question. Une question déjà vue ne doit pas être reproposée dans le même scope tant qu’il reste des questions inédites disponibles.

Avec 500 questions, le comportement attendu est :

- Culture générale : rotation sur l’ensemble des 500 questions ;
- Par catégorie : rotation sur les 50 questions de la catégorie choisie ;
- lorsqu’un stock est épuisé, un nouveau cycle démarre ;
- aucune question ne peut apparaître deux fois dans la même partie.

## Qualité des questions

Chaque question doit respecter les règles suivantes :

- identifiant unique ;
- catégorie valide ;
- difficulté valide ;
- quatre choix QCM ;
- index de bonne réponse valide ;
- explication courte et utile ;
- formulation non ambiguë ;
- pas de doublon exact ou quasi doublon évident dans la banque ;
- réponse libre compatible avec la bonne réponse QCM ;
- variantes `accepted` ajoutées uniquement lorsqu’elles sont réellement utiles.

## Tests et validation

La V4 doit être vérifiée au minimum sur les points suivants :

1. exactement 500 questions ;
2. exactement 50 questions par catégorie ;
3. répartition 12/14/14/10 par difficulté dans chaque catégorie ;
4. tous les IDs sont uniques ;
5. toutes les questions ont quatre options et une bonne réponse valide ;
6. la tolérance B fonctionne toujours ;
7. QCM, réponse libre et mixte lancent une partie complète ;
8. l’anti-répétition fonctionne ;
9. aucune erreur JavaScript au chargement et pendant une partie ;
10. aucun débordement horizontal sur les largeurs mobiles de référence 360 px et 393 px ;
11. le décor d’accueil ne contient aucun élément UI pré-incrusté susceptible de créer des doublons visuels.

## Hors périmètre de cette V4

- compte utilisateur ;
- backend ou Supabase ;
- classement en ligne ;
- multijoueur ;
- APK native ;
- sons avancés ;
- nouveaux modes de jeu supplémentaires.

Ces sujets restent possibles plus tard, mais ne doivent pas compliquer cette passe.

## Critère de réussite

La V4 est validée lorsque le jeu reprend exactement la direction visuelle entrepôt néon approuvée par l’utilisateur, fonctionne comme la V3 sur mobile, et propose une banque stable de 500 questions équilibrées, sans répétitions prématurées ni régression des trois types de réponse.
