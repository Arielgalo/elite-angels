/* ELITE ANGELS — Lógica del sitio (ARS · ubicaciones · perfiles reales) */
const fmtP = (n) => '$' + Number(n || 0).toLocaleString('es-AR');
const ubicTxt = (m) => [m.ciudad, m.provincia, m.pais].filter(Boolean).join(', ');

const MODELS = [
  { id:'valentina', name:'Valentina', pais:'España', provincia:'Comunidad de Madrid', ciudad:'Madrid', age:24, height:'1.72', price:400000, tone:'#d4af6e', badge:'VIP', langs:['Español','Inglés','Italiano'], style:['Elegante','Carismática'], bio:'Refinada y culta, combina una belleza serena con una conversación cautivadora. Perfecta para cenas de gala y eventos sociales de alto perfil.' },
  { id:'isabella', name:'Isabella', pais:'España', provincia:'Cataluña', ciudad:'Barcelona', age:26, height:'1.75', price:500000, tone:'#d9a7a0', badge:'TOP', langs:['Español','Inglés','Francés'], style:['Sofisticada','Divertida'], bio:'Modelo internacional de presencia magnética. Destaca por su naturalidad y su don para hacer de cada momento algo especial.' },
  { id:'camila', name:'Camila', pais:'Argentina', provincia:'Ciudad de Buenos Aires', ciudad:'Palermo', age:23, height:'1.68', price:300000, tone:'#e8cf9a', badge:'NUEVA', langs:['Español','Inglés','Portugués'], style:['Dulce','Espontánea'], bio:'Encanto latino y una sonrisa irresistible. Aporta frescura y calidez a cada encuentro, ideal para veladas íntimas y relajadas.' },
  { id:'sophia', name:'Sophia', pais:'Estados Unidos', provincia:'Florida', ciudad:'Miami', age:27, height:'1.74', price:600000, tone:'#c9a4cf', badge:'VIP', langs:['Inglés','Español'], style:['Glamorosa','Mundana'], bio:'Belleza cosmopolita y estilo impecable. La acompañante perfecta para quienes buscan elegancia y un toque de glamour internacional.' },
  { id:'aaliyah', name:'Aaliyah', pais:'Emiratos Árabes Unidos', provincia:'Dubái', ciudad:'Marina', age:25, height:'1.76', price:800000, tone:'#a4b8cf', badge:'TOP', langs:['Inglés','Árabe','Francés'], style:['Exótica','Distinguida'], bio:'Presencia exótica y modales exquisitos. Ofrece una experiencia de lujo a la altura de los destinos más exclusivos del mundo.' },
  { id:'martina', name:'Martina', pais:'Argentina', provincia:'Córdoba', ciudad:'Córdoba', age:22, height:'1.70', price:250000, tone:'#cfc0a4', badge:'NUEVA', langs:['Español','Inglés'], style:['Juvenil','Encantadora'], bio:'Juventud, energía y una elegancia natural. Conquista por su autenticidad y su conversación ágil e inteligente.' },
  { id:'lucia', name:'Lucía', pais:'España', provincia:'Andalucía', ciudad:'Marbella', age:28, height:'1.73', price:450000, tone:'#d4af6e', badge:'VIP', langs:['Español','Inglés','Alemán'], style:['Sensual','Intelectual'], bio:'Sofisticación mediterránea con un fondo culto. Combina sensualidad y profundidad, ideal para conversaciones memorables.' },
  { id:'renata', name:'Renata', pais:'Argentina', provincia:'Buenos Aires', ciudad:'La Plata', age:25, height:'1.71', price:350000, tone:'#d9a7a0', badge:'TOP', langs:['Español','Inglés','Italiano'], style:['Apasionada','Elegante'], bio:'Carácter cálido y una elegancia que no pasa desapercibida. Transforma cualquier ocasión en una experiencia inolvidable.' },
  { id:'victoria', name:'Victoria', pais:'Estados Unidos', provincia:'Nevada', ciudad:'Las Vegas', age:26, height:'1.77', price:700000, tone:'#e8cf9a', badge:'VIP', langs:['Inglés','Español','Ruso'], style:['Imponente','Refinada'], bio:'Estatura de modelo y porte de reina. Irradia seguridad y clase, una compañía a la altura de los eventos más exigentes.' },
  { id:'noor', name:'Noor', pais:'Emiratos Árabes Unidos', provincia:'Dubái', ciudad:'Downtown', age:24, height:'1.69', price:550000, tone:'#c9a4cf', badge:'NUEVA', langs:['Inglés','Árabe'], style:['Misteriosa','Cautivadora'], bio:'Mirada profunda y un aura enigmática. Ofrece discreción absoluta y una presencia tan elegante como inolvidable.' },
  { id:'emma', name:'Emma', pais:'Uruguay', provincia:'Maldonado', ciudad:'Punta del Este', age:27, height:'1.72', price:500000, tone:'#a4b8cf', badge:'TOP', langs:['Inglés','Español','Francés'], style:['Cosmopolita','Cálida'], bio:'Espíritu viajero y conversación fluida en varios idiomas. La acompañante ideal para escapadas y eventos internacionales.' },
  { id:'bianca', name:'Bianca', pais:'Argentina', provincia:'Santa Fe', ciudad:'Rosario', age:23, height:'1.70', price:400000, tone:'#cfc0a4', badge:'VIP', langs:['Español','Inglés','Portugués'], style:['Vivaz','Glamorosa'], bio:'Energía contagiosa y un estilo siempre impecable. Aporta chispa y sofisticación a cada cita.' },
];

