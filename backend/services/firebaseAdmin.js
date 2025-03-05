const admin = require('firebase-admin');
const firebaseConfig = require('../config/config.json');
  
admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
});

module.exports = admin;