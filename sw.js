const CACHE='aura-v1';
const SHELL=['/','/index.html','/feed.html','/css/styles.css?v=6','/assets/icon-192.png'];
self.addEventListener('install', e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL).catch(()=>{}))); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e=>{
  const req=e.request; if(req.method!=='GET') return;
  e.respondWith(fetch(req).catch(()=>caches.match(req).then(m=>m||caches.match('/index.html'))));
});
self.addEventListener('push', e=>{
  let d={}; try{ d=e.data.json(); }catch(_){ d={ body: e.data?e.data.text():'' }; }
  const title=d.title||'Aura Experience';
  const opts={ body:d.body||'', icon:'/assets/icon-192.png', badge:'/assets/icon-192.png', image:d.image||undefined, data:{url:d.url||'/feed.html'}, vibrate:[80,40,80] };
  e.waitUntil(self.registration.showNotification(title, opts));
});
self.addEventListener('notificationclick', e=>{
  e.notification.close();
  const url=(e.notification.data&&e.notification.data.url)||'/feed.html';
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cl=>{ for(const c of cl){ if('focus' in c){ try{c.navigate(url);}catch(_){}; return c.focus(); } } if(clients.openWindow) return clients.openWindow(url); }));
});
