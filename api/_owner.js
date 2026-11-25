const crypto = require('node:crypto');

const ALLOWED_FILES = new Set(['skins.json', 'addons.json', 'games.json', 'data.json']);
const CATALOG_FILES = ['skins.json', 'addons.json', 'games.json', 'data.json'];
const FALLBACK_FILE = 'fallback-data.js';
const OWNER_COOKIE = 'arpimc_owner_session';
const UNLOCK_COOKIE = 'arpimc_owner_unlock';
const ATTEMPT_COOKIE = 'arpimc_owner_attempts';

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

function addCookie(res, value) {
  const existing = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', existing ? [...(Array.isArray(existing) ? existing : [existing]), value] : value);
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

function attemptToken(count) {
  const payload = Buffer.from(JSON.stringify({ type: 'attempts', count, exp: Date.now() + 10 * 60 * 1000 })).toString('base64url');
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

function failedAttempts(req) {
  let count = 0;
  validSignedPayload(parseCookies(req)[ATTEMPT_COOKIE], data => {
    if (data.type !== 'attempts' || Number(data.exp) <= Date.now()) return false;
    count = Math.max(0, Math.min(3, Number(data.count) || 0));
    return true;
  });
  return count;
}

function setSession(res, token) {
  res.setHeader('Set-Cookie', `${OWNER_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=28800`);
}

function setUnlock(res, token) {
  addCookie(res, `${UNLOCK_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=600`);
}

function setAttemptCookie(res, count) {
  addCookie(res, `${ATTEMPT_COOKIE}=${encodeURIComponent(attemptToken(count))}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=600`);
}

function clearAttempts(res) {
  addCookie(res, `${ATTEMPT_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0`);
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

async function githubError(response, action) {
  let detail = '';
  try {
    const payload = await response.json();
    detail = payload?.message ? ` — ${String(payload.message).slice(0, 180)}` : '';
  } catch {}
  return new Error(`${action}: HTTP ${response.status}${detail}`);
}

function decodeContent(data) {
  return Buffer.from(String(data.content || '').replace(/\n/g, ''), 'base64').toString('utf8');
}

async function readGithubTextFile(file) {
  const response = await fetch(`${githubUrl(file)}?ref=${encodeURIComponent(process.env.GITHUB_BRANCH || 'main')}`, { headers: githubHeaders() });
  if (!response.ok) throw await githubError(response, `GitHub read ${file} failed`);
  const data = await response.json();
  return { sha: data.sha, content: decodeContent(data) };
}

async function readGithubFile(file) {
  const result = await readGithubTextFile(file);
  try {
    return { sha: result.sha, items: JSON.parse(result.content) };
  } catch {
    throw new Error(`GitHub read ${file}: file bukan JSON valid`);
  }
}

async function writeGithubTextFile(file, content, message = `Update ${file} from ArpiMC owner panel`) {
  const current = await readGithubTextFile(file);
  const branch = process.env.GITHUB_BRANCH || 'main';
  const response = await fetch(githubUrl(file), {
    method: 'PUT',
    headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: Buffer.from(String(content)).toString('base64'), sha: current.sha, branch })
  });
  if (!response.ok) throw await githubError(response, `GitHub write ${file} failed`);
  return response.json();
}

async function writeGithubFile(file, items) {
  return writeGithubTextFile(file, `${JSON.stringify(items, null, 2)}\n`, `Update ${file} from ArpiMC owner panel`);
}

async function syncFallbackData() {
  const [skins, addons, games, siteData] = await Promise.all(CATALOG_FILES.map(readGithubFile));
  const content = `/* Local fallback: used only when a JSON endpoint is unavailable. */\nwindow.ARPIMC_FALLBACK_DATA=${JSON.stringify({ skins: skins.items, addons: addons.items, games: games.items, siteData: siteData.items }, null, 0)};\n`;
  let current = '';
  try { current = (await readGithubTextFile(FALLBACK_FILE)).content; } catch (error) {
    if (!/HTTP 404/.test(error.message)) throw error;
  }
  if (current === content) return { changed: false, file: FALLBACK_FILE };
  await writeGithubTextFile(FALLBACK_FILE, content, 'Sync fallback data from catalog assets');
  return { changed: true, file: FALLBACK_FILE };
}

module.exports = { ALLOWED_FILES, body, calculatorCodeMatches, clearAttempts, clearSession, env, failedAttempts, passwordMatches, send, sessionToken, setAttemptCookie, setSession, setUnlock, syncFallbackData, unlockToken, validSession, validUnlock, readGithubFile, readGithubTextFile, writeGithubFile };
