const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Helper to check if email is configured
const isEmailConfigured = () => {
    return process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'your_email@gmail.com';
};

// Register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key_change_me', { expiresIn: '1h' });

        res.json({ token, userId: user._id, message: 'Login successful' });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expireTime = Date.now() + 3600000; // 1 hour

        user.resetToken = token;
        user.expireToken = expireTime;
        await user.save();

        const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
        };

        console.log(`[DEV] Reset Link for ${email}: ${resetLink}`);

        if (!isEmailConfigured()) {
            return res.json({ message: 'Email sent (simulated). Check server logs for link.' });
        }

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Email sent successfully' });

    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify Token
router.get('/verify-token/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const user = await User.findOne({
            resetToken: token,
            expireToken: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        res.json({ message: 'Token valid' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await User.findOne({
            resetToken: token,
            expireToken: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.expireToken = null;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
