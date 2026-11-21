const crypto = require('node:crypto');

const ALLOWED_FILES = new Set(['skins.json', 'addons.json', 'games.json']);
const OWNER_COOKIE = 'arpimc_owner_session';
const UNLOCK_COOKIE = 'arpimc_owner_unlock';

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function parseCookies(req) {
  return Object.fromEntries(String(req.headers.cookie || '').split(';').map(part => {
    const index = part.indexOf('=');
    return index < 0 ? ['', ''] : [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }).filter(([key]) => key));
}

function sign(value) {
  return crypto.createHmac('sha256', env('OWNER_SESSION_SECRET')).update(value).digest('base64url');
}

function sessionToken(username) {
  const payload = Buffer.from(JSON.stringify({ username, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function unlockToken() {
  const payload = Buffer.from(JSON.stringify({ type: 'unlock', exp: Date.now() + 10 * 60 * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function validSignedPayload(token, predicate) {
  const [payload, signature] = String(token || '').split('.');
  const expected = payload ? sign(payload) : '';
  if (!payload || !signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return predicate(data);
  } catch { return false; }
}

function validSession(req) {
  return validSignedPayload(parseCookies(req)[OWNER_COOKIE], data => data.username === env('OWNER_USERNAME') && Number(data.exp) > Date.now());
}

function validUnlock(req) {
  return validSignedPayload(parseCookies(req)[UNLOCK_COOKIE], data => data.type === 'unlock' && Number(data.exp) > Date.now());
}

function setSession(res, token) {
  res.setHeader('Set-Cookie', `${OWNER_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=28800`);
}

function setUnlock(res, token) {
  res.setHeader('Set-Cookie', `${UNLOCK_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=600`);
}

function clearSession(res) {
  res.setHeader('Set-Cookie', `${OWNER_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0`);
}

async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function passwordMatches(password) {
  const [algorithm, salt, expected] = String(env('OWNER_PASSWORD_HASH')).split('$');
  if (algorithm !== 'scrypt' || !salt || !expected) return false;
  const actual = crypto.scryptSync(String(password), salt, 32).toString('hex');
  return actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

function calculatorCodeMatches(code) {
  return String(code) === env('OWNER_CALCULATOR_CODE');
}

function githubHeaders() {
  return { Accept: 'application/vnd.github+json', Authorization: `Bearer ${env('GITHUB_TOKEN')}`, 'X-GitHub-Api-Version': '2022-11-28' };
}

function githubUrl(file) {
  const owner = env('GITHUB_OWNER');
  const repo = env('GITHUB_REPO');
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${file}`;
}

async function readGithubFile(file) {
  const response = await fetch(`${githubUrl(file)}?ref=${encodeURIComponent(process.env.GITHUB_BRANCH || 'main')}`, { headers: githubHeaders() });
  if (!response.ok) throw new Error(`GitHub read failed: ${response.status}`);
  const data = await response.json();
  return { sha: data.sha, items: JSON.parse(Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf8')) };
}

async function writeGithubFile(file, items) {
  const current = await readGithubFile(file);
  const branch = process.env.GITHUB_BRANCH || 'main';
  const content = Buffer.from(`${JSON.stringify(items, null, 2)}\n`).toString('base64');
  const response = await fetch(githubUrl(file), { method: 'PUT', headers: { ...githubHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ message: `Update ${file} from ArpiMC owner panel`, content, sha: current.sha, branch }) });
  if (!response.ok) throw new Error(`GitHub write failed: ${response.status}`);
  return response.json();
}

module.exports = { ALLOWED_FILES, body, calculatorCodeMatches, clearSession, env, passwordMatches, send, sessionToken, setSession, setUnlock, unlockToken, validSession, validUnlock, readGithubFile, writeGithubFile };
