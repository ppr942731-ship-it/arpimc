const { clearSession, send } = require('../_owner');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  clearSession(res);
  return send(res, 200, { ok: true });
};
