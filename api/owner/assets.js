const { ALLOWED_FILES, body, readGithubFile, send, validSession, writeGithubFile } = require('../_owner');

module.exports = async (req, res) => {
  if (!validSession(req)) return send(res, 401, { error: 'Session owner tidak valid.' });
  try {
    if (req.method === 'GET') {
      const files = {};
      for (const file of ALLOWED_FILES) files[file] = (await readGithubFile(file)).items;
      return send(res, 200, { files });
    }
    if (req.method !== 'PUT') return send(res, 405, { error: 'Method not allowed' });
    const input = await body(req);
    const file = String(input.file || '');
    if (!ALLOWED_FILES.has(file) || !Array.isArray(input.items)) return send(res, 400, { error: 'File asset atau format data tidak valid.' });
    await writeGithubFile(file, input.items);
    return send(res, 200, { ok: true, file });
  } catch (error) {
    console.error('[owner/assets]', error);
    return send(res, 500, { error: 'Asset gagal diproses. Periksa konfigurasi GitHub API.' });
  }
};
