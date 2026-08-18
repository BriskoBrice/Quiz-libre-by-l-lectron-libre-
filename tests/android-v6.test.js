const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const assert=(c,m)=>{if(!c)throw new Error(m)};

const gradle=read('android/app/build.gradle.kts');
for(const token of [
  'applicationId = "fr.electronlibre.quizlibre"',
  'compileSdk = 36','minSdk = 24','targetSdk = 36',
  'versionCode = 2','versionName = "1.1.0"'
]) assert(gradle.includes(token),`Gradle missing ${token}`);

const manifest=read('android/app/src/main/AndroidManifest.xml');
assert(!manifest.includes('android.permission.INTERNET'),'V6 must not request INTERNET');

const sync=read('scripts/sync-android-assets.js');
assert(sync.includes('@media(max-width:480px){.cleanHero{padding-top:245px}}'),'Android-only hero override missing');

const releasePath='.github/workflows/android-release.yml';
assert(fs.existsSync(path.join(root,releasePath)),'release workflow missing');
const workflow=read(releasePath);
for(const token of [
 'node scripts/sync-android-assets.js',
 'node tests/android-v5.test.js',
 'node tests/android-v6.test.js',
 'gradle -p android :app:assembleRelease --stacktrace',
 'app-release-unsigned.apk'
]) assert(workflow.includes(token),`release workflow missing ${token}`);

console.log('OK: Quiz Libre V6 release contract');
