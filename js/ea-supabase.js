/* ===================================================================
   ELITE ANGELS — Integración con Supabase (backend real)
   =================================================================== */
(function () {
  const SUPABASE_URL = 'https://fsjrimmurtnrorqhnbwu.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_2lWllWfVLWsPnnko4TEa4Q_2sx0kdI4';

  if (!window.supabase || !window.supabase.createClient) {
    console.warn('Supabase SDK no cargado; el sitio funciona en modo local.');
    return;
  }
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  /* ---------- Publicar: subir fotos + crear solicitud + iniciar pago en Mercado Pago ---------- */
  async function submitPublish(payload, files) {
    const urls = [];
    for (let i = 0; i < (files || []).length && i < 6; i++) {
      const f = files[i];
      const ext = (f.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await client.storage.from('fotos').upload(path, f, { upsert: false });
      if (!error) {
        urls.push(client.storage.from('fotos').getPublicUrl(path).data.publicUrl);
      }
    }
    const row = {
      nombre: payload.nombre, edad: payload.edad, ciudad: payload.ciudad, altura: payload.altura,
      telefono: payload.telefono, email: payload.email, bio: payload.bio, precio: payload.precio,
      fotos: urls, pago: 'pendiente', estado: 'pendiente'
    };
    const { data: ins, error } = await client.from('solicitudes').insert(row).select('id').single();
    if (error) throw error;

    const resp = await client.functions.invoke('crear-pago', {
      body: { nombre: payload.nombre, precio: payload.precio, solicitud_id: ins.id }
    });
    if (resp.error) throw resp.error;
    const initPoint = resp.data && (resp.data.init_point || resp.data.sandbox_init_point);
    if (initPoint) {
      window.location.href = initPoint;
      return 'redirect';
    }
    throw new Error((resp.data && resp.data.error) || 'No se pudo iniciar el pago.');
  }

  /* ---------- Panel de moderación con login ---------- */
  function checklistFor(s) {
    const fotos = Array.isArray(s.fotos) ? s.fotos : [];
    return [
      { label: 'Fotos recibidas (mín. 1)', ok: fotos.length >= 1, detail: fotos.length + ' foto(s)' },
      { label: 'Edad verificada (+18)', ok: !!(s.edad && s.edad >= 18), detail: s.edad ? s.edad + ' años' : 'sin dato' },
      { label: 'Datos de contacto completos', ok: !!(s.nombre && s.telefono && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.email || '')), detail: s.email || '—' },
      { label: 'Ciudad y tarifa definidas', ok: !!(s.ciudad && s.precio >= 50), detail: (s.ciudad || '—') + ' · ' + (s.precio || 0) + ' USD' },
      { label: 'Pago confirmado', ok: s.pago === 'pagado', detail: (s.mp_status || s.pago || '—') }
    ];
  }

  function loginView(root, msg) {
    root.innerHTML = `<div class="form-card" style="max-width:440px;margin:0 auto;text-align:center">
      <img src="assets/logo.svg" class="logo-emblem" style="margin:0 auto 18px">
      <h3 style="font-size:1.5rem;margin-bottom:8px">Acceso al panel</h3>
      <p style="color:var(--text-soft);font-size:.92rem;margin-bottom:22px">Ingresá tu email de administrador. Te enviamos un enlace de acceso seguro.</p>
      <div class="field"><input type="email" id="adminEmail" placeholder="arielgalo@gmail.com"></div>
      <button class="btn btn-gold" id="adminLogin" style="width:100%;justify-content:center">Enviar enlace de acceso</button>
      <p id="adminMsg" style="color:var(--gold);font-size:.85rem;margin-top:16px">${msg || ''}</p>
    </div>`;
    const btn = document.getElementById('adminLogin');
    btn.addEventListener('click', async () => {
      const email = document.getElementById('adminEmail').value.trim();
      if (!email) return;
      btn.textContent = 'Enviando…'; btn.disabled = true;
      const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: location.href } });
      document.getElementById('adminMsg').textContent = error
        ? 'Error: ' + error.message
        : 'Listo. Revisá tu email y abrí el enlace para entrar.';
      btn.textContent = 'Enviar enlace de acceso'; btn.disabled = false;
    });
  }

  async function renderList(root, filter) {
    const { data, error } = await client.from('solicitudes').select('*').order('created_at', { ascending: false });
    if (error) { loginView(root, 'Tu usuario no tiene permisos de administrador.'); return; }
    const counts = { pendiente: 0, publicado: 0, rechazado: 0 };
    data.forEach(s => { counts[s.estado] = (counts[s.estado] || 0) + 1; });
    document.querySelectorAll('.panel-tab').forEach(t => {
      const c = t.querySelector('.cnt'); if (c) c.textContent = counts[t.dataset.tab] || 0;
      t.classList.toggle('active', t.dataset.tab === filter);
    });
    const list = data.filter(s => s.estado === filter);
    const board = document.getElementById('eaBoard');
    if (!list.length) {
      board.innerHTML = `<div class="panel-empty"><div class="pe-ic">📭</div><h3>No hay solicitudes ${filter === 'pendiente' ? 'pendientes' : filter + 's'}</h3><p>Cuando una modelo publique y pague, aparece acá.</p></div>`;
      return;
    }
    board.innerHTML = list.map(s => {
      const checks = checklistFor(s);
      const allOk = checks.every(c => c.ok);
      const fotos = (Array.isArray(s.fotos) && s.fotos.length)
        ? s.fotos.map(f => `<a href="${f}" target="_blank" class="rev-photo"><img src="${f}" alt=""></a>`).join('')
        : `<div class="rev-nophoto">Sin fotos</div>`;
      const fecha = new Date(s.created_at).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      return `<article class="review-card">
        <div class="rev-media"><div class="rev-photos">${fotos}</div></div>
        <div class="rev-body">
          <div class="rev-head">
            <div><h3>${s.nombre || 'Sin nombre'} <span class="rev-price">${s.precio || 0} USD</span></h3>
            <div class="rev-meta">${s.ciudad || '—'} · ${s.edad || '—'} años · ${s.altura || '—'} · recibido ${fecha}</div></div>
            <span class="status-badge ${allOk ? 'ready' : 'incomplete'}">${allOk ? 'Listo para publicar' : 'Faltan datos'}</span>
          </div>
          <div class="rev-contact"><span>📞 ${s.telefono || '—'}</span><span>✉ ${s.email || '—'}</span><span>💳 Pago: ${s.pago || '—'}${s.mp_payment_id ? ' (MP ' + s.mp_payment_id + ')' : ''}</span></div>
          ${s.bio ? `<p class="rev-bio">"${s.bio}"</p>` : ''}
          <div class="checklist">${checks.map(c => `<div class="ck-item ${c.ok ? 'ok' : 'no'}"><span class="ck-box">${c.ok ? '✓' : '✕'}</span><span class="ck-label">${c.label}</span><span class="ck-detail">${c.detail}</span></div>`).join('')}</div>
          ${s.estado === 'pendiente'
            ? `<div class="rev-actions"><button class="btn btn-gold" data-ap="${s.id}" ${allOk ? '' : 'disabled'}>✓ Aprobar y publicar</button><button class="btn btn-ghost" data-rj="${s.id}">Rechazar</button></div>`
            : `<div class="rev-actions"><span class="final-state ${s.estado}">${s.estado === 'publicado' ? '✓ Publicado en el sitio' : '✕ Rechazado'}</span><button class="btn btn-ghost" data-del="${s.id}">Eliminar</button></div>`}
        </div></article>`;
    }).join('');

    board.querySelectorAll('[data-ap]').forEach(b => b.addEventListener('click', async () => {
      await client.from('solicitudes').update({ estado: 'publicado', aprobado_at: new Date().toISOString() }).eq('id', b.dataset.ap);
      renderList(root, filter);
    }));
    board.querySelectorAll('[data-rj]').forEach(b => b.addEventListener('click', async () => {
      if (confirm('¿Rechazar esta solicitud?')) { await client.from('solicitudes').update({ estado: 'rechazado' }).eq('id', b.dataset.rj); renderList(root, filter); }
    }));
    board.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
      if (confirm('¿Eliminar definitivamente?')) { await client.from('solicitudes').delete().eq('id', b.dataset.del); renderList(root, filter); }
    }));
  }

  async function panelView(root, email) {
    root.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px">
      <span style="color:var(--text-soft);font-size:.88rem">Conectado como <strong style="color:var(--gold)">${email}</strong></span>
      <button class="btn btn-ghost" id="eaLogout" style="padding:9px 18px">Cerrar sesión</button>
    </div>
    <div id="eaBoard"></div>`;
    document.getElementById('eaLogout').addEventListener('click', async () => { await client.auth.signOut(); location.reload(); });
    let filter = 'pendiente';
    document.querySelectorAll('.panel-tab').forEach(t => t.addEventListener('click', () => { filter = t.dataset.tab; renderList(root, filter); }));
    renderList(root, filter);
  }

  async function initPanel() {
    const root = document.getElementById('panelRoot');
    if (!root) return;
    const { data } = await client.auth.getSession();
    if (data.session) panelView(root, data.session.user.email);
    else loginView(root);
    client.auth.onAuthStateChange((_e, session) => {
      if (session) panelView(root, session.user.email);
    });
  }

  async function getPublicados() {
    const { data, error } = await client.from('perfiles_publicados').select('*').order('created_at', { ascending: false });
    return error ? [] : data;
  }

  window.eaSupa = { client, submitPublish, initPanel, getPublicados };
})();
