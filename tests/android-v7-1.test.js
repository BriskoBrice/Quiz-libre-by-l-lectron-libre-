const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const assert=(c,m)=>{if(!c)throw new Error(m)};

const gradle=read('android/app/build.gradle.kts');
assert(gradle.includes('applicationId = "fr.electronlibre.quizlibre"'),'applicationId must stay stable');
assert(gradle.includes('versionCode = 5'),'V7.1 must use versionCode 5');
assert(gradle.includes('versionName = "1.3.0"'),'V7.1 must use versionName 1.3.0');
assert(gradle.includes('com.google.android.gms:play-services-nearby:19.4.0'),'Nearby 19.4.0 compatibility pin missing');
assert(gradle.includes('isCoreLibraryDesugaringEnabled = true'),'Nearby 19.4.0 requires core library desugaring');
assert(gradle.includes('com.android.tools:desugar_jdk_libs:2.1.3'),'desugar_jdk_libs 2.1.3 dependency missing');

const manifest=read('android/app/src/main/AndroidManifest.xml');
for(const p of ['BLUETOOTH_ADVERTISE','BLUETOOTH_CONNECT','BLUETOOTH_SCAN','NEARBY_WIFI_DEVICES']) {
  assert(manifest.includes(`android.permission.${p}`),`missing ${p}`);
}
assert(!manifest.includes('android.permission.INTERNET'),'V7.1 must not explicitly request INTERNET');

console.log('OK: Quiz Libre V7.1 Android contract');
