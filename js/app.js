/* AURA EXPERIENCE — Lógica del sitio */
const fmtP = (n) => '$' + Number(n || 0).toLocaleString('es-AR');
const ubicTxt = (m) => [m.ciudad, m.provincia].filter(Boolean).join(', ');
const waLink = (tel) => 'https://wa.me/' + String(tel || '').replace(/[^\d]/g, '');
const numCm = (v) => { const n = parseInt(String(v||'').replace(/[^\d]/g,''),10); return isNaN(n)?null:n; };

const MODELS = [
  { id:'martina', name:'Martina', provincia:'Ciudad de Buenos Aires', ciudad:'Palermo', age:24, height:'1.72', cabello:'Castaña', tipo:'Delgada', nacionalidad:'Argentina', precio_cita:60000, price:60000, plan:'premium', puntos:48, tone:'#d4af6e', langs:['Español','Inglés'], style:['Elegante','Culta'], bio:'Refinada, culta y conversadora.' },
  { id:'delfina', name:'Delfina', provincia:'Córdoba', ciudad:'Córdoba', age:26, height:'1.75', cabello:'Morena', tipo:'Atlética', nacionalidad:'Argentina', precio_cita:50000, price:50000, plan:'premium', puntos:35, tone:'#d9a7a0', langs:['Español','Portugués'], style:['Sofisticada'], bio:'Presencia magnética y trato exquisito.' },
  { id:'camila', name:'Camila', provincia:'Santa Fe', ciudad:'Rosario', age:23, height:'1.68', cabello:'Rubia', tipo:'Curvas', nacionalidad:'Argentina', precio_cita:40000, price:40000, plan:'top', puntos:18, tone:'#e8cf9a', langs:['Español'], style:['Dulce'], bio:'Encanto y buena charla.' },
  { id:'renata', name:'Renata', provincia:'Buenos Aires', ciudad:'La Plata', age:25, height:'1.71', cabello:'Morena', tipo:'Curvas', nacionalidad:'Argentina', precio_cita:35000, price:35000, plan:'top', puntos:14, tone:'#cfc0a4', langs:['Español'], style:['Apasionada'], bio:'Carácter cálido y cercano.' },
  { id:'lucia', name:'Lucía', provincia:'Mendoza', ciudad:'Mendoza', age:22, height:'1.70', cabello:'Castaña', tipo:'Delgada', nacionalidad:'Argentina', precio_cita:30000, price:30000, plan:'estandar', puntos:6, tone:'#c9a4cf', langs:['Español'], style:['Juvenil'], bio:'Juventud y simpatía.' },
  { id:'abril', name:'Abril', provincia:'Neuquén', ciudad:'Neuquén', age:27, height:'1.73', cabello:'Pelirroja', tipo:'Curvas', nacionalidad:'Argentina', precio_cita:30000, price:30000, plan:'estandar', puntos:3, tone:'#a4b8cf', langs:['Español'], style:['Carismática'], bio:'Para conocernos sin apuro.' },
  { id:'valentina', name:'Valentina', provincia:'Ciudad de Buenos Aires', ciudad:'Recoleta', age:28, height:'1.74', cabello:'Rubia', tipo:'Voluptuosa', nacionalidad:'Argentina', precio_cita:50000, price:50000, plan:'top', puntos:22, tone:'#e8cf9a', langs:['Español','Inglés'], style:['Glamorosa'], bio:'Elegancia y actitud.' },
  { id:'bianca', name:'Bianca', provincia:'Salta', ciudad:'Salta', age:23, height:'1.69', cabello:'Morena', tipo:'Delgada', nacionalidad:'Argentina', precio_cita:30000, price:30000, plan:'estandar', puntos:1, tone:'#cfc0a4', langs:['Español'], style:['Misteriosa'], bio:'Un café y una buena charla.' },
];
function figureSVG(tone){ return `<svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" color="${tone}" d="M100 40c14 0 24 11 24 27s-10 30-24 30-24-14-24-30 10-27 24-27Zm-44 110c8-18 25-30 44-30s36 12 44 30c10 22 14 70 14 130H42c0-60 4-108 14-130Z"/></svg>`; }

const PLAN_BADGE={premium:'PREMIUM VIP',top:'TOP',estandar:'ESTÁNDAR'};
function tierRank(m){ return m.plan==='premium'?0:(m.plan==='top'?1:2); }
function planBadge(m){ const p=m.plan||'estandar'; const cls=p==='premium'?'model-badge vip right':(p==='top'?'model-badge tier-top right':'model-badge tier-std right'); return `<span class="${cls}">${PLAN_BADGE[p]||'ESTÁNDAR'}</span>`; }
function planName(p){ return p==='premium'?'Premium VIP':(p==='top'?'Top':'Estándar'); }

function cardMedia(m){ return m.foto ? `<div class="figure" style="position:absolute;inset:0"><img src="${m.foto}" alt="${m.name}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover"></div>` : `<div class="figure" style="position:absolute;inset:0">${figureSVG(m.tone||'#d4af6e')}</div>`; }
const ROLES_LBL={citas:'Pactos & Acuerdos',amigos:'Amigos & Salidas',eventos:'Eventos, Roles & Presencia'};
const ROLES_SHORT={citas:'Citas',amigos:'Amigos',eventos:'Eventos'};
function modelCard(m){
  const href = m.sid ? `perfil.html?sid=${m.sid}` : `perfil.html?id=${m.id}`;
  const vid = (m.videos && m.videos.length) ? '<span class="card-flag">▶ Video</span>' : '';
  const cita = m.price || m.precio_cita || 15000;
  return `<a class="model-card plan-${m.plan||'estandar'}" href="${href}" data-prov="${m.provincia||''}">
    <span class="model-price"><small>Acuerdo desde</small> <b>${fmtP(cita)}</b></span>
    ${planBadge(m)}${vid}
    ${cardMedia(m)}
    <div class="model-info"><h3>${m.name}</h3>
      <div class="loc"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>${ubicTxt(m)}</div>
      <div class="attrs"><span>${m.age||m.edad||''} años</span>${m.genero?`<span>·</span><span>${m.genero}</span>`:''}<span>·</span><span style="color:var(--gold)">${planName(m.plan)}</span>${m.puntos?`<span>·</span><span style="color:var(--gold)">★ ${m.puntos}</span>`:''}</div>
      ${(m.roles&&m.roles.length)?`<div class="role-tags">${m.roles.map(r=>`<span class="role-tag">${ROLES_SHORT[r]||r}</span>`).join('')}</div>`:''}${m.verificado?`<div class="verif-badge">✓ Verificado</div>`:``}<div class="model-cta"><span class="link">Ver perfil →</span></div>
    </div></a>`;
}
function fromPublicado(p){ return { sid:p.id, name:p.nombre, pais:'Argentina', provincia:p.provincia, ciudad:p.ciudad, edad:p.edad, age:p.edad, height:p.altura, busto:p.busto, cintura:p.cintura, cola:p.cola, nacionalidad:p.nacionalidad, cabello:p.cabello, tipo:p.tipo_cuerpo, price:(p.precio_cita||p.precio), precio_cita:(p.precio_cita||p.precio), plan:(p.plan||'estandar'), puntos:(p.puntos||0), numero:p.numero, foto:(Array.isArray(p.fotos)&&p.fotos[0])||null, fotos:p.fotos||[], videos:p.videos||[], audio:p.audio, telefono:p.telefono, bio:p.bio, idiomas:p.idiomas, estilo:p.estilo, genero:p.genero, roles:(p.roles||[]), verificado:p.verificado, created:p.created_at, nivel_educativo:p.nivel_educativo, edu_estado:p.edu_estado, estudio:p.estudio, cursos:p.cursos, hobbies:p.hobbies, rutinas:p.rutinas, habilidades:p.habilidades, otros_gustos:p.otros_gustos, comidas_gusta:p.comidas_gusta, comidas_rechaza:p.comidas_rechaza, negocio:p.negocio, negocio_nombre:p.negocio_nombre, negocio_rubro:p.negocio_rubro, negocio_servicios:p.negocio_servicios, negocio_promo:p.negocio_promo, negocio_zona:p.negocio_zona, negocio_contacto:p.negocio_contacto, negocio_web:p.negocio_web, langs:(p.idiomas?String(p.idiomas).split(',').map(x=>x.trim()).filter(Boolean):[]), style:(p.estilo?String(p.estilo).split(',').map(x=>x.trim()).filter(Boolean):[]) }; }
let _realesCache=null; async function getReales(){ if(_realesCache) return _realesCache; try { _realesCache = window.eaSupa ? (await window.eaSupa.getPublicados()).map(fromPublicado) : []; } catch(e){ _realesCache=[]; } return _realesCache; }

