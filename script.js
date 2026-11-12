// ArpiMC Zone — revisi stabil
'use strict';

let currentPage = 'home';
let skinsData = [], addonsData = [], gamesData = [], siteData = {};
const $ = (id) => document.getElementById(id);
const esc = (value='') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = (value='') => { try { const u = new URL(value, location.href); return ['http:','https:'].includes(u.protocol) ? u.href : '#'; } catch { return '#'; } };
const dataFromEmbed = (id) => { const el = $(id); if (!el) return null; try { return JSON.parse(el.textContent); } catch { return null; } };

 document.addEventListener('DOMContentLoaded', async () => {
  initRouter(); initSidebar(); initThemes(); initCosloUpload(); initLanguage();
  await loadAllData();
  initModalControls();
});

function initRouter() {
  function navigateTo(page, updateUrl=true) {
    if (!['home','skin','addon','game','info'].includes(page)) page='home';
    document.querySelectorAll('.page-section').forEach(p => p.classList.toggle('active', p.id === `page-${page}`));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.page === page));
    currentPage=page;
    if (updateUrl) history.replaceState({}, '', `/${page === 'home' ? '' : page}`);
    closeSidebar();
    window.scrollTo({top:0,behavior:'smooth'});
  }
  window.navigateTo = navigateTo;
  const path=location.pathname.replace(/^\/+|\/+$/g,'');
  const route=path.startsWith('game/') ? 'game' : (['skin','addon','game','info'].includes(path) ? path : 'home');
  navigateTo(route,false);
  document.querySelectorAll('[data-nav]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();navigateTo(a.dataset.nav);}));
  document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>navigateTo(b.dataset.page)));
  if(path.startsWith('game/')) setTimeout(()=>bukaGameBySlug(path.slice(5)),250);
}

function initSidebar() {
  $('sidebarToggle')?.addEventListener('click',()=>{ $('sidebar')?.classList.remove('hidden'); $('sidebarOverlay')?.classList.remove('hidden'); });
  $('closeSidebar')?.addEventListener('click',closeSidebar);
  $('sidebarOverlay')?.addEventListener('click',closeSidebar);
}
function closeSidebar(){ $('sidebar')?.classList.add('hidden'); $('sidebarOverlay')?.classList.add('hidden'); }

function initThemes(){
  let theme=localStorage.getItem('arpimc-theme')||'default'; setTheme(theme);
  document.querySelectorAll('.theme-choice').forEach(b=>{b.classList.toggle('active',b.dataset.theme===theme);b.addEventListener('click',()=>{setTheme(b.dataset.theme);document.querySelectorAll('.theme-choice').forEach(x=>x.classList.toggle('active',x===b));});});
}
function setTheme(theme){
  document.documentElement.setAttribute('data-theme',theme); localStorage.setItem('arpimc-theme',theme);
  $('cosloSettings')?.classList.toggle('hidden',theme!=='coslo');
  if(theme==='coslo'){const bg=localStorage.getItem('arpimc-coslo-bg'),type=localStorage.getItem('arpimc-coslo-type');if(bg)applyCosloBackground(bg,type);}
  else removeCosloBackground();
}
function initCosloUpload(){
  $('cosloUpload')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>8*1024*1024){alert('Ukuran file maksimal 8 MB.');e.target.value='';return;}
    const reader=new FileReader();reader.onload=ev=>{const type=file.type.startsWith('video')?'video':'image',url=ev.target.result;
      $('cosloPreviewWrap')?.classList.remove('hidden');$('cosloPreview').innerHTML=type==='video'?`<video src="${url}" muted loop autoplay playsinline></video>`:`<img src="${url}" alt="Pratinjau latar">`;
      try{localStorage.setItem('arpimc-coslo-bg',url);localStorage.setItem('arpimc-coslo-type',type);}catch{alert('File terlalu besar untuk disimpan di browser.');return;}if(localStorage.getItem('arpimc-theme')==='coslo')applyCosloBackground(url,type);
    };reader.readAsDataURL(file);
  });
  $('resetCoslo')?.addEventListener('click',()=>{localStorage.removeItem('arpimc-coslo-bg');localStorage.removeItem('arpimc-coslo-type');$('cosloPreviewWrap')?.classList.add('hidden');$('cosloPreview').innerHTML='';$('cosloUpload').value='';removeCosloBackground();});
}
function applyCosloBackground(url,type){const layer=$('coslo-bg-layer');if(!layer)return;layer.innerHTML=type==='video'?`<video src="${url}" muted loop autoplay playsinline></video>`:`<div style="width:100%;height:100%;background-image:url('${url}');background-position:center;background-size:cover"></div>`;document.body.classList.add('coslo-active');}
function removeCosloBackground(){if($('coslo-bg-layer'))$('coslo-bg-layer').innerHTML='';document.body.classList.remove('coslo-active');}
function initLanguage(){document.querySelectorAll('.lang-option').forEach(b=>{b.classList.toggle('active',b.dataset.lang===(localStorage.getItem('arpimc-lang')||'id'));b.addEventListener('click',()=>{localStorage.setItem('arpimc-lang',b.dataset.lang);document.querySelectorAll('.lang-option').forEach(x=>x.classList.toggle('active',x===b));alert(b.dataset.lang==='en'?'English selection saved. Some content remains in Indonesian.':'Bahasa Indonesia dipilih.');});});}

