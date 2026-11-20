const { body, passwordMatches, send, sessionToken, setSession, env, validUnlock } = require('../_owner');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    if (!validUnlock(req)) return send(res, 403, { error: 'Kalkulator belum dibuka.' });
    const input = await body(req);
    const username = String(input.username || '');
    const password = String(input.password || '');
    if (username !== env('OWNER_USERNAME') || !passwordMatches(password)) return send(res, 401, { error: 'Username atau sandi salah.' });
    setSession(res, sessionToken(username));
    return send(res, 200, { ok: true });
  } catch (error) {
    return send(res, 500, { error: 'Login belum dikonfigurasi dengan benar.' });
  }
};
