# Quiz Libre V3 Answer Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add QCM, free-response and mixed answer modes to Quiz Libre while expanding the embedded bank from 80 to exactly 180 questions.

**Architecture:** Keep the V2 neon UI and existing anti-repeat/localStorage model. Extend the question factory with optional accepted aliases, add pure normalization/matching helpers, assign an answer type per session, and render either QCM buttons or a free-response form in the same answer zone. Expand `questions.js` to 18 questions per category and strengthen the browser self-test.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, localStorage, no external dependencies.

## Global Constraints

- Base branch: `v2-premium-neon-build`; implementation branch: `v3-answer-modes-180q`.
- Preserve existing `quizlibre_stats_v1` and `quizlibre_used_v1_*` localStorage keys.
- Keep the V2 neon mobile-first visual identity.
- Answer modes: `qcm`, `free`, `mixed`.
- Free matching is tolerant level B: case/accent/punctuation/spacing normalization plus explicit aliases; no fuzzy typo matching.
- Exactly 180 questions total; exactly 18 per each of 10 categories; IDs unique.
- Every question retains four QCM options and a valid canonical answer index.
- No backend, account, API, multiplayer, timer, PWA or APK work in this version.

---

### Task 1: Add answer-mode controls and free-response UI shell

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

**Interfaces:**
- Produces: `#answerMode`, `#freeAnswerWrap`, `#freeAnswerInput`, `#freeAnswerBtn`, `#answerTypeBadge`.

- [ ] Add a `Type de réponse` selector with `qcm`, `free`, and `mixed` options in the run setup.
- [ ] Add the hidden free-response form inside the existing answer zone and an answer-type badge in question metadata.
- [ ] Add responsive neon styles for the input, validation button, locked states, and three-column setup on wider screens.
- [ ] Verify the page has no horizontal overflow at 360 px and 393 px.

### Task 2: Implement tolerant answer matching and answer-mode session logic

**Files:**
- Modify: `app.js`

**Interfaces:**
- Produces: `normalizeAnswer(value) -> string`, `acceptedAnswers(question) -> string[]`, `isFreeAnswerCorrect(question,input) -> boolean`, `assignAnswerTypes(length,mode) -> string[]`.

- [ ] Add normalization that lowercases, removes diacritics, converts apostrophes/dashes to spaces, removes punctuation, and collapses whitespace.
- [ ] Add alias matching using canonical `opts[a]` plus optional `accepted` values.
- [ ] Add per-session answer types: all QCM, all free, or approximately 50/50 shuffled for mixed mode.
- [ ] Render QCM or free-response controls for each question without changing anti-repeat selection.
- [ ] Support Enter submission, reject empty input, allow one attempt, and reuse the existing feedback/score/streak/next flow.
- [ ] Update self-test to validate answer-mode controls and matching behavior.

### Task 3: Expand and validate the question bank

**Files:**
- Modify: `questions.js`

**Interfaces:**
- Extend `Q(id,cat,diff,q,opts,a,ex,accepted=[])`.
- Produces exactly 180 valid question records.

- [ ] Keep the existing 80 questions unchanged where possible and add 10 new questions per category.
- [ ] Distribute additions across easy, normal, hard and expert difficulty.
- [ ] Add explicit `accepted` aliases where free-response wording could reasonably vary.
- [ ] Verify exactly 18 questions per category, 180 unique IDs, valid indices, four options per question, and non-empty aliases.

### Task 4: End-to-end verification and test artifact

**Files:**
- Create: standalone test artifact from current `index.html`, `styles.css`, `questions.js`, and `app.js`.

**Interfaces:**
- Produces: a single self-contained V3 HTML file for Android testing.

- [ ] Run structural JavaScript checks for question count/category distribution/IDs/aliases.
- [ ] Run normalization tests including `Napoléon`, punctuation/case variants, and rejection of `Napoléon Bonapart` unless explicitly aliased.
- [ ] Run browser flow checks for QCM-only, free-only, and mixed sessions through results.
- [ ] Verify Enter submission and empty-answer rejection.
- [ ] Verify no JS console errors and no horizontal overflow at 360 px and 393 px.
- [ ] Push final V3 files to `v3-answer-modes-180q` and provide the standalone test file to the user.
