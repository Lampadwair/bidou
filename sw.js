// Bidou : cache hors ligne. Change VERSION (et version.json, et APP_VER dans app.js) à chaque mise à jour.
const VERSION='bidou-v5';
const CORE=['./','./index.html','./config.js','./app.js','./recipes.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url);
  if(u.pathname.endsWith('/version.json')) return;
  if(u.origin!==location.origin&&!/fonts\.(googleapis|gstatic)\.com$|(thumb|upload)\.wikimedia\.org$/.test(u.hostname)) return; // Supabase et Claude passent toujours par le réseau
  const fresh=r.mode==='navigate'||/\/(config|app)\.js$/.test(u.pathname);
  if(fresh){ // réseau d'abord : les mises à jour arrivent dès qu'il y a du réseau
    const key=r.mode==='navigate'?'./index.html':r;
    e.respondWith(fetch(r.url,{cache:'no-cache',credentials:'same-origin'}).then(res=>{ if(res.ok&&res.type==='basic'){const cp=res.clone(); caches.open(VERSION).then(c=>c.put(key,cp));} return res;}).catch(()=>caches.match(key)));
    return; }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{ if(res.ok||res.type==='opaque'){const cp=res.clone(); caches.open(VERSION).then(c=>c.put(r,cp));} return res; })));
});
