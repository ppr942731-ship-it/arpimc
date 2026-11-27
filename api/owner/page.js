const { validSession } = require('../_owner');

module.exports = async (req, res) => {
  if (req.method !== 'GET' || !validSession(req)) {
    res.statusCode = 404;
    res.setHeader('Cache-Control', 'no-store');
    return res.end('Not found');
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res.end(`<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>Panel Owner | ArpiMC Zone</title>
  <style>
    :root{color-scheme:light;background:#eef5ff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    *{box-sizing:border-box}
    body{margin:0;min-height:100vh;background:linear-gradient(135deg,#eef5ff,#dbeafe);color:#172033}
    .owner-route-shell{min-height:100vh;padding:24px 16px}
    body.owner-route-page .owner-backdrop{position:static;min-height:100vh;padding:0;background:transparent;display:block}
    body.owner-route-page .owner-card{width:min(980px,100%);max-height:none;margin:0 auto}
  </style>
</head>
<body class="owner-route-page">
  <main class="owner-route-shell" aria-label="Panel Owner ArpiMC Zone"></main>
  <script src="/owner-panel.js" defer></script>
</body>
</html>`);
};
