const admin = require('firebase-admin');
const { env, sessionToken, setSession } = require('./_owner');

function firebaseAdmin() {
  if (admin.apps.length) return admin.app();
  const privateKey = String(process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw new Error('Firebase Admin belum dikonfigurasi di Vercel.');
  }
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey
    })
  });
}

function ownerIdentityMatches(decoded) {
  const allowedUid = String(process.env.FIREBASE_OWNER_UID || '').trim();
  const allowedEmail = String(process.env.FIREBASE_OWNER_EMAIL || '').trim().toLowerCase();
  const uidMatches = allowedUid && decoded.uid === allowedUid;
  const emailMatches = allowedEmail && String(decoded.email || '').toLowerCase() === allowedEmail;
  return Boolean(uidMatches || emailMatches);
}

async function verifyOwnerIdToken(token) {
  if (!token) throw new Error('Token Firebase tidak ditemukan.');
  const decoded = await firebaseAdmin().auth().verifyIdToken(token);
  if (!ownerIdentityMatches(decoded)) {
    const error = new Error('Akun Firebase ini bukan akun owner ArpiMC Zone.');
    error.status = 403;
    throw error;
  }
  return decoded;
}

function createOwnerSession(res, decoded) {
  const username = String(decoded.email || process.env.OWNER_USERNAME || 'owner');
  setSession(res, sessionToken(username));
}

module.exports = { createOwnerSession, verifyOwnerIdToken };
