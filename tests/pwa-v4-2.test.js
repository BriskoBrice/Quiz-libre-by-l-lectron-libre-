const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const assert=(cond,msg)=>{if(!cond){throw new Error(msg)}};

const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(index.includes('rel="manifest"'), 'index.html must reference a web manifest');
assert(index.includes('serviceWorker.register'), 'index.html must register the service worker');

const manifestPath=path.join(root,'manifest.webmanifest');
assert(fs.existsSync(manifestPath), 'manifest.webmanifest must exist');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
assert(manifest.name==='Quiz Libre','manifest name must be Quiz Libre');
assert(manifest.short_name==='Quiz Libre','manifest short_name must be Quiz Libre');
assert(manifest.start_url==='/' && manifest.scope==='/', 'manifest start_url/scope must be /');
assert(manifest.display==='standalone','manifest display must be standalone');
assert(manifest.orientation==='portrait-primary','manifest orientation must be portrait-primary');
assert(Array.isArray(manifest.icons) && manifest.icons.length>=3,'manifest must define 3 icons');

for(const file of ['icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png']){
  assert(fs.existsSync(path.join(root,file)), `${file} must exist`);
}

const swPath=path.join(root,'service-worker.js');
assert(fs.existsSync(swPath),'service-worker.js must exist');
const sw=fs.readFileSync(swPath,'utf8');
for(const required of [
  'index.html','styles.css','v3.css','v4.css','v4-1.css','app.js','answer-utils.js',
  'assets/warehouse-neon.jpg','questions/index.js','questions/histoire.js','questions/geographie.js',
  'questions/sciences.js','questions/cinema.js','questions/jeux.js','questions/musique.js','questions/tech.js',
  'questions/sport.js','questions/retro.js','questions/insolite.js','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'
]){
  assert(sw.includes(required),`service worker cache list missing ${required}`);
}

console.log('OK: PWA manifest, icons, service worker registration and offline shell');
