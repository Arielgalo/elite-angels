/* ELITE ANGELS — Lógica del sitio */
const MODELS = [
  { id:'valentina', name:'Valentina', city:'Madrid', age:24, height:'1.72', price:400, tone:'#d4af6e', badge:'VIP', langs:['Español','Inglés','Italiano'], style:['Elegante','Carismática'],
    bio:'Refinada y culta, Valentina combina una belleza serena con una conversación cautivadora. Perfecta para cenas de gala y eventos sociales de alto perfil.' },
  { id:'isabella', name:'Isabella', city:'Barcelona', age:26, height:'1.75', price:500, tone:'#d9a7a0', badge:'TOP', langs:['Español','Inglés','Francés'], style:['Sofisticada','Divertida'],
    bio:'Modelo internacional de presencia magnética. Isabella destaca por su naturalidad y su don para hacer de cada momento algo especial.' },
  { id:'camila', name:'Camila', city:'Buenos Aires', age:23, height:'1.68', price:300, tone:'#e8cf9a', badge:'NUEVA', langs:['Español','Inglés','Portugués'], style:['Dulce','Espontánea'],
    bio:'Encanto latino y una sonrisa irresistible. Camila aporta frescura y calidez a cada encuentro, ideal para veladas íntimas y relajadas.' },
  { id:'sophia', name:'Sophia', city:'Miami', age:27, height:'1.74', price:600, tone:'#c9a4cf', badge:'VIP', langs:['Inglés','Español'], style:['Glamorosa','Mundana'],
    bio:'Belleza cosmopolita y estilo impecable. Sophia es la acompañante perfecta para quienes buscan elegancia y un toque de glamour internacional.' },
  { id:'aaliyah', name:'Aaliyah', city:'Dubái', age:25, height:'1.76', price:800, tone:'#a4b8cf', badge:'TOP', langs:['Inglés','Árabe','Francés'], style:['Exótica','Distinguida'],
    bio:'Presencia exótica y modales exquisitos. Aaliyah ofrece una experiencia de lujo a la altura de los destinos más exclusivos del mundo.' },
  { id:'martina', name:'Martina', city:'Madrid', age:22, height:'1.70', price:250, tone:'#cfc0a4', badge:'NUEVA', langs:['Español','Inglés'], style:['Juvenil','Encantadora'],
    bio:'Juventud, energía y una elegancia natural. Martina conquista por su autenticidad y su conversación ágil e inteligente.' },
  { id:'lucia', name:'Lucía', city:'Barcelona', age:28, height:'1.73', price:450, tone:'#d4af6e', badge:'VIP', langs:['Español','Inglés','Alemán'], style:['Sensual','Intelectual'],
    bio:'Sofisticación mediterránea con un fondo culto. Lucía combina sensualidad y profundidad, ideal para conversaciones memorables.' },
  { id:'renata', name:'Renata', city:'Buenos Aires', age:25, height:'1.71', price:350, tone:'#d9a7a0', badge:'TOP', langs:['Español','Inglés','Italiano'], style:['Apasionada','Elegante'],
    bio:'Carácter cálido y una elegancia que no pasa desapercibida. Renata transforma cualquier ocasión en una experiencia inolvidable.' },
  { id:'victoria', name:'Victoria', city:'Miami', age:26, height:'1.77', price:700, tone:'#e8cf9a', badge:'VIP', langs:['Inglés','Español','Ruso'], style:['Imponente','Refinada'],
    bio:'Estatura de modelo y porte de reina. Victoria irradia seguridad y clase, una compañía a la altura de los eventos más exigentes.' },
  { id:'noor', name:'Noor', city:'Dubái', age:24, height:'1.69', price:550, tone:'#c9a4cf', badge:'NUEVA', langs:['Inglés','Árabe'], style:['Misteriosa','Cautivadora'],
    bio:'Mirada profunda y un aura enigmática. Noor ofrece discreción absoluta y una presencia tan elegante como inolvidable.' },
  { id:'emma', name:'Emma', city:'Madrid', age:27, height:'1.72', price:500, tone:'#a4b8cf', badge:'TOP', langs:['Inglés','Español','Francés'], style:['Cosmopolita','Cálida'],
    bio:'Espíritu viajero y conversación fluida en varios idiomas. Emma es la acompañante ideal para escapadas y eventos internacionales.' },
  { id:'bianca', name:'Bianca', city:'Barcelona', age:23, height:'1.70', price:400, tone:'#cfc0a4', badge:'VIP', langs:['Español','Inglés','Portugués'], style:['Vivaz','Glamorosa'],
    bio:'Energía contagiosa y un estilo siempre impecable. Bianca aporta chispa y sofisticación a cada cita.' },
];
function figureSVG(tone){
  return `<svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" color="${tone}" d="M100 40c14 0 24 11 24 27s-10 30-24 30-24-14-24-30 10-27 24-27Zm-44 110c8-18 25-30 44-30s36 12 44 30c10 22 14 70 14 130H42c0-60 4-108 14-130Z"/></svg>`;
}
function modelCard(m){
  const badgeClass = m.badge === 'VIP' ? 'model-badge vip right' : 'model-badge right';
  return `<a class="model-card" href="perfil.html?id=${m.id}" data-city="${m.city}">
    <span class="model-price"><b>${m.price}</b> <small>USD</small></span>
    <span class="${badgeClass}">${m.badge}</span>
    <div class="figure" style="position:absolute;inset:0">${figureSVG(m.tone)}</div>
    <div class="model-info">
      <h3>${m.name}</h3>
      <div class="loc"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>${m.city}</div>
      <div class="attrs"><span>${m.age} años</span><span>·</span><span>${m.height} m</span><span>·</span><span style="color:var(--gold)">${m.price} USD</span></div>
      <div class="model-cta"><span class="link">Ver perfil →</span></div>
    </div>
  </a>`;
}
function renderFeatured(){ const el = document.getElementById('featuredGrid'); if(!el) return; el.innerHTML = MODELS.slice(0,8).map(modelCard).join(''); }
function renderCatalog(){
  const el = document.getElementById('modelsGrid'); if(!el) return;
  el.innerHTML = MODELS.map(modelCard).join('');
  const btns = document.querySelectorAll('.filter-btn');
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.remove('active')); b.classList.add('active');
    const f = b.dataset.filter;
    document.querySelectorAll('#modelsGrid .model-card').forEach(card => { card.style.display = (f === 'all' || card.dataset.city === f) ? '' : 'none'; });
  }));
}
function renderProfile(){
  const wrap = document.getElementById('pName'); if(!wrap) return;
  const params = new URLSearchParams(location.search);
  const id = params.get('id') || 'valentina';
  const m = MODELS.find(x => x.id === id) || MODELS[0];
  document.title = `${m.name} · Elite Angels VIP`;
  document.getElementById('crumbName').textContent = m.name;
  document.getElementById('pName').textContent = m.name;
  document.getElementById('pLoc').textContent = m.city;
  document.getElementById('pBio').textContent = m.bio;
  document.getElementById('mainImg').innerHTML = `<div class="figure" style="position:absolute;inset:0">${figureSVG(m.tone)}</div>`;
  document.getElementById('thumbs').innerHTML = [m.tone,'#d9a7a0','#e8cf9a','#a4b8cf'].map(t => `<div class="thumb"><div class="figure" style="position:absolute;inset:0">${figureSVG(t)}</div></div>`).join('');
  const specs = [['Edad', m.age + ' años'],['Altura', m.height + ' m'],['Tarifa', m.price + ' USD'],['Ciudad', m.city]];
  document.getElementById('specGrid').innerHTML = specs.map(s => `<div class="spec"><div class="k">${s[0]}</div><div class="v">${s[1]}</div></div>`).join('');
  document.getElementById('pChips').innerHTML = [...m.langs, ...m.style].map(c => `<span class="chip">${c}</span>`).join('');
  const rateBox = document.getElementById('rateBox');
  if(rateBox){
    const rows = [['1 hora', m.price],['2 horas', Math.round(m.price*1.8)],['Cena / Evento', Math.round(m.price*2.5)],['Noche completa', Math.round(m.price*4)]];
    rateBox.innerHTML = `<h3 style="font-size:1.3rem;margin-bottom:8px">Tarifas</h3>` + rows.map(r => `<div class="rate-row"><span class="dur">${r[0]}</span><span class="pr">${r[1]} <small style="font-size:.7rem;color:var(--text-mute)">USD</small></span></div>`).join('');
  }
  const rel = document.getElementById('relatedGrid');
  if(rel){ rel.innerHTML = MODELS.filter(x => x.id !== m.id).slice(0,4).map(modelCard).join(''); }
}
function ageGate(){
  const gate = document.getElementById('ageGate'); if(!gate) return;
  if(!sessionStorage.getItem('ea_age_ok')){ document.body.style.overflow = 'hidden'; requestAnimationFrame(() => gate.classList.add('show')); }
  const c = document.getElementById('ageConfirm');
  if(c) c.addEventListener('click', () => { sessionStorage.setItem('ea_age_ok','1'); gate.classList.remove('show'); document.body.style.overflow = ''; });
}
function headerScroll(){ const h = document.getElementById('header'); if(!h) return; const on = () => h.classList.toggle('scrolled', window.scrollY > 40); on(); window.addEventListener('scroll', on, { passive:true }); }
function mobileMenu(){
  const burger = document.getElementById('burger'); const menu = document.getElementById('mobileMenu'); if(!burger || !menu) return;
  burger.addEventListener('click', () => { burger.classList.toggle('open'); menu.classList.toggle('open'); document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : ''; });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); menu.classList.remove('open'); document.body.style.overflow = ''; }));
}
function reveals(){
  const els = document.querySelectorAll('.reveal:not(.in)');
  if(!('IntersectionObserver' in window)){ els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => { entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold:0.12, rootMargin:'0px 0px -40px 0px' });
  els.forEach(e => io.observe(e));
}
function bookingForm(){
  const form = document.getElementById('bookingForm'); if(!form) return;
  form.addEventListener('submit', (e) => { e.preventDefault(); form.style.display = 'none'; document.getElementById('formSuccess').classList.add('show'); });
}
function luhnValid(num){
  const s = num.replace(/\D/g,''); if(s.length < 13) return false;
  let sum = 0, alt = false;
  for(let i = s.length - 1; i >= 0; i--){ let d = parseInt(s[i],10); if(alt){ d *= 2; if(d > 9) d -= 9; } sum += d; alt = !alt; }
  return sum % 10 === 0;
}
function cardBrand(num){
  const s = num.replace(/\D/g,'');
  if(/^4/.test(s)) return 'Visa'; if(/^(5[1-5]|2[2-7])/.test(s)) return 'Mastercard'; if(/^3[47]/.test(s)) return 'Amex'; if(/^(6011|65|64[4-9])/.test(s)) return 'Discover';
  return s.length >= 2 ? 'Tarjeta' : '';
}
function expValid(v){
  const m = v.match(/^(\d{2})\/(\d{2})$/); if(!m) return false;
  const mm = +m[1], yy = 2000 + +m[2]; if(mm < 1 || mm > 12) return false;
  return new Date(yy, mm, 0, 23, 59, 59) >= new Date();
}
function publishWizard(){
  const form = document.getElementById('publishForm'); if(!form) return;
  let amount = 0;
  const dots = document.querySelectorAll('.step-dot');
  const stepsEls = form.querySelectorAll('.wizard-step');
  function goStep(n){
    stepsEls.forEach(s => s.classList.toggle('active', +s.dataset.step === n));
    dots.forEach(d => { const dn = +d.dataset.step; d.classList.toggle('active', dn === n); d.classList.toggle('done', dn < n); });
    window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 120, behavior:'smooth' });
  }
  function validateStep(n){
    let ok = true;
    const step = form.querySelector(`.wizard-step[data-step="${n}"]`);
    step.querySelectorAll('[required]').forEach(inp => {
      const field = inp.closest('.field');
      let bad = !inp.value.trim();
      if(inp.type === 'email' && inp.value) bad = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value);
      if(inp.name === 'edad' && inp.value) bad = +inp.value < 18;
      if(inp.id === 'precioInput' && inp.value) bad = +inp.value < 50;
      if(field) field.classList.toggle('err', bad);
      if(bad) ok = false;
    });
    return ok;
  }
  form.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => {
    const cur = +b.closest('.wizard-step').dataset.step;
    if(!validateStep(cur)) return;
    const next = +b.dataset.next;
    if(next === 3){ amount = +document.getElementById('precioInput').value || 0; document.getElementById('sumName').textContent = form.nombre.value || '—'; document.getElementById('sumAmount').textContent = amount; document.getElementById('payBtnAmount').textContent = amount; }
    goStep(next);
  }));
  form.querySelectorAll('[data-prev]').forEach(b => b.addEventListener('click', () => goStep(+b.dataset.prev)));
  form.querySelectorAll('.price-chips button').forEach(b => b.addEventListener('click', () => { document.getElementById('precioInput').value = b.dataset.price; }));
  const drop = document.getElementById('photoDrop');
  const input = document.getElementById('photoInput');
  const preview = document.getElementById('photoPreview');
  let photoData = []; let photoFiles = [];
  if(drop){
    drop.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      preview.innerHTML = ''; photoData = []; photoFiles = [...input.files].slice(0,6);
      [...input.files].slice(0,6).forEach(f => {
        const url = URL.createObjectURL(f);
        preview.insertAdjacentHTML('beforeend', `<div class="pp"><img src="${url}" alt=""></div>`);
        const reader = new FileReader(); reader.onload = () => compressImage(reader.result, d => photoData.push(d)); reader.readAsDataURL(f);
      });
    });
  }
  const cardNumber = document.getElementById('cardNumber');
  const cardName = document.getElementById('cardName');
  const cardExp = document.getElementById('cardExp');
  const cardCvc = document.getElementById('cardCvc');
  cardNumber.addEventListener('input', () => { let v = cardNumber.value.replace(/\D/g,'').slice(0,16); cardNumber.value = v.replace(/(.{4})/g,'$1 ').trim(); document.getElementById('ccNumber').textContent = (cardNumber.value || '•••• •••• •••• ••••').padEnd(19,'•'); document.getElementById('ccBrand').textContent = cardBrand(v); });
  cardName.addEventListener('input', () => { document.getElementById('ccName').textContent = cardName.value.toUpperCase() || 'NOMBRE APELLIDO'; });
  cardExp.addEventListener('input', () => { let v = cardExp.value.replace(/\D/g,'').slice(0,4); if(v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2); cardExp.value = v; document.getElementById('ccExp').textContent = v || 'MM/AA'; });
  cardCvc.addEventListener('input', () => { cardCvc.value = cardCvc.value.replace(/\D/g,'').slice(0,4); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    const setErr = (el, bad) => { el.closest('.field').classList.toggle('err', bad); if(bad) ok = false; };
    setErr(cardNumber, !luhnValid(cardNumber.value)); setErr(cardName, !cardName.value.trim()); setErr(cardExp, !expValid(cardExp.value)); setErr(cardCvc, !/^\d{3,4}$/.test(cardCvc.value));
    if(!ok) return;
    const btn = document.getElementById('payBtn'); btn.textContent = 'Procesando…'; btn.disabled = true;
    const payload = { id:'sol_'+Date.now(), fecha:new Date().toISOString(), nombre:form.nombre.value.trim(), edad:+form.edad.value||null, ciudad:form.ciudad.value, altura:form.altura.value.trim(), telefono:form.telefono.value.trim(), email:form.email.value.trim(), bio:form.bio.value.trim(), precio:amount, fotos:photoData.slice(0,6), cardType:(form.cardType.value||'credito'), cardBrand:cardBrand(cardNumber.value), cardLast4:cardNumber.value.replace(/\D/g,'').slice(-4), pago:'pagado', estado:'pendiente' };
    const showDone = () => { document.getElementById('payArea').style.display = 'none'; document.getElementById('doneName').textContent = form.nombre.value || ''; document.getElementById('payDone').classList.add('show'); dots.forEach(d => d.classList.add('done')); };
    const fail = (msg) => { btn.textContent = 'Reintentar pago'; btn.disabled = false; alert(msg || 'No se pudo completar.'); };
    if(window.eaSupa){ window.eaSupa.submitPublish(payload, photoFiles).then(showDone).catch(err => { console.error(err); fail('No se pudo enviar la solicitud al servidor.'); }); }
    else { setTimeout(() => { saveSubmission(payload); showDone(); }, 1300); }
  });
}
function compressImage(dataUrl, cb){
  const img = new Image();
  img.onload = () => {
    const max = 600; let { width, height } = img;
    if(width > max || height > max){ const r = Math.min(max/width, max/height); width = Math.round(width*r); height = Math.round(height*r); }
    const c = document.createElement('canvas'); c.width = width; c.height = height; c.getContext('2d').drawImage(img, 0, 0, width, height);
    cb(c.toDataURL('image/jpeg', 0.7));
  };
  img.onerror = () => cb(dataUrl); img.src = dataUrl;
}
function getSubmissions(){ try { return JSON.parse(localStorage.getItem('ea_submissions') || '[]'); } catch(e){ return []; } }
function saveSubmission(sub){ const list = getSubmissions(); list.unshift(sub); try { localStorage.setItem('ea_submissions', JSON.stringify(list)); } catch(e){ console.warn('lleno'); } }
function updateSubmission(id, changes){ localStorage.setItem('ea_submissions', JSON.stringify(getSubmissions().map(s => s.id === id ? { ...s, ...changes } : s))); }
function deleteSubmission(id){ localStorage.setItem('ea_submissions', JSON.stringify(getSubmissions().filter(s => s.id !== id))); }
function checklistFor(s){
  return [
    { label:'Fotos recibidas (mín. 1)', ok:(s.fotos && s.fotos.length >= 1), detail:(s.fotos?.length||0)+' foto(s)' },
    { label:'Edad verificada (+18)', ok:(s.edad && s.edad >= 18), detail:s.edad ? s.edad+' años' : 'sin dato' },
    { label:'Datos de contacto completos', ok:!!(s.nombre && s.telefono && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.email||'')), detail:s.email||'—' },
    { label:'Ciudad y tarifa definidas', ok:!!(s.ciudad && s.precio >= 50), detail:(s.ciudad||'—')+' · '+(s.precio||0)+' USD' },
    { label:'Pago confirmado', ok:s.pago === 'pagado', detail:(s.cardBrand||'Tarjeta')+' ****'+(s.cardLast4||'') }
  ];
}
function renderPanel(){
  const root = document.getElementById('panelRoot'); if(!root) return;
  const filter = root.dataset.filter || 'pendiente';
  const all = getSubmissions();
  const counts = { pendiente:all.filter(s=>s.estado==='pendiente').length, publicado:all.filter(s=>s.estado==='publicado').length, rechazado:all.filter(s=>s.estado==='rechazado').length };
  document.querySelectorAll('.panel-tab').forEach(t => { const c = t.querySelector('.cnt'); if(c) c.textContent = counts[t.dataset.tab] ?? 0; t.classList.toggle('active', t.dataset.tab === filter); });
  const list = all.filter(s => s.estado === filter);
  if(!list.length){ root.innerHTML = `<div class="panel-empty"><div class="pe-ic">📭</div><h3>No hay solicitudes ${filter==='pendiente'?'pendientes':filter+'s'}</h3><p>Cuando una modelo complete <a href="publicar.html" style="color:var(--gold)">Publicá</a> y pague, aparece acá.</p></div>`; return; }
  root.innerHTML = list.map(s => {
    const checks = checklistFor(s); const allOk = checks.every(c => c.ok);
    const fotos = (s.fotos && s.fotos.length) ? s.fotos.map(f => `<a href="${f}" target="_blank" class="rev-photo"><img src="${f}" alt=""></a>`).join('') : `<div class="rev-nophoto">Sin fotos</div>`;
    const fecha = new Date(s.fecha).toLocaleString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
    return `<article class="review-card" data-id="${s.id}"><div class="rev-media"><div class="rev-photos">${fotos}</div></div><div class="rev-body"><div class="rev-head"><div><h3>${s.nombre||'Sin nombre'} <span class="rev-price">${s.precio||0} USD</span></h3><div class="rev-meta">${s.ciudad||'—'} · ${s.edad||'—'} años · ${s.altura||'—'} · recibido ${fecha}</div></div><span class="status-badge ${allOk?'ready':'incomplete'}">${allOk?'Listo para publicar':'Faltan datos'}</span></div><div class="rev-contact"><span>📞 ${s.telefono||'—'}</span><span>✉ ${s.email||'—'}</span><span>💳 ${(s.cardType||'')} · ${s.cardBrand||'Tarjeta'} ****${s.cardLast4||''}</span></div>${s.bio?`<p class="rev-bio">"${s.bio}"</p>`:''}<div class="checklist">${checks.map(c=>`<div class="ck-item ${c.ok?'ok':'no'}"><span class="ck-box">${c.ok?'✓':'✕'}</span><span class="ck-label">${c.label}</span><span class="ck-detail">${c.detail}</span></div>`).join('')}</div>${s.estado==='pendiente'?`<div class="rev-actions"><button class="btn btn-gold" data-approve="${s.id}" ${allOk?'':'disabled'}>✓ Aprobar y publicar</button><button class="btn btn-ghost" data-reject="${s.id}">Rechazar</button></div>`:`<div class="rev-actions"><span class="final-state ${s.estado}">${s.estado==='publicado'?'✓ Publicado en el sitio':'✕ Rechazado'}</span><button class="btn btn-ghost" data-delete="${s.id}">Eliminar</button></div>`}</div></article>`;
  }).join('');
  root.querySelectorAll('[data-approve]').forEach(b => b.addEventListener('click', () => { updateSubmission(b.dataset.approve, { estado:'publicado', aprobado:new Date().toISOString() }); renderPanel(); }));
  root.querySelectorAll('[data-reject]').forEach(b => b.addEventListener('click', () => { if(confirm('¿Rechazar esta solicitud?')){ updateSubmission(b.dataset.reject, { estado:'rechazado' }); renderPanel(); } }));
  root.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => { if(confirm('¿Eliminar definitivamente?')){ deleteSubmission(b.dataset.delete); renderPanel(); } }));
}
function panelInit(){
  const root = document.getElementById('panelRoot'); if(!root) return;
  if(window.eaSupa){ window.eaSupa.initPanel(); return; }
  document.querySelectorAll('.panel-tab').forEach(t => t.addEventListener('click', () => { root.dataset.filter = t.dataset.tab; renderPanel(); }));
  const demo = document.getElementById('loadDemo');
  if(demo) demo.addEventListener('click', () => { saveSubmission({ id:'sol_demo_'+Date.now(), fecha:new Date().toISOString(), nombre:'Catalina', edad:25, ciudad:'Buenos Aires', altura:'1.71 m', telefono:'+54 11 5555 5555', email:'catalina@ejemplo.com', bio:'Modelo elegante y conversadora.', precio:450, fotos:[], cardType:'credito', cardBrand:'Visa', cardLast4:'4242', pago:'pagado', estado:'pendiente' }); root.dataset.filter = 'pendiente'; renderPanel(); });
  renderPanel();
}
document.addEventListener('DOMContentLoaded', () => {
  ageGate(); headerScroll(); mobileMenu(); renderFeatured(); renderCatalog(); renderProfile(); reveals(); bookingForm(); publishWizard(); panelInit(); setTimeout(reveals, 60);
});
