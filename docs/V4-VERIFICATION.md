# Quiz Libre V4 — vérification avant fusion

Vérification effectuée avant fusion de `v4-entrepot-500q` vers `main`.

- Banque : 500 questions.
- Catégories : 10 × 50 questions.
- Difficultés par catégorie : 12 facile, 14 normal, 14 difficile, 10 expert.
- IDs et formulations normalisées uniques.
- Réponse libre : tolérance B préservée.
- Modes : QCM, réponse libre et mixte validés.
- Mobile : validation Chromium à 360 px et 393 px sans débordement horizontal.
- Direction visuelle : décor entrepôt néon séparé de l’interface HTML/CSS.
- Build autonome : script et test intégrés au dépôt.

Commandes de référence :

```bash
node tests/questions-v4.test.js
node tests/answer-utils-v4.test.js
node scripts/build-standalone.js
node tests/build-v4.test.js
python tests/browser-v4.py dist/quiz-libre-v4-test.html
```
