# Quiz Libre V7.1 Local Duel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un duel local Android 1v1, QCM, 6 manches de 3 questions, avec choix alterné parmi 3 catégories, chrono de 20 secondes et score adverse caché jusqu’à la fin de chaque manche.

**Architecture:** Le moteur solo HTML/JS reste intact. Une nouvelle machine d’état JavaScript gère le duel et ne connaît pas le transport ; Kotlin fournit un protocole validé, Nearby Connections en `P2P_POINT_TO_POINT`, les permissions Android et un bridge WebView limité à l’origine locale `https://appassets.androidplatform.net`. L’hôte est autoritaire sur questions, ordre, scores et transitions.

**Tech Stack:** HTML/CSS/JavaScript vanilla, Kotlin/JVM 17, Android SDK 36, AndroidX WebKit 1.16.0, Google Play services Nearby 19.5.0, `org.json`, Node.js 20 tests, Gradle 8.13.

**Spec:** `docs/superpowers/specs/2026-08-31-quiz-libre-v7-1-local-duel-design.md`

## Global Constraints

- `applicationId = fr.electronlibre.quizlibre` ne change jamais.
- `versionCode = 5`, `versionName = 1.3.0`, `protocolVersion = 1`.
- Conserver la même clé de signature permanente que V6/V6.1/V7 ; aucun secret dans GitHub.
- 1000 questions restent embarquées et le solo doit fonctionner même si les permissions Nearby sont refusées.
- Duel local : Android uniquement, exactement 2 joueurs, QCM uniquement, 6 manches × 3 questions, 20 secondes par question.
- Timeout : 0 point, question verrouillée, bonne réponse brièvement révélée, puis question suivante.
- Le score du premier joueur ne doit jamais être transmis à l’interface du second avant la fin de sa troisième question.
- Aucun bonus de vitesse, aucun tie-break, score maximum 18.
- Nearby utilise `Strategy.P2P_POINT_TO_POINT`, payloads `BYTES`, `serviceId = fr.electronlibre.quizlibre`.
- Pas de permission `INTERNET` ajoutée explicitement ; pas de serveur dans V7.1.
- Le bridge natif n’est injecté que pour `https://appassets.androidplatform.net` et aucune navigation externe n’obtient le bridge.
- Documentation Nearby à suivre pour les permissions : `https://developers.google.com/nearby/connections/android/get-started`.

---

### Task 1: Verrouiller le contrat Android V7.1, Nearby et les permissions

**Files:**
- Modify: `android/app/build.gradle.kts`
- Modify: `android/app/src/main/AndroidManifest.xml`
- Create: `android/app/src/main/java/fr/electronlibre/quizlibre/NearbyPermissionPolicy.kt`
- Create: `android/app/src/test/java/fr/electronlibre/quizlibre/NearbyPermissionPolicyTest.kt`
- Create: `tests/android-v7-1.test.js`
- Modify: `tests/android-v7.test.js`

**Interfaces:**
- Produces: `NearbyPermissionPolicy.requiredRuntimePermissions(sdkInt: Int): Array<String>` et `NearbyPermissionPolicy.hasAll(context: Context): Boolean`.
- Produces: dépendance `com.google.android.gms:play-services-nearby:19.5.0`.
- Consumes later: Tasks 5–6 utilisent la politique de permissions et la version Nearby.

- [ ] **Step 1: Écrire le test statique V7.1 en échec**

Créer `tests/android-v7-1.test.js` avec les assertions de contrat :

```js
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const assert=(c,m)=>{if(!c)throw new Error(m)};

const gradle=read('android/app/build.gradle.kts');
assert(gradle.includes('versionCode = 5'),'V7.1 must use versionCode 5');
assert(gradle.includes('versionName = "1.3.0"'),'V7.1 must use versionName 1.3.0');
assert(gradle.includes('applicationId = "fr.electronlibre.quizlibre"'),'applicationId must stay stable');
assert(gradle.includes('com.google.android.gms:play-services-nearby:19.5.0'),'Nearby dependency missing');

const manifest=read('android/app/src/main/AndroidManifest.xml');
for(const p of ['BLUETOOTH_ADVERTISE','BLUETOOTH_CONNECT','BLUETOOTH_SCAN','NEARBY_WIFI_DEVICES']) {
  assert(manifest.includes(`android.permission.${p}`),`missing ${p}`);
}
assert(!manifest.includes('android.permission.INTERNET'),'V7.1 must not explicitly request INTERNET');

console.log('OK: Quiz Libre V7.1 Android contract');
```