function setHeroStats(list){ const n=document.getElementById('statModelos'); if(n) n.textContent=list.length; const c=document.getElementById('statCiudades'); if(c){ const ciu=new Set(list.map(m=>m.provincia).filter(Boolean)); c.textContent=ciu.size||1; } }
async function renderDestacados(){
  const nEl=document.getElementById('nuevosGrid'), sEl=document.getElementById('subenGrid'); if(!nEl&&!sEl) return;
  const reales=await getReales();
  const sec=document.getElementById('destSection');
  if(!reales.length){ if(sec) sec.style.display='none'; return; }
  if(nEl){ const nuevos=reales.slice().sort((a,b)=>new Date(b.created||0)-new Date(a.created||0)).slice(0,4); nEl.innerHTML=nuevos.map(modelCard).join(''); }
  if(sEl){ const suben=reales.slice().filter(m=>(m.puntos||0)>0).sort((a,b)=>(b.puntos||0)-(a.puntos||0)).slice(0,4); sEl.innerHTML=suben.map(modelCard).join(''); }
}
async function renderFeatured(){ const reales=await getReales(); const base=(reales.length?reales:MODELS).slice().sort((a,b)=>tierRank(a)-tierRank(b)||(b.puntos||0)-(a.puntos||0)); setHeroStats(base); const el=document.getElementById('featuredGrid'); if(!el) return; el.innerHTML=base.slice(0,8).map(modelCard).join(''); }

let CATALOGO=[];
async function renderCatalog(){
  const el=document.getElementById('modelsGrid'); if(!el) return;
  const reales=await getReales(); CATALOGO=(reales.length?reales:MODELS).slice().sort((a,b)=>tierRank(a)-tierRank(b)||(b.puntos||0)-(a.puntos||0)); setHeroStats(CATALOGO);
  // cascada de ubicación en el buscador
  const L=window.EA_LOCATIONS||{}; const qP=document.getElementById('qPais'),qPr=document.getElementById('qProv'),qC=document.getElementById('qCiudad');
  const provs=Object.keys(L['Argentina']||{});
  if(qP){ qP.style.display='none'; qP.innerHTML='<option value="Argentina" selected>Argentina</option>'; qP.value='Argentina'; }
  if(qPr){ qPr.innerHTML='<option value="">Toda la Argentina</option>'+provs.map(p=>`<option>${p}</option>`).join('');
    qPr.addEventListener('change',()=>{ const cs=((L['Argentina']||{})[qPr.value])||[]; if(qC) qC.innerHTML='<option value="">Toda ciudad</option>'+cs.map(c=>`<option>${c}</option>`).join(''); }); }
  // preset por URL (?prov=)
  const presetProv=new URLSearchParams(location.search).get('prov'); if(presetProv&&qPr){ qPr.value=presetProv; qPr.dispatchEvent(new Event('change')); }
  const buscar=document.getElementById('qBuscar'), limpiar=document.getElementById('qLimpiar');
  if(buscar) buscar.addEventListener('click',aplicar);
  const qrol=document.getElementById('qRol'); if(qrol) qrol.addEventListener('change',aplicar);
  const qver=document.getElementById('qVerif'); if(qver) qver.addEventListener('change',aplicar);
  if(limpiar) limpiar.addEventListener('click',()=>{ document.querySelectorAll('.search-panel input,.search-panel select').forEach(i=>i.value=''); aplicar(); });
  aplicar();
}
function aplicar(){
  const el=document.getElementById('modelsGrid'); if(!el) return;
  const v=(id)=>{ const e=document.getElementById(id); return e?e.value.trim():''; };
  const texto=v('qText').toLowerCase(), fp=v('qPais'), fpr=v('qProv'), fc=v('qCiudad');
  const emin=+v('qEdadMin')||0, emax=+v('qEdadMax')||999, pmin=+v('qPrecioMin')||0, pmax=+v('qPrecioMax')||1e12;
  const halt=numCm(v('qAltura'))||0, fb=v('qBusto').toLowerCase(), fci=v('qCintura').toLowerCase(), fco=v('qCola').toLowerCase();
  const fcab=v('qCabello'), ftipo=v('qTipo'), fgen=v('qGenero'), frol=v('qRol');
  const res=CATALOGO.filter(m=>{
    const edad=+(m.age||m.edad||0); const alt=numCm(m.height)||0;
    if(texto){ const blob=[m.name,m.ciudad,m.provincia,m.pais,m.nacionalidad,m.genero,m.bio].join(' ').toLowerCase(); if(!blob.includes(texto)) return false; }
    if(fpr && m.provincia!==fpr) return false;
    if(fc && m.ciudad!==fc) return false;
    if(edad<emin||edad>emax) return false;
    if((m.price||0)<pmin||(m.price||0)>pmax) return false;
    if(halt && alt<halt) return false;
    if(fb && !String(m.busto||'').toLowerCase().includes(fb)) return false;
    if(fci && !String(m.cintura||'').toLowerCase().includes(fci)) return false;
    if(fco && !String(m.cola||'').toLowerCase().includes(fco)) return false;
    if(fcab && (m.cabello||'')!==fcab) return false;
    if(fgen && (m.genero||'')!==fgen) return false;
    if(frol && !((m.roles||[]).includes(frol))) return false;
    const qv=document.getElementById('qVerif'); if(qv&&qv.checked && !m.verificado) return false;
    if(ftipo && (m.tipo||'')!==ftipo) return false;
    return true;
  });
  el.innerHTML = res.length ? res.map(modelCard).join('') : '<div class="panel-empty" style="grid-column:1/-1"><div class="pe-ic">🔎</div><h3>Sin resultados</h3><p>Probá ampliar tu búsqueda.</p></div>';
  const cont=document.getElementById('qCount'); if(cont) cont.textContent = res.length+' resultado'+(res.length===1?'':'s');
}

