(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  if(root) root.AnswerUtils=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  function normalizeAnswer(value){
    return String(value??'')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/[’'`´\-‐‑‒–—―]/g,' ')
      .replace(/[^a-z0-9\s]/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  function acceptedAnswers(question){
    const canonical=question?.opts?.[question?.a];
    const aliases=Array.isArray(question?.accepted)?question.accepted:[];
    return [canonical,...aliases]
      .filter(v=>typeof v==='string'&&v.trim())
      .map(normalizeAnswer)
      .filter(Boolean)
      .filter((v,i,a)=>a.indexOf(v)===i);
  }

  function isFreeAnswerCorrect(question,input){
    const normalized=normalizeAnswer(input);
    if(!normalized) return false;
    return acceptedAnswers(question).includes(normalized);
  }

  function shuffle(values){
    const out=[...values];
    for(let i=out.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [out[i],out[j]]=[out[j],out[i]];
    }
    return out;
  }

  function assignAnswerTypes(length,mode){
    const n=Math.max(0,Number(length)||0);
    if(mode==='free') return Array(n).fill('free');
    if(mode==='qcm') return Array(n).fill('qcm');
    const freeCount=Math.floor(n/2);
    return shuffle([
      ...Array(freeCount).fill('free'),
      ...Array(n-freeCount).fill('qcm')
    ]);
  }

  return {normalizeAnswer,acceptedAnswers,isFreeAnswerCorrect,assignAnswerTypes};
});