- [ ] **Step 2: Lancer le test et vérifier le RED**

Run: `node tests/android-v7-1.test.js`

Expected: FAIL sur `versionCode = 5` ou la dépendance Nearby.

- [ ] **Step 3: Rendre le test V7 historique update-safe**

Dans `tests/android-v7.test.js`, remplacer les assertions exactes `versionCode = 4` / `versionName = "1.2.0"` par un parsing qui exige au moins V7 :

```js
const versionCode=Number((gradle.match(/versionCode = (\d+)/)||[])[1]);
assert(versionCode>=4,'Android release must remain at V7 or newer');
assert(/versionName = "1\.(?:2|3)\.\d+"/.test(gradle),'versionName must remain V7+ compatible');
```

Conserver toutes les assertions 1000 questions.

- [ ] **Step 4: Mettre à jour Gradle**

Dans `android/app/build.gradle.kts` :

```kotlin
defaultConfig {
    applicationId = "fr.electronlibre.quizlibre"
    minSdk = 24
    targetSdk = 36
    versionCode = 5
    versionName = "1.3.0"
}

dependencies {
    implementation("androidx.core:core-splashscreen:1.2.0")
    implementation("androidx.webkit:webkit:1.16.0")
    implementation("com.google.android.gms:play-services-nearby:19.5.0")
    testImplementation(kotlin("test"))
    testImplementation("org.json:json:20250517")
}
```

- [ ] **Step 5: Ajouter les permissions Nearby officielles sans stockage**

Ajouter avant `<application>` :

```xml
<uses-permission android:maxSdkVersion="31" android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:maxSdkVersion="31" android:name="android.permission.CHANGE_WIFI_STATE" />
<uses-permission android:maxSdkVersion="30" android:name="android.permission.BLUETOOTH" />
<uses-permission android:maxSdkVersion="30" android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:maxSdkVersion="28" android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:minSdkVersion="29" android:maxSdkVersion="31" android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:minSdkVersion="31" android:name="android.permission.BLUETOOTH_ADVERTISE" />
<uses-permission android:minSdkVersion="31" android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:minSdkVersion="31" android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:minSdkVersion="32" android:name="android.permission.NEARBY_WIFI_DEVICES" />
```

Ne pas ajouter `READ_EXTERNAL_STORAGE` : les payloads sont uniquement `BYTES`.

- [ ] **Step 6: Écrire le test Kotlin de politique runtime**

```kotlin
package fr.electronlibre.quizlibre

import android.Manifest
import kotlin.test.Test
import kotlin.test.assertContentEquals

class NearbyPermissionPolicyTest {
    @Test fun api28UsesCoarseLocation() {
        assertContentEquals(arrayOf(Manifest.permission.ACCESS_COARSE_LOCATION), NearbyPermissionPolicy.requiredRuntimePermissions(28))
    }

    @Test fun api30UsesFineLocation() {
        assertContentEquals(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), NearbyPermissionPolicy.requiredRuntimePermissions(30))
    }

    @Test fun api31UsesFineAndBluetoothRuntimePermissions() {
        assertContentEquals(arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.BLUETOOTH_ADVERTISE,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN,
        ), NearbyPermissionPolicy.requiredRuntimePermissions(31))
    }

    @Test fun api36UsesBluetoothAndNearbyWifi() {
        assertContentEquals(arrayOf(
            Manifest.permission.BLUETOOTH_ADVERTISE,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN,
            Manifest.permission.NEARBY_WIFI_DEVICES,
        ), NearbyPermissionPolicy.requiredRuntimePermissions(36))
    }
}
```

- [ ] **Step 7: Implémenter la politique minimale**

```kotlin
package fr.electronlibre.quizlibre

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat

object NearbyPermissionPolicy {
    fun requiredRuntimePermissions(sdkInt: Int): Array<String> = when {
        sdkInt <= 28 -> arrayOf(Manifest.permission.ACCESS_COARSE_LOCATION)
        sdkInt <= 30 -> arrayOf(Manifest.permission.ACCESS_FINE_LOCATION)
        sdkInt == 31 -> arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.BLUETOOTH_ADVERTISE,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN,
        )
        else -> arrayOf(
            Manifest.permission.BLUETOOTH_ADVERTISE,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN,
            Manifest.permission.NEARBY_WIFI_DEVICES,
        )
    }

    fun hasAll(context: Context): Boolean = requiredRuntimePermissions(android.os.Build.VERSION.SDK_INT)
        .all { ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED }
}
```

- [ ] **Step 8: Vérifier GREEN et commit**

