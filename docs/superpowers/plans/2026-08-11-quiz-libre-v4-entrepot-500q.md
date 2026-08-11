# Quiz Libre V4 — Entrepôt néon + 500 questions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire de la DA entrepôt néon validée la base officielle de Quiz Libre et étendre la banque à exactement 500 questions sans régression des modes QCM, réponse libre et mixte.

**Architecture:** Conserver le moteur V3 et son API globale `QUESTIONS`, mais déplacer les données vers 10 packs de catégorie qui alimentent cette collection. L’accueil utilise une image de décor vierge et tous les éléments d’interface restent en HTML/CSS. Un build autonome assemble les assets pour le fichier de test mobile.

**Tech Stack:** HTML5, CSS3, JavaScript vanilla, localStorage, Node.js pour les tests/build, navigateur Chromium pour la validation mobile.

## Global Constraints

- Exactement 500 questions.
- Exactement 50 questions par catégorie.
- Dans chaque catégorie : 12 `easy`, 14 `normal`, 14 `hard`, 10 `expert`.
- 10 catégories : histoire, geographie, sciences, cinema, jeux, musique, tech, sport, retro, insolite.
- Culture générale reste un mode transversal, pas une 11e catégorie.
- Conserver QCM, réponse libre tolérance B et mixte.
- Conserver anti-répétition, stats, historique local et fonctionnement hors ligne.
- Aucun texte, statistique, bouton ou cadre ne doit être pré-incrusté dans le décor d’accueil.
- Mobile-first, sans débordement horizontal à 360 px et 393 px.

---

### Task 1: Verrouiller la validation de la banque V4

**Files:**
- Create: `tests/questions-v4.test.js`
- Create: `questions/index.js`
- Create: `questions/histoire.js`
- Create: `questions/geographie.js`
- Create: `questions/sciences.js`
- Create: `questions/cinema.js`
- Create: `questions/jeux.js`
- Create: `questions/musique.js`
- Create: `questions/tech.js`
- Create: `questions/sport.js`
- Create: `questions/retro.js`
- Create: `questions/insolite.js`

**Interfaces:**
- Produces: global `QUESTIONS` array with objects `{id,cat,diff,q,opts,a,ex,accepted}`.

- [ ] **Step 1: Écrire le test qui exige 500 questions, 50 par catégorie, la répartition 12/14/14/10, quatre options et des IDs uniques.**
- [ ] **Step 2: Exécuter `node tests/questions-v4.test.js` et vérifier qu’il échoue sur la banque V3.**
- [ ] **Step 3: Migrer les 180 questions existantes dans les 10 packs puis ajouter les 320 nouvelles questions nécessaires.**
- [ ] **Step 4: Exécuter `node tests/questions-v4.test.js` et obtenir zéro erreur.**
- [ ] **Step 5: Commit `feat: expand quiz bank to 500 questions`.**

### Task 2: Intégrer la DA entrepôt néon validée

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Create: `assets/warehouse-neon.jpg`

**Interfaces:**
- Consumes: le moteur V3 existant et les IDs DOM actuels.
- Produces: accueil visuel validé sans changement des contrats JS.

- [ ] **Step 1: Ajouter un test DOM qui exige les IDs du moteur et vérifie que le décor est un asset séparé sans UI incrustée.**
- [ ] **Step 2: Exécuter le test et vérifier l’échec avec l’accueil V3.**
- [ ] **Step 3: Reprendre la composition validée : décor vierge, titre néon, statistiques HTML, cartes de mode, réglages et progression.**
- [ ] **Step 4: Vérifier que tous les IDs utilisés par `app.js` existent toujours.**
- [ ] **Step 5: Commit `feat: adopt validated neon warehouse home`.**

### Task 3: Brancher les packs sans modifier le comportement du moteur

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Keep: `answer-utils.js`

**Interfaces:**
- Consumes: global `QUESTIONS` créé par `questions/index.js`.
- Produces: même comportement `buildPool()`, `makeSession()`, QCM/libre/mixte et localStorage.

- [ ] **Step 1: Écrire un test de câblage qui charge les 10 packs et lance une session générale et une session par catégorie.**
- [ ] **Step 2: Vérifier que le test échoue avant le nouveau câblage.**
- [ ] **Step 3: Remplacer les anciens scripts de données par les 10 packs + `questions/index.js`.**
- [ ] **Step 4: Exécuter les tests moteur et réponse libre existants.**
- [ ] **Step 5: Commit `refactor: load question bank from category packs`.**

### Task 4: Produire le build autonome de test

**Files:**
- Create: `scripts/build-standalone.js`
- Create: `dist/quiz-libre-v4-test.html`

**Interfaces:**
- Consumes: `index.html`, CSS, décor et scripts de la V4.
- Produces: un HTML unique utilisable hors ligne sur Android.

- [ ] **Step 1: Écrire un test build qui exige un seul HTML sans dépendance locale externe.**
- [ ] **Step 2: Vérifier l’échec avant le script de build.**
- [ ] **Step 3: Implémenter l’assemblage CSS, image en data URI et JavaScript dans le HTML final.**
- [ ] **Step 4: Exécuter le build puis revalider les 500 questions dans le fichier autonome.**
- [ ] **Step 5: Commit `build: add standalone V4 test artifact`.**

### Task 5: Validation navigateur mobile

**Files:**
- Create: `tests/browser-v4.js`

**Interfaces:**
- Consumes: `dist/quiz-libre-v4-test.html`.
- Produces: preuve de fonctionnement sur 360 px et 393 px.

- [ ] **Step 1: Charger le build dans Chromium et vérifier `data-selftest="ok"`.**
- [ ] **Step 2: Tester une partie QCM complète, une réponse libre et un run mixte.**
- [ ] **Step 3: Vérifier `scrollWidth <= clientWidth` à 360 px et 393 px.**
- [ ] **Step 4: Vérifier zéro erreur JavaScript console.**
- [ ] **Step 5: Commit `test: verify V4 mobile flows`.**

## Self-review

- La spec est couverte : DA, 500 questions, répartition, packs, réponse libre B, anti-répétition, offline et mobile.
- Aucun placeholder `TBD`/`TODO`.
- `QUESTIONS` reste le contrat commun entre données et moteur.
- Aucun backend, compte, classement ou APK ajouté dans cette V4.
