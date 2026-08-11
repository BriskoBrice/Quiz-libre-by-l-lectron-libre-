const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let mode='general', selectedCat='histoire', session=[], idx=0, score=0, streak=0, bestSession=0, locked=false;
const storage={
  getStats(){try{return JSON.parse(localStorage.getItem('quizlibre_stats_v1'))||{answered:0,correct:0,best:0}}catch{return{answered:0,correct:0,best:0}}},
  setStats(v){localStorage.setItem('quizlibre_stats_v1',JSON.stringify(v))},
  getUsed(scope){try{return new Set(JSON.parse(localStorage.getItem('quizlibre_used_v1_'+scope))||[])}catch{return new Set()}},
  setUsed(scope,set){localStorage.setItem('quizlibre_used_v1_'+scope,JSON.stringify([...set]))},
  allUsed(){return Object.keys(CATEGORIES).reduce((n,k)=>n+this.getUsed(k).size,0)+this.getUsed('general').size},
  reset(){Object.keys(localStorage).filter(k=>k.startsWith('quizlibre_used_v1_')).forEach(k=>localStorage.removeItem(k))}
};
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function difficultyRank(d){return {easy:0,normal:1,hard:2,expert:3}[d]??1}
function pickWeighted(pool,count,target){if(target==='mixed')return shuffle(pool).slice(0,count);const t=difficultyRank(target);return [...pool].sort((a,b)=>{const da=Math.abs(difficultyRank(a.diff)-t),db=Math.abs(difficultyRank(b.diff)-t);return da-db || Math.random()-.5}).slice(0,count)}
function scopeName(){return mode==='general'?'general':selectedCat}
function buildPool(){return mode==='general'?QUESTIONS:QUESTIONS.filter(q=>q.cat===selectedCat)}
function makeSession(requested,target){
  const pool=buildPool(), scope=scopeName(), used=storage.getUsed(scope), unseen=pool.filter(q=>!used.has(q.id));
  let chosen=pickWeighted(unseen,Math.min(requested,unseen.length),target), recycled=false;
  if(chosen.length<Math.min(requested,pool.length)){
    recycled=true;
    const chosenIds=new Set(chosen.map(q=>q.id));
    const fill=pickWeighted(pool.filter(q=>!chosenIds.has(q.id)),Math.min(requested,pool.length)-chosen.length,target);
    chosen=chosen.concat(fill); used.clear();
  }
  chosen.forEach(q=>used.add(q.id)); storage.setUsed(scope,used);
  if(recycled)toast('♻️ Stock épuisé : nouveau cycle démarré sans doublon dans cette partie.');
  return chosen;
}
function updateStatsUI(){const s=storage.getStats();$('#statAnswered').textContent=s.answered;$('#statRate').textContent=s.answered?Math.round(s.correct/s.answered*100)+'%':'—';$('#statBest').textContent=s.best;$('#seenInfo').textContent=storage.allUsed()+" questions enregistrées comme vues sur cet appareil."}
function renderCategories(){const grid=$('#categoryGrid');grid.innerHTML='';Object.entries(CATEGORIES).forEach(([key,c],i)=>{const b=document.createElement('button');b.className='cat'+(key===selectedCat?' active':'');b.innerHTML=`<span class="emoji">${c.emoji}</span><span><b>${c.name}</b><small>${QUESTIONS.filter(q=>q.cat===key).length} questions test</small></span>`;b.onclick=()=>{selectedCat=key;renderCategories()};grid.appendChild(b)})}
function setMode(m){mode=m;$$('.mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));$('#categoryPanel').classList.toggle('hidden',m!=='category')}
function showScreen(which){['homeScreen','gameScreen','resultScreen'].forEach(id=>$('#'+id).classList.toggle('hidden',id!==which));window.scrollTo({top:0,behavior:'smooth'})}
function startGame(){const count=+$('#count').value,target=$('#difficulty').value;session=makeSession(count,target);if(!session.length)return toast('Aucune question disponible.');idx=0;score=0;streak=0;bestSession=0;locked=false;showScreen('gameScreen');renderQuestion()}
function renderQuestion(){locked=false;const q=session[idx];$('#gameCounter').textContent=`${idx+1}/${session.length}`;$('#progress').style.width=`${idx/session.length*100}%`;$('#scoreMini').textContent=score+' pt';$('#categoryBadge').textContent=CATEGORIES[q.cat].emoji+' '+CATEGORIES[q.cat].name;$('#difficultyBadge').textContent=DNAME[q.diff];$('#questionText').textContent=q.q;$('#feedback').className='feedback hidden';$('#nextBtn').classList.add('hidden');$('#streak').textContent=streak>=2?`🔥 Série de ${streak} bonnes réponses !`:'';const box=$('#answers');box.innerHTML='';q.opts.forEach((opt,i)=>{const b=document.createElement('button');b.className='answer';b.innerHTML=`<span class="letter">${'ABCD'[i]}</span><span>${opt}</span>`;b.onclick=()=>answer(i,b);box.appendChild(b)})}
function answer(choice,button){if(locked)return;locked=true;const q=session[idx],ok=choice===q.a;const buttons=$$('#answers .answer');buttons.forEach((b,i)=>{b.disabled=true;if(i===q.a)b.classList.add('correct')});if(!ok)button.classList.add('wrong');if(ok){score++;streak++;bestSession=Math.max(bestSession,streak)}else streak=0;const f=$('#feedback');f.className='feedback '+(ok?'good':'bad');f.innerHTML=`<b>${ok?'✅ Bonne réponse !':'❌ Raté — '+q.opts[q.a]}</b>${q.ex}`;$('#scoreMini').textContent=score+' pt';$('#streak').textContent=streak>=2?`🔥 Série de ${streak} bonnes réponses !`:'';const stats=storage.getStats();stats.answered++;if(ok)stats.correct++;stats.best=Math.max(stats.best,bestSession);storage.setStats(stats);$('#nextBtn').textContent=idx===session.length-1?'Voir le résultat 🏁':'Question suivante →';$('#nextBtn').classList.remove('hidden')}
function nextQuestion(){if(!locked)return;if(idx<session.length-1){idx++;$('#progress').style.width=`${idx/session.length*100}%`;renderQuestion()}else finish()}
function finish(){showScreen('resultScreen');const pct=Math.round(score/session.length*100);$('#bigScore').textContent=`${score}/${session.length}`;$('#resultPercent').textContent=pct+'%';$('#resultStreak').textContent=bestSession;$('#resultPoints').textContent=score*100;$('#resultIcon').textContent=pct===100?'👑':pct>=80?'🏆':pct>=60?'😎':pct>=40?'🧠':'🫠';$('#resultMessage').textContent=pct===100?'Parfait. Là, tu viens de plier la banque 😏':pct>=80?'Très solide ! On monte la difficulté ?':pct>=60?'Pas mal du tout. Encore une série et ça grimpe.':pct>=40?'Il y a du potentiel, on repart sur des nouvelles questions.':'Échauffement terminé 😜 La revanche est juste dessous.';$('#progress').style.width='100%';updateStatsUI()}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._to);t._to=setTimeout(()=>t.classList.remove('show'),2800)}
function goHome(){showScreen('homeScreen');updateStatsUI()}
$$('.mode').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));$('#startBtn').onclick=startGame;$('#nextBtn').onclick=nextQuestion;$('#homeBtn').onclick=goHome;$('#backBtn').onclick=goHome;$('#replayBtn').onclick=startGame;$('#resetBtn').onclick=()=>{if(confirm('Effacer uniquement l’historique des questions vues ? Les statistiques de score restent conservées.')){storage.reset();updateStatsUI();toast('Historique des questions vues remis à zéro.')}};
renderCategories();updateStatsUI();

// Auto-tests très légers du prototype : structure de la banque + cohérence des réponses.
(function selfTest(){
  const unique=new Set(QUESTIONS.map(q=>q.id)).size===QUESTIONS.length;
  const valid=QUESTIONS.every(q=>CATEGORIES[q.cat]&&DNAME[q.diff]&&q.opts.length===4&&Number.isInteger(q.a)&&q.a>=0&&q.a<4&&q.opts[q.a]);
  const cats=Object.keys(CATEGORIES).every(c=>QUESTIONS.filter(q=>q.cat===c).length===8);
  document.documentElement.dataset.selftest=(unique&&valid&&cats&&QUESTIONS.length===80)?'ok':'fail';
})();
