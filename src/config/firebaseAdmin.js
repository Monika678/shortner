// config/firebaseAdmin.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables from .env file

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Ensure private key is formatted correctly
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Check if necessary environment variables are available
if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
    console.error('Missing Firebase credentials in environment variables.');
    process.exit(1); // Exit if Firebase credentials are missing
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export default admin;
