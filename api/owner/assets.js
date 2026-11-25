const { ALLOWED_FILES, body, readGithubFile, readGithubTextFile, send, syncFallbackData, validSession, writeGithubFile } = require('../_owner');

function validPayload(file, items) {
  if (!ALLOWED_FILES.has(file)) return false;
  if (file === 'data.json') return items && typeof items === 'object' && !Array.isArray(items);
  return Array.isArray(items);
}

module.exports = async (req, res) => {
  if (!validSession(req)) return send(res, 401, { error: 'Session owner tidak valid.' });
  try {
    if (req.method === 'GET') {
      const files = {};
      for (const file of ALLOWED_FILES) files[file] = (await readGithubFile(file)).items;
      let fallback = { available: false };
      try {
        const raw = await readGithubTextFile('fallback-data.js');
        fallback = { available: true, bytes: raw.content.length };
      } catch (error) {
        fallback = { available: false, error: error.message };
      }
      return send(res, 200, { files, fallback });
    }
    if (req.method === 'POST') {
      const input = await body(req);
      if (input.action !== 'sync-fallback') return send(res, 400, { error: 'Aksi owner tidak valid.' });
      const result = await syncFallbackData();
      return send(res, 200, { ok: true, fallback: result });
    }
    if (req.method !== 'PUT') return send(res, 405, { error: 'Method not allowed' });
    const input = await body(req);
    const file = String(input.file || '');
    if (!validPayload(file, input.items)) return send(res, 400, { error: 'File asset atau format data tidak valid.' });
    await writeGithubFile(file, input.items);
    let fallback = null;
    try {
      fallback = await syncFallbackData();
    } catch (error) {
      console.error('[owner/assets:fallback]', error);
      return send(res, 502, { error: `Asset tersimpan, tetapi fallback gagal disinkronkan. ${error.message}`, file, fallbackSynced: false });
    }
    return send(res, 200, { ok: true, file, fallback });
  } catch (error) {
    console.error('[owner/assets]', error);
    const status = /^GitHub (read|write)/.test(error.message) ? 502 : 500;
    return send(res, status, { error: `GitHub API gagal. ${error.message}` });
  }
};