async function loadAllData(){
  try{
    const embedded=[dataFromEmbed('site-data-skins'),dataFromEmbed('site-data-addons'),dataFromEmbed('site-data-games'),dataFromEmbed('site-data-info')];
    if(embedded.every(Boolean)){[skinsData,addonsData,gamesData,siteData]=embedded;}
    else {const names=['skins.json','addons.json','games.json','data.json'];const results=await Promise.all(names.map(async n=>{const r=await fetch(n);if(!r.ok)throw new Error(`Gagal memuat ${n}`);return r.json();}));[skinsData,addonsData,gamesData,siteData]=results;}
    skinsData=skinsData.map(s=>({...s,nama:s.nama||s.tag||`Skin #${s.id}`,kredit:s.kredit||(String(s.deskripsi||'').replace(/^Credit by\s*/i,''))}));
    $('totalSkins').textContent=skinsData.length;
    renderSkins('all');renderAddons('all');renderGames('all');renderInfo();
    initFilters();checkDirectPreviewLink();
  }catch(err){console.error(err);['skinsGrid','addonsGrid','gamesGrid','infoLinks'].forEach(id=>{if($(id))$(id).innerHTML='<p class="loading-text">Data gagal dimuat. Periksa file JSON atau koneksi internet.</p>';});}
}
function initFilters(){
  [['#page-skin .filter-tab',renderSkins],['#page-addon .filter-tab',renderAddons],['#page-game .filter-tab',renderGames]].forEach(([selector,render])=>{
    document.querySelectorAll(selector).forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll(selector).forEach(x=>x.classList.toggle('active',x===btn));render(btn.dataset.filter);}));
  });
}
function imageMarkup(url,alt,kind='skin'){
  const safe=safeUrl(url);return safe==='#'?`<div class="image-fallback" aria-label="Gambar tidak tersedia">${kind==='addon'?'📦':'🎨'}</div>`:`<img src="${esc(safe)}" alt="${esc(alt)}" loading="lazy" onerror="this.outerHTML='<div class=&quot;image-fallback&quot;>🖼️</div>'">`;
}
function renderSkins(category){const grid=$('skinsGrid');const list=category==='all'?skinsData:skinsData.filter(s=>s.kategori===category);if(!list.length){grid.innerHTML='<p class="loading-text">Belum ada skin di kategori ini.</p>';return;}
  grid.innerHTML=list.map(s=>`<article class="skin-card"><div class="card-img-wrap" role="button" tabindex="0" aria-label="Preview ${esc(s.nama)}" onclick="bukaPreviewSkin(${Number(s.id)})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();bukaPreviewSkin(${Number(s.id)})}">${imageMarkup(s.gambar,s.nama)}</div><div class="card-body"><h3 class="card-name">${esc(s.nama)}</h3><p class="card-meta">${esc(s.kategori||'Skin')} ${s.kredit?'· Credit: '+esc(s.kredit):''}</p><div class="card-buttons"><button class="card-btn preview" onclick="bukaPreviewSkin(${Number(s.id)})">Preview</button><a href="${esc(safeUrl(s.link_download))}" target="_blank" rel="noopener noreferrer" class="card-btn download">Unduh</a></div></div></article>`).join('');
}
function renderAddons(category){const grid=$('addonsGrid');const list=category==='all'?addonsData:addonsData.filter(a=>a.kategori===category);if(!list.length){grid.innerHTML='<p class="loading-text">Belum ada addon di kategori ini.</p>';return;}
  grid.innerHTML=list.map(a=>`<article class="addon-card"><div class="card-img-wrap" role="button" tabindex="0" onclick="bukaPreviewAddon(${Number(a.id)})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();bukaPreviewAddon(${Number(a.id)})}">${imageMarkup(a.gambar,a.nama,'addon')}</div><div class="card-body"><h3 class="card-name">${esc(a.nama)}</h3><p class="card-meta">${esc(a.kategori||'Addon')} ${a.versi?'· MC '+esc(a.versi):''}</p><div class="card-buttons"><button class="card-btn preview" onclick="bukaPreviewAddon(${Number(a.id)})">Preview</button><a href="${esc(safeUrl(a.link_download))}" target="_blank" rel="noopener noreferrer" class="card-btn download">Unduh</a></div></div></article>`).join('');
}
function renderGames(category){const grid=$('gamesGrid');const list=category==='all'?gamesData:gamesData.filter(g=>(g.tipe||'game')===category);if(!list.length){grid.innerHTML='<p class="loading-text">Belum ada konten di kategori ini.</p>';return;}
  grid.innerHTML=list.map(g=>`<article class="game-card"><div class="card-body"><h3 class="game-name">${esc(g.nama)}</h3><p class="game-desc">${esc(g.deskripsi||'')}</p><p class="card-meta">${esc(g.tipe||'game')}</p><button class="card-btn download" onclick="bukaGame(${Number(g.id)})">Preview / Buka →</button></div></article>`).join('');
}
function makeShareUrl(type,item){const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set(`${type}-id`,item.id);return url.href;}
function showModal(id){$(id)?.classList.remove('hidden');document.body.style.overflow='hidden';}
function bukaPreviewSkin(id){const s=skinsData.find(x=>Number(x.id)===Number(id));if(!s)return;const share=makeShareUrl(s.kategori||'skin',s);$('skinModalTitle').textContent=s.nama;$('skinModalImage').src=s.gambar||'';$('skinModalImage').alt=s.nama;$('skinModalImage').onerror=()=>{$('skinModalImage').style.display='none';};$('skinModalImage').onload=()=>{$('skinModalImage').style.display='block';};$('skinModalInfo').textContent=[s.kredit?`Credit: ${s.kredit}`:'',s.tanggal_upload?`Tanggal: ${s.tanggal_upload}`:'',s.deskripsi&&!/^Credit by/i.test(s.deskripsi)?s.deskripsi:''].filter(Boolean).join(' • ')||'Informasi skin';setDownload('skinModalDownload',s.link_download);setDownload('skinModalDownloadTop',s.link_download);$('skinModalCopy').onclick=()=>copyText(share);$('skinModalShareWA').onclick=()=>shareWA(`Skin: ${s.nama}\n${s.kredit?'Credit: '+s.kredit+'\n':''}Unduh: ${s.link_download}\nArpiMC Zone`);showModal('skinModal');history.replaceState({},'',share);}
function bukaPreviewAddon(id){const a=addonsData.find(x=>Number(x.id)===Number(id));if(!a)return;const share=makeShareUrl('addon',a);$('addonModalTitle').textContent=a.nama;$('addonModalImage').src=a.gambar||'';$('addonModalImage').alt=a.nama;$('addonModalImage').onerror=()=>{$('addonModalImage').style.display='none';};$('addonModalImage').onload=()=>{$('addonModalImage').style.display='block';};$('addonModalInfo').textContent=[a.deskripsi||'',a.versi?`Versi MC: ${a.versi}`:'',a.ukuran?`Ukuran: ${a.ukuran}`:'',a.tanggal_upload?`Tanggal: ${a.tanggal_upload}`:''].filter(Boolean).join(' • ')||'Informasi addon';setDownload('addonModalDownload',a.link_download);setDownload('addonModalDownloadTop',a.link_download);$('addonModalCopy').onclick=()=>copyText(share);$('addonModalShareWA').onclick=()=>shareWA(`Addon: ${a.nama}\n${a.deskripsi||''}\nUnduh: ${a.link_download}\nArpiMC Zone`);showModal('addonModal');history.replaceState({},'',share);}
function setDownload(id,url){const el=$(id);if(!el)return;const u=safeUrl(url);el.href=u;el.style.pointerEvents=u==='#'?'none':'';el.style.opacity=u==='#'?'.5':'';}
async function copyText(value){try{await navigator.clipboard.writeText(value);alert('Link berhasil disalin.');}catch{prompt('Salin tautan ini:',value);}}
function shareWA(message){window.open('https://wa.me/?text='+encodeURIComponent(message),'_blank','noopener');}
function bukaGame(id){const g=gamesData.find(x=>Number(x.id)===Number(id));if(!g)return;$('gameModalTitle').textContent=g.nama;$('gameIframe').src=safeUrl(g.link);$('gameModalNewTab').href=safeUrl(g.link);showModal('gameModal');history.replaceState({},'',`/game/${encodeURIComponent(g.slug||g.nama.toLowerCase().replace(/[^a-z0-9]+/g,'-'))}`);}
function bukaGameBySlug(slug){const g=gamesData.find(x=>(x.slug||x.nama.toLowerCase().replace(/[^a-z0-9]+/g,'-'))===decodeURIComponent(slug));if(g)bukaGame(g.id);}
function closeModal(id){const el=$(id);if(!el||el.classList.contains('hidden'))return;el.classList.add('hidden');if(id==='gameModal')$('gameIframe').src='';if(!document.querySelector('.modal:not(.hidden)'))document.body.style.overflow='';history.replaceState({},'',`/${currentPage==='home'?'':currentPage}`);}
function tutupSkinModal(){closeModal('skinModal');}function tutupAddonModal(){closeModal('addonModal');}function tutupGameModal(){closeModal('gameModal');}
function initModalControls(){document.querySelector('#skinModal .back-btn')?.addEventListener('click',tutupSkinModal);document.querySelector('#addonModal .back-btn')?.addEventListener('click',tutupAddonModal);document.querySelector('#gameModal .back-btn')?.addEventListener('click',tutupGameModal);document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m){if(m.id==='skinModal')tutupSkinModal();if(m.id==='addonModal')tutupAddonModal();if(m.id==='gameModal')tutupGameModal();}}));document.addEventListener('keydown',e=>{if(e.key==='Escape'){tutupSkinModal();tutupAddonModal();tutupGameModal();}});}
function checkDirectPreviewLink(){const p=new URLSearchParams(location.search);for(const [key,value] of p){if(!key.endsWith('-id'))continue;const id=Number(value);if(key==='addon-id')bukaPreviewAddon(id);else if(skinsData.some(s=>Number(s.id)===id))bukaPreviewSkin(id);else if(addonsData.some(a=>Number(a.id)===id))bukaPreviewAddon(id);break;}}

function renderInfo(){
  const desc=siteData.tentang||'ArpiMC Zone, koleksi skin dan addon Minecraft Bedrock.';$('infoDesc').textContent=desc;
  const sections=[['📢 Saluran WhatsApp','Ikuti saluran untuk melihat koleksi dan pembaruan.',siteData.saluran],['📱 Media Sosial','Temukan pembaruan dan aktivitas ArpiMC.',siteData.sosmed],['🌐 Website & Layanan','Layanan dan halaman terkait.',siteData.website],['💜 Dukungan','Dukungan untuk membantu keberlangsungan konten.',siteData.dukungan]];
  $('infoLinks').innerHTML=sections.map(([title,sub,list])=>Array.isArray(list)&&list.length?`<section class="info-card"><h3>${esc(title)}</h3><p>${esc(sub)}</p><div class="info-grid">${list.map(item=>`<a class="info-grid-btn" href="${esc(safeUrl(item.link))}" target="_blank" rel="noopener noreferrer">${esc(item.nama)}</a>`).join('')}</div></section>`:'').join('')||'<p class="loading-text">Belum ada informasi.</p>';
}
