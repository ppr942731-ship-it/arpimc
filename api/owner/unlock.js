const { body, calculatorCodeMatches, send, setUnlock, unlockToken } = require('../_owner');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    const input = await body(req);
    if (!calculatorCodeMatches(input.code)) return send(res, 401, { error: 'Kode tidak cocok.' });
    setUnlock(res, unlockToken());
    return send(res, 200, { ok: true });
  } catch (error) {
    return send(res, 500, { error: 'Kalkulator owner belum dikonfigurasi.' });
  }
};
