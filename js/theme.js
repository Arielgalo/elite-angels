/* Aura — alternador de tema día/noche. Claro por defecto. */
(function(){
  var KEY='aura_theme';
  var MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg>';
  function cur(){ return document.documentElement.getAttribute('data-theme')==='dark'?'dark':'light'; }
  function apply(t){ if(t==='dark') document.documentElement.setAttribute('data-theme','dark'); else document.documentElement.removeAttribute('data-theme'); }
  function build(){
    if(document.getElementById('themeToggle')) return;
    var b=document.createElement('button');
    b.id='themeToggle'; b.className='theme-toggle'; b.type='button';
    function refresh(){ var t=cur(); b.innerHTML = t==='dark' ? SUN : MOON; var lbl = t==='dark' ? 'Cambiar a modo día' : 'Cambiar a modo noche'; b.setAttribute('aria-label',lbl); b.title=lbl; }
    b.addEventListener('click',function(){ var n = cur()==='dark' ? 'light' : 'dark'; apply(n); try{ localStorage.setItem(KEY,n); }catch(e){} refresh(); });
    document.body.appendChild(b); refresh();
  }
  if(document.readyState!=='loading') build(); else document.addEventListener('DOMContentLoaded',build);
})();
