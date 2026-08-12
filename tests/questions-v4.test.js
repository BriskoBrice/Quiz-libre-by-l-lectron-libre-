const fs=require('fs');
const path=require('path');
const vm=require('vm');
const assert=require('assert');

const root=path.resolve(__dirname,'..');
const cats=['histoire','geographie','sciences','cinema','jeux','musique','tech','sport','retro','insolite'];
const context=vm.createContext({console});
for(const file of ['questions/index.js',...cats.map(c=>`questions/${c}.js`)]){
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
}
const questions=vm.runInContext('QUESTIONS',context);
const categories=vm.runInContext('CATEGORIES',context);
assert.equal(questions.length,500,'La banque doit contenir exactement 500 questions');
assert.equal(Object.keys(categories).length,10,'Il doit y avoir exactement 10 catégories');
assert.equal(new Set(questions.map(q=>q.id)).size,500,'Tous les IDs doivent être uniques');
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
assert.equal(new Set(questions.map(q=>norm(q.q))).size,500,'Pas de doublon de formulation normalisée');
for(const cat of cats){
  const list=questions.filter(q=>q.cat===cat);
  assert.equal(list.length,50,`${cat}: 50 questions attendues`);
  const counts={easy:0,normal:0,hard:0,expert:0};
  for(const q of list){
    assert.ok(q.id && typeof q.id==='string',`${cat}: id invalide`);
    assert.ok(counts[q.diff]!==undefined,`${q.id}: difficulté invalide`);
    counts[q.diff]++;
    assert.ok(typeof q.q==='string' && q.q.trim(),`${q.id}: question vide`);
    assert.ok(Array.isArray(q.opts) && q.opts.length===4,`${q.id}: 4 options requises`);
    assert.ok(Number.isInteger(q.a) && q.a>=0 && q.a<4,`${q.id}: index réponse invalide`);
    assert.ok(typeof q.opts[q.a]==='string' && q.opts[q.a].trim(),`${q.id}: bonne réponse vide`);
    assert.ok(typeof q.ex==='string' && q.ex.trim(),`${q.id}: explication vide`);
    assert.ok(Array.isArray(q.accepted),`${q.id}: accepted doit être un tableau`);
  }
  assert.deepStrictEqual(counts,{easy:12,normal:14,hard:14,expert:10},`${cat}: répartition difficulté incorrecte`);
}
console.log('PASS questions-v4: 500 questions, 50/catégorie, 12/14/14/10, IDs et formulations uniques');