Run:

```bash
node tests/android-v7-1.test.js
gradle -p android :app:testDebugUnitTest --stacktrace
```

Expected: PASS.

Commit: `feat: prepare Android V7.1 Nearby contract`

---

### Task 2: Créer le cœur pur du duel et ses règles de sélection

**Files:**
- Create: `duel-core.js`
- Create: `tests/duel-core.test.js`

**Interfaces:**
- Produces: `DuelCore.createMatch({hostId, guestId})`.
- Produces: `DuelCore.buildCategoryOptions(categoryKeys, previousOptions, usage, rng)`.
- Produces: `DuelCore.pickRoundQuestions(questions, category, usedIds, rng)`.
- Produces: `DuelCore.applyTurnComplete(match, playerId, outcomes)` et `DuelCore.canRevealRound(match)`.
- Later: `multiplayer.js` utilise exclusivement ces fonctions pour les règles métier.

- [ ] **Step 1: Écrire les tests RED du cœur**

Le test doit couvrir 6 manches, alternance, trois catégories distinctes, aucun trio identique consécutif, trois questions distinctes et non rejouées, score maximum 18, et confidentialité avant le second tour.

Exemple de noyau de test :

```js
const assert=require('assert');
const DuelCore=require('../duel-core.js');

const match=DuelCore.createMatch({hostId:'host',guestId:'guest'});
assert.equal(match.round,1);
assert.equal(match.chooserId,'host');
assert.equal(match.turnPlayerId,'host');
assert.equal(match.scores.host,0);
assert.equal(match.scores.guest,0);

const categories=['histoire','geo','sciences','cinema','jeux','musique','tech','sport','retro','insolite'];
const first=DuelCore.buildCategoryOptions(categories,[],{},()=>0.1);
assert.equal(first.length,3);
assert.equal(new Set(first).size,3);

DuelCore.applyTurnComplete(match,'host',['correct','wrong','timeout']);
assert.equal(match.roundReveal,null);
assert.equal(match.turnPlayerId,'guest');
assert.equal(DuelCore.canRevealRound(match),false);

DuelCore.applyTurnComplete(match,'guest',['correct','correct','wrong']);
assert.equal(DuelCore.canRevealRound(match),true);
```

- [ ] **Step 2: Vérifier le RED**

Run: `node tests/duel-core.test.js`

Expected: FAIL avec `Cannot find module '../duel-core.js'`.

- [ ] **Step 3: Implémenter le module UMD testable dans Node et navigateur**

Structure imposée :

```js
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  root.DuelCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const ROUNDS=6, QUESTIONS_PER_ROUND=3, QUESTION_SECONDS=20;

  function createMatch({hostId,guestId}){
    return {
      hostId, guestId, round:1, chooserId:hostId, turnPlayerId:hostId,
      scores:{[hostId]:0,[guestId]:0}, usedQuestionIds:new Set(),
      previousCategoryOptions:[], categoryUsage:{}, roundQuestions:[],
      turnResults:{}, roundReveal:null, status:'choosing-category'
    };
  }

  function otherPlayer(match,id){ return id===match.hostId?match.guestId:match.hostId; }
  function scoreOutcomes(outcomes){ return outcomes.filter(v=>v==='correct').length; }

  // buildCategoryOptions, pickRoundQuestions, applyTurnComplete,
  // revealRound, advanceRound sont implémentées dans ce même module.

  return {ROUNDS,QUESTIONS_PER_ROUND,QUESTION_SECONDS,createMatch,otherPlayer,scoreOutcomes,
    buildCategoryOptions,pickRoundQuestions,applyTurnComplete,canRevealRound,revealRound,advanceRound};
});
```

`buildCategoryOptions` trie d’abord par fréquence d’utilisation, départage avec `rng()`, puis prend 3 catégories distinctes ; s’il reproduit exactement le trio précédent et qu’une alternative existe, remplacer le troisième élément par la première alternative disponible.

`pickRoundQuestions` filtre par catégorie et `usedQuestionIds`, mélange via Fisher-Yates avec `rng`, prend exactement 3 éléments et ajoute leurs IDs à `usedQuestionIds`.

- [ ] **Step 4: GREEN + tests d’invariants**

Ajouter des boucles de simulation de 100 parties déterministes qui vérifient :
- 6 manches exactement ;
- chooser host/guest alterné ;
- aucun score > 18 ;
- aucun ID question dupliqué dans une partie.

Run: `node tests/duel-core.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat: add transport-independent duel core`

---

