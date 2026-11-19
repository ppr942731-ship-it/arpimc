/* Locked WhatsApp share template: v1. Keep this format stable across JSON updates. */
(function(){
  const SITE='https://arpimc.zone.id';
  const SUPPORT='saweria.co/arpimc | sociabuzz.com/arpi_mc/tribe';
  const LINKTREE='https://linktr.ee/marple.v2';
  const previewUrl=(item,route)=>`${SITE}/share/${route}/${encodeURIComponent(String(item.id))}/index.html`;
  const creatorFrom=item=>{
    const match=String(item.deskripsi||'').match(/credit\s*(?:by)?\s*[:\-]?\s*(.+)/i);
    return match?match[1].trim():'';
  };
  const render=(item,route)=>{
    const preview=previewUrl(item,route);
    if(route==='skin')return `*✨ NEW SKIN DROP BY ARPIMC ZONE✨*
 ✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧
👑 Credit: ${creatorFrom(item)}
 ▸ Link Download ⤵
> ${preview}
━━━━━━━━━━━━━━━
💌 *Support*: ${SUPPORT}
🔗*Linktree*: ${LINKTREE}
🔎 *sumber*: ${SITE}
━━━━━━━━━━━━━━━
\`Follow gak rugi boss, tiap hari skin free kece\``;
    if(route==='addon')return `*✨ NEW ADDON DROP BY ARPIMC ZONE✨*
 ✧ ▬▭▬ ▬▭▬ ✦✧✦ ▬▭▬ ▬▭▬ ✧
📦 *Nama*: ${item.nama||'Minecraft Addon'}
📝 *Deskripsi*: ${item.deskripsi||'-'}
👑 *Credit*: ${creatorFrom(item)||'-'}
 ▸ *Link Download* ⤵
> ${preview}
━━━━━━━━━━━━━━━
💌 *Support*: ${SUPPORT}
🔗 *Linktree*: ${LINKTREE}
🔎 *Sumber*: ${SITE}
━━━━━━━━━━━━━━━
`;
    return `*🎮 ${route==='tools'?'TOOLS':'GAME'} BY ARPIMC ZONE*

*${item.nama||'Konten'}*
${item.deskripsi||''}

🔗 *Buka*: ${preview}
━━━━━━━━━━━━━━━
🔗 *Linktree*: ${LINKTREE}
🔎 *Sumber*: ${SITE}`;
  };
  window.ARPIMC_WA_TEMPLATE=Object.freeze({version:'locked-v1',render});
})();
