# Quiz Libre V3 — Answer Modes + 180 Questions Design

## Goal

Extend the approved V2 neon build with three answer modes — QCM, free response, and mixed — while preserving the existing anti-repeat system, local progression, scoring flow, and mobile-first visual identity. Expand the embedded question bank from 80 to 180 questions.

## Scope

V3 adds only two functional areas:

1. Answer-mode selection and free-response validation.
2. Question-bank expansion from 80 to 180 questions.

No account system, backend, online API, leaderboard, multiplayer, timer mode, or PWA packaging is added in this version.

## Base

Implementation starts from branch `v2-premium-neon-build` and is developed on `v3-answer-modes-180q`.

The V2 neon UI remains the visual foundation. Existing localStorage keys and anti-repeat history must remain compatible so current user statistics and seen-question history are not lost.

## Answer modes

A new setting named **Type de réponse** is added to the game setup panel with three choices:

- `qcm` — existing four-choice behavior.
- `free` — user types the answer into a text field and validates it.
- `mixed` — each question independently uses QCM or free response, aiming for an approximately balanced split in a session.

The chosen mode applies to the entire session configuration. In mixed mode, each selected question receives a transient session answer type; the question-bank data itself does not need separate QCM/free duplicate records.

## Question data model

Existing question fields remain:

- `id`
- `cat`
- `diff`
- `q`
- `opts`
- `a`
- `ex`

A new optional field `accepted` is added for free-response aliases. The canonical answer remains `opts[a]`.

Example:

```js
Q(
  'H03',
  'histoire',
  'normal',
  'Quel souverain devient empereur des Français en 1804 ?',
  ['Louis XVI','Napoléon Bonaparte','Louis-Philippe','Charles X'],
  1,
  'Napoléon Ier est sacré empereur en décembre 1804.',
  ['Napoléon', 'Napoleon', 'Napoleon Bonaparte']
)
```

For questions without explicit aliases, the canonical answer is sufficient.

## Tolerant free-response matching — Level B

Free responses are tolerant but not fuzzy.

Before comparison, both the user input and accepted answers are normalized by:

- trimming leading/trailing whitespace;
- converting to lowercase;
- removing diacritics/accents;
- normalizing apostrophes and dashes to spaces;
- removing punctuation;
- collapsing repeated whitespace.

The normalized user answer is considered correct only when it exactly matches one normalized accepted answer.

This means `Napoléon`, `napoleon`, and `Napoléon Bonaparte` can all be accepted if provided as aliases, while typo-based approximations such as `Napoléon Bonapart` are not accepted in V3.

No Levenshtein or AI-based fuzzy correction is used.

## Free-response interaction

When a free-response question is shown:

- the four QCM answer buttons are hidden;
- a single text input is displayed;
- a **Valider ma réponse** button is displayed;
- pressing Enter submits the answer;
- empty answers cannot be submitted;
- only one attempt is allowed;
- after submission, the input and submit button are locked;
- the canonical correct answer and the existing explanation are shown;
- the same next-question flow is used as QCM.

A correct free response increments score and streak exactly like a correct QCM answer. An incorrect free response resets the streak exactly like an incorrect QCM answer.

## Mixed mode

Mixed mode should produce a roughly 50/50 QCM/free split without requiring exact parity for odd session sizes.

For each session, answer types are assigned after question selection, shuffled, and stored only for that session. Replaying creates a new mix.

## UI changes

The existing V2 neon design is preserved.

The setup section gains a third field/card for **Type de réponse**. On narrow mobile screens the controls stack cleanly; on wider screens they may share a grid.

The game screen reuses the current question card. QCM and free-response controls occupy the same answer zone so the page does not visually jump between different layouts.

A small badge may indicate `QCM` or `Réponse libre` next to the category/difficulty metadata.

## Question-bank expansion

The bank expands from 80 to exactly **180 questions**.

There remain 10 categories:

- Histoire
- Géographie
- Sciences
- Cinéma & séries
- Jeux vidéo
- Musique
- Tech
- Sport
- Années 90/2000
- Insolite

Each category contains exactly **18 questions**.

The 100 new questions should be distributed across the four existing difficulty levels and written so that free-response mode remains practical. Questions whose canonical answers are unusually ambiguous must include aliases in `accepted`.

All 180 IDs must be unique.

## Anti-repeat compatibility

The existing anti-repeat algorithm remains unchanged in principle: questions are tracked by `id` within the same scope as V2.

Adding new question IDs naturally makes them unseen. Existing seen IDs remain valid. Answer mode does not create additional anti-repeat entries.

## Error handling

- If a free-response submission is empty after trimming, no answer is recorded and the user is prompted to type a response.
- If a question has an invalid canonical answer index, self-test must fail.
- If an alias list is present, every alias must be a non-empty string.
- If the selected pool contains fewer questions than requested, the current fallback/recycle behavior remains in effect.

## Self-test and verification

The V3 self-test must verify:

- exactly 180 questions;
- exactly 18 questions in each of the 10 categories;
- all IDs unique;
- every question has 4 QCM options;
- every answer index is valid;
- every optional `accepted` field is an array of non-empty strings;
- the answer-mode selector exists;
- normalization accepts accent/case/punctuation variants expected by Level B;
- normalization rejects near-miss typos not explicitly listed as aliases.

Manual/mobile verification must cover:

1. QCM-only session to results.
2. Free-response-only session to results.
3. Mixed session containing both answer types.
4. Correct and incorrect free responses.
5. Enter-key submission.
6. Empty-answer rejection.
7. Existing local stats and anti-repeat storage compatibility.
8. No horizontal overflow at 360 px and 393 px widths.

## Success criteria

V3 is successful when the user can choose QCM, free response, or mixed; free-response answers follow the approved tolerant Level B rules; the game reaches results correctly in all three modes; existing progress remains intact; and the embedded bank contains exactly 180 validated questions without duplicate IDs.
