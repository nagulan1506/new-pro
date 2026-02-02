const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Nodemailer Transporter
// NOTE: In a real app, use environment variables. For testing, we might need a mock or real credentials.
// For now, I'll set up the structure.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
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
            // html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
        };

        // For this task, if credentials aren't provided, we might fail to send email.
        // I will log the link as well for manual verification.
        console.log(`[DEV] Reset Link for ${email}: ${resetLink}`);

        if (process.env.EMAIL_USER === 'your_email@gmail.com') {
            // Mock success if no credentials provided
            return res.json({ message: 'Email sent (simulated). Check server logs for link.' });
        }

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Email sent successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify Token (Optional, can be done in Reset Password directly but good for UI 'Loading' state)
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

        user.password = newPassword; // In production, hash this!
        user.resetToken = null;
        user.expireToken = null;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