### Task 3: Ajouter le protocole Kotlin versionné et validé

**Files:**
- Create: `android/app/src/main/java/fr/electronlibre/quizlibre/DuelProtocol.kt`
- Create: `android/app/src/test/java/fr/electronlibre/quizlibre/DuelProtocolTest.kt`

**Interfaces:**
- Produces: `data class DuelEnvelope(protocolVersion:Int, matchId:String, type:String, sequence:Long, senderPlayerId:String, payload:JSONObject)`.
- Produces: `DuelProtocol.encode(envelope): String`.
- Produces: `DuelProtocol.decode(raw, lastSequence): DuelEnvelope` qui lève `DuelProtocolException` si invalide.
- Consumed by: `MultiplayerManager.sendEnvelope` et callbacks Task 5.

- [ ] **Step 1: Écrire les tests RED**

```kotlin
class DuelProtocolTest {
    @Test fun roundTripPreservesEnvelope() {
        val src=DuelEnvelope(1,"m1","HELLO",1,"host",JSONObject().put("name","Brice"))
        val decoded=DuelProtocol.decode(DuelProtocol.encode(src),0)
        assertEquals("HELLO",decoded.type)
        assertEquals("Brice",decoded.payload.getString("name"))
    }

    @Test fun rejectsWrongProtocol() {
        val raw=JSONObject().put("protocolVersion",99).put("matchId","m1")
            .put("type","HELLO").put("sequence",1).put("senderPlayerId","host")
            .put("payload",JSONObject()).toString()
        assertFailsWith<DuelProtocolException>{ DuelProtocol.decode(raw,0) }
    }

    @Test fun rejectsOldSequence() {
        val src=DuelEnvelope(1,"m1","HELLO",4,"host",JSONObject())
        assertFailsWith<DuelProtocolException>{ DuelProtocol.decode(DuelProtocol.encode(src),4) }
    }
}
```

- [ ] **Step 2: Vérifier RED**

Run: `gradle -p android :app:testDebugUnitTest --tests '*DuelProtocolTest' --stacktrace`

Expected: compilation FAIL car les types n’existent pas.

- [ ] **Step 3: Implémenter validation stricte**

Le protocole n’accepte que :

```kotlin
private val ALLOWED_TYPES=setOf(
    "HELLO","CONNECTION_VERIFIED","PLAYER_READY","MATCH_START",
    "CATEGORY_OPTIONS","CATEGORY_SELECTED","ROUND_QUESTIONS","TURN_COMPLETE",
    "ROUND_REVEAL","NEXT_ROUND","MATCH_END","PLAYER_LEFT","ERROR"
)
```

`decode` vérifie : version `1`, matchId/type/sender non vides, type autorisé, `sequence > lastSequence`, payload objet JSON.

- [ ] **Step 4: GREEN et commit**

Run: `gradle -p android :app:testDebugUnitTest --tests '*DuelProtocolTest' --stacktrace`

Expected: PASS.

Commit: `feat: add versioned duel protocol`

---

### Task 4: Construire l’UI duel et le chrono 20 secondes sans réseau

**Files:**
- Modify: `index.html`
- Create: `multiplayer.css`
- Create: `multiplayer.js`
- Create: `tests/multiplayer-ui-contract.test.js`

**Interfaces:**
- Consumes: `DuelCore`.
- Produces: `window.QuizLibreMultiplayer.onNativeEvent(rawJson)`.
- Produces: `window.QuizLibreMultiplayer.open()`, `close()`, `renderQuestion(snapshot)`, `startQuestionTimer()`.
- Native command sink: `window.quizLibreNative.postMessage(JSON.stringify(command))` quand disponible.

- [ ] **Step 1: Écrire le test de contrat UI RED**

```js
const fs=require('fs');
const assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
const js=fs.existsSync('multiplayer.js')?fs.readFileSync('multiplayer.js','utf8'):'';
assert(html.includes('id="duelEntryBtn"'));
assert(html.includes('id="duelScreen"'));
assert(html.includes('id="duelTimer"'));
assert(js.includes('QUESTION_SECONDS'));
assert(js.includes('timeout'));
assert(js.includes('QuizLibreMultiplayer'));
console.log('OK: multiplayer UI contract');
```

- [ ] **Step 2: Vérifier RED**

Run: `node tests/multiplayer-ui-contract.test.js`

Expected: FAIL sur `duelEntryBtn`.

- [ ] **Step 3: Ajouter l’entrée et les écrans duel**

