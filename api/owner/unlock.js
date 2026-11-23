const { body, calculatorCodeMatches, clearAttempts, failedAttempts, send, setAttemptCookie, setUnlock, unlockToken } = require('../_owner');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  try {
    const input = await body(req);
    const attempts = failedAttempts(req);
    if (attempts >= 3) return send(res, 429, { error: 'Terlalu banyak percobaan. Coba lagi setelah 10 menit.' });
    if (!calculatorCodeMatches(input.code)) {
      const next = attempts + 1;
      setAttemptCookie(res, next);
      return send(res, 401, { error: `Kode tidak cocok. Sisa percobaan: ${Math.max(0, 3 - next)}.` });
    }
    clearAttempts(res);
    setUnlock(res, unlockToken());
    return send(res, 200, { ok: true });
  } catch (error) {
    return send(res, 500, { error: 'Kalkulator owner belum dikonfigurasi.' });
  }
};
