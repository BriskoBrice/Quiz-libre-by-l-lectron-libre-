const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const assert=(c,m)=>{if(!c)throw new Error(m)};

const required=[
  'android/settings.gradle.kts','android/build.gradle.kts','android/gradle.properties','android/app/build.gradle.kts',
  'android/app/src/main/AndroidManifest.xml','android/app/src/main/java/fr/electronlibre/quizlibre/MainActivity.kt',
  'android/app/src/main/res/values/themes.xml','android/app/src/main/res/drawable/splash_icon.xml',
  'scripts/sync-android-assets.js','.github/workflows/android-debug.yml'
];
for(const f of required) assert(fs.existsSync(path.join(root,f)),`missing ${f}`);

const gradle=read('android/app/build.gradle.kts');
for(const token of ['applicationId = "fr.electronlibre.quizlibre"','compileSdk = 36','minSdk = 24','targetSdk = 36','versionCode = 1','versionName = "1.0.0"','androidx.webkit:webkit:1.16.0','androidx.core:core-splashscreen:1.2.0']) assert(gradle.includes(token),`Gradle missing ${token}`);

const manifest=read('android/app/src/main/AndroidManifest.xml');
assert(!manifest.includes('android.permission.INTERNET'),'APK must not request INTERNET');
assert(manifest.includes('android:screenOrientation="portrait"'),'portrait orientation missing');

const activity=read('android/app/src/main/java/fr/electronlibre/quizlibre/MainActivity.kt');
for(const token of ['WebViewAssetLoader','AssetsPathHandler','javaScriptEnabled = true','domStorageEnabled = true','allowFileAccess = false','allowContentAccess = false','allowFileAccessFromFileURLs = false','allowUniversalAccessFromFileURLs = false','https://appassets.androidplatform.net/assets/www/index.html','installSplashScreen()','onBackPressedDispatcher']) assert(activity.includes(token),`MainActivity missing ${token}`);

const themes=read('android/app/src/main/res/values/themes.xml');
for(const token of ['Theme.SplashScreen','windowSplashScreenBackground','windowSplashScreenAnimatedIcon','postSplashScreenTheme']) assert(themes.includes(token),`Splash theme missing ${token}`);

const workflow=read('.github/workflows/android-debug.yml');
for(const token of ['node scripts/sync-android-assets.js','node tests/android-v5.test.js','gradle -p android :app:assembleDebug','quiz-libre-1.0.0-debug.apk','actions/upload-artifact@v4']) assert(workflow.includes(token),`workflow missing ${token}`);

const www=path.join(root,'android/app/src/main/assets/www');
if(fs.existsSync(www)){
  const index=read('android/app/src/main/assets/www/index.html');
  assert(!index.includes('serviceWorker.register'),'Android index must not register service worker');
  assert(!index.includes('rel="manifest"'),'Android index must not reference PWA manifest');
  assert(!/vercel\.app|cdn\.jsdelivr\.net/i.test(index),'Android bundle must not depend on Vercel/CDN');
  for(const f of ['questions/index.js','questions/histoire.js','questions/geographie.js','questions/sciences.js','questions/cinema.js','questions/jeux.js','questions/musique.js','questions/tech.js','questions/sport.js','questions/retro.js','questions/insolite.js','assets/warehouse-neon.jpg']) assert(fs.existsSync(path.join(www,f)),`Android bundle missing ${f}`);
}
console.log('OK: Quiz Libre V5 Android shell, security, splash and CI structure');
