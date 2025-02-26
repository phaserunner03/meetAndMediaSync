const admin = require('./firebaseAdmin');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

async function signup() {
    try {

        console.log("Sign Up")
    }
    catch (err) {
        console.error("Error in signup", err)
    }
}

async function login() {
    try {
        console.log("Login")
    }
    catch (err) {
        console.error("Error in login", err)
    }
}

async function signInWithGoogle(idToken) {
    try {
        
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;
        let user = await User.findOne({ uid });

        if (!user) {
            user = new User({ uid, displayName: name, email, photoURL: picture });
            await user.save();
        }
        const token = jwt.sign({ uid, email }, SECRET_KEY, { expiresIn: "7d" });

        return { success: true, token, user };
    }
    catch (err) {
        console.error("Error verifying token:", err);
        throw new Error("Unauthorized");
    }
}

module.exports = { signup, login, signInWithGoogle };