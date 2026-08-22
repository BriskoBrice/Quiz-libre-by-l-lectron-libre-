const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const assert=(c,m)=>{if(!c)throw new Error(m)};

const gradle=read('android/app/build.gradle.kts');
assert(gradle.includes('applicationId = "fr.electronlibre.quizlibre"'),'applicationId must stay stable');
const versionCode=Number((gradle.match(/versionCode\s*=\s*(\d+)/)||[])[1]);
assert(versionCode>=3,'Android updates must never go below versionCode 3');
assert(/versionName\s*=\s*"\d+\.\d+\.\d+"/.test(gradle),'versionName must remain semantic');
assert(gradle.includes('compileSdk = 36'),'compileSdk must remain 36');
assert(gradle.includes('targetSdk = 36'),'targetSdk must remain 36');

const manifest=read('android/app/src/main/AndroidManifest.xml');
assert(!manifest.includes('android.permission.INTERNET'),'Android app must stay fully offline');

console.log('OK: Quiz Libre V6.1+ stable update identity contract');
