# Quiz Libre V4.2 — PWA + Vercel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer Quiz Libre V4.1 en PWA installable et hors ligne, puis produire un déploiement HTTPS de test sur Vercel sans modifier le moteur ni les 500 questions.

**Architecture:** Conserver l’application statique actuelle et lui ajouter un manifeste, trois icônes locales, un service worker versionné et un enregistrement non bloquant. Le site reste sans backend et garde ses chemins relatifs pour rester compatible avec un hébergement statique Vercel.

**Tech Stack:** HTML5, CSS3, JavaScript vanilla, Service Worker API, Web App Manifest, localStorage, Node.js/Python pour les tests, Chromium pour la validation mobile.

## Global Constraints

- Conserver exactement 500 questions et les 10 catégories actuelles.
- Ne modifier ni le scoring, ni QCM/libre/mixte, ni l’anti-répétition.
- PWA installable avec `display: standalone` et orientation `portrait-primary`.
- Fonctionnement hors ligne après une première visite réussie.
- Icônes locales 192×192, 512×512 et maskable 512×512.
- Aucun backend, compte, notification push ou synchronisation cloud.
- Mobile-first, sans débordement à 360 px et 393 px.
- Déploiement Vercel de test avant toute fusion dans `main`.

---

### Task 1: Verrouiller les critères PWA

**Files:**
- Create: `tests/pwa-v4-2.test.js`

**Interfaces:**
- Consumes: `index.html`, futurs `manifest.webmanifest` et `service-worker.js`.
- Produces: test statique exigeant manifeste, service worker, références HTML et liste de cache complète.

- [ ] **Step 1: Écrire le test qui exige les fichiers PWA, les champs de manifeste, les 3 icônes et l’enregistrement du service worker.**
- [ ] **Step 2: Exécuter `node tests/pwa-v4-2.test.js` et vérifier l’échec attendu avant implémentation.**
- [ ] **Step 3: Ne modifier aucun fichier de production tant que l’échec n’est pas confirmé.**

### Task 2: Ajouter le manifeste, les icônes et le service worker

**Files:**
- Create: `manifest.webmanifest`
- Create: `service-worker.js`
- Create: `icons/icon-192.png`
- Create: `icons/icon-512.png`
- Create: `icons/icon-maskable-512.png`
- Modify: `index.html`

**Interfaces:**
- Produces: PWA installable et shell pré-caché.

- [ ] **Step 1: Créer le manifeste avec `name`, `short_name`, `start_url`, `scope`, `display`, `orientation`, couleurs et icônes.**
- [ ] **Step 2: Créer les trois PNG à partir de l’identité éclair violet/cyan.**
- [ ] **Step 3: Créer `service-worker.js` avec cache `quiz-libre-v4-2-shell-v1`, pré-cache de tous les fichiers du jeu, nettoyage des vieux caches, navigation network-first avec fallback `index.html`, assets cache-first.**
- [ ] **Step 4: Référencer manifeste, Apple touch icon et enregistrer le service worker dans `index.html` sans bloquer le jeu.**
- [ ] **Step 5: Exécuter `node tests/pwa-v4-2.test.js` et obtenir PASS.**
- [ ] **Step 6: Commit `feat: add installable offline PWA shell`.**

### Task 3: Vérifier hors ligne et non-régression

**Files:**
- Create: `tests/pwa-browser-v4-2.py`
- Keep: tous les tests V4/V4.1 existants.

**Interfaces:**
- Consumes: site statique V4.2.
- Produces: validation navigateur en ligne puis hors ligne.

- [ ] **Step 1: Servir le projet en HTTP local et ouvrir Chromium à 360×800.**
- [ ] **Step 2: Attendre l’activation du service worker puis recharger hors ligne et vérifier `data-selftest="ok"`.**
- [ ] **Step 3: Lancer au moins un run QCM et vérifier l’absence d’erreur console.**
- [ ] **Step 4: Refaire la vérification à 393 px et contrôler `scrollWidth <= clientWidth`.**
- [ ] **Step 5: Relancer les tests de banque, réponse libre, wiring et V4.1.**
- [ ] **Step 6: Commit `test: verify Quiz Libre PWA offline`.**

### Task 4: Déployer une preview Vercel

**Files:**
- Optional create: `vercel.json` uniquement si nécessaire pour servir statiquement la racine.

**Interfaces:**
- Consumes: branche `v4-2-pwa-vercel` validée.
- Produces: URL HTTPS de preview.

- [ ] **Step 1: Retenter l’accès Vercel et identifier équipe/projet existant si disponible.**
- [ ] **Step 2: Déployer la branche/site statique sans promouvoir dans `main`.**
- [ ] **Step 3: Vérifier que `index.html`, `manifest.webmanifest` et `service-worker.js` répondent en HTTPS.**
- [ ] **Step 4: Tester la preview sur mobile/PWA quand l’URL est disponible.**
- [ ] **Step 5: Ne fusionner dans `main` qu’après validation utilisateur.**

## Self-review

- La PWA reste entièrement statique et ne change pas le moteur du quiz.
- Tous les fichiers nécessaires au jeu hors ligne sont explicitement pré-cachés.
- Les critères d’installation Android et de fallback hors ligne sont couverts.
- Aucun placeholder, backend ou fonctionnalité hors périmètre n’est introduit.
