(function(){
  // --- Forzar dominio propio (si entran por la URL vieja de Netlify) ---
  try{ if(location.hostname.indexOf('netlify.app')>-1){ location.replace('https://auraexperience.com.ar'+location.pathname+location.search+location.hash); return; } }catch(_){}

  var VAPID='BLBxWk3M5hcx_QPWW1XdWp3V6RajAmqh1YfbdkJDsc2VgyfJAZQDupH-NFAZTW9fJc5yI4xV7pI0nWL8Z7eYxTA';
  var SUPA='https://fsjrimmurtnrorqhnbwu.supabase.co';
  var KEY='sb_publishable_2lWllWfVLWsPnnko4TEa4Q_2sx0kdI4';
  var deferred=null;
  function isStandalone(){ return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true; }
  function isIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent); }
  function inApp(){ var ua=navigator.userAgent||''; return /FBAN|FBAV|FB_IAB|Instagram|Line\/|Twitter|WhatsApp|; wv\)|GSA\//i.test(ua); }
  function fullUrl(){ return 'https://auraexperience.com.ar'+location.pathname+location.search; }
  function openBrowser(){
    var url=fullUrl();
    if(isIOS()){ try{navigator.clipboard.writeText(url);}catch(_){}
      sheet('Abrila en Safari 🧭','<p>Estás viendo Aura dentro de otra app (Instagram/WhatsApp), y desde ahí no se puede instalar.</p><p style="margin-top:10px"><b>Copié el link.</b> Abrí <b>Safari</b>, pegalo en la barra de arriba y entrá. Ahí vas a poder instalar Aura como app.</p><p style="margin-top:10px;color:#f6d79b;word-break:break-all;font-size:.85rem">'+url+'</p>', null);
    } else {
      try{ location.href='intent://auraexperience.com.ar'+location.pathname+'#Intent;scheme=https;package=com.android.chrome;end'; }
      catch(e){ try{navigator.clipboard.writeText(url);}catch(_){}; sheet('Abrila en Chrome','<p>Copié el link. Abrí <b>Chrome</b>, pegalo y desde ahí instalás Aura.</p>', null); }
    }
  }
  function u8(b){ var pad='='.repeat((4-b.length%4)%4); var s=(b+pad).replace(/-/g,'+').replace(/_/g,'/'); var raw=atob(s); var a=new Uint8Array(raw.length); for(var i=0;i<raw.length;i++)a[i]=raw.charCodeAt(i); return a; }

  // estilos del panel
  var st=document.createElement('style');
  st.textContent='@keyframes auraUp{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes auraFade{from{opacity:0}to{opacity:1}}#aura-ov{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;animation:auraFade .2s ease;font-family:Helvetica,Arial,sans-serif}#aura-card{width:100%;max-width:460px;background:#141018;border:1px solid rgba(212,175,110,.35);border-bottom:0;border-radius:22px 22px 0 0;padding:20px 18px calc(22px + env(safe-area-inset-bottom));color:#fff;animation:auraUp .26s cubic-bezier(.2,.8,.2,1)}.aura-num{width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:700;color:#0a0a0c;background:linear-gradient(135deg,#f59e0b,#f43f5e);font-size:14px}.aura-row{display:flex;gap:12px;align-items:flex-start;margin:12px 0}.aura-row b{color:#f6d79b}#aura-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(24px + env(safe-area-inset-bottom));z-index:100001;background:#141018;border:1px solid rgba(212,175,110,.4);color:#fff;padding:12px 18px;border-radius:999px;font-family:Helvetica,Arial,sans-serif;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.5);animation:auraFade .2s ease}';
  document.head.appendChild(st);

  function closeSheet(){ var o=document.getElementById('aura-ov'); if(o) o.remove(); }
  function sheet(title, inner, primaryLabel, primaryFn){
    closeSheet();
    var ov=document.createElement('div'); ov.id='aura-ov';
    ov.addEventListener('click', function(e){ if(e.target===ov) closeSheet(); });
    var primary = primaryLabel ? '<button id="aura-p" style="flex:1;background:linear-gradient(90deg,#f59e0b,#f43f5e);color:#0a0a0c;font-weight:700;border:0;border-radius:999px;padding:13px;font-size:15px;cursor:pointer">'+primaryLabel+'</button>' : '';
    ov.innerHTML='<div id="aura-card"><div style="width:40px;height:4px;border-radius:99px;background:rgba(255,255,255,.2);margin:0 auto 16px"></div>'+
      (title?'<h3 style="font-size:1.3rem;font-weight:700;margin:0 0 12px;color:#f6d79b">'+title+'</h3>':'')+
      '<div style="font-size:.95rem;line-height:1.5;color:#ece7ef">'+inner+'</div>'+
      '<div style="display:flex;gap:10px;margin-top:18px">'+primary+
      '<button id="aura-c" style="'+(primaryLabel?'':'flex:1;')+'background:rgba(255,255,255,.1);color:#fff;font-weight:600;border:0;border-radius:999px;padding:13px 20px;font-size:15px;cursor:pointer">'+(primaryLabel?'Ahora no':'Entendido')+'</button></div></div>';
    document.body.appendChild(ov);
    document.getElementById('aura-c').addEventListener('click', closeSheet);
    if(primaryLabel){ document.getElementById('aura-p').addEventListener('click', function(){ if(primaryFn) primaryFn(); }); }
  }
  function toast(msg){ var t=document.getElementById('aura-toast'); if(t)t.remove(); t=document.createElement('div'); t.id='aura-toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(function(){ if(t)t.remove(); }, 3200); }

  function iosGuide(){
    // si estamos en la página de instalar, mostrar los pasos ahí en vez del panel
    var steps=document.getElementById('stepsIos');
    if(steps && typeof pick==='function'){ pick('ios'); steps.scrollIntoView({behavior:'smooth',block:'center'}); return; }
    sheet('Instalá Aura en tu iPhone',
      '<p style="margin:0 0 6px">En 3 toques la tenés como app, gratis:</p>'+
      '<div class="aura-row"><span class="aura-num">1</span><span>Tocá el botón <b>Compartir</b> — el cuadradito con la flecha <b>⬆</b>, abajo en el centro de Safari.</span></div>'+
      '<div class="aura-row"><span class="aura-num">2</span><span>Deslizá y elegí <b>"Agregar a inicio"</b>.</span></div>'+
      '<div class="aura-row"><span class="aura-num">3</span><span>Tocá <b>Agregar</b>. ¡Listo! El ícono de Aura queda en tu pantalla. 🎉</span></div>',
      null);
  }

  window.auraInstall=function(){
    if(inApp()){ openBrowser(); return; }
    if(deferred){ deferred.prompt(); deferred.userChoice.finally(function(){ deferred=null; var b=document.getElementById('aura-pwa-bar'); if(b) b.remove(); }); return; }
    if(isIOS()){ iosGuide(); return; }
    sheet('Instalá Aura', '<p>Abrí el menú del navegador (⋮ o ⋯) y elegí <b>"Instalar app"</b> o <b>"Agregar a pantalla de inicio"</b>.</p>', null);
  };

  window.auraNotif=async function(){
    try{
      if(isIOS() && !isStandalone()){
        sheet('Activá los avisos 🔔', '<p>En iPhone, los avisos funcionan cuando Aura está <b>instalada como app</b>. Instalala primero (te muestro cómo) y después abrila desde su ícono para activarlos.</p>', 'Cómo instalar', function(){ closeSheet(); iosGuide(); });
        return;
      }
      if(!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window)){
        sheet('Avisos no disponibles', '<p>Tu navegador no permite avisos push. Probá abriendo Aura en <b>Chrome</b> (Android) o instalándola como app.</p>', null); return;
      }
      var perm=await Notification.requestPermission();
      if(perm!=='granted'){ toast('Podés activar los avisos cuando quieras 🔔'); return; }
      var reg=await navigator.serviceWorker.ready;
      var sub=await reg.pushManager.getSubscription();
      if(!sub){ sub=await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey:u8(VAPID) }); }
      await fetch(SUPA+'/functions/v1/guardar-suscripcion',{ method:'POST', headers:{'Content-Type':'application/json','apikey':KEY,'Authorization':'Bearer '+KEY}, body:JSON.stringify({ sub: sub.toJSON(), ua: navigator.userAgent.slice(0,180) }) });
      toast('¡Avisos activados! Te llegan las novedades de Aura 🔔');
      var b=document.getElementById('aura-pwa-bar'); if(b) b.remove();
    }catch(e){ console.error(e); sheet('Ups', '<p>No pudimos activar los avisos ahora. Probá de nuevo en un ratito.</p>', null); }
  };

  if('serviceWorker' in navigator){ window.addEventListener('load', function(){ navigator.serviceWorker.register('/sw.js').catch(function(e){console.warn('SW',e);}); }); }
  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferred=e; renderBar(); });
  window.addEventListener('appinstalled', function(){ var b=document.getElementById('aura-pwa-bar'); if(b) b.remove(); });

  function renderBar(){
    if(document.getElementById('aura-pwa-bar')) return;
    if(/feed\.html/.test(location.pathname) || /instalar\.html/.test(location.pathname)) return;
    if(isStandalone()) return;
    try{ if(localStorage.getItem('aura_pwa_dismiss')==='1') return; }catch(_){}
    var bar=document.createElement('div'); bar.id='aura-pwa-bar';
    bar.style.cssText='position:fixed;left:12px;right:12px;bottom:14px;z-index:9999;display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;background:rgba(20,16,24,.96);backdrop-filter:blur(10px);border:1px solid rgba(212,175,110,.35);border-radius:16px;padding:10px 12px;box-shadow:0 10px 30px rgba(0,0,0,.5);font-family:Helvetica,Arial,sans-serif';
    bar.innerHTML='<span style="color:#fff;font-size:13px;flex:1;min-width:140px">📲 Sumá Aura a tu pantalla de inicio</span>'+
      '<button onclick="auraInstall()" style="background:linear-gradient(90deg,#f59e0b,#f43f5e);color:#0a0a0c;font-weight:700;border:0;border-radius:999px;padding:9px 16px;font-size:13px;cursor:pointer">Instalar</button>'+
      '<button onclick="(function(){try{localStorage.setItem(\'aura_pwa_dismiss\',\'1\')}catch(e){};var b=document.getElementById(\'aura-pwa-bar\');if(b)b.remove();})()" style="background:transparent;color:#fff8;border:0;font-size:16px;padding:4px 6px;cursor:pointer">✕</button>';
    document.body.appendChild(bar);
  }
  function renderInApp(){
    if(!inApp() || isStandalone()) return;
    if(document.getElementById('aura-inapp')) return;
    var b=document.createElement('div'); b.id='aura-inapp';
    b.style.cssText='position:fixed;left:10px;right:10px;top:10px;z-index:99998;display:flex;gap:8px;align-items:center;background:linear-gradient(90deg,#f59e0b,#f43f5e);color:#0a0a0c;border-radius:14px;padding:10px 12px;box-shadow:0 8px 24px rgba(0,0,0,.4);font-family:Helvetica,Arial,sans-serif;font-weight:600;font-size:13px';
    b.innerHTML='<span style="flex:1">Para instalar Aura, abrila en tu navegador</span><button onclick="auraInstall()" style="background:#0a0a0c;color:#fff;border:0;border-radius:999px;padding:7px 14px;font-weight:700;font-size:13px">Abrir</button>';
    document.body.appendChild(b);
  }
  window.addEventListener('load', function(){ renderInApp(); setTimeout(renderBar, 1400); });
})();
