(() => {
  const state = { files: {}, kind: 'skins.json', modal: null };
  const style = document.createElement('style');
  style.textContent = `.owner-backdrop{position:fixed;inset:0;z-index:100;background:#07111dcc;display:grid;place-items:center;padding:18px}.owner-card{width:min(760px,100%);max-height:min(88vh,760px);overflow:auto;background:var(--surface,#fff);color:var(--text,#172033);border:1px solid var(--border,#dbeafe);border-radius:18px;padding:20px;box-shadow:0 18px 60px #0007}.owner-card h2{margin:0 0 6px;font-size:20px}.owner-card p{color:var(--muted,#64748b);font-size:12px;line-height:1.5}.owner-form{display:grid;gap:10px}.owner-form input,.owner-form select,.owner-form textarea{width:100%;border:1px solid var(--border,#dbeafe);border-radius:10px;padding:11px;background:var(--bg-alt,#fff);color:var(--text,#172033);font:inherit}.owner-form textarea{min-height:330px;font-family:ui-monospace,SFMono-Regular,monospace;font-size:11px;line-height:1.5}.owner-actions{display:flex;gap:8px;flex-wrap:wrap}.owner-actions button{border:0;border-radius:9px;padding:10px 13px;background:var(--primary,#06f);color:#fff;font-weight:800;cursor:pointer}.owner-actions .owner-secondary{background:var(--bg-alt,#fff);color:var(--text,#172033);border:1px solid var(--border,#dbeafe)}.owner-message{min-height:18px;font-size:12px;font-weight:700;color:var(--primary,#06f)}.owner-danger{color:#b91c1c}.owner-code{background:var(--bg-alt,#f0f7ff);padding:10px;border-radius:9px;font:11px ui-monospace,monospace;overflow:auto}`;
  document.head.appendChild(style);

  function close() { state.modal?.remove(); state.modal = null; }
  function shell(title, content) {
    close();
    const el = document.createElement('div');
    el.className = 'owner-backdrop';
    el.innerHTML = `<section class="owner-card" role="dialog" aria-modal="true"><div class="owner-actions" style="justify-content:flex-end"><button class="owner-secondary" data-owner-close>× Tutup</button></div><h2>${title}</h2>${content}</section>`;
    el.addEventListener('click', event => { if (event.target === el || event.target.closest('[data-owner-close]')) close(); });
    document.body.appendChild(el); state.modal = el; return el;
  }
  function message(el, text, danger = false) { const node = el.querySelector('[data-owner-message]'); node.textContent = text; node.classList.toggle('owner-danger', danger); }

  function openCalculator() {
    const el = shell('Kalkulator Owner', `<p>Masukkan kode akses untuk melanjutkan.</p><form class="owner-form" data-calculator><input name="code" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="Kode 4 digit" required><div class="owner-actions"><button type="submit">Lanjutkan</button></div><div class="owner-message" data-owner-message></div></form>`);
    el.querySelector('[name=code]').focus();
    el.querySelector('[data-calculator]').addEventListener('submit', async event => { event.preventDefault(); message(el, 'Memverifikasi...'); try { const response = await fetch('/api/owner/unlock', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({code:event.currentTarget.code.value}) }); const data = await response.json(); if (!response.ok) throw Error(data.error || 'Kode tidak cocok.'); openLogin(); } catch (error) { message(el, error.message, true); } });
  }
  function openLogin() {
    const el = shell('Login Owner ArpiMC Zone', `<p>Kredensial diverifikasi oleh server. Password tidak disimpan di browser.</p><form class="owner-form" data-login><input name="username" autocomplete="username" placeholder="Username owner" required><input type="password" name="password" autocomplete="current-password" placeholder="Sandi owner" required><div class="owner-actions"><button type="submit">Masuk</button></div><div class="owner-message" data-owner-message></div></form>`);
    el.querySelector('[data-login]').addEventListener('submit', async event => {
      event.preventDefault(); const form = event.currentTarget; message(el, 'Memverifikasi...');
      try { const response = await fetch('/api/owner/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username: form.username.value, password: form.password.value }) }); const data = await response.json(); if (!response.ok) throw Error(data.error || 'Login gagal.'); await openPanel(); } catch (error) { message(el, error.message, true); }
    });
  }
  function selectedItems() {
    if (state.kind !== 'tools.json') return state.files[state.kind] || [];
    return (state.files['games.json'] || []).filter(item => String(item.jenis || item.tipe || '').toLowerCase() === 'tools');
  }
  function loadEditor(el) { el.querySelector('[data-owner-json]').value = JSON.stringify(selectedItems(), null, 2); el.querySelector('[data-owner-kind]').textContent = state.kind === 'games.json' ? 'Game' : state.kind === 'tools.json' ? 'Tools' : state.kind.replace('.json',''); }
  async function openPanel() {
    const el = shell('Panel Owner ArpiMC Zone', `<p>Editor ini menyimpan perubahan asset melalui GitHub API server-side. Jangan memasukkan token atau password ke JSON asset.</p><div class="owner-form"><select data-owner-select><option value="skins.json">Skin</option><option value="addons.json">Addon</option><option value="games.json">Game</option><option value="tools.json">Tools</option></select><textarea data-owner-json spellcheck="false"></textarea><div class="owner-actions"><button data-owner-save>Simpan Asset</button><button class="owner-secondary" data-owner-reload>Muat Ulang</button><button class="owner-secondary" data-owner-logout>Logout</button></div><div class="owner-message" data-owner-message></div><p><b>Pengaturan password:</b> ubah <code>OWNER_PASSWORD_HASH</code> dan <code>OWNER_SESSION_SECRET</code> pada environment Vercel, lalu deploy ulang. Nilai secret tidak disimpan di repository publik.</p><p class="owner-code">File yang dapat dikelola: skins.json, addons.json, games.json, dan subset tools di games.json.</p></div>`);
    try { const response = await fetch('/api/owner/assets'); const data = await response.json(); if (!response.ok) throw Error(data.error || 'Asset gagal dimuat.'); state.files = data.files; loadEditor(el); } catch (error) { message(el, error.message, true); return; }
    el.querySelector('[data-owner-select]').addEventListener('change', event => { state.kind = event.target.value; loadEditor(el); });
    el.querySelector('[data-owner-reload]').addEventListener('click', () => loadEditor(el));
    el.querySelector('[data-owner-save]').addEventListener('click', async () => {
      let items; try { items = JSON.parse(el.querySelector('[data-owner-json]').value); if (!Array.isArray(items)) throw Error('Data harus berupa array JSON.'); } catch (error) { message(el, error.message, true); return; }
      if (state.kind === 'tools.json') state.files.games = [...(state.files.games || []).filter(item => String(item.jenis || item.tipe || '').toLowerCase() !== 'tools'), ...items.map(item => ({ ...item, jenis: 'tools' }))]; else state.files[state.kind] = items;
      message(el, 'Menyimpan ke GitHub...');
      try { const response = await fetch('/api/owner/assets', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ file: state.kind === 'tools.json' ? 'games.json' : state.kind, items: state.kind === 'tools.json' ? state.files.games : items }) }); const data = await response.json(); if (!response.ok) throw Error(data.error || 'Gagal menyimpan.'); message(el, 'Berhasil disimpan. Deploy akan memperbarui website.'); } catch (error) { message(el, error.message, true); }
    });
    el.querySelector('[data-owner-logout]').addEventListener('click', async () => { await fetch('/api/owner/logout', {method:'POST'}); close(); });
  }

  const logo = document.querySelector('.brand'); let clicks = 0; let timer;
  logo?.addEventListener('click', event => { event.preventDefault(); clicks += 1; clearTimeout(timer); if (clicks >= 3) { clicks = 0; openCalculator(); return; } timer = setTimeout(() => { clicks = 0; location.href = '/skin'; }, 550); });
})();
