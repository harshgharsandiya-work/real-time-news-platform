const admin = require("firebase-admin");
const env = require("../config/env");

const serviceAccount = JSON.parse(env.FIREBASE_PRIVATE_KEY);

const firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();
module.exports = { firebaseAdmin, messaging };

/**
 * Verifies a Firebase ID token from the client.
 * Returns the decoded token (uid, email, role claim, etc.)
 * Throws if the token is invalid or expired.
 *
 * @param {string} idToken
 * @returns {Promise<admin.auth.DecodedIdToken>}
 */
const verifyFirebaseToken = async (idToken) => {
    return await firebaseAdmin.auth().verifyIdToken(idToken);
};

module.exports = { firebaseAdmin, messaging, verifyFirebaseToken };
