# Quiz Libre V4.1 — Game & Results Neon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prolonger la DA entrepôt néon de l’accueil dans les écrans de jeu et de résultat sans modifier le moteur, la banque de 500 questions ni les règles.

**Architecture:** Ajouter un fichier `v4-1.css` ciblé et enrichir légèrement le HTML avec des couches décoratives non fonctionnelles. `app.js` ne reçoit que des hooks de classes de feedback/entrée ; toute la sélection des questions, le scoring et la tolérance B restent intacts. Le build autonome doit inclure ce nouveau CSS.

**Tech Stack:** HTML5, CSS3, JavaScript vanilla, localStorage, Node.js pour tests/build, Chromium pour vérification mobile.

## Global Constraints

- 500 questions inchangées.
- 10 catégories inchangées.
- QCM, réponse libre et mixte inchangés.
- Tolérance B inchangée.
- Anti-répétition et statistiques locales inchangés.
- Aucun débordement horizontal à 360 px et 393 px.
- Fonctionnement hors ligne conservé.
- Aucun nouveau framework ou dépendance runtime.
- Le décor ne doit jamais contenir de texte ou UI pré-incrustés.
- Respect de `prefers-reduced-motion`.

---

### Task 1: Verrouiller les contrats DOM et visuels V4.1

**Files:**
- Create: `tests/v4-1-ui.test.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: IDs actuels de `app.js` (`gameCounter`, `progress`, `scoreMini`, `questionText`, `answers`, `freeAnswerWrap`, `feedback`, `nextBtn`, `streak`, `bigScore`, `resultMessage`, `resultPercent`, `resultStreak`, `resultPoints`, `replayBtn`, `backBtn`).
- Produces: classes `gameStage`, `gameHud`, `gameQuestionCard`, `resultStage`, `resultCardV41` et couches décoratives `.warehouseBackdrop` sans suppression d’ID.

- [ ] **Step 1: Écrire le test DOM** qui charge `index.html`, vérifie tous les IDs moteur et exige les nouvelles classes V4.1.
- [ ] **Step 2: Exécuter `node tests/v4-1-ui.test.js`** ; attendu : échec car les classes V4.1 n’existent pas encore.
- [ ] **Step 3: Modifier `index.html`** pour ajouter uniquement des wrappers/classes décoratifs autour des écrans jeu/résultat et charger `<link rel="stylesheet" href="v4-1.css" />` après `v4.css`.
- [ ] **Step 4: Relancer `node tests/v4-1-ui.test.js`** ; attendu : PASS.
- [ ] **Step 5: Commit** `feat: add V4.1 game and result structure`.

### Task 2: Habiller l’écran de question

**Files:**
- Create: `v4-1.css`
- Test: `tests/v4-1-ui.test.js`

**Interfaces:**
- Consumes: classes ajoutées à Task 1 et variables CSS existantes.
- Produces: HUD néon, fond entrepôt assombri, carte verre/métal, réponses tactiles, feedbacks bonne/mauvaise réponse, styles libre/mixte et media query reduced motion.

- [ ] **Step 1: Étendre le test** pour exiger dans `v4-1.css` les sélecteurs `.gameStage`, `.gameHud`, `.gameQuestionCard`, `.answer.correct`, `.answer.wrong`, `.freeAnswerWrap.correct`, `.freeAnswerWrap.wrong`, et `@media (prefers-reduced-motion: reduce)`.
- [ ] **Step 2: Exécuter le test** ; attendu : échec car `v4-1.css` n’existe pas.
- [ ] **Step 3: Créer `v4-1.css`** avec un fond réutilisant `assets/warehouse-neon.jpg`, des overlays CSS, un HUD compact, carte question sombre et réponses néon sans modifier l’accessibilité ni la taille tactile.
- [ ] **Step 4: Relancer le test** ; attendu : PASS.
- [ ] **Step 5: Commit** `feat: style V4.1 neon game screen`.

### Task 3: Ajouter les micro-animations de feedback sans toucher au moteur

**Files:**
- Modify: `app.js`
- Create: `tests/v4-1-hooks.test.js`

**Interfaces:**
- Consumes: `renderQuestion()`, `answer()`, `submitFreeAnswer()`, `recordOutcome()`.
- Produces: classes temporaires `is-entering`, `is-correct`, `is-wrong` sur `.gameQuestionCard` / `#gameScreen` uniquement.