function figureSVG(tone){ return `<svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" color="${tone}" d="M100 40c14 0 24 11 24 27s-10 30-24 30-24-14-24-30 10-27 24-27Zm-44 110c8-18 25-30 44-30s36 12 44 30c10 22 14 70 14 130H42c0-60 4-108 14-130Z"/></svg>`; }

function cardMedia(m){
  if(m.foto) return `<div class="figure" style="position:absolute;inset:0"><img src="${m.foto}" alt="${m.name}" style="width:100%;height:100%;object-fit:cover"></div>`;
  return `<div class="figure" style="position:absolute;inset:0">${figureSVG(m.tone||'#d4af6e')}</div>`;
}
function modelCard(m){
  const href = m.sid ? `perfil.html?sid=${m.sid}` : `perfil.html?id=${m.id}`;
  const badge = m.badge || 'VIP';
  const badgeClass = badge === 'VIP' ? 'model-badge vip right' : 'model-badge right';
  return `<a class="model-card" href="${href}" data-pais="${m.pais||''}">
    <span class="model-price"><b>${fmtP(m.price)}</b></span>
    <span class="${badgeClass}">${badge}</span>
    ${cardMedia(m)}
    <div class="model-info">
      <h3>${m.name}</h3>
      <div class="loc"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>${ubicTxt(m)}</div>
      <div class="attrs"><span>${m.age||m.edad||''} años</span><span>·</span><span style="color:var(--gold)">${fmtP(m.price)}</span></div>
      <div class="model-cta"><span class="link">Ver perfil →</span></div>
    </div>
  </a>`;
}
function fromPublicado(p){ return { sid:p.id, name:p.nombre, pais:p.pais, provincia:p.provincia, ciudad:p.ciudad, edad:p.edad, age:p.edad, height:p.altura, price:p.precio, foto:(Array.isArray(p.fotos)&&p.fotos[0])||null, fotos:p.fotos, bio:p.bio, badge:'VIP' }; }

async function getReales(){ try { return window.eaSupa ? (await window.eaSupa.getPublicados()).map(fromPublicado) : []; } catch(e){ return []; } }

async function renderFeatured(){
  const el = document.getElementById('featuredGrid'); if(!el) return;
  const reales = await getReales();
  const lista = [...reales, ...MODELS].slice(0,8);
  el.innerHTML = lista.map(modelCard).join('');
}

async function renderCatalog(){
  const el = document.getElementById('modelsGrid'); if(!el) return;
  const reales = await getReales();
  const lista = [...reales, ...MODELS];
  el.innerHTML = lista.map(modelCard).join('');
  // Filtros dinámicos por país
  const filtros = document.getElementById('filters');
  if(filtros){
    const paises = [...new Set(lista.map(m => m.pais).filter(Boolean))];
    filtros.innerHTML = `<button class="filter-btn active" data-filter="all">Todos</button>` + paises.map(p => `<button class="filter-btn" data-filter="${p}">${p}</button>`).join('');
    const btns = filtros.querySelectorAll('.filter-btn');
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.classList.remove('active')); b.classList.add('active');
      const f = b.dataset.filter;
      document.querySelectorAll('#modelsGrid .model-card').forEach(card => { card.style.display = (f === 'all' || card.dataset.pais === f) ? '' : 'none'; });
    }));
  }
}

