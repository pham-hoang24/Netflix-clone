const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createUserDocument = functions.auth.user().onCreate((user) => {
  const {uid, email} = user;
  const userRef = admin.firestore().collection("users").doc(uid);
  return userRef.set({
    email,
    region: "US", // Default region, can be updated later
    profileType: "Adult", // Default profile type
    preferred_genres: [], // Empty array for preferred genres
  });
});
