# Quiz Libre V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refaire l’habillage de Quiz Libre en direction premium néon + arcade, sans changer le moteur de quiz ni la banque de questions.

**Architecture:** Conserver `questions.js` et la logique métier existante dans `app.js`. Modifier principalement `index.html` pour enrichir la hiérarchie visuelle et `styles.css` pour la nouvelle DA, tout en conservant les IDs utilisés par JavaScript.

**Tech Stack:** HTML5, CSS3, JavaScript vanilla, localStorage.

## Global Constraints

- Aucun framework ni dépendance externe.
- Compatible mobile 360 px et plus.
- Conserver les mêmes IDs fonctionnels utilisés par `app.js`.
- Conserver les clés localStorage V1.
- Conserver le self-test de 80 questions.
- Respecter `prefers-reduced-motion`.

---

### Task 1: Recomposer l’accueil

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

**Interfaces:**
- Consumes: IDs actuels `statAnswered`, `statRate`, `statBest`, `startBtn`, `difficulty`, `count`, `categoryPanel`, `categoryGrid`.
- Produces: nouvelle hiérarchie visuelle sans changement de contrat JavaScript.

- [ ] Mettre à jour le branding V2 et enrichir le hero.
- [ ] Transformer les statistiques en HUD visuel.
- [ ] Renforcer les cartes de mode et le panneau de réglages.
- [ ] Vérifier qu’aucun ID fonctionnel n’a été supprimé.

### Task 2: Refaire l’écran de jeu

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `gameCounter`, `progress`, `scoreMini`, `categoryBadge`, `difficultyBadge`, `questionText`, `answers`, `feedback`, `nextBtn`, `streak`.
- Produces: HUD et carte de question plus immersifs.

- [ ] Styliser la progression et le score.
- [ ] Donner plus de profondeur à la carte question.
- [ ] Renforcer les états des réponses correctes et incorrectes.
- [ ] Ajouter des micro-animations CSS non bloquantes.

### Task 3: Refaire l’écran de résultat

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

**Interfaces:**
- Consumes: IDs de résultat existants.
- Produces: résultat plus spectaculaire sans changement logique.

- [ ] Mettre le score au centre de la composition.
- [ ] Styliser les trois statistiques finales.
- [ ] Renforcer le bouton revanche.

### Task 4: Vérification

**Files:**
- Verify: `index.html`
- Verify: `styles.css`
- Verify: `app.js`
- Verify: `questions.js`

**Interfaces:**
- Consumes: structure finale de la V2.
- Produces: confirmation que le moteur V1 reste compatible.

- [ ] Vérifier la présence de tous les IDs utilisés par `app.js`.
- [ ] Vérifier que `QUESTIONS.length === 80` et le self-test restent inchangés.
- [ ] Vérifier les règles mobiles 360 px et `prefers-reduced-motion`.
- [ ] Ouvrir une pull request V2 vers `main` pour comparaison avant fusion.
