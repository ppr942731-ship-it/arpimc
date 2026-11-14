const CACHE='arpimc-zone-info-v5';
const CORE=['/','/index.html','/style.css','/script.js','/manifest.json','/icon.svg','/icons/icon.svg','/icons/icon-96.png','/icons/icon-192.png','/icons/icon-512.png','/skins.json','/addons.json','/games.json','/data.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);await self.clients.claim()})()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp}))) });
