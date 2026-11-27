module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
  }
  const config = {
    apiKey: process.env.FIREBASE_WEB_API_KEY,
    authDomain: process.env.FIREBASE_WEB_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_WEB_DATABASE_URL,
    projectId: process.env.FIREBASE_WEB_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_WEB_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_WEB_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_WEB_APP_ID
  };
  const configured = ['apiKey', 'authDomain', 'projectId', 'appId'].every(key => Boolean(config[key]));
  res.statusCode = 200;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify({ ok: true, enabled: configured, config: configured ? config : null }));
};