- [ ] **Step 1: Écrire le test** qui exige les hooks de classes et vérifie que les fonctions de sélection `buildPool()` / `makeSession()` ne sont pas modifiées par la passe.
- [ ] **Step 2: Exécuter le test** ; attendu : échec sur les hooks absents.
- [ ] **Step 3: Ajouter les hooks minimaux** : `renderQuestion()` déclenche `is-entering`; `recordOutcome(ok, ...)` applique `is-correct` ou `is-wrong`; les classes sont retirées par timeout court. Aucun calcul de score ou réponse n’est changé.
- [ ] **Step 4: Relancer les tests V4 existants** `node tests/questions-v4.test.js`, `node tests/answer-utils-v4.test.js`, `node tests/wiring-v4.test.js` plus le nouveau test hooks.
- [ ] **Step 5: Commit** `feat: add lightweight answer feedback motion`.

### Task 4: Habiller l’écran de résultat

**Files:**
- Modify: `v4-1.css`
- Test: `tests/v4-1-ui.test.js`

**Interfaces:**
- Consumes: `resultStage`, `resultCardV41`, IDs résultat existants.
- Produces: résultat cohérent avec l’entrepôt, score central, modules de stats lumineux et boutons harmonisés.

- [ ] **Step 1: Étendre le test** pour exiger `.resultStage`, `.resultCardV41`, `.resultGrid`, `.bigScore`, `.replayPrimary` dans `v4-1.css`.
- [ ] **Step 2: Exécuter le test** ; attendu : échec sur les sélecteurs résultat manquants.
- [ ] **Step 3: Ajouter les styles résultat** avec fond assombri, halo central, score très lisible, statistiques en trois tuiles, CTA principal et secondaire.
- [ ] **Step 4: Relancer le test** ; attendu : PASS.
- [ ] **Step 5: Commit** `feat: style V4.1 neon results screen`.

### Task 5: Mettre à jour le build autonome et vérifier mobile

**Files:**
- Modify: `scripts/build-standalone.js`
- Modify: `tests/browser-v4.py`
- Produce locally: `/mnt/data/quiz_libre_v4_1_neon_test.html`

**Interfaces:**
- Consumes: `index.html`, `styles.css`, `v3.css`, `v4.css`, `v4-1.css`, image et scripts/questions.
- Produces: un HTML autonome V4.1 testable sur Android.

- [ ] **Step 1: Étendre le test build** pour exiger que `v4-1.css` soit inline dans l’artefact et qu’aucune dépendance locale externe ne reste.
- [ ] **Step 2: Exécuter le build/test** ; attendu : échec avant mise à jour du builder.
- [ ] **Step 3: Modifier `scripts/build-standalone.js`** pour inclure `v4-1.css` après `v4.css` et régénérer l’HTML autonome.
- [ ] **Step 4: Exécuter toutes les vérifications** : banque 500, réponse libre B, wiring, UI V4.1, hooks, build, Chromium 360/393 px, QCM/libre/mixte, résultat, zéro erreur console.
- [ ] **Step 5: Commit** `build: add V4.1 standalone neon test`.

## Self-review

- Le scope est limité aux écrans jeu/résultat et micro-animations.
- Aucun comportement métier supplémentaire n’est introduit.
- Tous les IDs moteur sont conservés.
- Le build autonome et les tests mobiles sont inclus dans le plan.
- Aucun placeholder ou dépendance externe nouvelle.
