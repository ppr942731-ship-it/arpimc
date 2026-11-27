const { body, send, validUnlock } = require('../_owner');
const { createOwnerSession, verifyOwnerIdToken } = require('../_firebase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    if (!validUnlock(req)) return send(res, 403, { error: 'Kalkulator belum dibuka.' });
    const input = await body(req);
    const decoded = await verifyOwnerIdToken(String(input.idToken || '').trim());
    createOwnerSession(res, decoded);
    return send(res, 200, { ok: true });
  } catch (error) {
    const status = Number(error.status) || 401;
    return send(res, status, { error: status === 401 ? 'Login Firebase gagal atau token kedaluwarsa.' : error.message });
  }
};
