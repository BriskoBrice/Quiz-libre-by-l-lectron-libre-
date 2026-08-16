const fs=require('fs');
const assert=require('assert');
const app=fs.readFileSync('app.js','utf8');
assert(app.includes('is-entering'),'missing question entry hook');
assert(app.includes('is-correct'),'missing correct feedback hook');
assert(app.includes('is-wrong'),'missing wrong feedback hook');
assert(app.includes("function buildPool(){return mode==='general'?QUESTIONS:QUESTIONS.filter(q=>q.cat===selectedCat)}"),'buildPool contract changed');
assert(app.includes('function makeSession(requested,target){'),'makeSession missing');
console.log('OK: V4.1 motion hooks present and pool contract retained');
