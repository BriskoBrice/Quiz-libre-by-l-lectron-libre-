const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const assert=(c,m)=>{if(!c)throw new Error(m)};

const gradle=read('android/app/build.gradle.kts');
assert(gradle.includes('applicationId = "fr.electronlibre.quizlibre"'),'applicationId must stay stable');
assert(gradle.includes('versionCode = 3'),'V6.1 must use versionCode 3');
assert(gradle.includes('versionName = "1.1.1"'),'V6.1 must use versionName 1.1.1');
assert(gradle.includes('compileSdk = 36'),'compileSdk must remain 36');
assert(gradle.includes('targetSdk = 36'),'targetSdk must remain 36');

const manifest=read('android/app/src/main/AndroidManifest.xml');
assert(!manifest.includes('android.permission.INTERNET'),'V6.1 must stay fully offline');

console.log('OK: Quiz Libre V6.1 update identity/version contract');
