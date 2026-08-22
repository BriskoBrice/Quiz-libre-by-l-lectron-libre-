const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.resolve(__dirname,'..');
const baseFiles=[
  'questions/index.js','questions/histoire.js','questions/geographie.js','questions/sciences.js',
  'questions/cinema.js','questions/jeux.js','questions/musique.js','questions/tech.js',
  'questions/sport.js','questions/retro.js','questions/insolite.js'
];
const v7Files=[
  'questions/v7-histoire.js','questions/v7-geographie.js','questions/v7-sciences.js',
  'questions/v7-cinema.js','questions/v7-jeux.js','questions/v7-musique.js','questions/v7-tech.js',
  'questions/v7-sport.js','questions/v7-retro.js','questions/v7-insolite.js'
];
const files=baseFiles.concat(v7Files.filter(f=>fs.existsSync(path.join(root,f))));
const source=files.map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
const ctx={};
vm.createContext(ctx);
vm.runInContext(source,ctx);
const questions=vm.runInContext('QUESTIONS',ctx);
const categories=vm.runInContext('CATEGORIES',ctx);

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

assert(questions.length===1000,`Expected 1000 questions, got ${questions.length}`);
assert(new Set(questions.map(q=>q.id)).size===1000,'Question IDs must be unique');

for(const [cat] of Object.entries(categories)){
  const list=questions.filter(q=>q.cat===cat);
  const count={easy:0,normal:0,hard:0,expert:0};
  for(const q of list) count[q.diff]=(count[q.diff]||0)+1;
  assert(list.length===100,`${cat}: expected 100 questions, got ${list.length}`);
  assert(count.easy===24&&count.normal===28&&count.hard===28&&count.expert===20,
    `${cat}: expected 24/28/28/20, got ${count.easy}/${count.normal}/${count.hard}/${count.expert}`);
}

for(const q of questions){
  assert(categories[q.cat],`${q.id}: unknown category ${q.cat}`);
  assert(['easy','normal','hard','expert'].includes(q.diff),`${q.id}: invalid difficulty`);
  assert(typeof q.q==='string'&&q.q.trim(),`${q.id}: empty question`);
  assert(Array.isArray(q.opts)&&q.opts.length===4,`${q.id}: must have 4 options`);
  assert(new Set(q.opts.map(normalize)).size===4,`${q.id}: duplicate/equivalent options`);
  assert(Number.isInteger(q.a)&&q.a>=0&&q.a<4,`${q.id}: invalid answer index`);
  assert(typeof q.ex==='string'&&q.ex.trim(),`${q.id}: explanation required`);
  assert(q.accepted===undefined||Array.isArray(q.accepted),`${q.id}: accepted aliases must be an array`);
}

const normalizedQuestions=new Map();
for(const q of questions){
  const key=normalize(q.q);
  assert(!normalizedQuestions.has(key),`${q.id}: exact normalized duplicate of ${normalizedQuestions.get(key)}`);
  normalizedQuestions.set(key,q.id);
}

console.log('OK: Quiz Libre V7 bank = 1000 questions, 100/category, 24/28/28/20, unique IDs and structurally valid items');