Dans `index.html`, ajouter une carte `Duel local` séparée du sélecteur solo et un `<main id="duelScreen" class="hidden">` contenant les états :
- choix créer/rejoindre ;
- pseudo ;
- liste d’hôtes découverts ;
- code de vérification ;
- attente ;
- 3 cartes catégories ;
- question QCM ;
- chrono `20` ;
- révélation de manche ;
- résultat final.

Charger les scripts dans cet ordre :

```html
<script src="duel-core.js"></script>
<script src="multiplayer.js"></script>
<script src="app.js"></script>
```

et `multiplayer.css` après `v4-1.css`.

- [ ] **Step 4: Implémenter le chrono avec injection de l’horloge pour testabilité**

Dans `multiplayer.js` :

```js
function createQuestionTimer({seconds=DuelCore.QUESTION_SECONDS,onTick,onExpire,setIntervalFn=setInterval,clearIntervalFn=clearInterval}){
  let remaining=seconds, handle=null, stopped=false;
  onTick(remaining);
  handle=setIntervalFn(()=>{
    if(stopped)return;
    remaining--;
    onTick(Math.max(0,remaining));
    if(remaining<=0){ stopped=true; clearIntervalFn(handle); onExpire(); }
  },1000);
  return {stop(){if(!stopped){stopped=true;clearIntervalFn(handle)}},getRemaining(){return remaining}};
}
```

À expiration, envoyer un outcome `timeout`, désactiver les 4 boutons, marquer la bonne réponse, afficher `Temps écoulé`, puis avancer après 900 ms.

- [ ] **Step 5: Cacher le duel hors coque Android**

Au chargement, le bouton duel reste désactivé avec `Disponible sur l’app Android` tant que l’objet `quizLibreNative` n’existe pas. Après réception de l’événement natif `NATIVE_READY`, l’activer.

Le solo ne dépend jamais de ce signal.

- [ ] **Step 6: Vérifier UI contract et commit**

Run:

```bash
node tests/multiplayer-ui-contract.test.js
node tests/duel-core.test.js
```

Expected: PASS.

Commit: `feat: add local duel screens and 20 second timer`

---

### Task 5: Implémenter Nearby Connections dans un manager isolé

**Files:**
- Create: `android/app/src/main/java/fr/electronlibre/quizlibre/MultiplayerManager.kt`
- Create: `tests/nearby-static-contract.test.js`

**Interfaces:**
- Constructor: `MultiplayerManager(activity: Activity, emit: (String) -> Unit)`.
- Produces: `createDuel(playerName:String)`, `discoverDuels(playerName:String)`, `joinDuel(endpointId:String)`, `confirmPendingConnection()`, `rejectPendingConnection()`, `sendProtocolMessage(rawJson:String)`, `leaveDuel()`, `destroy()`.
- Emits JSON native events: `HOSTING`, `ENDPOINT_FOUND`, `ENDPOINT_LOST`, `CONNECTION_CONFIRMATION`, `CONNECTED`, `MESSAGE`, `DISCONNECTED`, `ERROR`.

- [ ] **Step 1: Écrire le static contract RED**

Le test lit `MultiplayerManager.kt` et exige :

```js
for(const token of [
  'Strategy.P2P_POINT_TO_POINT','startAdvertising','startDiscovery','stopAdvertising',
  'stopDiscovery','stopAllEndpoints','Payload.fromBytes','acceptConnection','rejectConnection'
]) assert(src.includes(token),`Nearby manager missing ${token}`);
```

- [ ] **Step 2: Vérifier RED**

Run: `node tests/nearby-static-contract.test.js`

Expected: FAIL car le fichier n’existe pas.

- [ ] **Step 3: Implémenter la découverte et connexion**

Initialisation :

```kotlin
private val client: ConnectionsClient = Nearby.getConnectionsClient(activity)
private val strategy = Strategy.P2P_POINT_TO_POINT
private val serviceId = "fr.electronlibre.quizlibre"
```

`startAdvertising` et `startDiscovery` utilisent exactement `serviceId` et `strategy`. Dès `onConnectionResult(...STATUS_OK)`, appeler `stopAdvertising()` et `stopDiscovery()`.

- [ ] **Step 4: Implémenter la vérification humaine**

Dans `onConnectionInitiated`, ne pas accepter immédiatement. Conserver `pendingEndpointId`, émettre :

```json
{"type":"CONNECTION_CONFIRMATION","endpointId":"...","token":"1234","remoteName":"..."}
```

Le token affiché provient de `ConnectionInfo.authenticationDigits`. `confirmPendingConnection()` appelle `acceptConnection(endpointId,payloadCallback)`, `rejectPendingConnection()` appelle `rejectConnection(endpointId)`.

