// authController.js
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');  // Assuming you have a User model for your database
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Set up with your Google client ID

// Register user via Google Sign-In
const register = async (req, res) => {
    const { token } = req.body;

    try {
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, // Your Google client ID
        });

        const { email, name } = ticket.getPayload();

        // Check if user already exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if doesn't exist
            user = new User({
                email,
                name,
            });
            await user.save();
        }

        // Generate JWT token for user session
        const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.json({ authToken });
    } catch (error) {
        return res.status(400).json({ error: 'Google Sign-In failed' });
    }
};

// Login user via Google Sign-In
const login = async (req, res) => {
    const { token } = req.body;

    try {
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name } = ticket.getPayload();

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'User not registered' });
        }

        // Generate JWT token for user session
        const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.json({ authToken });
    } catch (error) {
        return res.status(400).json({ error: 'Google Sign-In failed' });
    }
};

module.exports = { register, login };
