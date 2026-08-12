const fs=require('fs');
const assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
const css=fs.existsSync('v4-1.css')?fs.readFileSync('v4-1.css','utf8'):'';

const requiredIds=['gameCounter','progress','scoreMini','categoryBadge','answerTypeBadge','difficultyBadge','questionText','answers','freeAnswerWrap','feedback','nextBtn','streak','bigScore','resultMessage','resultPercent','resultStreak','resultPoints','replayBtn','backBtn'];
requiredIds.forEach(id=>assert(html.includes(`id="${id}"`),`missing DOM id ${id}`));
['gameStage','gameHud','gameQuestionCard','resultStage','resultCardV41'].forEach(cls=>assert(html.includes(cls),`missing class ${cls}`));
assert(html.includes('href="v4-1.css"'),'v4-1.css not loaded');
['.gameStage','.gameHud','.gameQuestionCard','.answer.correct','.answer.wrong','.freeAnswerWrap.correct','.freeAnswerWrap.wrong','.resultStage','.resultCardV41','.resultGrid','.bigScore','.replayPrimary'].forEach(sel=>assert(css.includes(sel),`missing CSS selector ${sel}`));
assert(css.includes('@media (prefers-reduced-motion: reduce)'),'missing reduced-motion support');
assert(css.includes("assets/warehouse-neon.jpg"),'warehouse background not reused');
console.log('OK: V4.1 DOM/CSS contracts present');
