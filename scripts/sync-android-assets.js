const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'android/app/src/main/assets/www');
const files=[
  'index.html','styles.css','v3.css','v4.css','v4-1.css','app.js','answer-utils.js',
  'assets/warehouse-neon.jpg',
  'questions/index.js','questions/histoire.js','questions/geographie.js','questions/sciences.js',
  'questions/cinema.js','questions/jeux.js','questions/musique.js','questions/tech.js',
  'questions/sport.js','questions/retro.js','questions/insolite.js',
  'questions/v7-histoire.js','questions/v7-geographie.js','questions/v7-sciences.js',
  'questions/v7-cinema.js','questions/v7-jeux.js','questions/v7-musique.js','questions/v7-tech.js',
  'questions/v7-sport.js','questions/v7-retro.js','questions/v7-insolite.js','questions/v7-quality-fixes.js'
];
fs.rmSync(out,{recursive:true,force:true});
for(const rel of files){
  const src=path.join(root,rel);
  if(!fs.existsSync(src)) throw new Error(`Missing required web asset: ${rel}`);
  const dest=path.join(out,rel);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  if(rel==='index.html'){
    let html=fs.readFileSync(src,'utf8');
    html=html.replace(/\n?<link rel="manifest"[^>]*>\s*/g,'\n');
    html=html.replace(/\n?<link rel="apple-touch-icon"[^>]*>\s*/g,'\n');
    html=html.replace(/\n?<script>\s*if\('serviceWorker' in navigator\)[\s\S]*?<\/script>\s*(?=<\/body>)/m,'\n');
    fs.writeFileSync(dest,html);
  }else if(rel==='v4.css'){
    let css=fs.readFileSync(src,'utf8');
    css+='\n/* Android shell V6+: lift hero content without changing PWA */\n@media(max-width:480px){.cleanHero{padding-top:245px}}\n';
    fs.writeFileSync(dest,css);
  }else{
    fs.copyFileSync(src,dest);
  }
}
console.log(`Synced ${files.length} web assets to ${path.relative(root,out)}`);
