/* ELITE ANGELS — Backend (Supabase): media, edición, reseñas, auth admin y portal modelo */
(function () {
  const SUPABASE_URL = 'https://fsjrimmurtnrorqhnbwu.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_2lWllWfVLWsPnnko4TEa4Q_2sx0kdI4';
  if (!window.supabase || !window.supabase.createClient) { console.warn('Supabase SDK no cargado'); return; }
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const fmt = (n) => '$' + Number(n || 0).toLocaleString('es-AR');
  const ubic = (s) => [s.ciudad, s.provincia, s.pais].filter(Boolean).join(', ');
  const esc = (t) => (t == null ? '' : String(t)).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  async function up(bucket, file, nameHint) {
    const base = (file && file.name) || nameHint || 'archivo';
    const ext = (base.split('.').pop() || 'dat').toLowerCase();
    const path = Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.' + ext;
    const { error } = await client.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (error) { console.error('upload', error); return null; }
    return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }
  async function subirMedios(photoFiles, videoFiles, audioBlob) {
    const fotos = [], videos = [];
    for (const f of (photoFiles || []).slice(0, 8)) { const u = await up('fotos', f); if (u) fotos.push(u); }
    for (const f of (videoFiles || []).slice(0, 4)) { const u = await up('medios', f); if (u) videos.push(u); }
    let audio = null;
    if (audioBlob) audio = await up('medios', audioBlob, 'voz.webm');
    return { fotos, videos, audio };
  }

  /* ---------- Publicar ---------- */
  async function submitPublish(payload, photoFiles, videoFiles, audioBlob) {
    const m = await subirMedios(photoFiles, videoFiles, audioBlob);
    const row = {
      nombre: payload.nombre, edad: payload.edad, pais: payload.pais, provincia: payload.provincia,
      ciudad: payload.ciudad, altura: payload.altura, telefono: payload.telefono, email: payload.email,
      bio: payload.bio, precio: payload.precio, fotos: m.fotos, videos: m.videos, audio: m.audio, busto: payload.busto, cintura: payload.cintura, cola: payload.cola, nacionalidad: payload.nacionalidad, cabello: payload.cabello, tipo_cuerpo: payload.tipo_cuerpo,
      pago: 'pendiente', estado: 'pendiente'
    };
    const { data: ins, error } = await client.from('solicitudes').insert(row).select('id').single();
    if (error) throw error;
    const resp = await client.functions.invoke('crear-pago', { body: { nombre: payload.nombre, precio: payload.precio, solicitud_id: ins.id } });
    if (resp.error) throw resp.error;
    const ip = resp.data && (resp.data.init_point || resp.data.sandbox_init_point);
    if (ip) { window.location.href = ip; return 'redirect'; }
    throw new Error((resp.data && resp.data.error) || 'No se pudo iniciar el pago.');
  }

  /* ---------- Lecturas públicas ---------- */
  async function getPublicados() { const { data, error } = await client.from('perfiles_publicados').select('*').order('created_at', { ascending: false }); return error ? [] : data; }
  async function getPerfil(id) { const { data, error } = await client.from('perfiles_publicados').select('*').eq('id', id).single(); return error ? null : data; }
  async function getResenas(id) { const { data, error } = await client.from('resenas_aprobadas').select('*').eq('solicitud_id', id).order('created_at', { ascending: false }); return error ? [] : data; }
  async function submitResena(r) { const { error } = await client.from('resenas').insert({ solicitud_id: r.solicitud_id, autor: r.autor, texto: r.texto, estrellas: r.estrellas }); if (error) throw error; return true; }

  /* ---------- Config del sitio (editor) ---------- */
  async function getConfig() { const { data } = await client.from('sitio_config').select('data').eq('id', 1).single(); return (data && data.data) || {}; }
  async function saveConfig(obj) { const { error } = await client.from('sitio_config').update({ data: obj, updated_at: new Date().toISOString() }).eq('id', 1); if (error) throw error; return true; }

  /* ---------- Formulario de edición (compartido admin/modelo) ---------- */
  function selUbic(s) {
    const L = window.EA_LOCATIONS || {};
    const paises = Object.keys(L);
    return `<div class="field-row">
      <div class="field"><label>País</label><select data-ef="pais">${['',...paises].map(p=>`<option ${p===s.pais?'selected':''}>${p||'País'}</option>`).join('')}</select></div>
      <div class="field"><label>Provincia</label><input data-ef="provincia" value="${esc(s.provincia)}" placeholder="Provincia"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Ciudad</label><input data-ef="ciudad" value="${esc(s.ciudad)}" placeholder="Ciudad"></div>
      <div class="field"><label>Altura</label><input data-ef="altura" value="${esc(s.altura)}" placeholder="1.70 m"></div>
    </div>`;
  }
  function mediaChips(arr, tipo) {
    return (arr||[]).map((u,i)=>`<span class="ed-chip">${tipo}${i+1} <button type="button" class="ed-rm" data-tipo="${tipo}" data-url="${esc(u)}">✕</button></span>`).join('');
  }
  function editForm(s, isAdmin) {
    return `<form class="ed-form" data-id="${s.id}">
      <div class="field-row">
        <div class="field"><label>Nombre</label><input data-ef="nombre" value="${esc(s.nombre)}"></div>
        <div class="field"><label>Edad</label><input data-ef="edad" type="number" value="${esc(s.edad)}"></div>
      </div>
      ${selUbic(s)}
      <div class="field-row">
        <div class="field"><label>Teléfono / WhatsApp</label><input data-ef="telefono" value="${esc(s.telefono)}"></div>
        <div class="field"><label>Tarifa (ARS)${isAdmin?'':' — la edita la administración'}</label><input data-ef="precio" type="number" value="${esc(s.precio)}" ${isAdmin?'':'disabled'}></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Nacionalidad</label><input data-ef="nacionalidad" value="${esc(s.nacionalidad)}" placeholder="Argentina"></div>
        <div class="field"><label>Cabello</label><input data-ef="cabello" value="${esc(s.cabello)}" placeholder="Morena / Rubia..."></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Tipo de cuerpo</label><input data-ef="tipo_cuerpo" value="${esc(s.tipo_cuerpo)}" placeholder="Delgada / Curvas..."></div>
        <div class="field"><label>Busto</label><input data-ef="busto" value="${esc(s.busto)}" placeholder="90 cm"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Cintura</label><input data-ef="cintura" value="${esc(s.cintura)}" placeholder="60 cm"></div>
        <div class="field"><label>Cola</label><input data-ef="cola" value="${esc(s.cola)}" placeholder="95 cm"></div>
      </div>
      <div class="field"><label>Descripción</label><textarea data-ef="bio">${esc(s.bio)}</textarea></div>
      <div class="field"><label>Fotos actuales</label><div class="ed-chips">${mediaChips(s.fotos,'foto')||'<span style="color:var(--text-mute)">sin fotos</span>'}</div><input type="file" data-ef="addFotos" accept="image/*" multiple></div>
      <div class="field"><label>Videos actuales</label><div class="ed-chips">${mediaChips(s.videos,'video')||'<span style="color:var(--text-mute)">sin videos</span>'}</div><input type="file" data-ef="addVideos" accept="video/*" multiple></div>
      <div class="field"><label>Mensaje de voz / Audio</label>${s.audio?`<div class="ed-chips"><span class="ed-chip">audio <button type="button" class="ed-rm" data-tipo="audio" data-url="${esc(s.audio)}">✕</button></span></div><audio controls src="${esc(s.audio)}" style="width:100%;margin-top:8px"></audio>`:'<span style="color:var(--text-mute)">sin audio</span>'}<input type="file" data-ef="addAudio" accept="audio/*,video/*"></div>
      <div class="ed-actions"><button type="button" class="btn btn-ghost ed-cancel">Cancelar</button><button type="submit" class="btn btn-gold">Guardar cambios</button></div>
    </form>`;
  }
  async function recolectarYGuardar(formEl, removidos, isAdmin) {
    const id = formEl.dataset.id;
    const get = (k) => { const el = formEl.querySelector(`[data-ef="${k}"]`); return el ? el.value.trim() : undefined; };
    // cargar fila actual para fusionar media
    const { data: actual } = await client.from('solicitudes').select('fotos,videos,audio').eq('id', id).single();
    let fotos = (actual?.fotos || []).filter(u => !removidos.includes(u));
    let videos = (actual?.videos || []).filter(u => !removidos.includes(u));
    let audio = actual?.audio || null;
    if (audio && removidos.includes(audio)) audio = null;
    const fIn = formEl.querySelector('[data-ef="addFotos"]'); const vIn = formEl.querySelector('[data-ef="addVideos"]'); const aIn = formEl.querySelector('[data-ef="addAudio"]');
    const nuevos = await subirMedios(fIn?[...fIn.files]:[], vIn?[...vIn.files]:[], aIn&&aIn.files[0]?aIn.files[0]:null);
    fotos = fotos.concat(nuevos.fotos); videos = videos.concat(nuevos.videos); if (nuevos.audio) audio = nuevos.audio;
    const patch = { nombre:get('nombre'), edad:+get('edad')||null, pais:get('pais'), provincia:get('provincia'), ciudad:get('ciudad'), altura:get('altura'), busto:get('busto'), cintura:get('cintura'), cola:get('cola'), nacionalidad:get('nacionalidad'), cabello:get('cabello'), tipo_cuerpo:get('tipo_cuerpo'), telefono:get('telefono'), bio:get('bio'), fotos, videos, audio };
    if (isAdmin) patch.precio = +get('precio')||0;
    const { error } = await client.from('solicitudes').update(patch).eq('id', id);
    if (error) throw error;
    return true;
  }

  /* ---------- Panel admin ---------- */
  function adminLogin(root, msg) {
    root.innerHTML = `<div class="form-card" style="max-width:420px;margin:0 auto">
      <img src="assets/logo.svg" class="logo-emblem" style="margin:0 auto 16px">
      <h3 style="font-size:1.5rem;text-align:center;margin-bottom:6px">Panel privado</h3>
      <p style="color:var(--text-soft);font-size:.9rem;text-align:center;margin-bottom:20px">Acceso exclusivo de administración.</p>
      <div class="field"><label>Email</label><input type="email" id="aEmail" placeholder="arielgalo@gmail.com"></div>
      <div class="field"><label>Contraseña</label><input type="password" id="aPass" placeholder="••••••••"></div>
      <button class="btn btn-gold" id="aLogin" style="width:100%;justify-content:center">Ingresar</button>
      <p style="text-align:center;margin-top:14px"><a href="#" id="aReset" style="color:var(--gold);font-size:.85rem">Crear o restablecer contraseña</a></p>
      <p id="aMsg" style="color:var(--gold);font-size:.85rem;text-align:center;margin-top:10px">${msg||''}</p>
    </div>`;
    document.getElementById('aLogin').addEventListener('click', async () => {
      const email = document.getElementById('aEmail').value.trim(), pass = document.getElementById('aPass').value;
      const { error } = await client.auth.signInWithPassword({ email, password: pass });
      if (error) document.getElementById('aMsg').textContent = 'Email o contraseña incorrectos.';
    });
    document.getElementById('aReset').addEventListener('click', async (e) => {
      e.preventDefault(); const email = document.getElementById('aEmail').value.trim();
      if (!email) { document.getElementById('aMsg').textContent = 'Escribí tu email primero.'; return; }
      await client.auth.resetPasswordForEmail(email, { redirectTo: location.href });
      document.getElementById('aMsg').textContent = 'Te enviamos un email para definir tu contraseña.';
    });
  }
  async function adminBoard(root, email) {
    root.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px">
      <span style="color:var(--text-soft);font-size:.88rem">Admin: <strong style="color:var(--gold)">${esc(email)}</strong></span>
      <button class="btn btn-ghost" id="aOut" style="padding:9px 18px">Cerrar sesión</button></div><div id="eaBoard"></div>`;
    document.getElementById('aOut').addEventListener('click', async () => { await client.auth.signOut(); location.reload(); });
    let filtro = 'pendiente';
    document.querySelectorAll('.panel-tab').forEach(t => t.addEventListener('click', () => { filtro = t.dataset.tab; render(); }));
    async function render() {
      const board = document.getElementById('eaBoard');
      document.querySelectorAll('.panel-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === filtro));
      if (filtro === 'resenas') return renderResenas(board);
      if (filtro === 'sitio') return renderSitio(board);
      const { data, error } = await client.from('solicitudes').select('*').order('created_at', { ascending: false });
      if (error) { adminLogin(root, 'Tu usuario no es administrador.'); return; }
      const counts = { pendiente:0, publicado:0, rechazado:0 }; data.forEach(s => counts[s.estado] = (counts[s.estado]||0)+1);
      document.querySelectorAll('.panel-tab').forEach(t => { const c = t.querySelector('.cnt'); if (c && counts[t.dataset.tab]!=null) c.textContent = counts[t.dataset.tab]; });
      const list = data.filter(s => s.estado === filtro);
      if (!list.length) { board.innerHTML = `<div class="panel-empty"><div class="pe-ic">📭</div><h3>Sin solicitudes ${filtro}s</h3></div>`; return; }
      board.innerHTML = list.map(s => {
        const fotos = (s.fotos&&s.fotos.length)?s.fotos.map(f=>`<a href="${esc(f)}" target="_blank" class="rev-photo"><img src="${esc(f)}"></a>`).join(''):'<div class="rev-nophoto">Sin fotos</div>';
        const fecha = new Date(s.created_at).toLocaleString('es-AR');
        return `<article class="review-card" data-row="${s.id}"><div class="rev-media"><div class="rev-photos">${fotos}</div></div>
          <div class="rev-body"><div class="rev-head"><div><h3>${esc(s.nombre)||'Sin nombre'} <span class="rev-price">${fmt(s.precio)}</span></h3>
          <div class="rev-meta">${esc(ubic(s))||'—'} · ${s.edad||'—'} años · ${esc(s.altura)||'—'} · ${fecha}</div></div>
          <span class="status-badge ${s.pago==='pagado'?'ready':'incomplete'}">Pago: ${esc(s.pago)}</span></div>
          <div class="rev-contact"><span>📞 ${esc(s.telefono)||'—'}</span><span>✉ ${esc(s.email)||'—'}</span><span>🎬 ${(s.videos||[]).length} video(s)</span><span>🎤 ${s.audio?'voz ✓':'sin voz'}</span></div>
          ${s.bio?`<p class="rev-bio">"${esc(s.bio)}"</p>`:''}
          <div class="rev-actions">
            <button class="btn btn-gold" data-ap="${s.id}">✓ Aprobar y publicar</button>
            <button class="btn btn-ghost" data-ed="${s.id}">✎ Editar</button>
            ${s.estado!=='rechazado'?`<button class="btn btn-ghost" data-rj="${s.id}">Rechazar</button>`:''}
            <button class="btn btn-ghost" data-del="${s.id}">Eliminar</button>
          </div>
          <div class="ed-slot"></div></div></article>`;
      }).join('');
      board.querySelectorAll('[data-ap]').forEach(b=>b.addEventListener('click', async()=>{ await client.from('solicitudes').update({estado:'publicado',aprobado_at:new Date().toISOString()}).eq('id',b.dataset.ap); render(); }));
      board.querySelectorAll('[data-rj]').forEach(b=>b.addEventListener('click', async()=>{ if(confirm('¿Rechazar?')){ await client.from('solicitudes').update({estado:'rechazado'}).eq('id',b.dataset.rj); render(); } }));
      board.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click', async()=>{ if(confirm('¿Eliminar definitivamente?')){ await client.from('solicitudes').delete().eq('id',b.dataset.del); render(); } }));
      board.querySelectorAll('[data-ed]').forEach(b=>b.addEventListener('click', async()=>{
        const card = b.closest('.review-card'); const slot = card.querySelector('.ed-slot');
        if (slot.innerHTML) { slot.innerHTML=''; return; }
        const { data: s } = await client.from('solicitudes').select('*').eq('id', b.dataset.ed).single();
        slot.innerHTML = editForm(s, true);
        const removidos = [];
        slot.querySelectorAll('.ed-rm').forEach(x=>x.addEventListener('click',()=>{ removidos.push(x.dataset.url); x.closest('.ed-chip').remove(); }));
        slot.querySelector('.ed-cancel').addEventListener('click',()=>slot.innerHTML='');
        slot.querySelector('.ed-form').addEventListener('submit', async (e)=>{ e.preventDefault(); const btn=e.target.querySelector('button[type="submit"]'); btn.textContent='Guardando…'; btn.disabled=true; try{ await recolectarYGuardar(e.target, removidos, true); render(); }catch(err){ alert('Error al guardar: '+err.message); btn.textContent='Guardar cambios'; btn.disabled=false; } });
      }));
    }
    async function renderResenas(board) {
      const { data, error } = await client.from('resenas').select('*, solicitudes(nombre)').order('created_at',{ascending:false});
      if (error) { board.innerHTML='<div class="panel-empty"><p>No se pudieron cargar las reseñas.</p></div>'; return; }
      const pend = data.filter(r=>r.estado==='pendiente');
      const cTab = document.querySelector('.panel-tab[data-tab="resenas"] .cnt'); if(cTab) cTab.textContent = pend.length;
      if(!data.length){ board.innerHTML='<div class="panel-empty"><div class="pe-ic">💬</div><h3>Sin reseñas todavía</h3></div>'; return; }
      board.innerHTML = data.map(r=>`<div class="review-card" style="grid-template-columns:1fr"><div class="rev-body">
        <div class="rev-head"><div><h3 style="font-size:1.2rem">${esc(r.autor)} <span style="color:var(--gold)">${'★'.repeat(r.estrellas)}</span></h3>
        <div class="rev-meta">sobre ${esc(r.solicitudes?.nombre)||'—'} · ${new Date(r.created_at).toLocaleDateString('es-AR')}</div></div>
        <span class="status-badge ${r.estado==='aprobado'?'ready':'incomplete'}">${esc(r.estado)}</span></div>
        <p class="rev-bio">"${esc(r.texto)}"</p>
        <div class="rev-actions">${r.estado!=='aprobado'?`<button class="btn btn-gold" data-rap="${r.id}">✓ Aprobar</button>`:''}<button class="btn btn-ghost" data-rdel="${r.id}">Eliminar</button></div>
        </div></div>`).join('');
      board.querySelectorAll('[data-rap]').forEach(b=>b.addEventListener('click', async()=>{ await client.from('resenas').update({estado:'aprobado'}).eq('id',b.dataset.rap); renderResenas(board); }));
      board.querySelectorAll('[data-rdel]').forEach(b=>b.addEventListener('click', async()=>{ if(confirm('¿Eliminar reseña?')){ await client.from('resenas').delete().eq('id',b.dataset.rdel); renderResenas(board); } }));
    }
    async function renderSitio(board) {
      let cfg = {}; try { cfg = await getConfig(); } catch (e) {}
      const v = (k) => esc(cfg[k] || '');
      const car = Array.isArray(cfg.carrusel) ? cfg.carrusel : [];
      const defs = ['assets/hero/slide1.jpg','assets/hero/slide2.jpg','assets/hero/slide3.jpg','assets/hero/slide4.jpg'];
      board.innerHTML = `<div class="form-card" style="max-width:740px">
        <h3 style="font-size:1.5rem;margin-bottom:6px">Editor del sitio</h3>
        <p style="color:var(--text-soft);font-size:.9rem;margin-bottom:22px">Cambiá textos, contacto, redes y las fotos del carrusel. Al guardar, se aplica en toda la web.</p>
        <div class="field"><label>Título del hero (podés resaltar con &lt;span class="text-gold"&gt;palabra&lt;/span&gt;)</label><input id="cfg_titulo" value="${v('hero_titulo')}" placeholder="Experiencias donde el aura se expande"></div>
        <div class="field"><label>Bajada del hero</label><textarea id="cfg_lead" placeholder="Acompañantes de alto nivel...">${v('hero_lead')}</textarea></div>
        <div class="field-row">
          <div class="field"><label>WhatsApp (solo números con país)</label><input id="cfg_whatsapp" value="${v('whatsapp')}" placeholder="5492214982243"></div>
          <div class="field"><label>Teléfono (como se muestra)</label><input id="cfg_telefono" value="${v('telefono')}" placeholder="+54 9 221 498-2243"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Instagram (URL)</label><input id="cfg_instagram" value="${v('instagram')}" placeholder="https://instagram.com/tu_cuenta"></div>
          <div class="field"><label>Telegram (URL)</label><input id="cfg_telegram" value="${v('telegram')}" placeholder="https://t.me/tu_cuenta"></div>
        </div>
        <label style="display:block;font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;color:var(--text-soft);margin:20px 0 10px">Fotos del carrusel (hasta 4)</label>
        <div class="sp-grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
          ${[0,1,2,3].map(i=>`<div class="field" style="margin:0"><div style="aspect-ratio:16/9;border-radius:10px;overflow:hidden;border:1px solid var(--line-soft);margin-bottom:6px;background:#1d0e28"><img id="cfg_carimg_${i}" src="${car[i]||defs[i]}" style="width:100%;height:100%;object-fit:cover"></div><input type="file" data-car="${i}" accept="image/*" style="font-size:.76rem;color:var(--text-soft)"></div>`).join('')}
        </div>
        <div class="ed-actions" style="margin-top:24px"><button class="btn btn-gold" id="cfg_save" style="justify-content:center">Guardar y publicar cambios</button></div>
        <p id="cfg_msg" style="color:var(--gold);font-size:.9rem;text-align:center;margin-top:14px"></p>
      </div>`;
      board.querySelectorAll('input[data-car]').forEach(inp => inp.addEventListener('change', () => { const fl = inp.files[0]; if (fl) document.getElementById('cfg_carimg_' + inp.dataset.car).src = URL.createObjectURL(fl); }));
      document.getElementById('cfg_save').addEventListener('click', async () => {
        const btn = document.getElementById('cfg_save'), msg = document.getElementById('cfg_msg');
        btn.textContent = 'Guardando…'; btn.disabled = true; msg.textContent = '';
        try {
          const carrusel = [];
          for (let i = 0; i < 4; i++) { const inp = board.querySelector('input[data-car="' + i + '"]'); let url = car[i] || null; if (inp && inp.files[0]) { const u = await up('sitio', inp.files[0]); if (u) url = u; } carrusel.push(url); }
          const obj = { hero_titulo: document.getElementById('cfg_titulo').value.trim(), hero_lead: document.getElementById('cfg_lead').value.trim(), whatsapp: document.getElementById('cfg_whatsapp').value.trim(), telefono: document.getElementById('cfg_telefono').value.trim(), instagram: document.getElementById('cfg_instagram').value.trim(), telegram: document.getElementById('cfg_telegram').value.trim(), carrusel: carrusel.filter(Boolean) };
          await saveConfig(obj);
          msg.textContent = '✓ Guardado. Los cambios ya están publicados en la web.';
          btn.textContent = 'Guardar y publicar cambios'; btn.disabled = false;
        } catch (err) { msg.textContent = 'Error: ' + (err.message || err); btn.textContent = 'Reintentar'; btn.disabled = false; }
      });
    }

    render();
  }
  async function initPanel() {
    const root = document.getElementById('panelRoot'); if (!root) return;
    const { data } = await client.auth.getSession();
    if (data.session) adminBoard(root, data.session.user.email); else adminLogin(root);
    client.auth.onAuthStateChange((_e, session) => { if (session) adminBoard(root, session.user.email); });
  }

  /* ---------- Portal de la modelo ---------- */
  function portalLogin(root, msg) {
    root.innerHTML = `<div class="form-card" style="max-width:440px;margin:0 auto">
      <img src="assets/logo.svg" class="logo-emblem" style="margin:0 auto 16px">
      <h3 style="font-size:1.5rem;text-align:center;margin-bottom:6px">Acceso de modelos</h3>
      <p style="color:var(--text-soft);font-size:.9rem;text-align:center;margin-bottom:20px">Editá tu perfil. Usá el email con el que publicaste.</p>
      <div class="field"><label>Email</label><input type="email" id="mEmail" placeholder="tu@email.com"></div>
      <div class="field"><label>Contraseña</label><input type="password" id="mPass" placeholder="••••••••"></div>
      <button class="btn btn-gold" id="mLogin" style="width:100%;justify-content:center;margin-bottom:10px">Ingresar</button>
      <button class="btn btn-ghost" id="mSignup" style="width:100%;justify-content:center">Crear mi contraseña (primera vez)</button>
      <p style="text-align:center;margin-top:14px"><a href="#" id="mReset" style="color:var(--gold);font-size:.85rem">Olvidé mi contraseña</a></p>
      <p id="mMsg" style="color:var(--gold);font-size:.85rem;text-align:center;margin-top:10px">${msg||''}</p>
    </div>`;
    const M = (t)=>document.getElementById('mMsg').textContent=t;
    document.getElementById('mLogin').addEventListener('click', async()=>{ const {error}=await client.auth.signInWithPassword({email:document.getElementById('mEmail').value.trim(),password:document.getElementById('mPass').value}); if(error) M('Email o contraseña incorrectos. Si es tu primera vez, tocá "Crear mi contraseña".'); });
    document.getElementById('mSignup').addEventListener('click', async()=>{ const email=document.getElementById('mEmail').value.trim(), p=document.getElementById('mPass').value; if(p.length<6){M('La contraseña debe tener al menos 6 caracteres.');return;} const {error}=await client.auth.signUp({email,password:p,options:{emailRedirectTo:location.href}}); M(error?('Error: '+error.message):'¡Listo! Revisá tu email para confirmar la cuenta y luego ingresá.'); });
    document.getElementById('mReset').addEventListener('click', async(e)=>{ e.preventDefault(); const email=document.getElementById('mEmail').value.trim(); if(!email){M('Escribí tu email primero.');return;} await client.auth.resetPasswordForEmail(email,{redirectTo:location.href}); M('Te enviamos un email para restablecer tu contraseña.'); });
  }
  async function portalBoard(root, email) {
    const { data: filas } = await client.from('solicitudes').select('*').eq('email', email).order('created_at',{ascending:false});
    const header = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px">
      <span style="color:var(--text-soft);font-size:.88rem">Conectada como <strong style="color:var(--gold)">${esc(email)}</strong></span>
      <button class="btn btn-ghost" id="mOut" style="padding:9px 18px">Cerrar sesión</button></div>`;
    if (!filas || !filas.length) { root.innerHTML = header + `<div class="panel-empty"><div class="pe-ic">🔍</div><h3>No encontramos perfiles con este email</h3><p>Asegurate de usar el mismo email con el que publicaste, o <a href="publicar.html" style="color:var(--gold)">publicá tu perfil</a>.</p></div>`; document.getElementById('mOut').addEventListener('click',async()=>{await client.auth.signOut();location.reload();}); return; }
    root.innerHTML = header + filas.map(s=>`<div class="form-card" style="margin-bottom:20px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="font-size:1.3rem">${esc(s.nombre)}</h3><span class="status-badge ${s.estado==='publicado'?'ready':'incomplete'}">${esc(s.estado)}</span></div><div class="ed-slot" data-for="${s.id}"></div></div>`).join('');
    document.getElementById('mOut').addEventListener('click',async()=>{await client.auth.signOut();location.reload();});
    for (const s of filas) {
      const slot = root.querySelector(`.ed-slot[data-for="${s.id}"]`);
      slot.innerHTML = editForm(s, false);
      const removidos = [];
      slot.querySelectorAll('.ed-rm').forEach(x=>x.addEventListener('click',()=>{ removidos.push(x.dataset.url); x.closest('.ed-chip').remove(); }));
      const cancel = slot.querySelector('.ed-cancel'); if(cancel) cancel.style.display='none';
      slot.querySelector('.ed-form').addEventListener('submit', async (e)=>{ e.preventDefault(); const btn=e.target.querySelector('button[type="submit"]'); btn.textContent='Guardando…'; btn.disabled=true; try{ await recolectarYGuardar(e.target, removidos, false); btn.textContent='✓ Guardado'; setTimeout(()=>{btn.textContent='Guardar cambios';btn.disabled=false;},1500); }catch(err){ alert('Error: '+err.message); btn.textContent='Guardar cambios'; btn.disabled=false; } });
    }
  }
  async function initPortal() {
    const root = document.getElementById('portalRoot'); if (!root) return;
    const { data } = await client.auth.getSession();
    if (data.session) portalBoard(root, data.session.user.email); else portalLogin(root);
    client.auth.onAuthStateChange((_e, session) => { if (session) portalBoard(root, session.user.email); });
  }

  window.eaSupa = { client, submitPublish, getPublicados, getPerfil, getResenas, submitResena, initPanel, initPortal, ubic, fmt, getConfig, saveConfig };
})();
