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

exports.checkEmailExists = functions.https.onCall(async (data, context) => {
  // 1. Input Validation
  const email = data.email;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a valid 'email' argument.",
    );
  }

  let userExists = false;
  let emailVerified = false;
  let disabled = false;
  let hasProfile = false;

  try {
    // 2. Use Firebase Admin SDK's getUserByEmail()
    const userRecord = await admin.auth().getUserByEmail(email);
    userExists = true;
    emailVerified = userRecord.emailVerified;
    disabled = userRecord.disabled;

    // 3. Optional: Check if user has a profile in Firestore
    const db = admin.firestore(); // Initialize firestore here
    const userProfileDoc =
    await db.collection("users").doc(userRecord.uid).get();
    hasProfile = userProfileDoc.exists;
    functions.logger.info(
        `Email check for ${email}: User exists, Profile exists: ${hasProfile}`,
    );
  } catch (error) {
    // 4. Proper error handling for different scenarios
    if (error.code === "auth/user-not-found") {
      userExists = false;
      functions.logger.info(`Email check for ${email}: User not found.`);
    } else {
      // Log other unexpected errors for debugging
      functions.logger.error(
          `Error checking email ${email}:`,
          error,
      );
      throw new functions.https.HttpsError(
          "internal",
          "An unexpected error occurred while checking email existence.",
      );
    }
  }

  // 5. Return structured output
  return {exists: userExists, emailVerified, disabled, hasProfile};
});
