const CACHE_NAME='quiz-libre-v4-2-shell-v1';
const APP_SHELL=[
  '/',
  '/index.html',
  '/styles.css',
  '/v3.css',
  '/v4.css',
  '/v4-1.css',
  '/app.js',
  '/answer-utils.js',
  '/assets/warehouse-neon.jpg',
  '/questions/index.js',
  '/questions/histoire.js',
  '/questions/geographie.js',
  '/questions/sciences.js',
  '/questions/cinema.js',
  '/questions/jeux.js',
  '/questions/musique.js',
  '/questions/tech.js',
  '/questions/sport.js',
  '/questions/retro.js',
  '/questions/insolite.js',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(APP_SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;

  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put('/index.html',copy));
          return response;
        })
        .catch(()=>caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      if(response && response.status===200 && response.type==='basic'){
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
      }
      return response;
    }))
  );
});
