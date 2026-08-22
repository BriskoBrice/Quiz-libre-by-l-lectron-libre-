const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const assert=(c,m)=>{if(!c)throw new Error(m)};

const v7Packs=[
  'v7-histoire.js','v7-geographie.js','v7-sciences.js','v7-cinema.js','v7-jeux.js',
  'v7-musique.js','v7-tech.js','v7-sport.js','v7-retro.js','v7-insolite.js','v7-quality-fixes.js'
];

const gradle=read('android/app/build.gradle.kts');
assert(gradle.includes('applicationId = "fr.electronlibre.quizlibre"'),'applicationId must stay stable');
assert(gradle.includes('versionCode = 4'),'V7 must use versionCode 4');
assert(gradle.includes('versionName = "1.2.0"'),'V7 must use versionName 1.2.0');

const html=read('index.html');
assert(html.includes('1000 QUESTIONS'),'home screen must advertise 1000 questions');
assert(!html.includes('500 QUESTIONS'),'home screen must not advertise the old 500-question count');
for(const f of v7Packs) assert(html.includes(`questions/${f}`),`index.html missing questions/${f}`);

const app=read('app.js');
assert(app.includes('list.length===100'),'browser self-test must expect 100 questions/category');
assert(app.includes('d.easy===24')&&app.includes('d.normal===28')&&app.includes('d.hard===28')&&app.includes('d.expert===20'),'browser self-test must expect V7 difficulty distribution');
assert(app.includes('QUESTIONS.length===1000'),'browser self-test must expect 1000 questions');

const sync=read('scripts/sync-android-assets.js');
for(const f of v7Packs) assert(sync.includes(`questions/${f}`),`Android sync missing questions/${f}`);

const sw=read('service-worker.js');
assert(sw.includes("quiz-libre-v7-shell-v1"),'PWA cache name must be bumped for V7');
for(const f of v7Packs) assert(sw.includes(`/questions/${f}`),`service worker missing /questions/${f}`);

const workflow=read('.github/workflows/android-release.yml');
assert(workflow.includes('node tests/v7-question-bank.test.js'),'Android release CI must validate the 1000-question bank');
assert(workflow.includes('node tests/android-v7.test.js'),'Android release CI must run V7 contract');
assert(workflow.includes('quiz-libre-1.2.0-release-unsigned'),'Android release artifact must use V7 version name');

const manifest=read('android/app/src/main/AndroidManifest.xml');
assert(!manifest.includes('android.permission.INTERNET'),'V7 Android APK must remain fully offline');

console.log('OK: Quiz Libre V7 Android/PWA 1000-question release contract');