function lightbox(src, list, idx){
  const arr = (Array.isArray(list)&&list.length) ? list.slice() : [src];
  let start = (typeof idx==='number' && idx>=0) ? idx : Math.max(0, arr.indexOf(src));
  let lb=document.getElementById('eaLightbox');
  if(!lb){
    if(!document.getElementById('lbCss')){ var st=document.createElement('style'); st.id='lbCss'; st.textContent=
      '.lightbox .lb-nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.12);color:rgba(255,255,255,.5);border:none;width:44px;height:44px;border-radius:50%;font-size:27px;line-height:1;cursor:pointer;z-index:3;display:flex;align-items:center;justify-content:center;padding-bottom:3px;opacity:.4;transition:opacity .2s,background .2s}'+
      '.lightbox .lb-nav:hover{opacity:.85;background:rgba(0,0,0,.28);color:#fff}'+
      '.lightbox .lb-prev{left:8px}.lightbox .lb-next{right:8px}'+
      '.lightbox .lb-dots{position:absolute;bottom:14px;left:0;right:0;display:flex;gap:6px;justify-content:center;z-index:3}'+
      '.lightbox .lb-dots i{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.4)}.lightbox .lb-dots i.on{background:#fff}'+
      '.lightbox img{touch-action:none;user-select:none;-webkit-user-drag:none;transition:transform .07s ease-out}';
      document.head.appendChild(st); }
    lb=document.createElement('div'); lb.id='eaLightbox'; lb.className='lightbox';
    lb.innerHTML='<span class="lb-close">✕</span><button class="lb-nav lb-prev" aria-label="Anterior">‹</button><img alt=""><button class="lb-nav lb-next" aria-label="Siguiente">›</button><div class="lb-dots"></div>';
    document.body.appendChild(lb);
    const img=lb.querySelector('img');
    let scale=1, tx=0, ty=0, pinchStart=0, scaleStart=1, st1=null, panStart=null, lastTap=0;
    function apply(){ img.style.transform='translate('+tx+'px,'+ty+'px) scale('+scale+')'; }
    function reset(){ scale=1; tx=0; ty=0; apply(); }
    function dist(ts){ const a=ts[0],b=ts[1]; return Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY); }
    lb._reset=reset;
    lb.addEventListener('click',function(e){ if(e.target===lb||e.target.classList.contains('lb-close')) lb.classList.remove('show'); });
    lb.querySelector('.lb-prev').addEventListener('click',function(e){ e.stopPropagation(); reset(); lb._go(-1); });
    lb.querySelector('.lb-next').addEventListener('click',function(e){ e.stopPropagation(); reset(); lb._go(1); });
    img.addEventListener('touchstart',function(e){
      if(e.touches.length===2){ pinchStart=dist(e.touches); scaleStart=scale; st1=null; }
      else if(e.touches.length===1){ const t=e.touches[0]; st1={x:t.clientX,y:t.clientY}; panStart={x:tx,y:ty,px:t.clientX,py:t.clientY};
        const now=Date.now(); if(now-lastTap<300){ if(scale>1) reset(); else { scale=2.2; apply(); } lastTap=0; e.preventDefault(); } else lastTap=now; }
    },{passive:false});
    img.addEventListener('touchmove',function(e){
      if(e.touches.length===2){ e.preventDefault(); scale=Math.min(4,Math.max(1, scaleStart*(dist(e.touches)/pinchStart))); apply(); }
      else if(e.touches.length===1 && scale>1){ e.preventDefault(); const t=e.touches[0]; tx=panStart.x+(t.clientX-panStart.px); ty=panStart.y+(t.clientY-panStart.py); apply(); }
    },{passive:false});
    img.addEventListener('touchend',function(e){
      if(scale<=1.03){ if(st1){ const ch=e.changedTouches[0]; const dx=ch.clientX-st1.x, dy=ch.clientY-st1.y; if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){ reset(); lb._go(dx<0?1:-1); return; } } reset(); }
    });
    document.addEventListener('keydown',function(e){ if(!lb.classList.contains('show'))return; if(e.key==='ArrowRight'){reset();lb._go(1);} else if(e.key==='ArrowLeft'){reset();lb._go(-1);} else if(e.key==='Escape')lb.classList.remove('show'); });
    lb._render=function(){ const multi=lb._arr.length>1; img.src=lb._arr[lb._i]; lb.querySelector('.lb-prev').style.display=multi?'':'none'; lb.querySelector('.lb-next').style.display=multi?'':'none'; lb.querySelector('.lb-dots').innerHTML= multi? lb._arr.map(function(_,k){return '<i class="'+(k===lb._i?'on':'')+'"></i>';}).join('') : ''; };
    lb._go=function(d){ lb._reset&&lb._reset(); lb._i=(lb._i+d+lb._arr.length)%lb._arr.length; lb._render(); };
  }
  lb._reset&&lb._reset();
  lb._arr=arr; lb._i=Math.min(Math.max(0,start),arr.length-1); lb._render(); lb.classList.add('show');
}