async function renderProfile(){
  const wrap = document.getElementById('pName'); if(!wrap) return;
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');
  let m;
  if(sid && window.eaSupa){
    const p = await window.eaSupa.getPerfil(sid);
    if(p) m = fromPublicado(p);
  }
  if(!m){
    const id = params.get('id') || 'valentina';
    m = MODELS.find(x => x.id === id) || MODELS[0];
  }
  document.title = `${m.name} · Elite Angels VIP`;
  document.getElementById('crumbName').textContent = m.name;
  document.getElementById('pName').textContent = m.name;
  document.getElementById('pLoc').textContent = ubicTxt(m);
  document.getElementById('pBio').textContent = m.bio || '';
  const fotos = (m.fotos && m.fotos.length) ? m.fotos : null;
  document.getElementById('mainImg').innerHTML = fotos ? `<img src="${fotos[0]}" alt="${m.name}" style="width:100%;height:100%;object-fit:cover">` : `<div class="figure" style="position:absolute;inset:0">${figureSVG(m.tone||'#d4af6e')}</div>`;
  document.getElementById('thumbs').innerHTML = (fotos || [m.tone||'#d4af6e','#d9a7a0','#e8cf9a','#a4b8cf']).slice(0,4).map(x => fotos ? `<div class="thumb"><img src="${x}" style="width:100%;height:100%;object-fit:cover"></div>` : `<div class="thumb"><div class="figure" style="position:absolute;inset:0">${figureSVG(x)}</div></div>`).join('');
  const specs = [['Edad', (m.age||m.edad||'—') + ' años'],['Altura', (m.height||'—')],['Tarifa', fmtP(m.price)],['Ubicación', m.ciudad||'—']];
  document.getElementById('specGrid').innerHTML = specs.map(s => `<div class="spec"><div class="k">${s[0]}</div><div class="v">${s[1]}</div></div>`).join('');
  document.getElementById('pChips').innerHTML = [...(m.langs||[]), ...(m.style||[])].map(c => `<span class="chip">${c}</span>`).join('');
  const rateBox = document.getElementById('rateBox');
  if(rateBox){
    const rows = [['1 hora', m.price],['2 horas', Math.round(m.price*1.8)],['Cena / Evento', Math.round(m.price*2.5)],['Noche completa', Math.round(m.price*4)]];
    rateBox.innerHTML = `<h3 style="font-size:1.3rem;margin-bottom:8px">Tarifas</h3>` + rows.map(r => `<div class="rate-row"><span class="dur">${r[0]}</span><span class="pr">${fmtP(r[1])}</span></div>`).join('');
  }
  const rel = document.getElementById('relatedGrid');
  if(rel){ const reales = await getReales(); const otras = [...reales, ...MODELS].filter(x => (x.sid||x.id) !== (m.sid||m.id)).slice(0,4); rel.innerHTML = otras.map(modelCard).join(''); }
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

function setupUbicacion(){
  const selP = document.getElementById('selPais'), selPr = document.getElementById('selProvincia'), selC = document.getElementById('selCiudad');
  if(!selP || !window.EA_LOCATIONS) return;
  const L = window.EA_LOCATIONS;
  selP.innerHTML = '<option value="">País</option>' + Object.keys(L).map(p => `<option>${p}</option>`).join('');
  selP.addEventListener('change', () => {
    const provs = L[selP.value] ? Object.keys(L[selP.value]) : [];
    selPr.innerHTML = '<option value="">Provincia / Estado</option>' + provs.map(p => `<option>${p}</option>`).join('');
    selPr.disabled = !provs.length; selC.innerHTML = '<option value="">Ciudad</option>'; selC.disabled = true;
  });
  selPr.addEventListener('change', () => {
    const cs = (L[selP.value] && L[selP.value][selPr.value]) || [];
    selC.innerHTML = '<option value="">Ciudad</option>' + cs.map(c => `<option>${c}</option>`).join('');
    selC.disabled = !cs.length;
  });
}

function publishWizard(){
  const form = document.getElementById('publishForm'); if(!form) return;
  setupUbicacion();
  let amount = 0;
  const dots = document.querySelectorAll('.step-dot');
  const stepsEls = form.querySelectorAll('.wizard-step');

  const pagoRet = new URLSearchParams(location.search).get('pago');
  if(pagoRet){
    const pa = document.getElementById('payArea'); if(pa) pa.style.display = 'none';
    const pd = document.getElementById('payDone');
    if(pd){
      const titulo = pd.querySelector('h3'); const txt = pd.querySelector('p');
      if(pagoRet === 'ok'){ if(titulo) titulo.textContent = '¡Pago confirmado!'; if(txt) txt.textContent = 'Recibimos tu pago y tu solicitud. La verificamos y, una vez aprobada, queda publicada por 30 días.'; }
      else if(pagoRet === 'pendiente'){ if(titulo) titulo.textContent = 'Pago pendiente'; if(txt) txt.textContent = 'Tu pago quedó pendiente de acreditación. Cuando se confirme, procesamos tu publicación.'; }
      else { if(titulo) titulo.textContent = 'El pago no se completó'; if(txt) txt.textContent = 'No se pudo procesar el pago. Podés intentar publicar nuevamente.'; }
      pd.classList.add('show');
    }
    stepsEls.forEach(s => s.classList.toggle('active', +s.dataset.step === 3));
    dots.forEach(d => d.classList.add('done'));
  }

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
      if(inp.id === 'precioInput' && inp.value) bad = +inp.value < 50000;
      if(field) field.classList.toggle('err', bad);
      if(bad) ok = false;
    });
    return ok;
  }
  form.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => {
    const cur = +b.closest('.wizard-step').dataset.step;
    if(!validateStep(cur)) return;
    const next = +b.dataset.next;
    if(next === 3){ amount = +document.getElementById('precioInput').value || 0; document.getElementById('sumName').textContent = form.nombre.value || '—'; document.getElementById('sumAmount').textContent = fmtP(amount); const pba = document.getElementById('payBtnAmount'); if(pba) pba.textContent = fmtP(amount); }
    goStep(next);
  }));
  form.querySelectorAll('[data-prev]').forEach(b => b.addEventListener('click', () => goStep(+b.dataset.prev)));
  form.querySelectorAll('.price-chips button').forEach(b => b.addEventListener('click', () => { document.getElementById('precioInput').value = b.dataset.price; }));
  const drop = document.getElementById('photoDrop');
  const input = document.getElementById('photoInput');
  const preview = document.getElementById('photoPreview');
  let photoFiles = [];
  if(drop){
    drop.addEventListener('click', () => input.click());
    input.addEventListener('change', () => {
      preview.innerHTML = ''; photoFiles = [...input.files].slice(0,6);
      photoFiles.forEach(f => { const url = URL.createObjectURL(f); preview.insertAdjacentHTML('beforeend', `<div class="pp"><img src="${url}" alt=""></div>`); });
    });
  }
  const usingMP = !!window.eaSupa;
  if(usingMP){
    const cc = document.querySelector('.credit-card'); if(cc) cc.style.display = 'none';
    const pt = document.querySelector('.pay-type'); if(pt) pt.style.display = 'none';
    ['cardNumber','cardName','cardExp','cardCvc'].forEach(idv => { const el = document.getElementById(idv); const fld = el && el.closest('.field'); if(fld) fld.style.display = 'none'; });
    const sr = document.querySelector('.secure-row'); if(sr) sr.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg> Pago seguro procesado por Mercado Pago';
    const pb = document.getElementById('payBtn'); if(pb) pb.innerHTML = 'Pagar <span id="payBtnAmount"></span> con Mercado Pago';
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!usingMP){ alert('Conectá el backend para procesar pagos.'); return; }
    const selP = document.getElementById('selPais'), selPr = document.getElementById('selProvincia'), selC = document.getElementById('selCiudad');
    const btn = document.getElementById('payBtn'); btn.textContent = 'Procesando…'; btn.disabled = true;
    const payload = { nombre:form.nombre.value.trim(), edad:+form.edad.value||null, pais:selP?selP.value:'', provincia:selPr?selPr.value:'', ciudad:selC?selC.value:'', altura:form.altura.value.trim(), telefono:form.telefono.value.trim(), email:form.email.value.trim(), bio:form.bio.value.trim(), precio:amount };
    const fail = (msg) => { btn.textContent = 'Reintentar pago'; btn.disabled = false; alert(msg || 'No se pudo completar.'); };
    window.eaSupa.submitPublish(payload, photoFiles).then(r => { if(r !== 'redirect'){ document.getElementById('payArea').style.display='none'; document.getElementById('payDone').classList.add('show'); dots.forEach(d => d.classList.add('done')); } }).catch(err => { console.error(err); fail('No se pudo iniciar el pago. Probá de nuevo.'); });
  });
}

function panelInit(){
  const root = document.getElementById('panelRoot'); if(!root) return;
  if(window.eaSupa){ window.eaSupa.initPanel(); return; }
  root.innerHTML = '<div class="panel-empty"><div class="pe-ic">📭</div><h3>Conectá el backend</h3><p>El panel real se activa con Supabase.</p></div>';
}

document.addEventListener('DOMContentLoaded', () => {
  ageGate(); headerScroll(); mobileMenu(); renderFeatured(); renderCatalog(); renderProfile(); reveals(); bookingForm(); publishWizard(); panelInit(); setTimeout(reveals, 120);
});
