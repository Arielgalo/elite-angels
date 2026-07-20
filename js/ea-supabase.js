/* ELITE ANGELS — Backend (Supabase): media, edición, reseñas, auth admin y portal modelo */
(function () {
  const SUPABASE_URL = 'https://fsjrimmurtnrorqhnbwu.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_2lWllWfVLWsPnnko4TEa4Q_2sx0kdI4';
  if (!window.supabase || !window.supabase.createClient) { console.warn('Supabase SDK no cargado'); return; }
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const fmt = (n) => '$' + Number(n || 0).toLocaleString('es-AR');
  const ubic = (s) => [s.ciudad, s.provincia, s.pais].filter(Boolean).join(', ');
  const esc = (t) => (t == null ? '' : String(t)).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  async function comprimirFoto(file) {
    try {
      if (!file || !((file.type || '').startsWith('image/'))) return file;
      const bmp = await createImageBitmap(file);
      const maxW = 1600;
      const scale = Math.min(1, maxW / bmp.width);
      const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(bmp, 0, 0, w, h);
      const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.74));
      if (blob && blob.size < (file.size || Infinity)) return new File([blob], (file.name || 'foto').replace(/\\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
      return file;
    } catch (e) { return file; }
  }
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
    for (const f of (photoFiles || []).slice(0, 8)) { const c = await comprimirFoto(f); const u = await up('fotos', c); if (u) fotos.push(u); }
    for (const f of (videoFiles || []).slice(0, 4)) { const u = await up('medios', f); if (u) videos.push(u); }
    let audio = null;
    if (audioBlob) audio = await up('medios', audioBlob, 'voz.webm');
    return { fotos, videos, audio };
  }

  /* ---------- Publicar ---------- */
  function fileToB64(file){ return new Promise(function(res,rej){ const r=new FileReader(); r.onload=function(){ const t=String(r.result||''); res(t.slice(t.indexOf(',')+1)); }; r.onerror=rej; r.readAsDataURL(file); }); }
  async function subirVerificacion(sid, email, frenteFile, dorsoFile){ if(!sid||!frenteFile||!dorsoFile) return false; const f=await comprimirFoto(frenteFile), d=await comprimirFoto(dorsoFile); const fb=await fileToB64(f), db=await fileToB64(d); const resp=await client.functions.invoke('guardar-verificacion',{ body:{ sid:sid, email:email||'', dni_frente:fb, dni_dorso:db } }); if(resp.error) throw resp.error; if(resp.data&&resp.data.error) throw new Error(resp.data.error); return true; }
  async function submitPublish(payload, photoFiles, videoFiles, audioBlob) {
    const m = await subirMedios(photoFiles, videoFiles, audioBlob);
    const sid = (self.crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now() + '-' + Math.random().toString(36).slice(2));
    const ts = Date.now();
    let _h = 0; const _str = (payload.email || '') + '|' + ts; for (let i = 0; i < _str.length; i++) { _h = (_h * 31 + _str.charCodeAt(i)) >>> 0; }
    const numero = 'AE-' + ts.toString(36).slice(-4).toUpperCase() + '-' + _h.toString(36).slice(-4).toUpperCase();
    const dias = payload.dias || 3;
    const row = {
      id: sid, numero,
      plan: payload.plan || 'estandar', dias, puntos: payload.puntos || 0, precio_cita: payload.precio_cita || 15000,
      vence: new Date(ts + dias * 86400000).toISOString(),
      nombre: payload.nombre, edad: payload.edad, pais: payload.pais, provincia: payload.provincia,
      ciudad: payload.ciudad, altura: payload.altura, telefono: payload.telefono, email: payload.email,
      bio: payload.bio, genero: payload.genero, roles: payload.roles || [], precio: payload.precio, fotos: m.fotos, videos: m.videos, audio: m.audio, busto: payload.busto, cintura: payload.cintura, cola: payload.cola, nacionalidad: payload.nacionalidad, cabello: payload.cabello, tipo_cuerpo: payload.tipo_cuerpo,
      nivel_educativo: payload.nivel_educativo, edu_estado: payload.edu_estado, estudio: payload.estudio, cursos: payload.cursos, hobbies: payload.hobbies, rutinas: payload.rutinas, habilidades: payload.habilidades, otros_gustos: payload.otros_gustos, comidas_gusta: payload.comidas_gusta, comidas_rechaza: payload.comidas_rechaza, negocio: payload.negocio,
      pago: 'pendiente', estado: 'pendiente'
    };
    const { error } = await client.from('solicitudes').insert(row);
    if (error) throw error;
    if (payload.dniFrente && payload.dniDorso) { try { await subirVerificacion(sid, payload.email, payload.dniFrente, payload.dniDorso); } catch (e) { console.warn('verif', e); } }
    const resp = await client.functions.invoke('crear-pago', { body: { nombre: payload.nombre, precio: payload.precio, solicitud_id: sid } });
    if (resp.error) throw resp.error;
    const ip = resp.data && (resp.data.init_point || resp.data.sandbox_init_point);
    if (ip) { window.location.href = ip; return 'redirect'; }
    throw new Error((resp.data && resp.data.error) || 'No se pudo iniciar el pago.');
  }

  async function submitPublishGratis(payload, photoFiles, videoFiles, audioBlob) {
    const m = await subirMedios(photoFiles, videoFiles, audioBlob);
    const body = { nombre: payload.nombre, edad: payload.edad, pais: payload.pais, provincia: payload.provincia, ciudad: payload.ciudad, altura: payload.altura, busto: payload.busto, cintura: payload.cintura, cola: payload.cola, nacionalidad: payload.nacionalidad, cabello: payload.cabello, tipo_cuerpo: payload.tipo_cuerpo, telefono: payload.telefono, email: payload.email, bio: payload.bio, genero: payload.genero, roles: payload.roles || [], nivel_educativo: payload.nivel_educativo, edu_estado: payload.edu_estado, estudio: payload.estudio, cursos: payload.cursos, hobbies: payload.hobbies, rutinas: payload.rutinas, habilidades: payload.habilidades, otros_gustos: payload.otros_gustos, comidas_gusta: payload.comidas_gusta, comidas_rechaza: payload.comidas_rechaza, negocio: payload.negocio, fotos: m.fotos, videos: m.videos, audio: m.audio };
    const resp = await client.functions.invoke('publicar-gratis', { body });
    if (resp.error) throw resp.error;
    if (resp.data && resp.data.error) throw new Error(resp.data.error);
    if (resp.data && resp.data.ok) { const newId = resp.data.id; if (newId && payload.dniFrente && payload.dniDorso) { try { await subirVerificacion(newId, payload.email, payload.dniFrente, payload.dniDorso); } catch (e) { console.warn('verif', e); } } return 'ok'; }
    throw new Error('No se pudo publicar.');
  }

  /* ---------- Lecturas públicas ---------- */
  async function getPublicados() { const { data, error } = await client.from('perfiles_publicados').select('*').order('created_at', { ascending: false }); return error ? [] : data; }
  async function getPerfil(id) { const { data, error } = await client.from('perfiles_publicados').select('*').eq('id', id).single(); return error ? null : data; }
  async function getResenas(id) { const { data, error } = await client.from('resenas_aprobadas').select('*').eq('solicitud_id', id).order('created_at', { ascending: false }); return error ? [] : data; }
  async function submitResena(r) { const { error } = await client.from('resenas').insert({ solicitud_id: r.solicitud_id, autor: r.autor, texto: r.texto, estrellas: r.estrellas }); if (error) throw error; return true; }

  /* ---------- Config del sitio (editor) ---------- */
  async function getConfig() { const { data } = await client.from('sitio_config').select('data').eq('id', 1).single(); return (data && data.data) || {}; }
  async function saveConfig(obj) { const { error } = await client.from('sitio_config').update({ data: obj, updated_at: new Date().toISOString() }).eq('id', 1); if (error) throw error; return true; }
  async function getMovimientos() { const { data } = await client.from('movimientos_puntos').select('*').order('created_at', { ascending: false }); return data || []; }
  async function addMovimiento(m) { const { error } = await client.from('movimientos_puntos').insert(m); if (error) throw error; return true; }
  async function setMovimientoEstado(id, estado) { const { error } = await client.from('movimientos_puntos').update({ estado }).eq('id', id); if (error) throw error; return true; }
  async function delMovimiento(id) { const { error } = await client.from('movimientos_puntos').delete().eq('id', id); if (error) throw error; return true; }
  async function getFinanzas() {
    const { data: sols } = await client.from('solicitudes').select('precio,pago').eq('pago', 'pagado');
    const totalPub = (sols || []).reduce((a, s) => a + Number(s.precio || 0), 0);
    const { data: mov } = await client.from('movimientos_puntos').select('monto,estado');
    const totalPuntos = (mov || []).filter(m => m.estado === 'verificado').reduce((a, m) => a + Number(m.monto || 0), 0);
    const pend = (mov || []).filter(m => m.estado === 'pendiente').length;
    return { totalPub, totalPuntos, pend, count: (mov || []).length };
  }

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
  function fotoGrid(fotos) {
    const arr = fotos || [];
    if (!arr.length) return '<div class="ed-fotos" data-fotos><span style="color:var(--text-mute)">sin fotos</span></div>';
    return `<div class="ed-fotos" data-fotos>${arr.map((u, i) => `<div class="ed-foto" draggable="true" data-url="${esc(u)}"><img src="${esc(u)}"><span class="ed-foto-n">${i + 1}</span><button type="button" class="ed-rm-foto" data-url="${esc(u)}" title="Eliminar">✕</button></div>`).join('')}</div>`;
  }
  function enableFotoSort(grid) {
    if (!grid) return; let drag = null;
    const renum = () => grid.querySelectorAll('.ed-foto').forEach((el, i) => { const n = el.querySelector('.ed-foto-n'); if (n) n.textContent = i + 1; });
    grid.querySelectorAll('.ed-foto').forEach(el => {
      el.addEventListener('dragstart', e => { drag = el; el.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
      el.addEventListener('dragend', () => { el.classList.remove('dragging'); renum(); });
    });
    grid.addEventListener('dragover', e => {
      e.preventDefault(); if (!drag) return;
      const els = [...grid.querySelectorAll('.ed-foto:not(.dragging)')]; let after = null, best = -Infinity;
      els.forEach(c => { const b = c.getBoundingClientRect(); const off = e.clientX - b.left - b.width / 2; if (off < 0 && off > best) { best = off; after = c; } });
      if (after == null) grid.appendChild(drag); else grid.insertBefore(drag, after);
    });
  }
  function wireEdit(slot, removidos) {
    slot.querySelectorAll('.ed-rm').forEach(x => x.addEventListener('click', () => { removidos.push(x.dataset.url); x.closest('.ed-chip').remove(); }));
    slot.querySelectorAll('.ed-rm-foto').forEach(x => x.addEventListener('click', () => { x.closest('.ed-foto').remove(); }));
    enableFotoSort(slot.querySelector('.ed-fotos'));
    const vbtn = slot.querySelector('[data-verif-send]');
    if (vbtn) vbtn.addEventListener('click', async () => {
      const id = vbtn.dataset.verifSend; const msg = slot.querySelector('.verif-msg');
      const files = {}; slot.querySelectorAll('[data-verif]').forEach(i => { if (i.files[0]) files[i.dataset.verif] = i.files[0]; });
      if (!files.dni_frente || !files.dni_dorso || !files.selfie) { msg.textContent = 'Subí las 3 imágenes: DNI frente, dorso y selfie con el DNI.'; return; }
      vbtn.disabled = true; vbtn.textContent = 'Subiendo…';
      try {
        const docs = {};
        for (const k of ['dni_frente','dni_dorso','selfie']) { const c = await comprimirFoto(files[k]); const p = await upPriv('verificaciones', c); if (!p) throw new Error('No se pudo subir ' + k); docs[k] = p; }
        await solicitarVerificacion(id, docs);
        msg.textContent = '✓ Enviado. Tu perfil quedó En revisión. Te avisamos cuando esté verificado.'; vbtn.textContent = 'Enviado ✓';
      } catch (e) { msg.textContent = 'Error: ' + (e.message || e); vbtn.disabled = false; vbtn.textContent = 'Enviar a verificación'; }
    });
  }
  function editForm(s, isAdmin) {
    return `<form class="ed-form" data-id="${s.id}">
      <div class="field-row">
        <div class="field"><label>Nombre</label><input data-ef="nombre" value="${esc(s.nombre)}"></div>
        <div class="field"><label>Edad</label><input data-ef="edad" type="number" value="${esc(s.edad)}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Género</label><select data-ef="genero"><option value="">Sin especificar</option><option value="Mujer"${s.genero==='Mujer'?' selected':''}>Mujer</option><option value="Varón"${s.genero==='Varón'?' selected':''}>Varón</option><option value="No binarie"${s.genero==='No binarie'?' selected':''}>No binarie</option><option value="Trans femenina"${s.genero==='Trans femenina'?' selected':''}>Trans femenina</option><option value="Trans masculino"${s.genero==='Trans masculino'?' selected':''}>Trans masculino</option><option value="Crossdresser"${s.genero==='Crossdresser'?' selected':''}>Crossdresser</option><option value="Otro / prefiero no decir"${s.genero==='Otro / prefiero no decir'?' selected':''}>Otro / prefiero no decir</option></select></div>
        <div class="field"><label>Roles que ofrece (más roles = más búsquedas)</label><div class="roles-pick">${['citas','amigos','eventos'].map(r=>`<label class="role-chk"><input type="checkbox" data-rol="${r}" ${(Array.isArray(s.roles)&&s.roles.includes(r))?'checked':''}> <span>${({citas:'Citas & Compañía',amigos:'Amigos & Salidas',eventos:'Eventos, Roles & Presencia'})[r]}</span></label>`).join('')}</div></div>
        <div class="field"></div>
      </div>
      ${selUbic(s)}
      <div class="field-row">
        <div class="field"><label>Teléfono / WhatsApp</label><input data-ef="telefono" value="${esc(s.telefono)}"></div>
        <div class="field"><label>Tu tarifa (ARS) · plan de 30 min (lo cobrás vos, directo)</label><input data-ef="precio_cita" type="number" min="15000" value="${esc(s.precio_cita)}" placeholder="15000"></div>
      </div>
      ${isAdmin?`<div class="field-row"><div class="field"><label>Nivel</label><select data-ef="plan"><option value="estandar"${s.plan==='estandar'?' selected':''}>Estándar</option><option value="top"${s.plan==='top'?' selected':''}>Top</option><option value="premium"${s.plan==='premium'?' selected':''}>Premium VIP</option></select></div><div class="field"><label>Puntos (ranking)</label><input data-ef="puntos" type="number" value="${esc(s.puntos)}"></div></div>`:''}
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
      <div class="field-row">
        <div class="field"><label>Idiomas (separados por coma)</label><input data-ef="idiomas" value="${esc(s.idiomas)}" placeholder="Español, Inglés, Portugués"></div>
        <div class="field"><label>Estilo (separados por coma)</label><input data-ef="estilo" value="${esc(s.estilo)}" placeholder="Elegante, Culta, Carismática"></div>
      </div>
      <div style="border-top:1px solid var(--line-soft);margin-top:8px;padding-top:16px">
        <label style="color:var(--gold-bright);font-size:1.02rem">🎓 Perfil profesional (para tu currículum)</label>
        <p style="color:var(--text-soft);font-size:.83rem;margin:4px 0 12px">Se muestra en tu perfil y podés descargarlo como CV en PDF (3 diseños).</p>
      </div>
      <div class="field-row">
        <div class="field"><label>Nivel educativo</label><select data-ef="nivel_educativo"><option value="">Seleccionar</option>${['Primario','Secundario','Terciario','Universitario'].map(o=>`<option ${s.nivel_educativo===o?'selected':''}>${o}</option>`).join('')}</select></div>
        <div class="field"><label>Estado</label><select data-ef="edu_estado"><option value="">Seleccionar</option>${['Completo','En curso','En transición'].map(o=>`<option ${s.edu_estado===o?'selected':''}>${o}</option>`).join('')}</select></div>
      </div>
      <div class="field"><label>Carrera / qué estudiás o estudiaste</label><input data-ef="estudio" value="${esc(s.estudio)}" placeholder="Ej: Diseño gráfico, Enfermería, Marketing..."></div>
      <div class="field"><label>Cursos y capacitaciones (uno por línea; aclará si están en transición)</label><textarea data-ef="cursos" placeholder="Community Manager (en transición) — redes y contenido&#10;Inglés B2 — Cultural Inglesa">${esc(s.cursos)}</textarea></div>
      <div class="field-row">
        <div class="field"><label>Habilidades</label><input data-ef="habilidades" value="${esc(s.habilidades)}" placeholder="fotografía, ventas, oratoria"></div>
        <div class="field"><label>Hobbies e intereses</label><input data-ef="hobbies" value="${esc(s.hobbies)}" placeholder="yoga, viajes, música"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Rutinas</label><input data-ef="rutinas" value="${esc(s.rutinas)}" placeholder="gimnasio a la mañana, lectura"></div>
        <div class="field"><label>Otros gustos</label><input data-ef="otros_gustos" value="${esc(s.otros_gustos)}" placeholder="gastronomía, cine, arte"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Comidas que te gustan</label><input data-ef="comidas_gusta" value="${esc(s.comidas_gusta)}" placeholder="asado, pastas, sushi"></div>
        <div class="field"><label>Comidas que no te gustan</label><input data-ef="comidas_rechaza" value="${esc(s.comidas_rechaza)}" placeholder="mariscos, picante"></div>
      </div>
      <div style="border-top:1px solid var(--line-soft);margin-top:8px;padding-top:16px">
        <label style="color:var(--gold-bright);font-size:1.02rem">💼 Perfil comercial · tu negocio, emprendimiento u oficio</label>
        <p style="color:var(--text-soft);font-size:.83rem;margin:4px 0 12px">Difundí lo que ofrecés para multiplicar tus beneficios. Se muestra en tu perfil con botón de contacto.</p>
      </div>
      <div class="field-row">
        <div class="field"><label>Nombre del negocio / emprendimiento</label><input data-ef="negocio_nombre" value="${esc(s.negocio_nombre)}" placeholder="Ej: Estudio Aura, Kiosco 24h..."></div>
        <div class="field"><label>Rubro / categoría</label><input data-ef="negocio_rubro" value="${esc(s.negocio_rubro)}" placeholder="Gastronomía, Belleza, Servicios..."></div>
      </div>
      <div class="field"><label>¿Qué ofrecés? (descripción)</label><textarea data-ef="negocio" placeholder="Contá tu propuesta, qué te diferencia, para quién...">${esc(s.negocio)}</textarea></div>
      <div class="field"><label>Servicios / productos (uno por línea)</label><textarea data-ef="negocio_servicios" placeholder="Corte de pelo — $...&#10;Delivery de comida casera&#10;Clases particulares">${esc(s.negocio_servicios)}</textarea></div>
      <div class="field-row">
        <div class="field"><label>Promoción / oferta actual</label><input data-ef="negocio_promo" value="${esc(s.negocio_promo)}" placeholder="2x1 los martes · 10% primera compra"></div>
        <div class="field"><label>Zona / dónde atendés</label><input data-ef="negocio_zona" value="${esc(s.negocio_zona)}" placeholder="La Plata y alrededores · online"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>WhatsApp / teléfono del negocio</label><input data-ef="negocio_contacto" value="${esc(s.negocio_contacto)}" placeholder="+54 9 221 000 0000"></div>
        <div class="field"><label>Instagram / web</label><input data-ef="negocio_web" value="${esc(s.negocio_web)}" placeholder="@minegocio o minegocio.com"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Logo / imagen de marca</label>${s.negocio_logo?`<img src="${esc(s.negocio_logo)}" style="width:72px;height:72px;object-fit:cover;border-radius:10px;border:1px solid var(--line);display:block;margin-bottom:8px">`:''}<input type="file" data-ef="negocio_logo_file" accept="image/*"></div>
        <div class="field"><label>Fotos de productos / trabajos</label><div class="ed-chips">${(s.negocio_fotos||[]).map((u,i)=>`<span class="ed-chip">foto${i+1} <button type="button" class="ed-rm" data-tipo="negfoto" data-url="${esc(u)}">✕</button></span>`).join('')||'<span style="color:var(--text-mute)">sin fotos</span>'}</div><input type="file" data-ef="negocio_fotos_file" accept="image/*" multiple></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Dirección (para mostrar el mapa)</label><input data-ef="negocio_direccion" value="${esc(s.negocio_direccion)}" placeholder="Calle 50 n° 123, La Plata"></div>
        <div class="field"><label>Link de Google Maps (opcional)</label><input data-ef="negocio_mapa" value="${esc(s.negocio_mapa)}" placeholder="https://maps.app.goo.gl/..."></div>
      </div>
      <div class="field"><label>Descuentos y promociones (uno por línea)</label><textarea data-ef="negocio_descuentos" placeholder="20% off pagando en efectivo&#10;3x2 en productos seleccionados">${esc(s.negocio_descuentos)}</textarea></div>
      <div class="field"><label>Notas de prensa / links (uno por línea: título — url)</label><textarea data-ef="negocio_prensa" placeholder="Nota en Diario X — https://...&#10;Entrevista — https://...">${esc(s.negocio_prensa)}</textarea></div>
      <div class="field"><label>Fotos actuales (arrastrá para ordenar · ✕ para borrar)</label>${fotoGrid(s.fotos)}<input type="file" data-ef="addFotos" accept="image/*" multiple style="margin-top:10px"></div>
      <div class="field"><label>Videos para el feed (verticales, tipo TikTok)</label><div class="ed-chips">${mediaChips(s.videos,'video')||'<span style="color:var(--text-mute)">sin videos</span>'}</div><input type="file" data-ef="addVideos" accept="video/*" multiple></div>
      <div class="field"><label>Mensaje de voz / Audio</label>${s.audio?`<div class="ed-chips"><span class="ed-chip">audio <button type="button" class="ed-rm" data-tipo="audio" data-url="${esc(s.audio)}">✕</button></span></div><audio controls src="${esc(s.audio)}" style="width:100%;margin-top:8px"></audio>`:'<span style="color:var(--text-mute)">sin audio</span>'}<input type="file" data-ef="addAudio" accept="audio/*,video/*"></div>
      <div class="field" style="border-top:1px solid var(--line-soft);margin-top:8px;padding-top:16px">
        <label>Verificación de identidad — <span class="verif-state verif-${s.verif_estado||'sin_verificar'}">${estadoVerifLbl(s.verif_estado)}</span></label>
        <p style="color:var(--text-soft);font-size:.85rem;margin:6px 0 12px">Subí tu <strong>DNI (frente y dorso)</strong> y una <strong>selfie sosteniendo el DNI</strong> junto a tu cara. Cuando el equipo confirme que coincidís con tus fotos, tu perfil queda <strong>Verificado ✓</strong>. Tus documentos son privados: solo los ve el equipo de Aura.</p>
        <div class="field-row"><div class="field"><label>DNI · frente</label><input type="file" data-verif="dni_frente" accept="image/*"></div><div class="field"><label>DNI · dorso</label><input type="file" data-verif="dni_dorso" accept="image/*"></div></div>
        <div class="field"><label>Selfie sosteniendo el DNI</label><input type="file" data-verif="selfie" accept="image/*"></div>
        <button type="button" class="btn btn-gold" data-verif-send="${s.id}" style="margin-top:4px">Enviar a verificación</button>
        <div class="verif-msg" style="color:var(--gold);font-size:.86rem;margin-top:8px"></div>
      </div>
      <div class="ed-actions"><button type="button" class="btn btn-ghost ed-cancel">Cancelar</button><button type="submit" class="btn btn-gold">Guardar cambios</button></div>
    </form>`;
  }
  async function recolectarYGuardar(formEl, removidos, isAdmin) {
    const id = formEl.dataset.id;
    const get = (k) => { const el = formEl.querySelector(`[data-ef="${k}"]`); return el ? el.value.trim() : undefined; };
    // cargar fila actual para fusionar media
    const { data: actual } = await client.from('solicitudes').select('fotos,videos,audio,negocio_logo,negocio_fotos').eq('id', id).single();
    const _grid = formEl.querySelector('.ed-fotos'); let fotos = _grid ? [...formEl.querySelectorAll('.ed-fotos .ed-foto')].map(e => e.dataset.url) : (actual?.fotos || []).filter(u => !removidos.includes(u));
    let videos = (actual?.videos || []).filter(u => !removidos.includes(u));
    let audio = actual?.audio || null;
    if (audio && removidos.includes(audio)) audio = null;
    const fIn = formEl.querySelector('[data-ef="addFotos"]'); const vIn = formEl.querySelector('[data-ef="addVideos"]'); const aIn = formEl.querySelector('[data-ef="addAudio"]');
    const nuevos = await subirMedios(fIn?[...fIn.files]:[], vIn?[...vIn.files]:[], aIn&&aIn.files[0]?aIn.files[0]:null);
    fotos = fotos.concat(nuevos.fotos); videos = videos.concat(nuevos.videos); if (nuevos.audio) audio = nuevos.audio;
    let negLogo = actual?.negocio_logo || null;
    const lIn = formEl.querySelector('[data-ef="negocio_logo_file"]'); if(lIn && lIn.files[0]){ const upl = await subirMedios([lIn.files[0]],[],null); if(upl.fotos[0]) negLogo = upl.fotos[0]; }
    let negFotos = (Array.isArray(actual?.negocio_fotos)?actual.negocio_fotos:[]).filter(u => !removidos.includes(u));
    const pfIn = formEl.querySelector('[data-ef="negocio_fotos_file"]'); if(pfIn && pfIn.files.length){ const upp = await subirMedios([...pfIn.files],[],null); negFotos = negFotos.concat(upp.fotos); }
    const patch = { nombre:get('nombre'), edad:+get('edad')||null, pais:get('pais'), provincia:get('provincia'), ciudad:get('ciudad'), altura:get('altura'), busto:get('busto'), cintura:get('cintura'), cola:get('cola'), genero:get('genero'), nacionalidad:get('nacionalidad'), cabello:get('cabello'), tipo_cuerpo:get('tipo_cuerpo'), telefono:get('telefono'), bio:get('bio'), idiomas:get('idiomas'), estilo:get('estilo'), nivel_educativo:get('nivel_educativo'), edu_estado:get('edu_estado'), estudio:get('estudio'), cursos:get('cursos'), hobbies:get('hobbies'), rutinas:get('rutinas'), habilidades:get('habilidades'), otros_gustos:get('otros_gustos'), comidas_gusta:get('comidas_gusta'), comidas_rechaza:get('comidas_rechaza'), negocio:get('negocio'), negocio_nombre:get('negocio_nombre'), negocio_rubro:get('negocio_rubro'), negocio_servicios:get('negocio_servicios'), negocio_promo:get('negocio_promo'), negocio_zona:get('negocio_zona'), negocio_contacto:get('negocio_contacto'), negocio_web:get('negocio_web'), negocio_logo:negLogo, negocio_fotos:negFotos, negocio_direccion:get('negocio_direccion'), negocio_mapa:get('negocio_mapa'), negocio_descuentos:get('negocio_descuentos'), negocio_prensa:get('negocio_prensa'), fotos, videos, audio };
    patch.precio_cita = +get('precio_cita')||15000;
    patch.roles = [...formEl.querySelectorAll('input[data-rol]:checked')].map(e => e.dataset.rol);
    if (isAdmin) { patch.plan = get('plan'); patch.puntos = +get('puntos')||0; }
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
      <div style="display:flex;gap:10px"><button class="btn btn-gold" id="aNew" style="padding:9px 18px">+ Nuevo perfil</button><button class="btn btn-ghost" id="aOut" style="padding:9px 18px">Cerrar sesión</button></div></div><div id="admVerif"></div><div id="admNoticias"></div><div id="admReportes"></div><div id="eaBoard"></div>`;
    document.getElementById('aOut').addEventListener('click', async () => { await client.auth.signOut(); location.reload(); });
    document.getElementById('aNew').addEventListener('click', async () => {
      const nsid = (self.crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now() + '');
      const nts = Date.now(); let nh = 0; const nstr = 'nueva|' + nts; for (let i = 0; i < nstr.length; i++) { nh = (nh * 31 + nstr.charCodeAt(i)) >>> 0; }
      const nnum = 'AE-' + nts.toString(36).slice(-4).toUpperCase() + '-' + nh.toString(36).slice(-4).toUpperCase();
      const { error } = await client.from('solicitudes').insert({ id: nsid, numero: nnum, nombre: 'Nuevo perfil', pais: 'Argentina', plan: 'estandar', puntos: 0, dias: 30, precio_cita: 30000, precio: 0, estado: 'publicado', pago: 'pagado' });
      if (error) { alert('Error al crear: ' + error.message); return; }
      filtro = 'publicado'; await render();
      alert('Perfil creado gratis y publicado (N° ' + nnum + '). Tocá «Editar» en su tarjeta para cargar fotos, ubicación, tarifa de cita y datos.');
    });
    async function renderAdmVerif() {
      const el = document.getElementById('admVerif'); if (!el) return;
      const { data } = await client.from('solicitudes').select('id,nombre,numero,verif_docs').eq('verif_estado','en_revision').order('created_at',{ascending:false});
      const pend = data || []; if (!pend.length) { el.innerHTML=''; return; }
      const cards = [];
      for (const s of pend) {
        const d = s.verif_docs || {}; const imgs = [];
        for (const k of ['dni_frente','dni_dorso','selfie']) {
          if (d[k]) { const { data:su } = await client.storage.from('verificaciones').createSignedUrl(d[k], 3600); if (su&&su.signedUrl) imgs.push(`<a href="${su.signedUrl}" target="_blank" title="${k}"><img src="${su.signedUrl}" style="width:96px;height:74px;object-fit:cover;border-radius:8px;border:1px solid var(--line)"></a>`); }
        }
        cards.push(`<div style="padding:12px 0;border-bottom:1px solid var(--line-soft)"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><strong>${esc(s.nombre)||'Perfil'} <span style="color:var(--text-mute)">${esc(s.numero||'')}</span></strong><span style="display:flex;gap:6px"><button class="btn btn-gold vf-ok" data-id="${s.id}" style="padding:7px 14px">✓ Verificar</button><button class="btn btn-ghost vf-no" data-id="${s.id}" style="padding:7px 14px">Rechazar</button></span></div><div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">${imgs.join('')||'<span style=\'color:var(--text-mute)\'>Sin documentos legibles</span>'}</div></div>`);
      }
      el.innerHTML = `<div class="form-card" style="margin-bottom:18px;border:1px solid var(--gold)"><h3 style="color:var(--gold);font-size:1.2rem;margin-bottom:6px">🪪 Verificaciones pendientes (${pend.length})</h3><p style="color:var(--text-soft);font-size:.84rem;margin-bottom:8px">Compará la selfie con la foto del DNI y con las fotos del perfil. Si coinciden, verificá.</p>${cards.join('')}</div>`;
      el.querySelectorAll('.vf-ok,.vf-no').forEach(b=>b.addEventListener('click', async ()=>{ b.disabled=true; b.textContent='…'; const nuevo=b.classList.contains('vf-no')?'rechazado':'verificado'; try{ await client.from('solicitudes').update({ verif_estado:nuevo }).eq('id', b.dataset.id); renderAdmVerif(); }catch(e){ alert('Error: '+(e.message||e)); b.disabled=false; } }));
    }
    renderAdmVerif();
    async function renderAdmReportes(){
      const el=document.getElementById('admReportes'); if(!el) return;
      const { data } = await client.from('reportes').select('*').eq('estado','pendiente').order('created_at',{ascending:false}).limit(100);
      const reps=data||[]; if(!reps.length){ el.innerHTML=''; return; }
      const cards=[];
      for(const r of reps){
        let preview='', tipoLbl='', extraBtns='';
        if(r.tipo==='post'){
          tipoLbl='Video de usuario';
          const { data:pr } = await client.from('posts').select('id,video_url,caption,user_id,estado').eq('id', r.ref_id).maybeSingle();
          if(pr){ const oculto=pr.estado!=='visible';
            preview=`<video src="${esc(pr.video_url)}#t=0.1" muted playsinline preload="metadata" style="width:120px;height:90px;object-fit:cover;border-radius:8px;border:1px solid var(--line)"></video><div style="font-size:.82rem;color:var(--text-soft);margin-top:4px">${esc(pr.caption||'')}</div>${oculto?'<div style="color:#f6a5b4;font-size:.78rem">● ya oculto</div>':''}`;
            extraBtns=`<button class="btn btn-ghost rp-hide" data-ref="${esc(r.ref_id)}" data-cur="${esc(pr.estado)}" style="padding:7px 12px">${oculto?'Mostrar':'Ocultar'}</button><button class="btn btn-ghost rp-ban" data-user="${esc(pr.user_id)}" style="padding:7px 12px">Bloquear autor</button><button class="btn btn-ghost rp-del" data-ref="${esc(r.ref_id)}" style="padding:7px 12px;color:#f66">Eliminar</button>`;
          } else { preview='<span style="color:var(--text-mute)">Contenido ya eliminado</span>'; }
        } else {
          tipoLbl='Perfil';
          const { data:so } = await client.from('solicitudes').select('id,nombre,numero,fotos,estado').eq('id', r.ref_id).maybeSingle();
          if(so){ const oculto=so.estado!=='publicado'; const ft=(Array.isArray(so.fotos)&&so.fotos[0])||'';
            preview=`${ft?`<img src="${esc(ft)}" style="width:90px;height:110px;object-fit:cover;border-radius:8px;border:1px solid var(--line)">`:''}<div style="font-size:.85rem;margin-top:4px">${esc(so.nombre||'Perfil')} <span style="color:var(--text-mute)">${esc(so.numero||'')}</span></div>${oculto?'<div style="color:#f6a5b4;font-size:.78rem">● ya oculto</div>':''}`;
            extraBtns=`<button class="btn btn-ghost rp-hideperfil" data-ref="${esc(r.ref_id)}" data-cur="${esc(so.estado)}" style="padding:7px 12px">${oculto?'Republicar':'Ocultar perfil'}</button>`;
          } else { preview='<span style="color:var(--text-mute)">Perfil no encontrado</span>'; }
        }
        cards.push(`<div style="padding:12px 0;border-bottom:1px solid var(--line-soft)"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:flex-start"><div><span style="font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-mute)">${tipoLbl}</span><div style="font-weight:700;color:#f6a5b4">${esc(r.motivo||'')}</div><div style="font-size:.74rem;color:var(--text-mute)">${new Date(r.created_at).toLocaleString('es-AR')}</div></div><div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">${extraBtns}<button class="btn btn-gold rp-ok" data-id="${esc(r.id)}" style="padding:7px 12px">Descartar</button></div></div><div style="margin-top:10px;display:flex;flex-direction:column;gap:2px">${preview}</div></div>`);
      }
      el.innerHTML=`<div class="form-card" style="margin-bottom:18px;border:1px solid #f43f5e"><h3 style="color:#f6a5b4;font-size:1.2rem;margin-bottom:6px">🚩 Reportes pendientes (${reps.length})</h3><p style="color:var(--text-soft);font-size:.84rem;margin-bottom:8px">Revisá y actuá: ocultar/eliminar el contenido o bloquear al autor. Descartá si no corresponde. Las tiendas piden actuar dentro de las 24 h.</p>${cards.join('')}</div>`;
      const done=()=>renderAdmReportes();
      el.querySelectorAll('.rp-ok').forEach(b=>b.addEventListener('click', async()=>{ b.disabled=true; try{ await client.from('reportes').update({estado:'descartado'}).eq('id',b.dataset.id); done(); }catch(e){ alert('Error: '+(e.message||e)); b.disabled=false; } }));
      el.querySelectorAll('.rp-hide').forEach(b=>b.addEventListener('click', async()=>{ b.disabled=true; try{ const nuevo=(b.dataset.cur==='visible')?'oculto':'visible'; await client.from('posts').update({estado:nuevo}).eq('id',b.dataset.ref); await client.from('reportes').update({estado:'resuelto'}).eq('tipo','post').eq('ref_id',b.dataset.ref); done(); }catch(e){ alert('Error: '+(e.message||e)); b.disabled=false; } }));
      el.querySelectorAll('.rp-del').forEach(b=>b.addEventListener('click', async()=>{ if(!confirm('¿Eliminar el video definitivamente?')) return; b.disabled=true; try{ await client.from('posts').delete().eq('id',b.dataset.ref); await client.from('reportes').update({estado:'resuelto'}).eq('tipo','post').eq('ref_id',b.dataset.ref); done(); }catch(e){ alert('Error: '+(e.message||e)); b.disabled=false; } }));
      el.querySelectorAll('.rp-ban').forEach(b=>b.addEventListener('click', async()=>{ if(!confirm('¿Ocultar TODOS los videos de este autor?')) return; b.disabled=true; try{ const uid=b.dataset.user; const {data:ps}=await client.from('posts').select('id').eq('user_id',uid); await client.from('posts').update({estado:'oculto'}).eq('user_id',uid); const ids=(ps||[]).map(x=>x.id); if(ids.length) await client.from('reportes').update({estado:'resuelto'}).eq('tipo','post').in('ref_id',ids); done(); }catch(e){ alert('Error: '+(e.message||e)); b.disabled=false; } }));
      el.querySelectorAll('.rp-hideperfil').forEach(b=>b.addEventListener('click', async()=>{ b.disabled=true; try{ const nuevo=(b.dataset.cur==='publicado')?'oculto':'publicado'; await client.from('solicitudes').update({estado:nuevo}).eq('id',b.dataset.ref); await client.from('reportes').update({estado:'resuelto'}).eq('tipo','perfil').eq('ref_id',b.dataset.ref); done(); }catch(e){ alert('Error: '+(e.message||e)); b.disabled=false; } }));
    }
    renderAdmReportes();
    async function renderFuentesNoticias(){
      const box=document.getElementById('nnFuentes'); if(!box) return;
      const { data } = await client.from('noticias_fuentes').select('*').order('categoria').order('nombre');
      const fs=data||[];
      box.innerHTML='<div style="border-top:1px solid var(--line-soft);padding-top:14px"><strong style="font-size:.92rem">Fuentes RSS ('+fs.filter(x=>x.activa).length+' activas)</strong>'
        + fs.map(function(x){ return '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--line-soft);flex-wrap:wrap"><label style="display:flex;align-items:center;gap:7px;flex:1;min-width:180px;cursor:pointer"><input type="checkbox" class="fnAct" data-id="'+x.id+'" '+(x.activa?'checked':'')+' style="width:auto;accent-color:var(--gold)"><span>'+esc(x.nombre)+' <span style="color:var(--text-mute);font-size:.76rem">· '+esc(x.categoria)+'</span></span></label>'
          + (x.ultimo_error? '<span style="color:#e08aa0;font-size:.72rem">⚠ '+esc(String(x.ultimo_error).slice(0,40))+'</span>' : '<span style="color:#7be3a0;font-size:.72rem">✓ ok</span>')
          + '<button class="btn btn-ghost fnDel" data-id="'+x.id+'" style="padding:4px 9px;font-size:.7rem">✕</button></div>'; }).join('')
        + '<div class="field-row" style="margin-top:12px"><div class="field"><label>Nombre del medio</label><input id="fnNom" placeholder="Ej: La Nación"></div><div class="field"><label>Categoría</label><select id="fnCat"><option value="argentina">Argentina</option><option value="ciudad">Mi ciudad</option><option value="mundo">Mundo</option><option value="tema">Temático</option></select></div></div>'
        + '<div class="field"><label>URL del RSS</label><input id="fnUrl" placeholder="https://medio.com/rss"></div><button class="btn btn-gold" id="fnAdd" style="padding:8px 16px">+ Agregar fuente</button></div>';
      box.querySelectorAll('.fnAct').forEach(c=>c.addEventListener('change', async ()=>{ await client.from('noticias_fuentes').update({activa:c.checked}).eq('id',c.dataset.id); }));
      box.querySelectorAll('.fnDel').forEach(b=>b.addEventListener('click', async ()=>{ if(!confirm('¿Eliminar esta fuente?'))return; await client.from('noticias_fuentes').delete().eq('id',b.dataset.id); renderFuentesNoticias(); }));
      const add=document.getElementById('fnAdd');
      if(add) add.addEventListener('click', async ()=>{ const n=document.getElementById('fnNom').value.trim(), u=document.getElementById('fnUrl').value.trim(), c=document.getElementById('fnCat').value;
        if(!n||!u){ alert('Completá nombre y URL del RSS.'); return; }
        const r=await client.from('noticias_fuentes').insert({nombre:n,url:u,categoria:c}); if(r.error){ alert('Error: '+r.error.message); return; } renderFuentesNoticias(); });
    }
    function renderAdmNoticias(){
      const el=document.getElementById('admNoticias'); if(!el) return;
      el.innerHTML=`<div class="form-card" style="margin-bottom:18px;border:1px solid var(--gold)">
        <h3 style="color:var(--gold);font-size:1.2rem;margin-bottom:4px">📰 Aura Noticias</h3>
        <p style="color:var(--text-soft);font-size:.84rem;margin-bottom:12px">Publicá tu propia nota en segundos, o traé ahora lo último de las fuentes (se hace solo cada 8 h).</p>
        <div class="field"><label>Título</label><input id="nnTit" placeholder="Título de la nota" maxlength="200"></div>
        <div class="field"><label>Copete / resumen (opcional)</label><input id="nnRes" placeholder="Una línea que enganche" maxlength="300"></div>
        <div class="field"><label>Desarrollo de la nota</label><textarea id="nnCont" rows="6" placeholder="Escribí la nota acá..."></textarea></div>
        <div class="field-row"><div class="field"><label>Foto</label><input type="file" id="nnFoto" accept="image/*"></div><div class="field"><label>Video (opcional)</label><input type="file" id="nnVideo" accept="video/*"></div></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:6px">
          <button type="button" class="btn btn-gold" id="nnPub">Publicar nota</button>
          <button type="button" class="btn btn-ghost" id="nnFetch">↻ Traer noticias ahora</button>
          <a class="btn btn-ghost" href="noticias.html" target="_blank" style="padding:9px 16px">Ver Aura Noticias</a>
          <span id="nnMsg" style="color:var(--gold);font-size:.86rem"></span>
        </div>
        <div id="nnFuentes"></div></div>`;
      const msg=(t,ok)=>{ const e=document.getElementById('nnMsg'); e.textContent=t||''; e.style.color= ok===false?'#e08aa0':'var(--gold)'; };
      const DK='aura_nota_draft';
      const guardarBorrador=()=>{ try{ localStorage.setItem(DK, JSON.stringify({ tit:(document.getElementById('nnTit')||{}).value||'', res:(document.getElementById('nnRes')||{}).value||'', cont:(document.getElementById('nnCont')||{}).value||'' })); }catch(e){} };
      try{ const d=JSON.parse(localStorage.getItem(DK)||'{}');
        if(d.tit) document.getElementById('nnTit').value=d.tit;
        if(d.res) document.getElementById('nnRes').value=d.res;
        if(d.cont) document.getElementById('nnCont').value=d.cont;
        if(d.tit||d.res||d.cont) msg('Borrador recuperado ✓');
      }catch(e){}
      ['nnTit','nnRes','nnCont'].forEach(function(id){ const e=document.getElementById(id); if(e){ e.addEventListener('input',guardarBorrador); e.addEventListener('blur',guardarBorrador); } });
      document.getElementById('nnPub').addEventListener('click', async ()=>{
        const tit=document.getElementById('nnTit').value.trim(); const res=document.getElementById('nnRes').value.trim(); const cont=document.getElementById('nnCont').value.trim();
        if(!tit){ msg('Poné un título.',false); return; }
        const b=document.getElementById('nnPub'); b.disabled=true; msg('Publicando…');
        try{
          const fIn=document.getElementById('nnFoto'), vIn=document.getElementById('nnVideo');
          const up=await subirMedios(fIn&&fIn.files[0]?[fIn.files[0]]:[], vIn&&vIn.files[0]?[vIn.files[0]]:[], null);
          const row={ tipo:'propia', titulo:tit, resumen:res||cont.slice(0,200), contenido:cont, imagen:(up.fotos&&up.fotos[0])||null, video:(up.videos&&up.videos[0])||null, fuente:'Aura Experience', categoria:'aura', publicado_at:new Date().toISOString() };
          const r=await client.from('noticias').insert(row).select('id').single(); if(r.error) throw r.error;
          try{ localStorage.removeItem(DK); }catch(_){}
          msg('✓ Publicada. Ver: /nota.html?id='+r.data.id);
          document.getElementById('nnTit').value=''; document.getElementById('nnRes').value=''; document.getElementById('nnCont').value='';
          if(fIn) fIn.value=''; if(vIn) vIn.value='';
        }catch(e){ msg('Error: '+(e.message||e), false); }
        b.disabled=false;
      });
      document.getElementById('nnFetch').addEventListener('click', async ()=>{
        const b=document.getElementById('nnFetch'); b.disabled=true; msg('Trayendo noticias…');
        try{ const r=await client.functions.invoke('traer-noticias'); const d=r.data||{};
          msg('✓ '+(d.totalNuevas||0)+' noticias nuevas'); renderFuentesNoticias();
        }catch(e){ msg('Error: '+(e.message||e), false); }
        b.disabled=false;
      });
      renderFuentesNoticias();
    }
    renderAdmNoticias();
    function renderAdmNotif(){
      const el=document.getElementById('admNotif'); if(!el) return;
      el.innerHTML=`<div class="form-card" style="margin-bottom:18px;border:1px solid var(--gold)"><h3 style="color:var(--gold);font-size:1.2rem;margin-bottom:4px">🔔 Enviar notificación push</h3><p style="color:var(--text-soft);font-size:.84rem;margin-bottom:12px">Llega al celular de quienes instalaron la app y activaron avisos.</p><div class="field"><label>Título</label><input id="ntfTitle" placeholder="Novedad en Aura ✨" maxlength="60"></div><div class="field"><label>Mensaje</label><input id="ntfBody" placeholder="Entrá a ver los nuevos perfiles de hoy" maxlength="140"></div><div class="field"><label>Link al tocar (opcional)</label><input id="ntfUrl" placeholder="/feed.html"></div><div style="display:flex;gap:10px;align-items:center;margin-top:6px;flex-wrap:wrap"><button class="btn btn-gold" id="ntfSend">Enviar a todos</button><span id="ntfMsg" style="color:var(--gold);font-size:.86rem"></span></div></div>`;
      document.getElementById('ntfSend').addEventListener('click', async ()=>{
        const t=document.getElementById('ntfTitle').value.trim(); const b=document.getElementById('ntfBody').value.trim(); const u=document.getElementById('ntfUrl').value.trim();
        const msg=document.getElementById('ntfMsg'); if(!t&&!b){ msg.textContent='Escribí un título o mensaje.'; return; }
        const btn=document.getElementById('ntfSend'); btn.disabled=true; btn.textContent='Enviando…';
        try{ const r=await client.functions.invoke('enviar-notificacion',{ body:{ title:t, body:b, url:u||'/feed.html' } }); if(r.error) throw r.error; if(r.data&&r.data.error) throw new Error(r.data.error); msg.textContent='✓ Enviadas: '+(r.data.enviados||0)+' de '+(r.data.total||0)+' suscriptas'; }
        catch(e){ msg.textContent='Error: '+(e.message||e); }
        btn.disabled=false; btn.textContent='Enviar a todos';
      });
    }
    renderAdmNotif();
    let filtro = 'pendiente';
    document.querySelectorAll('.panel-tab').forEach(t => t.addEventListener('click', () => { filtro = t.dataset.tab; render(); }));
    async function render() {
      const board = document.getElementById('eaBoard');
      document.querySelectorAll('.panel-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === filtro));
      if (filtro === 'resenas') return renderResenas(board);
      if (filtro === 'sitio') return renderSitio(board);
      if (filtro === 'movimientos') return renderMovimientos(board);
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
          <div class="rev-meta">${esc(ubic(s))||'—'} · ${s.edad||'—'} años · <strong style="color:var(--gold)">${(s.plan||'estandar')}</strong>${s.puntos?(' · '+s.puntos+' pts'):''}${s.numero?(' · '+esc(s.numero)):''} · ${fecha}</div></div>
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
        wireEdit(slot, removidos);
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
      const TA = ['hero_lead','hero_eyebrow','feat_sub','serv_sub','serv1_text','serv2_text','serv3_text','why_text','cta_text'];
      const tf = (key,label,ph) => TA.includes(key)
        ? `<div class="field"><label>${label}</label><textarea id="cfg_${key}" placeholder="${ph||''}">${v(key)}</textarea></div>`
        : `<div class="field"><label>${label}</label><input id="cfg_${key}" value="${v(key)}" placeholder="${ph||''}"></div>`;
      const imgField = (key,label,cur,ph,contain) => `<div class="field" style="margin:0"><label>${label}</label><div style="aspect-ratio:16/9;border-radius:10px;overflow:hidden;border:1px solid var(--line-soft);margin-bottom:6px;background:#1d0e28;display:grid;place-items:center"><img id="prev_${key}" src="${cur||ph}" style="${contain?'max-width:70%;max-height:70%;object-fit:contain':'width:100%;height:100%;object-fit:cover'}"></div><input type="file" data-img="${key}" accept="image/*" style="font-size:.76rem;color:var(--text-soft)"></div>`;
      const H = (t) => `<h4 style="font-family:var(--serif);font-size:1.15rem;color:var(--gold);margin:26px 0 12px;border-bottom:1px solid var(--line-soft);padding-bottom:8px">${t}</h4>`;
      board.innerHTML = `<div class="form-card" style="max-width:780px">
        <h3 style="font-size:1.5rem;margin-bottom:6px">Editor del sitio</h3>
        <p style="color:var(--text-soft);font-size:.9rem;margin-bottom:6px">Cambiá textos, imágenes, logo, contacto y redes. Al guardar, se aplica en toda la web.</p>
        ${H('Logo (ícono de la marca)')}
        <div class="sp-grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${imgField('logo','Subí tu logo (PNG/SVG)', cfg.logo, 'assets/logo.svg', true)}</div>
        ${H('Portada (Hero)')}
        ${tf('hero_titulo','Título (podés resaltar con <span class="text-gold">palabra</span>)','Experiencias donde el aura se expande')}
        ${tf('hero_lead','Bajada','Presencia real para lo que necesites...')}
        ${tf('hero_eyebrow','Texto chico sobre el título (arriba del título grande)','Plataforma inclusiva · coequipers, asistentes y compañía...')}
        ${H('Fotos del carrusel (hasta 4)')}
        <div class="sp-grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
          ${[0,1,2,3,4,5,6,7,8].map(i=>`<div class="field" style="margin:0"><div style="aspect-ratio:16/9;border-radius:10px;overflow:hidden;border:1px solid var(--line-soft);margin-bottom:6px;background:#1d0e28"><img id="cfg_carimg_${i}" src="${car[i]||defs[i%4]}" style="width:100%;height:100%;object-fit:cover"></div><input type="file" data-car="${i}" accept="image/*" style="font-size:.76rem;color:var(--text-soft)"></div>`).join('')}
        </div>
        ${H('Sección grande del inicio (arriba del catálogo)')}
        <div class="field-row"><div class="field"><label>Título grande (ej: «Modelos y Asistentes Empresariales por tiempo»)</label><input id="cfg_feat_title" value="${v('feat_title')}" placeholder="Modelos destacadas"></div></div>
        ${tf('feat_sub','Subtítulo','Una cuidada selección...')}
        ${H('Sección «Servicios»')}
        <div class="field-row"><div class="field"><label>Título</label><input id="cfg_serv_title" value="${v('serv_title')}" placeholder="Nuestros servicios"></div></div>
        ${tf('serv_sub','Subtítulo','Acompañamiento elegante...')}
        <div class="field-row">${tf('serv1_title','Servicio 1 · título','Eventos & Galas')}${tf('serv2_title','Servicio 2 · título','Viajes & Travel')}</div>
        ${tf('serv1_text','Servicio 1 · texto','')}
        ${tf('serv2_text','Servicio 2 · texto','')}
        <div class="field-row">${tf('serv3_title','Servicio 3 · título','Cenas privadas')}</div>
        ${tf('serv3_text','Servicio 3 · texto','')}
        ${H('Sección «El estándar más alto»')}
        <div class="field-row"><div class="field"><label>Título</label><input id="cfg_why_title" value="${v('why_title')}" placeholder="El estándar más alto en compañía VIP"></div></div>
        ${tf('why_text','Texto','Llevamos años construyendo...')}
        <div class="sp-grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${imgField('img_estandar','Imagen de esta sección (reemplaza el logo)', cfg.img_estandar, 'assets/logo.svg', !cfg.img_estandar)}</div>
        ${H('Sección «Nosotros»')}
        <div class="sp-grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${imgField('img_nosotros','Imagen de Nosotros', cfg.img_nosotros, 'assets/logo.svg', !cfg.img_nosotros)}</div>
        ${H('Llamado final (CTA)')}
        <div class="field"><label>Título</label><input id="cfg_cta_title" value="${v('cta_title')}" placeholder="Tu próximo plan te está esperando"></div>
        ${tf('cta_text','Texto','Contactanos de forma discreta...')}
        ${H('Contacto y redes')}
        <div class="field-row"><div class="field"><label>WhatsApp (solo números con país)</label><input id="cfg_whatsapp" value="${v('whatsapp')}" placeholder="5492214982243"></div><div class="field"><label>Teléfono (como se muestra)</label><input id="cfg_telefono" value="${v('telefono')}" placeholder="+54 9 221 498-2243"></div></div>
        <div class="field-row"><div class="field"><label>Instagram (URL)</label><input id="cfg_instagram" value="${v('instagram')}" placeholder="https://instagram.com/tu_cuenta"></div><div class="field"><label>Telegram (URL)</label><input id="cfg_telegram" value="${v('telegram')}" placeholder="https://t.me/tu_cuenta"></div></div>
        <div class="ed-actions" style="margin-top:26px"><button class="btn btn-gold" id="cfg_save" style="justify-content:center">Guardar y publicar cambios</button></div>
        <p id="cfg_msg" style="color:var(--gold);font-size:.9rem;text-align:center;margin-top:14px"></p>
      </div>`;
      board.querySelectorAll('input[data-img]').forEach(inp => inp.addEventListener('change', () => { const fl = inp.files[0]; if (fl) document.getElementById('prev_' + inp.dataset.img).src = URL.createObjectURL(fl); }));
      board.querySelectorAll('input[data-car]').forEach(inp => inp.addEventListener('change', () => { const fl = inp.files[0]; if (fl) document.getElementById('cfg_carimg_' + inp.dataset.car).src = URL.createObjectURL(fl); }));
      const textKeys = ['hero_titulo','hero_lead','hero_eyebrow','feat_title','feat_sub','serv_title','serv_sub','serv1_title','serv1_text','serv2_title','serv2_text','serv3_title','serv3_text','why_title','why_text','cta_title','cta_text','whatsapp','telefono','instagram','telegram'];
      document.getElementById('cfg_save').addEventListener('click', async () => {
        const btn = document.getElementById('cfg_save'), msg = document.getElementById('cfg_msg');
        btn.textContent = 'Guardando…'; btn.disabled = true; msg.textContent = '';
        try {
          const obj = Object.assign({}, cfg);
          for (const k of textKeys) { const el = document.getElementById('cfg_' + k); if (el) obj[k] = el.value.trim(); }
          for (const k of ['logo','img_estandar','img_nosotros']) { const inp = board.querySelector('input[data-img="' + k + '"]'); if (inp && inp.files[0]) { const u = await up('sitio', inp.files[0]); if (u) obj[k] = u; } }
          const carr = []; for (let i = 0; i < 9; i++) { const inp = board.querySelector('input[data-car="' + i + '"]'); let url = car[i] || null; if (inp && inp.files[0]) { const u = await up('sitio', inp.files[0]); if (u) url = u; } carr.push(url); }
          obj.carrusel = carr.filter(Boolean);
          await saveConfig(obj);
          msg.textContent = '✓ Guardado. Los cambios ya están publicados en la web.';
          btn.textContent = 'Guardar y publicar cambios'; btn.disabled = false;
        } catch (err) { msg.textContent = 'Error: ' + (err.message || err); btn.textContent = 'Reintentar'; btn.disabled = false; }
      });
    }
    async function renderMovimientos(board) {
      let fin = { totalPub: 0, totalPuntos: 0, pend: 0, count: 0 };
      let movs = [];
      try { fin = await getFinanzas(); movs = await getMovimientos(); }
      catch (e) { board.innerHTML = '<div class="panel-empty"><div class="pe-ic">🔒</div><h3>Solo administradores</h3></div>'; return; }
      board.innerHTML = `
      <div class="fin-grid">
        <div class="fin-card"><div class="fin-lbl">Recaudado · publicaciones</div><div class="fin-num">${fmt(fin.totalPub)}</div><div class="fin-sub">lo que pagan las modelos a Aura</div></div>
        <div class="fin-card"><div class="fin-lbl">Recaudado · puntos</div><div class="fin-num">${fmt(fin.totalPuntos)}</div><div class="fin-sub">clientes potenciando modelos</div></div>
        <div class="fin-card fin-total"><div class="fin-lbl">Total recaudado</div><div class="fin-num">${fmt(fin.totalPub + fin.totalPuntos)}</div><div class="fin-sub">${fin.pend} pago(s) de puntos pendientes</div></div>
      </div>
      <div class="form-card" style="margin:22px 0">
        <h3 style="font-size:1.3rem;margin-bottom:6px">Registrar pago de puntos de un cliente</h3>
        <p style="color:var(--text-soft);font-size:.88rem;margin-bottom:16px"><strong>$1.000 = 1 punto.</strong> Verificás el pago y los puntos se acreditan solos a la modelo por su número.</p>
        <div class="field-row"><div class="field"><label>N° de modelo</label><input id="mvNum" placeholder="AE-XXXX-XXXX"></div><div class="field"><label>Monto pagado (ARS)</label><input id="mvMonto" type="number" min="1000" step="1000" placeholder="5000"></div></div>
        <div class="field-row"><div class="field"><label>Cliente (nombre / alias)</label><input id="mvCli" placeholder="Cómo identificás al cliente"></div><div class="field"><label>Referencia de pago</label><input id="mvRef" placeholder="WhatsApp, alias, N° de operación"></div></div>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:4px"><span id="mvPts" style="color:var(--gold);font-family:var(--serif);font-size:1.2rem">0 puntos</span><span style="flex:1"></span><button class="btn btn-ghost" id="mvAddPend" style="padding:11px 20px">Guardar pendiente</button><button class="btn btn-gold" id="mvAddVer" style="padding:11px 20px">Verificar y acreditar</button></div>
        <p id="mvMsg" style="color:var(--gold);font-size:.86rem;margin-top:12px"></p>
        <div style="border-top:1px solid var(--line-soft);margin-top:18px;padding-top:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap"><button class="btn btn-ghost" disabled style="opacity:.45;cursor:not-allowed;padding:11px 20px">⚡ Cobro automático con N° de modelo</button><span style="color:var(--text-mute);font-size:.82rem">Próximamente — integración de pago directo (en desarrollo)</span></div>
      </div>
      <h3 style="font-size:1.2rem;margin:10px 0 12px">Planilla de movimientos</h3>
      <div id="mvList"></div>`;
      const calc = () => { const mo = +document.getElementById('mvMonto').value || 0; document.getElementById('mvPts').textContent = Math.floor(mo / 1000) + ' puntos'; };
      document.getElementById('mvMonto').addEventListener('input', calc);
      async function guardar(estado) {
        const num = document.getElementById('mvNum').value.trim().toUpperCase();
        const monto = +document.getElementById('mvMonto').value || 0;
        const cli = document.getElementById('mvCli').value.trim();
        const ref = document.getElementById('mvRef').value.trim();
        const msg = document.getElementById('mvMsg');
        if (!num || monto < 1000) { msg.textContent = 'Completá N° de modelo y monto (mínimo $1.000).'; return; }
        const puntos = Math.floor(monto / 1000);
        try {
          await addMovimiento({ numero_modelo: num, monto, puntos, cliente_nombre: cli, cliente_contacto: ref, estado });
          renderMovimientos(board);
        } catch (e) { msg.textContent = 'Error: ' + (e.message || e); }
      }
      document.getElementById('mvAddPend').addEventListener('click', () => guardar('pendiente'));
      document.getElementById('mvAddVer').addEventListener('click', () => guardar('verificado'));
      const list = document.getElementById('mvList');
      if (!movs.length) { list.innerHTML = '<div class="panel-empty"><div class="pe-ic">💠</div><h3>Sin movimientos todavía</h3><p>Cuando un cliente pague puntos, registralo arriba.</p></div>'; return; }
      list.innerHTML = `<div class="mv-table"><div class="mv-row mv-head"><span>Fecha</span><span>N° modelo</span><span>Cliente</span><span>Monto</span><span>Pts</span><span>Estado</span><span></span></div>` + movs.map(m => `<div class="mv-row"><span>${new Date(m.created_at).toLocaleDateString('es-AR')}</span><span style="color:var(--gold)">${esc(m.numero_modelo) || '—'}</span><span>${m.origen==='cliente'?'\ud83d\udcb3 ':''}${esc(m.cliente_nombre) || '—'}${m.cliente_contacto ? `<br><small style="color:var(--text-mute)">${esc(m.cliente_contacto)}</small>` : ''}</span><span>${fmt(m.monto)}</span><span>${m.puntos}</span><span>${m.origen==='cliente' ? (m.pagado ? '<span class="status-badge ready">pagado \u2713</span>' : '<span class="status-badge incomplete">sin pago</span>') : ''}<span class="status-badge ${m.estado === 'verificado' ? 'ready' : 'incomplete'}">${esc(m.estado)}</span></span><span style="display:flex;gap:6px;justify-content:flex-end">${m.estado !== 'verificado' ? `<button class="btn btn-gold mv-ver" data-id="${m.id}" style="padding:6px 12px;font-size:.7rem">Verificar</button>` : ''}<button class="btn btn-ghost mv-del" data-id="${m.id}" style="padding:6px 10px;font-size:.7rem">✕</button></span></div>`).join('') + `</div>`;
      list.querySelectorAll('.mv-ver').forEach(b => b.addEventListener('click', async () => { await setMovimientoEstado(b.dataset.id, 'verificado'); renderMovimientos(board); }));
      list.querySelectorAll('.mv-del').forEach(b => b.addEventListener('click', async () => { if (confirm('¿Eliminar este movimiento?')) { await delMovimiento(b.dataset.id); renderMovimientos(board); } }));
    }
    render();
  }
  async function initPanel() {
    const root = document.getElementById('panelRoot'); if (!root) return;
    let montado = null;
    const { data } = await client.auth.getSession();
    if (data.session) { montado = data.session.user.email; adminBoard(root, montado); } else adminLogin(root);
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') { setPasswordForm(root); return; }
      if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') return;
      if (session) { if (montado === session.user.email) return; montado = session.user.email; adminBoard(root, montado); }
      else { montado = null; adminLogin(root); }
    });
  }
  function setPasswordForm(root) {
    root.innerHTML = `<div class="form-card" style="max-width:420px;margin:0 auto"><img src="assets/logo.svg" class="logo-emblem" style="margin:0 auto 16px"><h3 style="font-size:1.5rem;text-align:center;margin-bottom:6px">Defin\u00ed tu contrase\u00f1a</h3><p style="color:var(--text-soft);font-size:.9rem;text-align:center;margin-bottom:18px">Eleg\u00ed una contrase\u00f1a para entrar y salir desde cualquier dispositivo.</p><div class="field"><label>Nueva contrase\u00f1a</label><input type="password" id="npass" placeholder="m\u00ednimo 6 caracteres"></div><button class="btn btn-gold" id="nsave" style="width:100%;justify-content:center">Guardar contrase\u00f1a</button><p id="nmsg" style="color:var(--gold);font-size:.88rem;text-align:center;margin-top:12px"></p></div>`;
    document.getElementById('nsave').addEventListener('click', async () => { const p = document.getElementById('npass').value; const m = document.getElementById('nmsg'); if (p.length < 6) { m.textContent = 'La contrase\u00f1a debe tener al menos 6 caracteres.'; return; } const { error } = await client.auth.updateUser({ password: p }); if (error) { m.textContent = 'Error: ' + error.message; } else { m.textContent = '\u2713 Contrase\u00f1a guardada. Ya pod\u00e9s entrar con tu email y contrase\u00f1a.'; setTimeout(() => location.reload(), 1600); } });
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
  async function renderComentariosMod(el, sid){
    let list=[];
    try{ const { data } = await client.from('comentarios').select('*').eq('solicitud_id', sid).order('created_at',{ascending:false}).limit(200); list=data||[]; }catch(e){ el.innerHTML=''; return; }
    if(!list.length){ el.innerHTML=''; return; }
    el.innerHTML = `<div class="form-card" style="margin-top:12px;border:1px solid var(--line-soft)"><h4 style="color:var(--gold);font-size:1.05rem;margin-bottom:4px">💬 Comentarios en tus publicaciones (${list.length})</h4><p style="color:var(--text-soft);font-size:.82rem;margin-bottom:10px">Ocultá o borrá lo que no quieras que se vea. Vos moderás tu espacio.</p>`+list.map(c=>`<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--line-soft)"><div style="min-width:0"><strong style="color:var(--gold);font-size:.85rem">${esc(c.autor||'Anónimo')}</strong>${c.estado==='oculto'?' <span style=\'color:var(--text-mute);font-size:.74rem\'>(oculto)</span>':''}<div style="font-size:.9rem;color:var(--text-soft);word-break:break-word">${esc(c.texto)}</div></div><div style="display:flex;gap:6px;flex-shrink:0"><button class="btn btn-ghost cm-tog" data-id="${c.id}" data-estado="${esc(c.estado)}" style="padding:5px 12px;font-size:.78rem">${c.estado==='oculto'?'Mostrar':'Ocultar'}</button><button class="btn btn-ghost cm-del" data-id="${c.id}" style="padding:5px 10px;font-size:.78rem">✕</button></div></div>`).join('')+`</div>`;
    el.querySelectorAll('.cm-tog').forEach(b=>b.addEventListener('click', async ()=>{ const nuevo=b.dataset.estado==='oculto'?'visible':'oculto'; b.disabled=true; try{ await client.from('comentarios').update({estado:nuevo}).eq('id',b.dataset.id); }catch(e){ alert('Error: '+(e.message||e)); } renderComentariosMod(el, sid); }));
    el.querySelectorAll('.cm-del').forEach(b=>b.addEventListener('click', async ()=>{ if(!confirm('¿Borrar este comentario?')) return; try{ await client.from('comentarios').delete().eq('id',b.dataset.id); }catch(e){ alert('Error: '+(e.message||e)); } renderComentariosMod(el, sid); }));
  }
  async function portalBoard(root, email) {
    const { data: filas } = await client.from('solicitudes').select('*').eq('email', email).order('created_at',{ascending:false});
    const header = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px">
      <span style="color:var(--text-soft);font-size:.88rem">Conectada como <strong style="color:var(--gold)">${esc(email)}</strong></span>
      <button class="btn btn-ghost" id="mOut" style="padding:9px 18px">Cerrar sesión</button></div>`;
    if (!filas || !filas.length) { root.innerHTML = header + `<div class="panel-empty"><div class="pe-ic">🔍</div><h3>No encontramos perfiles con este email</h3><p>Asegurate de usar el mismo email con el que publicaste, o <a href="publicar.html" style="color:var(--gold)">publicá tu perfil</a>.</p></div>`; document.getElementById('mOut').addEventListener('click',async()=>{await client.auth.signOut();location.reload();}); return; }
    root.innerHTML = header + filas.map(s=>`<div class="form-card" style="margin-bottom:20px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="font-size:1.3rem">${esc(s.nombre)}</h3><span class="status-badge ${s.estado==='publicado'?'ready':'incomplete'}">${esc(s.estado)}</span></div><div class="ed-slot" data-for="${s.id}"></div><div class="cmod-slot" data-for="${s.id}"></div></div>`).join('');
    document.getElementById('mOut').addEventListener('click',async()=>{await client.auth.signOut();location.reload();});
    for (const s of filas) {
      const slot = root.querySelector(`.ed-slot[data-for="${s.id}"]`);
      slot.innerHTML = editForm(s, false);
      const removidos = [];
      wireEdit(slot, removidos);
      const cancel = slot.querySelector('.ed-cancel'); if(cancel) cancel.style.display='none';
      slot.querySelector('.ed-form').addEventListener('submit', async (e)=>{ e.preventDefault(); const btn=e.target.querySelector('button[type="submit"]'); btn.textContent='Guardando…'; btn.disabled=true; try{ await recolectarYGuardar(e.target, removidos, false); btn.textContent='✓ Guardado'; setTimeout(()=>{btn.textContent='Guardar cambios';btn.disabled=false;},1500); }catch(err){ alert('Error: '+err.message); btn.textContent='Guardar cambios'; btn.disabled=false; } });
      const cslot=root.querySelector(`.cmod-slot[data-for="${s.id}"]`); if(cslot) renderComentariosMod(cslot, s.id);
    }
  }
  async function initPortal() {
    const root = document.getElementById('portalRoot'); if (!root) return;
    let montadoP = null;
    const { data } = await client.auth.getSession();
    if (data.session) { montadoP = data.session.user.email; portalBoard(root, montadoP); } else portalLogin(root);
    client.auth.onAuthStateChange((_e, session) => {
      if (_e === 'TOKEN_REFRESHED' || _e === 'INITIAL_SESSION' || _e === 'USER_UPDATED') return;
      if (session) { if (montadoP === session.user.email) return; montadoP = session.user.email; portalBoard(root, montadoP); }
      else { montadoP = null; }
    });
  }

  async function crearPagoPuntos(numero, monto, cliente_nombre, cliente_contacto) {
    const resp = await client.functions.invoke('crear-pago-puntos', { body: { numero_modelo: numero, monto: monto, cliente_nombre: cliente_nombre, cliente_contacto: cliente_contacto } });
    if (resp.error) throw resp.error;
    const ip = resp.data && (resp.data.init_point || resp.data.sandbox_init_point);
    if (ip) { window.location.href = ip; return 'redirect'; }
    throw new Error((resp.data && resp.data.error) || 'No se pudo iniciar el pago de puntos.');
  }
  async function upPriv(bucket, file) {
    const base=(file&&file.name)||'doc.jpg'; const ext=(base.split('.').pop()||'jpg').toLowerCase();
    const path=Date.now()+'_'+Math.random().toString(36).slice(2,8)+'.'+ext;
    const { error }=await client.storage.from(bucket).upload(path,file,{upsert:false,contentType:file.type||undefined});
    if(error){console.error('upPriv',error);return null;} return path;
  }
  async function solicitarVerificacion(id, docs) {
    const r=await client.functions.invoke('solicitar-verificacion',{ body:{ id, docs } });
    if(r.error) throw r.error; if(r.data&&r.data.error) throw new Error(r.data.error); return r.data;
  }
  function estadoVerifLbl(e){ return ({sin_verificar:'Sin verificar', en_revision:'En revisión ⏳', verificado:'Verificado ✓', rechazado:'Rechazado — volvé a subir'})[e||'sin_verificar']||'Sin verificar'; }
  window.eaSupa = { client, submitPublish, submitPublishGratis, crearPagoPuntos, getPublicados, getPerfil, getResenas, submitResena, initPanel, initPortal, ubic, fmt, getConfig, saveConfig };
})();