- [ ] **Step 5: Implémenter les payloads BYTES**

```kotlin
fun sendProtocolMessage(rawJson:String) {
    val id=connectedEndpointId ?: return emitError("NOT_CONNECTED")
    client.sendPayload(id, Payload.fromBytes(rawJson.toByteArray(Charsets.UTF_8)))
        .addOnFailureListener { emitError("SEND_FAILED", it.message) }
}
```

Dans `onPayloadReceived`, ignorer tout type autre que `Payload.Type.BYTES`, décoder UTF-8, valider la taille <= `ConnectionsClient.MAX_BYTES_DATA_SIZE`, émettre `MESSAGE`.

- [ ] **Step 6: Nettoyer chaque ressource**

`leaveDuel()` et `destroy()` appellent `stopAdvertising()`, `stopDiscovery()`, `stopAllEndpoints()` et remettent tous les IDs à `null`.

- [ ] **Step 7: GREEN et commit**

Run:

```bash
node tests/nearby-static-contract.test.js
gradle -p android :app:compileDebugKotlin --stacktrace
```

Expected: PASS.

Commit: `feat: add Nearby local duel transport`

---

### Task 6: Brancher Nearby à la WebView avec origine autorisée et permissions à la demande

**Files:**
- Modify: `android/app/src/main/java/fr/electronlibre/quizlibre/MainActivity.kt`
- Create: `tests/webview-bridge-contract.test.js`

**Interfaces:**
- Consumes: `NearbyPermissionPolicy`, `MultiplayerManager`.
- JS object injected: `quizLibreNative`.
- Commands JS→Kotlin : `READY`, `REQUEST_PERMISSIONS`, `CREATE_DUEL`, `DISCOVER_DUELS`, `JOIN_DUEL`, `CONFIRM_CONNECTION`, `REJECT_CONNECTION`, `SEND_MESSAGE`, `LEAVE_DUEL`.
- Events Kotlin→JS : chaîne JSON passée à `window.QuizLibreMultiplayer.onNativeEvent`.

- [ ] **Step 1: Écrire le test bridge RED**

Le test exige :

```js
assert(src.includes('WebViewCompat.addWebMessageListener'));
assert(src.includes('https://appassets.androidplatform.net'));
assert(src.includes('WebViewFeature.WEB_MESSAGE_LISTENER'));
assert(!src.includes('addJavascriptInterface'));
assert(src.includes('NearbyPermissionPolicy.requiredRuntimePermissions'));
assert(src.includes('shouldOverrideUrlLoading'));
```

- [ ] **Step 2: Vérifier RED**

Run: `node tests/webview-bridge-contract.test.js`

Expected: FAIL.

- [ ] **Step 3: Bloquer les navigations hors origine locale**

Dans le `WebViewClientCompat` :

```kotlin
override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
    val u=request.url
    return !(u.scheme=="https" && u.host=="appassets.androidplatform.net")
}
```

- [ ] **Step 4: Installer le listener avant `loadUrl`**

```kotlin
if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
    WebViewCompat.addWebMessageListener(
        webView,
        "quizLibreNative",
        setOf("https://appassets.androidplatform.net"),
    ) { _, message, sourceOrigin, isMainFrame, _ ->
        if(!isMainFrame || sourceOrigin.host != "appassets.androidplatform.net") return@addWebMessageListener
        handleNativeCommand(message.data ?: return@addWebMessageListener)
    }
}
```

Ne jamais utiliser `addJavascriptInterface`.

- [ ] **Step 5: Ajouter le flux de permissions runtime**

`REQUEST_PERMISSIONS` appelle :

```kotlin
requestPermissions(
    NearbyPermissionPolicy.requiredRuntimePermissions(Build.VERSION.SDK_INT),
    REQUEST_NEARBY_PERMISSIONS
)
```

`onRequestPermissionsResult` émet `PERMISSIONS_RESULT` avec `granted:true/false`. Les commandes CREATE/DISCOVER échouent avec `PERMISSIONS_REQUIRED` si les permissions manquent.

- [ ] **Step 6: Émettre les événements vers JS de façon sûre**

```kotlin
private fun emitToWeb(json:String) {
    val arg=org.json.JSONObject.quote(json)
    webView.post {
        webView.evaluateJavascript(
            "window.QuizLibreMultiplayer&&window.QuizLibreMultiplayer.onNativeEvent($arg)", null
        )
    }
}
```

