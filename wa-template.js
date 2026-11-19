/* Locked WhatsApp share template: v3. Keep this format stable across JSON updates. */
(function(){
  const SUPPORT='saweria.co/arpimc | sociabuzz.com/arpi_mc/tribe';
  const LINKTREE='https://linktr.ee/marple.v2';
  const currentOrigin=()=>{
    const origin=typeof window!=='undefined'&&window.location&&window.location.origin;
    return origin&&origin!=='null'?String(origin).replace(/\/+$/,''):'https://arpimc.zone.id';
  };
  const slugify=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const itemSlug=(item,route)=>{
    if(item.slug)return slugify(item.slug);
    let value=route==='skin'?(item.tag||item.nama):(item.nama||`${route}-${item.id}`);
    value=String(value).replace(/^SKIN\s*/i,'').replace(/\s*\|\s*/g,'-').replace(/^CR\s*/i,'cr-');
    return slugify(value)||`${route}-${item.id}`;
  };
  const previewUrl=(item,route)=>`${currentOrigin()}/share/${route}/${encodeURIComponent(itemSlug(item,route))}`;
  const creatorFrom=item=>{
    const match=String(item.deskripsi||'').match(/credit\s*(?:by)?\s*[:\-]?\s*(.+)/i);
    return match?match[1].trim():'';
  };
  const render=(item,route)=>{
    const preview=previewUrl(item,route);
    if(route==='skin')return `*✨ NEW SKIN DROP BY ARPIMC ZONE✨*
 ✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧
👑 Credit: ${creatorFrom(item)}
 ▸ *Link hasil ArpiMC Zone* ⤵
> ${preview}
━━━━━━━━━━━━━━━
💌 *Support*: ${SUPPORT}
🔗 *Linktree*: ${LINKTREE}
━━━━━━━━━━━━━━━
\`Buka link untuk melihat preview dan tombol unduh.\``;
    if(route==='addon')return `*✨ NEW ADDON DROP BY ARPIMC ZONE✨*
 ✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧
📦 *Nama*: ${item.nama||'Minecraft Addon'}
📝 *Deskripsi*: ${item.deskripsi||'-'}
👑 *Credit*: ${creatorFrom(item)||'-'}
 ▸ *Link hasil ArpiMC Zone* ⤵
> ${preview}
━━━━━━━━━━━━━━━
💌 *Support*: ${SUPPORT}
🔗 *Linktree*: ${LINKTREE}
━━━━━━━━━━━━━━━
\`Buka link untuk melihat preview dan tombol unduh.\``;
    return `*🎮 ${route==='tools'?'TOOLS':'GAME'} BY ARPIMC ZONE*

*${item.nama||'Konten'}*
${item.deskripsi||''}

🔗 *Link hasil ArpiMC Zone*: ${preview}
━━━━━━━━━━━━━━━
🔗 *Linktree*: ${LINKTREE}
━━━━━━━━━━━━━━━
\`Buka link untuk melihat preview dan tombol unduh.\``;
  };
  window.ARPIMC_WA_TEMPLATE=Object.freeze({version:'locked-v3',render});
})();