function mediaKind(u){ const e=(String(u).split('?')[0].split('.').pop()||'').toLowerCase(); if(['mp3','wav','ogg','oga','m4a','aac','opus','weba','flac'].includes(e)) return 'audio'; return 'video'; }
async function renderProfile(){
  const wrap=document.getElementById('pName'); if(!wrap) return;
  const params=new URLSearchParams(location.search); const sid=params.get('sid'); let m,real=false;
  if(sid&&window.eaSupa){ const p=await window.eaSupa.getPerfil(sid); if(p){ m=fromPublicado(p); real=true; } }
  if(!m){ const id=params.get('id')||'valentina'; m=MODELS.find(x=>x.id===id)||MODELS[0]; }
  document.title=`${m.name} · Aura Experience`;
  document.getElementById('crumbName').textContent=m.name;
  document.getElementById('pName').textContent=m.name; if(m.verificado){ const _pn=document.getElementById('pName'); if(_pn && !_pn.parentElement.querySelector('.verif-badge')) _pn.insertAdjacentHTML('afterend','<span class="verif-badge" style="margin-top:6px">✓ Perfil verificado</span>'); }
  document.getElementById('pLoc').textContent=ubicTxt(m);
  (function(){ try{
    if(!document.getElementById('auraKf')){ var st=document.createElement('style'); st.id='auraKf'; st.textContent='@keyframes auraspin{to{transform:rotate(360deg)}}'; document.head.appendChild(st); }
    var fresh = m.created ? ((Date.now()-new Date(m.created).getTime())<86400000) : false;
    var av = (m.fotos&&m.fotos.length)?m.fotos[0]:null;
    var ph = document.querySelector('.profile-header'); if(!ph) return;
    var feedHref = 'feed.html'+(m.sid?('?sid='+m.sid):'');
    var ringBg = fresh?'conic-gradient(from 0deg,#f59e0b,#f43f5e,#a855f7,#f59e0b)':'#3a3a40';
    var glow = fresh?'box-shadow:0 0 18px 3px rgba(244,63,94,.55);':'';
    var spin = fresh?'animation:auraspin 4s linear infinite;':'';
    var inner = av?('<img src="'+av+'" alt="'+(m.name||'')+'" style="width:100%;height:100%;object-fit:cover">'):('<div style="width:100%;height:100%;background:'+(m.tone||'#d4af6e')+'"></div>');
    var lbl = fresh?'\u25cf Nuevo \u00b7 tocá para ver':'Ver en el feed';
    var lblColor = fresh?'#f6a5b4':'var(--text-mute)';
    var html='<a href="'+feedHref+'" class="aura-avatar" title="Ver a '+(m.name||'')+' en el feed" style="display:inline-flex;flex-direction:column;align-items:center;gap:7px;text-decoration:none;margin-bottom:16px">'
      +'<span style="position:relative;width:104px;height:104px;display:inline-block">'
      +'<span style="position:absolute;inset:0;border-radius:50%;background:'+ringBg+';'+glow+spin+'"></span>'
      +'<span style="position:absolute;inset:'+(fresh?4:3)+'px;border-radius:50%;overflow:hidden;background:#111;display:block">'+inner+'</span>'
      +'</span>'
      +'<span style="font-size:.74rem;color:'+lblColor+';letter-spacing:.03em;font-weight:600">'+lbl+'</span></a>';
    ph.insertAdjacentHTML('afterbegin', html);
  }catch(e){} })();

  document.getElementById('pBio').textContent=m.bio||'';
  const fotos=(m.fotos&&m.fotos.length)?m.fotos:null;
  const mainImg=document.getElementById('mainImg');
  mainImg.innerHTML=fotos?`<img src="${fotos[0]}" alt="${m.name}" style="width:100%;height:100%;object-fit:cover;cursor:zoom-in">`:`<div class="figure" style="position:absolute;inset:0">${figureSVG(m.tone||'#d4af6e')}</div>`;
  if(fotos) mainImg.querySelector('img').addEventListener('click',()=>lightbox(fotos[0], fotos, 0));
  const thumbsEl=document.getElementById('thumbs');
  if(fotos){ thumbsEl.innerHTML=fotos.map((x,i)=>`<div class="thumb${i===0?' active':''}"><img src="${x}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover"></div>`).join(''); thumbsEl.querySelectorAll('.thumb').forEach((t,i)=>t.addEventListener('click',()=>{ const im=mainImg.querySelector('img'); if(im) im.src=fotos[i]; thumbsEl.querySelectorAll('.thumb').forEach(x=>x.classList.remove('active')); t.classList.add('active'); })); }
  else { thumbsEl.innerHTML=[m.tone||'#d4af6e','#d9a7a0','#e8cf9a','#a4b8cf'].map(t=>`<div class="thumb"><div class="figure" style="position:absolute;inset:0">${figureSVG(t)}</div></div>`).join(''); }
  try{ if(window.matchMedia('(max-width: 760px)').matches){
    var _mi=document.getElementById('mainImg'); if(_mi) _mi.style.display='none';
    var _av=document.querySelector('.aura-avatar'); if(_av){ _av.style.display='flex'; _av.style.width='max-content'; _av.style.margin='6px auto 16px'; var _rw=_av.querySelector('span'); if(_rw){ _rw.style.width='140px'; _rw.style.height='140px'; } }
    var _th=document.getElementById('thumbs'); var _hd=document.querySelector('.profile-header'); if(_th&&_hd){ _hd.insertAdjacentElement('afterend', _th); _th.style.margin='2px 0 20px'; }
    if(fotos&&_th){ _th.querySelectorAll('.thumb').forEach(function(t,i){ t.style.cursor='zoom-in'; t.addEventListener('click',function(){ if(typeof lightbox==='function') lightbox(fotos[i], fotos, i); }); }); }
  } }catch(e){}
  const allMedia=[...(m.videos||[])]; if(m.audio) allMedia.push(m.audio);
  const vids=allMedia.filter(u=>mediaKind(u)==='video'); const auds=allMedia.filter(u=>mediaKind(u)==='audio');
  const vidWrap=document.getElementById('profileVideos'); if(vidWrap){ vidWrap.innerHTML=vids.length?`<h3 style="font-size:1.4rem;margin:8px 0 14px">Videos</h3><div class="video-grid">${vids.map(v=>`<video controls preload="metadata" playsinline><source src="${v}">Tu navegador no puede reproducir este video.</video>`).join('')}</div>`:''; }
  const audWrap=document.getElementById('profileAudio'); if(audWrap){ audWrap.innerHTML=auds.length?auds.map(a=>`<div class="voice-card"><span class="voice-ic">🎤</span><div style="flex:1"><div class="voice-t">Mensaje de voz</div><audio controls src="${a}" style="width:100%;margin-top:6px"></audio></div></div>`).join(''):''; }
  const specs=[['Edad',(m.age||m.edad||'—')+' años'],['Altura',(m.height||'—')],['Acuerdo desde',fmtP(m.price)],['Ubicación',m.ciudad||'—']];
  if(m.busto) specs.push(['Busto',m.busto]); if(m.cintura) specs.push(['Cintura',m.cintura]); if(m.cola) specs.push(['Cola',m.cola]);
  if(m.genero) specs.push(['Género',m.genero]); if(m.cabello) specs.push(['Cabello',m.cabello]); if(m.tipo) specs.push(['Cuerpo',m.tipo]); if(m.nacionalidad) specs.push(['Nacionalidad',m.nacionalidad]);
  document.getElementById('specGrid').innerHTML=specs.map(s=>`<div class="spec"><div class="k">${s[0]}</div><div class="v">${s[1]}</div></div>`).join('');
  const _idi=(m.langs||[]).length?`<div class="chip-group"><span class="chip-label">Idiomas</span>${(m.langs).map(c=>`<span class="chip chip-lang">${c}</span>`).join('')}</div>`:'';
  const _rol=(m.roles||[]).length?`<div class="chip-group"><span class="chip-label">Ofrece</span>${m.roles.map(r=>`<span class="chip chip-lang">${ROLES_LBL[r]||r}</span>`).join('')}</div>`:'';
  const _est=(m.style||[]).length?`<div class="chip-group"><span class="chip-label">Estilo</span>${(m.style).map(c=>`<span class="chip">${c}</span>`).join('')}</div>`:'';
  document.getElementById('pChips').innerHTML=(_rol+_idi+_est)||'<span style="color:var(--text-mute)">Sin especificar todavía</span>';
  (function(){ try{
    var cv=[['Formación',[m.nivel_educativo, m.edu_estado?('· '+m.edu_estado):'', m.estudio?('— '+m.estudio):''].filter(Boolean).join(' ')],['Cursos y capacitaciones',m.cursos],['Habilidades',m.habilidades],['Hobbies e intereses',m.hobbies],['Rutinas',m.rutinas],['Otros gustos',m.otros_gustos],['Comidas que disfruta',m.comidas_gusta],['No consume',m.comidas_rechaza],['Negocio / oficio',m.negocio]].filter(function(x){return x[1];});
    var chipsEl=document.getElementById('pChips'); if(chipsEl && cv.length){
      var esc=function(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');};
      var html='<div style="border-top:1px solid var(--line-soft);margin-top:24px;padding-top:18px"><h3 style="font-size:1.4rem;margin-bottom:14px">Perfil profesional</h3>'+cv.map(function(fld){return '<div style="margin-bottom:12px"><div style="font-size:.72rem;text-transform:uppercase;letter-spacing:.07em;color:var(--gold);margin-bottom:2px">'+fld[0]+'</div><div style="color:var(--text-soft);white-space:pre-line;line-height:1.55">'+esc(fld[1])+'</div></div>';}).join('')+'</div>';
      chipsEl.insertAdjacentHTML('afterend', html);
    }
    if(m.sid && cv.length){ setTimeout(function(){ var acc=document.getElementById('profileActions'); if(acc && !acc.querySelector('.cv-btn')) acc.insertAdjacentHTML('beforeend','<a class="cv-btn" href="cv.html?sid='+m.sid+'" class="btn btn-ghost" style="display:flex;justify-content:center;margin-top:10px;padding:12px;border:1px solid var(--line);border-radius:999px;color:var(--gold);text-decoration:none">📄 Ver / descargar currículum (PDF)</a>'); },80); }
  }catch(e){} })();
  (function(){ try{
    if(!(m.negocio_nombre||m.negocio||m.negocio_servicios||m.negocio_promo)) return;
    var esc=function(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;');};
    var servs= m.negocio_servicios? String(m.negocio_servicios).split(/\n/).map(function(t){return t.trim();}).filter(Boolean).map(function(t){return '<div style="color:var(--text-soft);font-size:.9rem;padding-left:15px;position:relative;margin-bottom:5px;line-height:1.5"><span style="position:absolute;left:0;top:8px;width:5px;height:5px;border-radius:50%;background:var(--gold)"></span>'+esc(t)+'</div>';}).join(''):'';
    var promo= m.negocio_promo? '<div style="background:linear-gradient(90deg,rgba(245,158,11,.16),rgba(244,63,94,.12));border:1px solid rgba(245,158,11,.4);border-radius:12px;padding:10px 14px;margin:12px 0;color:var(--gold-bright);font-weight:600">🎁 '+esc(m.negocio_promo)+'</div>':'';
    var wa= m.negocio_contacto? '<a href="'+waLink(m.negocio_contacto)+'" target="_blank" class="btn btn-wa" style="justify-content:center;margin-top:12px">💬 Contactar el negocio por WhatsApp</a>':'';
    var webu= m.negocio_web? (/^https?:/.test(m.negocio_web)? m.negocio_web : (m.negocio_web.charAt(0)==='@'? 'https://instagram.com/'+m.negocio_web.slice(1) : 'https://'+m.negocio_web)) : '';
    var web= webu? '<a href="'+webu+'" target="_blank" style="color:var(--gold);font-size:.88rem;text-decoration:none;display:inline-block;margin-top:10px">🔗 '+esc(m.negocio_web)+'</a>':'';
    var html='<div style="border:1px solid var(--gold);border-radius:16px;padding:22px;margin-top:26px;background:rgba(212,175,110,.05)">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:4px"><h3 style="font-size:1.45rem">💼 '+esc(m.negocio_nombre||'Mi negocio')+'</h3>'+(m.negocio_rubro?'<span style="font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:var(--gold);border:1px solid var(--line);border-radius:999px;padding:3px 11px">'+esc(m.negocio_rubro)+'</span>':'')+'</div>'
      +(m.negocio?'<p style="color:var(--text-soft);line-height:1.65;margin-bottom:6px">'+esc(m.negocio)+'</p>':'')
      +promo
      +(servs?'<div style="margin:10px 0"><div style="font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--gold);margin-bottom:7px">Servicios / productos</div>'+servs+'</div>':'')
      +(m.negocio_zona?'<div style="color:var(--text-mute);font-size:.86rem;margin-top:8px">📍 '+esc(m.negocio_zona)+'</div>':'')
      +wa+web+'</div>';
    var acc=document.getElementById('profileActions'); if(acc) acc.insertAdjacentHTML('beforebegin', html);
  }catch(e){} })();
  const rateBox=document.getElementById('rateBox'); if(rateBox){ const pn=planName(m.plan);
    rateBox.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="font-size:1.3rem">Pacto</h3><span class="tier-pill tier-${m.plan||'estandar'}">${pn}</span></div>
      <div class="rate-row"><span class="dur">Acordar o pactar · desde 30 min</span><span class="pr">${fmtP(m.price)}</span></div>
      <p style="color:var(--text-soft);font-size:.86rem;margin-top:14px">El valor del pacto se acuerda y se paga el tiempo <strong>a ${m.name}</strong> (transferencia o en efectivo). Lo que consuman —café, mates, una cena o una bebida— lo abona quien invita.</p>
      ${m.numero?`<p style="color:var(--text-mute);font-size:.78rem;margin-top:10px">Código de perfil: <strong style="color:var(--gold)">${m.numero}</strong>${m.puntos?` · <span style=\"color:var(--gold)\">★ ${m.puntos} puntos</span>`:''}</p>`:''}`; }
  const acc=document.getElementById('profileActions'); if(acc){ const tel=real?m.telefono:''; acc.innerHTML=tel?`<a href="${waLink(tel)}" target="_blank" class="btn btn-wa" style="justify-content:center">Contratar por WhatsApp</a><p style="color:var(--text-mute);font-size:.82rem;margin-top:10px">Contratación directa y privada con ${m.name}.</p>`:`<a href="https://wa.me/" target="_blank" class="btn btn-wa" style="justify-content:center">Contactar</a>`; }
  if(real&&window.eaSupa) renderResenas(m.sid, m); if(new URLSearchParams(location.search).get('pts')==='ok'){ setTimeout(()=>alert('¡Gracias! Recibimos tu pago de puntos. Se acreditarán a '+m.name+' tras la moderación.'),300); }
  const rel=document.getElementById('relatedGrid'); if(rel){ const reales=await getReales(); rel.innerHTML=[...reales,...MODELS].filter(x=>(x.sid||x.id)!==(m.sid||m.id)).slice(0,4).map(modelCard).join(''); }
}

async function renderResenas(sid, modelo){
  const cont=document.getElementById('resenasSection'); if(!cont) return;
  let lista=[]; try{ lista=await window.eaSupa.getResenas(sid); }catch(e){}
  const items=lista.length?lista.map(r=>`<div class="resena"><div class="resena-top"><span class="resena-av">${(r.autor||'?').slice(0,1).toUpperCase()}</span><div><div class="resena-nm">${r.autor||'Anónimo'}</div><div class="resena-stars">${'★'.repeat(r.estrellas)}${'☆'.repeat(5-r.estrellas)}</div></div></div><p>${(r.texto||'').replace(/</g,'&lt;')}</p></div>`).join(''):'<p style="color:var(--text-mute)">Todavía no hay reseñas. ¡Sé el primero!</p>';
  const numNota = (modelo&&modelo.numero)?`<div class="pts-nota"><strong>¿Te gustó ${modelo.name}?</strong> Valorá con estrellas a ${modelo.name}. Cada estrella suma <strong>1 punto</strong> a su ranking. Para potenciar su lugar, reconocela con <strong>$1.000 por punto</strong> pagando de forma segura por Mercado Pago — se asignan a su número <span class="num-chip">${modelo.numero}</span> y suben tras la moderación.<div class="pts-buy"><span class="cur">$</span><input id="ptsMonto" type="number" min="5000" step="1000" placeholder="5000" value="5000"><span id="ptsCalc">5 puntos</span><button class="btn btn-gold" id="ptsPagar">Potenciar a ${modelo.name}</button></div><div id="ptsMsg" class="pts-msg"></div></div>`:'';
  cont.innerHTML=`<div class="section-head" style="margin-bottom:22px"><span class="eyebrow">Experiencias</span><h2 style="font-size:clamp(1.8rem,4vw,2.6rem);margin-top:10px">Reseñas</h2><div class="divider"></div></div>${numNota}
    <div class="resenas-grid">${items}</div>
    <div class="form-card" style="max-width:560px;margin:34px auto 0"><h3 style="font-size:1.3rem;margin-bottom:6px">Dejá tu reseña</h3><p style="color:var(--text-soft);font-size:.88rem;margin-bottom:18px">Se publica luego de ser revisada.</p>
      <div class="field-row"><div class="field"><label>Tu nombre</label><input id="rsAutor" placeholder="Cómo querés aparecer"></div>
      <div class="field"><label>Puntaje</label><select id="rsEstrellas"><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select></div></div>
      <div class="field"><label>Tu experiencia</label><textarea id="rsTexto" placeholder="Contá tu experiencia..."></textarea></div>
      <button class="btn btn-gold" id="rsEnviar" style="width:100%;justify-content:center">Enviar reseña</button>
      <p id="rsMsg" style="color:var(--gold);font-size:.85rem;text-align:center;margin-top:12px"></p></div>`;
  const pMonto=document.getElementById('ptsMonto'), pBtn=document.getElementById('ptsPagar'), pCalc=document.getElementById('ptsCalc'), pMsg=document.getElementById('ptsMsg');
  if(pMonto&&pCalc){ const upd=()=>{ pCalc.textContent=Math.floor((+pMonto.value||0)/1000)+' puntos'; }; pMonto.addEventListener('input',upd); upd(); }
  if(pBtn&&modelo&&modelo.numero){ pBtn.addEventListener('click',async()=>{ const monto=+pMonto.value||0; if(monto<5000){ pMsg.textContent='El mínimo para potenciar es $5.000 (5 puntos).'; return; } pBtn.textContent='Redirigiendo al pago…'; pBtn.disabled=true; try{ await window.eaSupa.crearPagoPuntos(modelo.numero, monto, '', ''); }catch(e){ pMsg.textContent='No se pudo iniciar el pago. Probá de nuevo.'; pBtn.textContent='Potenciar a '+modelo.name; pBtn.disabled=false; } }); }
  const btn=document.getElementById('rsEnviar');
  btn.addEventListener('click',async()=>{ const autor=document.getElementById('rsAutor').value.trim(),texto=document.getElementById('rsTexto').value.trim(),estrellas=+document.getElementById('rsEstrellas').value; if(!autor||!texto){ document.getElementById('rsMsg').textContent='Completá nombre y experiencia.'; return; } btn.textContent='Enviando…'; btn.disabled=true; try{ await window.eaSupa.submitResena({solicitud_id:sid,autor,texto,estrellas}); document.getElementById('rsMsg').textContent='¡Gracias! Tu reseña quedó pendiente de aprobación.'; document.getElementById('rsAutor').value=''; document.getElementById('rsTexto').value=''; }catch(e){ document.getElementById('rsMsg').textContent='No se pudo enviar.'; } btn.textContent='Enviar reseña'; btn.disabled=false; });
}

function heroCarousel(){ const c=document.getElementById('heroCarousel'); if(!c) return; const slides=[...c.querySelectorAll('.hero-slide')]; const dotsW=document.getElementById('heroDots'); if(!slides.length) return; let i=0; if(dotsW){ dotsW.innerHTML=slides.map((_,k)=>`<button class="${k===0?'active':''}" data-k="${k}"></button>`).join(''); dotsW.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>go(+b.dataset.k))); } function go(n){ slides[i].classList.remove('active'); if(dotsW)dotsW.children[i].classList.remove('active'); i=(n+slides.length)%slides.length; slides[i].classList.add('active'); if(dotsW)dotsW.children[i].classList.add('active'); } setInterval(()=>go(i+1),5000); }

function ageGate(){ const g=document.getElementById('ageGate'); if(!g) return; if(!sessionStorage.getItem('ea_age_ok')){ document.body.style.overflow='hidden'; requestAnimationFrame(()=>g.classList.add('show')); } const c=document.getElementById('ageConfirm'); if(c) c.addEventListener('click',()=>{ sessionStorage.setItem('ea_age_ok','1'); g.classList.remove('show'); document.body.style.overflow=''; }); }
function headerScroll(){ const h=document.getElementById('header'); if(!h) return; let tick=false; const on=()=>{ h.classList.toggle('scrolled',window.scrollY>40); tick=false; }; window.addEventListener('scroll',()=>{ if(!tick){ tick=true; requestAnimationFrame(on); } },{passive:true}); on(); }
function mobileMenu(){ const b=document.getElementById('burger'),m=document.getElementById('mobileMenu'); if(!b||!m) return; b.addEventListener('click',()=>{ b.classList.toggle('open'); m.classList.toggle('open'); document.body.style.overflow=m.classList.contains('open')?'hidden':''; }); m.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{ b.classList.remove('open'); m.classList.remove('open'); document.body.style.overflow=''; })); }
function reveals(){ const els=document.querySelectorAll('.reveal:not(.in)'); if(!('IntersectionObserver'in window)){ els.forEach(e=>e.classList.add('in')); return; } const io=new IntersectionObserver((en)=>{ en.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{threshold:0.12,rootMargin:'0px 0px -40px 0px'}); els.forEach(e=>io.observe(e)); }

function publishWizard(){
  const form=document.getElementById('publishForm'); if(!form) return;
  if(window.EA_LOCATIONS) setupUbic();
  let amount=0; const dots=document.querySelectorAll('.step-dot'); const stepsEls=form.querySelectorAll('.wizard-step');
  const pagoRet=new URLSearchParams(location.search).get('pago');
  if(pagoRet){ const pa=document.getElementById('payArea'); if(pa) pa.style.display='none'; const pd=document.getElementById('payDone'); if(pd){ const t=pd.querySelector('h3'),x=pd.querySelector('p'); if(pagoRet==='ok'){ if(t)t.textContent='¡Pago confirmado!'; if(x)x.textContent='Recibimos tu pago y tu solicitud. La verificamos y queda publicada.'; } else if(pagoRet==='pendiente'){ if(t)t.textContent='Pago pendiente'; if(x)x.textContent='Tu pago quedó pendiente de acreditación.'; } else { if(t)t.textContent='El pago no se completó'; if(x)x.textContent='Podés intentar nuevamente.'; } pd.classList.add('show'); } stepsEls.forEach(s=>s.classList.toggle('active',+s.dataset.step===3)); dots.forEach(d=>d.classList.add('done')); }
  function goStep(n){ stepsEls.forEach(s=>s.classList.toggle('active',+s.dataset.step===n)); dots.forEach(d=>{ const dn=+d.dataset.step; d.classList.toggle('active',dn===n); d.classList.toggle('done',dn<n); }); window.scrollTo({top:form.getBoundingClientRect().top+window.scrollY-120,behavior:'smooth'}); }
  function validateStep(n){ let ok=true; form.querySelector(`.wizard-step[data-step="${n}"]`).querySelectorAll('[required]').forEach(inp=>{ const f=inp.closest('.field'); let bad=!inp.value.trim(); if(inp.type==='email'&&inp.value) bad=!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value); if(inp.name==='edad'&&inp.value) bad=+inp.value<18; if(inp.id==='citaInput'&&inp.value) bad=+inp.value<30000; if(f) f.classList.toggle('err',bad); if(bad) ok=false; }); return ok; }
  function setupUbic(){ const L=window.EA_LOCATIONS||{},sP=document.getElementById('selPais'),sPr=document.getElementById('selProvincia'),sC=document.getElementById('selCiudad'); if(!sP) return; sP.innerHTML='<option value="Argentina" selected>Argentina</option>'; sP.value='Argentina'; const pf=sP.closest('.field'); if(pf) pf.style.display='none'; const provs=Object.keys(L['Argentina']||{}); sPr.innerHTML='<option value="">Provincia</option>'+provs.map(p=>`<option>${p}</option>`).join(''); sPr.disabled=false; sPr.addEventListener('change',()=>{ const cs=((L['Argentina']||{})[sPr.value])||[]; sC.innerHTML='<option value="">Ciudad</option>'+cs.map(c=>`<option>${c}</option>`).join(''); sC.disabled=!cs.length; }); }
  function enterPayStep(){ const gratis=((form.querySelector('input[name="plan"]:checked')||{}).value)==='gratis'; amount=+document.getElementById('precioInput').value||0; const sn=document.getElementById('sumName'); if(sn) sn.textContent=form.nombre.value||'—'; const sa=document.getElementById('sumAmount'); if(sa) sa.textContent= gratis?'Gratis':fmtP(amount); const pb=document.getElementById('payBtn'); const sr=document.querySelector('.secure-row'); const h=document.querySelector('#payArea h3'); const desc=document.querySelector('#payArea > p'); if(gratis){ if(pb) pb.textContent='Publicar mi perfil gratis'; if(sr) sr.textContent='\u2713 Se publica al instante, sin espera ni moderaci\u00f3n.'; if(h) h.textContent='Public\u00e1 tu perfil gratis'; if(desc) desc.textContent='Tu perfil aparece en la web al instante y sin costo. Pod\u00e9s sumar cita paga o destacarte cuando quieras.'; } else { if(pb) pb.innerHTML='<span style="display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.15"><span>Pagar '+fmtP(amount)+'</span><span style="font-size:.72em;opacity:.8;font-weight:600">con Mercado Pago</span></span>'; if(sr) sr.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg> Tarjeta de d\u00e9bito o cr\u00e9dito \u00b7 no necesit\u00e1s cuenta de Mercado Pago'; if(h) h.textContent='Activ\u00e1 tu publicaci\u00f3n'; if(desc) desc.textContent='Pag\u00e1 con tarjeta de d\u00e9bito o cr\u00e9dito de forma segura. No necesit\u00e1s cuenta de Mercado Pago.'; } }
  form.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>{ const cur=+b.closest('.wizard-step').dataset.step; if(!validateStep(cur)) return; const next=+b.dataset.next; if(next===3){ enterPayStep(); } goStep(next); }));
  form.querySelectorAll('[data-prev]').forEach(b=>b.addEventListener('click',()=>goStep(+b.dataset.prev)));
  const planInputs=form.querySelectorAll('input[name="plan"]'); const diasExtraEl=document.getElementById('diasExtra'); const puntosEl=document.getElementById('puntosInput'); const precioHidden=document.getElementById('precioInput'); const diasField=document.getElementById('diasExtraField');
  function recalcPlan(){ if(!precioHidden) return; const plan=((form.querySelector('input[name="plan"]:checked')||{}).value)||'dias'; const dx=Math.max(0,+((diasExtraEl||{}).value||0)); const pts=Math.max(0,+((puntosEl||{}).value||0)); const gratis=plan==='gratis'; const base= gratis?0:(plan==='d30'?30000:15000); const extraD= 0; const ptsA= gratis?0:pts*1000; const total=base+extraD+ptsA; precioHidden.value=total; const set=(id,t)=>{const e=document.getElementById(id); if(e) e.textContent=t;}; set('planLabel', gratis?'Perfil gratis · se publica al instante':((plan==='d30'?30:15)+' días de publicación')); set('planBase',gratis?'$0':fmtP(base)); set('diasExtraAmt',fmtP(extraD)); set('puntosAmt',fmtP(ptsA)); set('pubTotal',total>0?fmtP(total):'Gratis'); }
  function applyPlanMode(){ const plan=((form.querySelector('input[name="plan"]:checked')||{}).value)||'d15'; const gratis=plan==='gratis'; const cita=document.getElementById('citaInput'); const citaField=cita&&cita.closest('.field'); const pf=document.getElementById('diasExtraField'); if(cita){ if(gratis){ cita.removeAttribute('required'); cita.disabled=true; if(citaField){citaField.classList.remove('err'); citaField.style.opacity='.45';} } else { cita.setAttribute('required',''); cita.disabled=false; if(citaField) citaField.style.opacity=''; if(!cita.value) cita.value='15000'; } } if(pf) pf.style.display=gratis?'none':''; recalcPlan(); }
  planInputs.forEach(r=>r.addEventListener('change',applyPlanMode)); if(diasExtraEl) diasExtraEl.addEventListener('input',recalcPlan); if(puntosEl) puntosEl.addEventListener('input',recalcPlan); applyPlanMode();
  (function(){ const gEl=document.getElementById('selGenero'), cab=document.getElementById('selCabello'), cue=document.getElementById('selCuerpo'), bf=document.getElementById('bustoField'); if(!gEl) return; const FEM=['Mujer','Trans femenina'], MASC=['Var\u00f3n','Trans masculino']; const CAB={fem:['Rubia','Casta\u00f1a','Morocha','Pelirroja','Canosa','Otro'], masc:['Rubio','Casta\u00f1o','Morocho','Pelirrojo','Canoso','Otro'], neu:['Rubio/a','Casta\u00f1o/a','Morocho/a','Pelirrojo/a','Canoso/a','Otro']}; const CUE={fem:['Delgada','Atl\u00e9tica','Con curvas','Voluptuosa'], masc:['Delgado','Atl\u00e9tico','Musculoso','Robusto'], neu:['Delgado/a','Atl\u00e9tico/a','Con curvas','Robusto/a']}; function fill(sel,arr){ if(!sel) return; const prev=sel.value; sel.innerHTML='<option value="">Seleccionar</option>'+arr.map(function(o){return '<option'+(o===prev?' selected':'')+'>'+o+'</option>';}).join(''); } function apply(){ const g=gEl.value; const k= FEM.indexOf(g)>=0?'fem':(MASC.indexOf(g)>=0?'masc':'neu'); fill(cab,CAB[k]); fill(cue,CUE[k]); if(bf) bf.style.display=(k==='masc')?'none':''; } gEl.addEventListener('change',apply); apply(); })();
  const drop=document.getElementById('photoDrop'),input=document.getElementById('photoInput'),preview=document.getElementById('photoPreview'); let photoFiles=[];
  if(drop){ drop.addEventListener('click',()=>input.click()); input.addEventListener('change',()=>{ preview.innerHTML=''; photoFiles=[...input.files].slice(0,8); photoFiles.forEach(f=>{ const u=URL.createObjectURL(f); preview.insertAdjacentHTML('beforeend',`<div class="pp"><img src="${u}"></div>`); }); }); }
  const vInput=document.getElementById('videoInput'),vPrev=document.getElementById('videoPreview'); let videoFiles=[]; if(vInput){ vInput.addEventListener('change',()=>{ videoFiles=[...vInput.files].slice(0,4); if(vPrev) vPrev.textContent=videoFiles.length?`${videoFiles.length} video(s)`:''; }); }
  const aInput=document.getElementById('audioInput'),aPrev=document.getElementById('audioPreview'); if(aInput){ aInput.addEventListener('change',()=>{ if(aPrev) aPrev.textContent=aInput.files[0]?'Audio listo ✓':''; }); }
  ['dniFrente','dniDorso'].forEach(function(id){ var el=document.getElementById(id); var pv=document.getElementById(id+'Prev'); if(el) el.addEventListener('change',function(){ if(pv) pv.textContent=el.files[0]?'Cargado ✓':''; }); });
  const usingMP=!!window.eaSupa;
  if(usingMP){ const cc=document.querySelector('.credit-card'); if(cc)cc.style.display='none'; const pt=document.querySelector('.pay-type'); if(pt)pt.style.display='none'; ['cardNumber','cardName','cardExp','cardCvc'].forEach(id=>{ const el=document.getElementById(id); const f=el&&el.closest('.field'); if(f)f.style.display='none'; }); const sr=document.querySelector('.secure-row'); if(sr) sr.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg> Tarjeta de d\u00e9bito o cr\u00e9dito \u00b7 no necesit\u00e1s cuenta de Mercado Pago'; }
  form.addEventListener('submit',(e)=>{ e.preventDefault(); if(!usingMP){ alert('Conectá el backend.'); return; } const g=(id)=>{ const el=document.getElementById(id); return el?el.value.trim():''; }; const sP=document.getElementById('selPais'),sPr=document.getElementById('selProvincia'),sC=document.getElementById('selCiudad'); const btn=document.getElementById('payBtn'); btn.textContent='Procesando…'; btn.disabled=true; const planSel=((form.querySelector('input[name="plan"]:checked')||{}).value)||'dias'; const puntos=Math.max(0,+((document.getElementById('puntosInput')||{}).value||0)); const diasExtra=Math.max(0,+((document.getElementById('diasExtra')||{}).value||0)); const dias= planSel==='d30'?30:15; const tier= puntos>=10?'top':'estandar'; const precioCita=+((document.getElementById('citaInput')||{}).value||15000); const payload={ nombre:form.nombre.value.trim(), edad:+form.edad.value||null, pais:'Argentina', provincia:sPr?sPr.value:'', ciudad:sC?sC.value:'', altura:form.altura.value.trim(), busto:g('busto'), cintura:g('cintura'), cola:g('cola'), nacionalidad:g('nacionalidad'), cabello:g('cabello'), tipo_cuerpo:g('tipo_cuerpo'), telefono:form.telefono.value.trim(), email:form.email.value.trim(), bio:form.bio.value.trim(), genero:(form.genero?form.genero.value:''), roles:[...form.querySelectorAll('input[name="rol"]:checked')].map(x=>x.value), precio:amount, precio_cita:precioCita, plan:tier, dias:dias, puntos:puntos }; var gv=function(id){var e=document.getElementById(id);return e?e.value.trim():'';}; payload.nivel_educativo=gv('pNivel'); payload.edu_estado=gv('pEstado'); payload.estudio=gv('pEstudio'); payload.cursos=gv('pCursos'); payload.habilidades=gv('pHabil'); payload.hobbies=gv('pHobbies'); payload.rutinas=gv('pRutinas'); payload.otros_gustos=gv('pGustos'); payload.comidas_gusta=gv('pComeSi'); payload.comidas_rechaza=gv('pComeNo'); payload.negocio=gv('pNegocio'); payload.dniFrente=((document.getElementById('dniFrente')||{}).files||[])[0]||null; payload.dniDorso=((document.getElementById('dniDorso')||{}).files||[])[0]||null; const fail=(msg)=>{ btn.textContent='Reintentar'; btn.disabled=false; alert(msg); }; const audioF=aInput&&aInput.files[0]?aInput.files[0]:null; if(planSel==='gratis'){ payload.precio=0; payload.precio_cita=0; payload.plan='gratis'; payload.dias=15; payload.puntos=0; window.eaSupa.submitPublishGratis(payload, photoFiles, videoFiles, audioF).then(function(r){ var pd=document.getElementById('payDone'); var h=pd&&pd.querySelector('h3'); var x=pd&&pd.querySelector('p'); if(h) h.textContent='\u00a1Perfil publicado! \ud83c\udf89'; if(x) x.textContent='Tu perfil ya est\u00e1 en la web. Pod\u00e9s verlo en el cat\u00e1logo y editarlo cuando quieras.'; document.getElementById('payArea').style.display='none'; if(pd) pd.classList.add('show'); }).catch(function(err){ console.error(err); fail((err&&err.message)||'No se pudo publicar. Prob\u00e1 de nuevo.'); }); return; } window.eaSupa.submitPublish(payload, photoFiles, videoFiles, audioF).then(r=>{ if(r!=='redirect'){ document.getElementById('payArea').style.display='none'; document.getElementById('payDone').classList.add('show'); } }).catch(err=>{ console.error(err); fail('No se pudo iniciar el pago. Probá de nuevo.'); }); });
}


async function aplicarConfig(){
  if(!(window.eaSupa&&window.eaSupa.getConfig)) return;
  let c={}; try{ c=(await window.eaSupa.getConfig())||{}; }catch(e){ return; }
  if(c.whatsapp){ const wa='https://wa.me/'+String(c.whatsapp).replace(/[^0-9]/g,''); document.querySelectorAll('a[href*="wa.me"]').forEach(a=>a.href=wa); }
  if(c.telefono){ document.querySelectorAll('.js-phone, a[href^="tel:"]').forEach(a=>{ a.textContent=c.telefono; a.href='tel:'+String(c.telefono).replace(/[^0-9+]/g,''); }); }
  if(c.instagram){ document.querySelectorAll('a[aria-label="Instagram"]').forEach(a=>a.href=c.instagram); }
  if(c.telegram){ document.querySelectorAll('a[aria-label="Telegram"]').forEach(a=>a.href=c.telegram); }
  if(c.hero_titulo){ const h=document.getElementById('heroTitulo'); if(h) h.innerHTML=c.hero_titulo; }
  if(c.hero_lead){ const l=document.getElementById('heroLead'); if(l) l.textContent=c.hero_lead; }
  if(Array.isArray(c.carrusel)){ const slides=document.querySelectorAll('.hero-slide'); c.carrusel.forEach((u,i)=>{ if(u&&slides[i]) slides[i].style.backgroundImage="linear-gradient(120deg,rgba(18,7,22,.78),rgba(18,7,22,.28) 46%,rgba(18,7,22,0) 72%),url('"+u+"')"; }); }
  document.querySelectorAll('[data-cfg]').forEach(el=>{ const k=el.dataset.cfg; if(c[k]!=null && String(c[k]).trim()!=='') el.innerHTML=c[k]; });
  if(c.logo){ document.querySelectorAll('img.logo-emblem, .figure-logo, .exc-logo').forEach(im=>{ im.src=c.logo; }); const fav=document.querySelector('link[rel="icon"]'); if(fav) fav.href=c.logo; }
  if(c.img_estandar){ const e=document.getElementById('estandarVisual'); if(e){ const lg=e.querySelector('.figure-logo'); if(lg) lg.style.display='none'; e.style.backgroundImage="url('"+c.img_estandar+"')"; e.style.backgroundSize='cover'; e.style.backgroundPosition='center'; } }
  if(c.img_nosotros){ const e=document.getElementById('nosotrosVisual'); if(e){ e.querySelectorAll('.exc-logo,.exc-word').forEach(x=>x.style.display='none'); e.style.backgroundImage="url('"+c.img_nosotros+"')"; e.style.backgroundSize='cover'; e.style.backgroundPosition='center'; } }
}

function panelInit(){ const root=document.getElementById('panelRoot'); if(!root) return; if(window.eaSupa){ window.eaSupa.initPanel(); return; } root.innerHTML='<div class="panel-empty"><div class="pe-ic">📭</div><h3>Conectá el backend</h3></div>'; }
function portalInit(){ const root=document.getElementById('portalRoot'); if(!root) return; if(window.eaSupa){ window.eaSupa.initPortal(); } }

document.addEventListener('DOMContentLoaded',()=>{ ageGate(); headerScroll(); mobileMenu(); heroCarousel(); renderFeatured(); renderDestacados(); renderCatalog(); renderProfile(); reveals(); publishWizard(); panelInit(); portalInit(); aplicarConfig(); setTimeout(reveals,120); });