Après chargement de la page, le premier `READY` reçu depuis JS déclenche `NATIVE_READY`.

- [ ] **Step 7: Cycle de vie**

`onDestroy()` appelle `multiplayerManager.destroy()` avant `webView.destroy()`. `onBackPressed()` quitte d’abord le duel via JS/manager si `duelScreen` est actif, sinon garde le comportement solo actuel.

- [ ] **Step 8: GREEN et commit**

Run:

```bash
node tests/webview-bridge-contract.test.js
gradle -p android :app:compileDebugKotlin --stacktrace
```

Expected: PASS.

Commit: `feat: connect secure WebView bridge to Nearby`

---

### Task 7: Relier la machine d’état duel au protocole et garantir le score caché

**Files:**
- Modify: `multiplayer.js`
- Modify: `tests/duel-core.test.js`
- Create: `tests/duel-protocol-privacy.test.js`

**Interfaces:**
- Host JS owns a `DuelCore` match and sends canonical snapshots.
- Guest never computes official totals ; it renders only host messages.
- `TURN_COMPLETE.payload` contient `{round, playerId, outcomes:[{questionId,result}]}` et jamais un score adverse.
- `ROUND_REVEAL.payload` contient `{round, roundScores, totalScores}`.

- [ ] **Step 1: Écrire le test confidentialité RED**

```js
const assert=require('assert');
const mp=require('../multiplayer.js');
const msg=mp.buildTurnComplete({
  matchId:'m1',round:1,playerId:'host',
  outcomes:[{questionId:'H01',result:'correct'},{questionId:'H02',result:'wrong'},{questionId:'H03',result:'timeout'}]
});
const raw=JSON.stringify(msg);
assert(!raw.includes('opponentScore'));
assert(!raw.includes('totalScores'));
assert(!raw.includes('roundScores'));
```

Exporter les fonctions pures de `multiplayer.js` via un petit UMD/`module.exports` sans exécuter le DOM dans Node.

- [ ] **Step 2: Vérifier RED**

Run: `node tests/duel-protocol-privacy.test.js`

Expected: FAIL car `buildTurnComplete` n’est pas exportée.

- [ ] **Step 3: Implémenter les envelopes JS**

`buildEnvelope(type,payload)` incrémente `sequence`. `buildTurnComplete` n’inclut que les outcomes du joueur courant. Le host traite le second `TURN_COMPLETE`, appelle `DuelCore.revealRound`, puis seulement là construit `ROUND_REVEAL`.

- [ ] **Step 4: Gérer le chrono comme outcome officiel**

Une question expirée produit exactement :

```js
{questionId:q.id,result:'timeout'}
```

Le host compte uniquement `result==='correct'`.

- [ ] **Step 5: Gérer les six manches**

Après `ROUND_REVEAL` :
- si `round < 6`, `NEXT_ROUND`, alternance chooser, nouveau trio ;
- sinon `MATCH_END` avec résultat `win`, `loss` ou `draw` calculé à partir des totaux.

- [ ] **Step 6: GREEN et commit**

Run:

```bash
node tests/duel-core.test.js
node tests/duel-protocol-privacy.test.js
node tests/multiplayer-ui-contract.test.js
```

Expected: PASS.

Commit: `feat: wire duel state and hidden-score protocol`

---

### Task 8: Embarquer les assets multi, préserver PWA/solo et mettre à jour la CI release

**Files:**
- Modify: `scripts/sync-android-assets.js`
- Modify: `service-worker.js`
- Modify: `.github/workflows/android-release.yml`
- Modify: `tests/android-v7-1.test.js`

**Interfaces:**
- Android assets must include `duel-core.js`, `multiplayer.js`, `multiplayer.css`.
- PWA peut charger ces fichiers mais `Duel local` reste désactivé sans bridge natif.
- Release CI runs all V7.1 tests before Gradle build.

- [ ] **Step 1: Étendre le test V7.1 en RED**

Ajouter :

```js
const sync=read('scripts/sync-android-assets.js');
for(const f of ['duel-core.js','multiplayer.js','multiplayer.css']) assert(sync.includes(`'${f}'`),`Android sync missing ${f}`);

const workflow=read('.github/workflows/android-release.yml');
for(const t of ['duel-core.test.js','duel-protocol-privacy.test.js','android-v7-1.test.js']) {
  assert(workflow.includes(t),`release CI missing ${t}`);
}
assert(workflow.includes('quiz-libre-1.3.0-release-unsigned'),'artifact name must be V7.1');
```

- [ ] **Step 2: Vérifier RED**

