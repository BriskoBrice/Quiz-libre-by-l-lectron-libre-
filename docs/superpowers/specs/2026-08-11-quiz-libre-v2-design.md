# Quiz Libre V2 — Design

## Objectif
Transformer la V1 fonctionnelle en une interface de vrai jeu mobile, plus premium et plus marquée, tout en conservant le moteur de quiz, la banque de 80 questions et la sauvegarde locale existants.

## Direction visuelle
- Thème sombre premium.
- Palette néon violet / cyan / bleu électrique.
- Petite touche arcade via une grille de fond, des halos, des contours lumineux et des micro-animations.
- Aucun asset externe obligatoire afin de garder le projet léger et fonctionnel hors ligne.
- Lisibilité mobile prioritaire.

## Écran d’accueil
- Hero plus spectaculaire avec badge de version, décor lumineux et meilleure hiérarchie.
- Statistiques présentées comme des modules de HUD.
- Cartes de mode plus profondes et plus ludiques.
- Réglages regroupés dans un panneau de préparation de partie plus premium.
- Progression locale plus discrète.

## Écran de jeu
- Barre de progression stylée comme un HUD.
- Carte question avec effet de profondeur et accent lumineux.
- Réponses plus grandes, tactiles et visuelles, avec états correct / incorrect renforcés.
- Série et feedback mieux intégrés.

## Écran de résultat
- Score central plus spectaculaire.
- Statistiques finales sous forme de cartes.
- CTA de revanche plus visible.

## Contraintes
- Pas de dépendance externe.
- Pas de changement de structure des données de questions.
- Pas de rupture de compatibilité avec localStorage V1.
- Conserver les mêmes IDs utilisés par app.js.
- Garder le self-test existant.
- Respecter prefers-reduced-motion.

## Critères de validation
- L’interface doit sembler nettement plus riche que la V1 sur mobile.
- Aucun bouton important ne doit sortir de l’écran sur 360 px de largeur.
- La navigation accueil → quiz → résultat doit rester inchangée fonctionnellement.
- L’anti-répétition et les statistiques doivent continuer de fonctionner.
