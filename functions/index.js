const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.handleLogin = functions.https.onCall(async (data, context) => {
    const { uid } = context.auth;
    const { newSessionId } = data;

    const userRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        await userRef.set({
            sessionId: newSessionId,
            loggedIn: true
        });
        return { newSession: true };
    }

    const { sessionId, loggedIn } = userDoc.data();

    if (loggedIn && sessionId !== newSessionId) {
        return { newSession: false, message: 'You have already signed in to another browser. Would you like to sign out of the previous browser' };
    }

    await userRef.update({
        sessionId: newSessionId,
        loggedIn: true
    });

    return { newSession: true };
});

exports.handleLogout = functions.https.onCall(async (data, context) => {
    const { uid } = context.auth;
    const userRef = admin.firestore().collection('users').doc(uid);
    await userRef.update({ loggedIn: false });
    return { success: true };
});