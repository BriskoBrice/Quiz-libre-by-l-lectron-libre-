const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const assert=(c,m)=>{if(!c)throw new Error(m)};

const rootGradle=read('android/build.gradle.kts');
assert(rootGradle.includes('org.jetbrains.kotlin.android") version "2.4.0"'),'V7.1 must use Kotlin 2.4.0 for current Nearby metadata');

const gradle=read('android/app/build.gradle.kts');
assert(gradle.includes('applicationId = "fr.electronlibre.quizlibre"'),'applicationId must stay stable');
assert(gradle.includes('versionCode = 5'),'V7.1 must use versionCode 5');
assert(gradle.includes('versionName = "1.3.0"'),'V7.1 must use versionName 1.3.0');
assert(gradle.includes('com.google.android.gms:play-services-nearby:19.5.0'),'Nearby 19.5.0 dependency missing');
assert(!gradle.includes('coreLibraryDesugaring('),'Nearby 19.5.0 must not keep the temporary 19.4 desugaring workaround');

const manifest=read('android/app/src/main/AndroidManifest.xml');
for(const p of ['BLUETOOTH_ADVERTISE','BLUETOOTH_CONNECT','BLUETOOTH_SCAN','NEARBY_WIFI_DEVICES']) {
  assert(manifest.includes(`android.permission.${p}`),`missing ${p}`);
}
assert(!manifest.includes('android.permission.INTERNET'),'V7.1 must not explicitly request INTERNET');

console.log('OK: Quiz Libre V7.1 Android contract');
