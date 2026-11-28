const PUBLIC_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCVYTdA1yCNd0c1_WgzNkL4p_AOTKvTPcU',
  authDomain: 'arpimc-zone.firebaseapp.com',
  databaseURL: 'https://arpimc-zone-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'arpimc-zone',
  storageBucket: 'arpimc-zone.firebasestorage.app',
  messagingSenderId: '487557380435',
  appId: '1:487557380435:web:5c6e4380b7f6650ed789a6',
  measurementId: 'G-5NH1WN0EQF'
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
  }
  const config = {
    apiKey: process.env.FIREBASE_WEB_API_KEY || PUBLIC_FIREBASE_CONFIG.apiKey,
    authDomain: process.env.FIREBASE_WEB_AUTH_DOMAIN || PUBLIC_FIREBASE_CONFIG.authDomain,
    databaseURL: process.env.FIREBASE_WEB_DATABASE_URL || PUBLIC_FIREBASE_CONFIG.databaseURL,
    projectId: process.env.FIREBASE_WEB_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || PUBLIC_FIREBASE_CONFIG.projectId,
    storageBucket: process.env.FIREBASE_WEB_STORAGE_BUCKET || PUBLIC_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: process.env.FIREBASE_WEB_MESSAGING_SENDER_ID || PUBLIC_FIREBASE_CONFIG.messagingSenderId,
    appId: process.env.FIREBASE_WEB_APP_ID || PUBLIC_FIREBASE_CONFIG.appId,
    measurementId: process.env.FIREBASE_WEB_MEASUREMENT_ID || PUBLIC_FIREBASE_CONFIG.measurementId
  };
  const configured = ['apiKey', 'authDomain', 'projectId', 'appId'].every(key => Boolean(config[key]));
  res.statusCode = 200;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify({ ok: true, enabled: configured, config: configured ? config : null }));
};