Run: `node tests/android-v7-1.test.js`

Expected: FAIL sur les nouveaux assets.

- [ ] **Step 3: Ajouter les assets au sync et au cache PWA**

Dans `scripts/sync-android-assets.js`, ajouter après `answer-utils.js` :

```js
'duel-core.js','multiplayer.js','multiplayer.css',
```

Dans `service-worker.js`, incrémenter le cache en `quiz-libre-v7-1-shell-v1` et ajouter `/duel-core.js`, `/multiplayer.js`, `/multiplayer.css`.

- [ ] **Step 4: Mettre la CI à jour**

Avant `assembleRelease`, lancer :

```yaml
- name: Run V7.1 duel tests
  run: |
    node tests/duel-core.test.js
    node tests/multiplayer-ui-contract.test.js
    node tests/duel-protocol-privacy.test.js
    node tests/nearby-static-contract.test.js
    node tests/webview-bridge-contract.test.js
    node tests/android-v7-1.test.js
    gradle -p android :app:testDebugUnitTest --stacktrace
```

Nom d’artefact : `quiz-libre-1.3.0-release-unsigned`.

- [ ] **Step 5: GREEN et commit**

Run:

```bash
node tests/v7-question-bank.test.js
node tests/android-v5.test.js
node tests/android-v6.test.js
node tests/android-v6-1.test.js
node tests/android-v7.test.js
node tests/android-v7-1.test.js
node tests/duel-core.test.js
node tests/multiplayer-ui-contract.test.js
node tests/duel-protocol-privacy.test.js
node tests/nearby-static-contract.test.js
node tests/webview-bridge-contract.test.js
gradle -p android :app:testDebugUnitTest :app:assembleRelease --stacktrace
```

Expected: tous PASS / `BUILD SUCCESSFUL`.

Commit: `ci: validate V7.1 local duel release`

---

### Task 9: Vérification finale, APK signée et test réel à deux téléphones

**Files:**
- No production code unless a test exposes a defect.
- Optional test report: `docs/superpowers/reports/2026-08-31-v7-1-device-test.md`.

**Interfaces:**
- Release input: unsigned APK built by CI.
- Release output: `quiz-libre-1.3.0-release.apk`, signé avec la clé permanente existante.

- [ ] **Step 1: Vérifier le build CI frais de la branche**

Exiger : question bank PASS, tests V7.1 PASS, Kotlin unit tests PASS, `assembleRelease` PASS.

- [ ] **Step 2: Signer avec la clé permanente hors dépôt**

Utiliser `zipalign` puis `apksigner` comme V6/V6.1/V7. Ne jamais imprimer ni committer les mots de passe.

- [ ] **Step 3: Vérifier la signature et l’identité APK**

Run conceptuel avec les outils Android :

```bash
apksigner verify --verbose --print-certs quiz-libre-1.3.0-release.apk
```

Expected : signatures v2/v3 valides et empreinte certificat identique à V7.

Inspecter aussi : package `fr.electronlibre.quizlibre`, versionCode `5`, versionName `1.3.0`, 1000 questions embarquées, assets multi présents.

- [ ] **Step 4: Test de mise à jour sur téléphone 1**

Installer par-dessus V7 sans désinstaller. Vérifier : stats solo conservées, solo jouable, aucune permission Nearby demandée au lancement.

- [ ] **Step 5: Test duel complet sur deux Android**

Scénario obligatoire :
1. Téléphone A → Duel local → Créer → pseudo A.
2. Téléphone B → Rejoindre → pseudo B.
3. Confirmer le même code sur les deux.
4. Manche 1 : A choisit parmi 3 catégories, joue 3 questions ; B ne voit pas le score A.
5. B joue les mêmes 3 questions ; révélation uniquement après sa 3e.
6. Vérifier que B choisit la manche 2.
7. Laisser volontairement une question expirer : exactement 20→0, 0 point, verrouillage.
8. Aller jusqu’à la manche 6 ; scores finaux identiques sur les deux.
9. Revenir au solo ; stats solo inchangées par le duel.

- [ ] **Step 6: Test de déconnexion**

Pendant une partie, couper Bluetooth/Wi-Fi ou éloigner un téléphone. Vérifier : `Connexion perdue`, aucune continuation divergente, abandon propre si reconnexion impossible.

- [ ] **Step 7: Documenter le résultat et demander validation utilisateur**

Ne fusionner `v7-1-local-duel` dans `main` qu’après validation du test réel sur deux téléphones.

Commit éventuel du rapport : `docs: record V7.1 two-device validation`.
