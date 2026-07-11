(function(){
  var VAPID='BLBxWk3M5hcx_QPWW1XdWp3V6RajAmqh1YfbdkJDsc2VgyfJAZQDupH-NFAZTW9fJc5yI4xV7pI0nWL8Z7eYxTA';
  var SUPA='https://fsjrimmurtnrorqhnbwu.supabase.co';
  var KEY='sb_publishable_2lWllWfVLWsPnnko4TEa4Q_2sx0kdI4';
  var deferred=null;
  function isStandalone(){ return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true; }
  function isIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent); }
  function u8(b){ var pad='='.repeat((4-b.length%4)%4); var s=(b+pad).replace(/-/g,'+').replace(/_/g,'/'); var raw=atob(s); var a=new Uint8Array(raw.length); for(var i=0;i<raw.length;i++)a[i]=raw.charCodeAt(i); return a; }

  if('serviceWorker' in navigator){ window.addEventListener('load', function(){ navigator.serviceWorker.register('/sw.js').catch(function(e){console.warn('SW',e);}); }); }
  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferred=e; renderBar(); });
  window.addEventListener('appinstalled', function(){ var b=document.getElementById('aura-pwa-bar'); if(b) b.remove(); });

  window.auraInstall=function(){
    if(deferred){ deferred.prompt(); deferred.userChoice.finally(function(){ deferred=null; var b=document.getElementById('aura-pwa-bar'); if(b) b.remove(); }); }
    else if(isIOS()){ alert('Para instalar Aura: tocá el botón Compartir (cuadrito con flecha ↑) y elegí "Agregar a inicio".'); }
    else { alert('Abrí el menú del navegador (⋮) y elegí "Instalar app" / "Agregar a pantalla de inicio".'); }
  };

  window.auraNotif=async function(){
    try{
      if(!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window)){ alert('Tu navegador no soporta notificaciones.'); return; }
      if(isIOS() && !isStandalone()){ alert('En iPhone primero instalá la app: Compartir → "Agregar a inicio". Después, abrila desde el ícono y activá las notificaciones.'); return; }
      var perm=await Notification.requestPermission();
      if(perm!=='granted'){ alert('No se activaron las notificaciones.'); return; }
      var reg=await navigator.serviceWorker.ready;
      var sub=await reg.pushManager.getSubscription();
      if(!sub){ sub=await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey:u8(VAPID) }); }
      await fetch(SUPA+'/functions/v1/guardar-suscripcion',{ method:'POST', headers:{'Content-Type':'application/json','apikey':KEY,'Authorization':'Bearer '+KEY}, body:JSON.stringify({ sub: sub.toJSON(), ua: navigator.userAgent.slice(0,180) }) });
      alert('¡Listo! Vas a recibir las novedades de Aura. 🔔');
      var b=document.getElementById('aura-pwa-bar'); if(b) b.remove();
    }catch(e){ console.error(e); alert('No se pudo activar: '+(e.message||e)); }
  };

  function renderBar(){
    if(document.getElementById('aura-pwa-bar')) return;
    if(/feed\.html/.test(location.pathname)) return;
    if(isStandalone()) return;
    try{ if(localStorage.getItem('aura_pwa_dismiss')==='1') return; }catch(_){}
    var canInstall = !!deferred || isIOS();
    var bar=document.createElement('div'); bar.id='aura-pwa-bar';
    bar.style.cssText='position:fixed;left:12px;right:12px;bottom:14px;z-index:9999;display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;background:rgba(15,10,20,.94);backdrop-filter:blur(10px);border:1px solid rgba(212,175,110,.35);border-radius:16px;padding:10px 12px;box-shadow:0 10px 30px rgba(0,0,0,.5);font-family:Helvetica,Arial,sans-serif';
    bar.innerHTML='<span style="color:#fff;font-size:13px;flex:1;min-width:150px">📲 Llevá Aura en tu celu y recibí avisos</span>'+
      (canInstall?'<button onclick="auraInstall()" style="background:linear-gradient(90deg,#f59e0b,#f43f5e);color:#0a0a0c;font-weight:700;border:0;border-radius:999px;padding:8px 14px;font-size:13px">Instalar</button>':'')+
      '<button onclick="auraNotif()" style="background:rgba(255,255,255,.12);color:#fff;font-weight:700;border:0;border-radius:999px;padding:8px 14px;font-size:13px">🔔 Avisos</button>'+
      '<button onclick="(function(){try{localStorage.setItem(\'aura_pwa_dismiss\',\'1\')}catch(e){};document.getElementById(\'aura-pwa-bar\').remove();})()" style="background:transparent;color:#fff8;border:0;font-size:16px;padding:4px 6px">✕</button>';
    document.body.appendChild(bar);
  }
  window.addEventListener('load', function(){ setTimeout(renderBar, 1200); });
})();
