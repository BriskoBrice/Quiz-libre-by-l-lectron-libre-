const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'android/app/src/main/assets/www');
const files=[
  'index.html','styles.css','v3.css','v4.css','v4-1.css','app.js','answer-utils.js',
  'assets/warehouse-neon.jpg',
  'questions/index.js','questions/histoire.js','questions/geographie.js','questions/sciences.js',
  'questions/cinema.js','questions/jeux.js','questions/musique.js','questions/tech.js',
  'questions/sport.js','questions/retro.js','questions/insolite.js'
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
  }else{
    fs.copyFileSync(src,dest);
  }
}
console.log(`Synced ${files.length} web assets to ${path.relative(root,out)}`);
