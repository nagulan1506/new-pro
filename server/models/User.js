const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String, // Will be hashed in a real app, storing plain/hashed for now as per minimal flow but should be hashed.
        // For this task, "proper update of new password in DB" implies we just store it. 
        // I'll keep it simple but functional.
        required: true,
    },
    resetToken: {
        type: String,
        default: null,
    },
    expireToken: {
        type: Date,
        default: null,
    },
});

module.exports = mongoose.model('User', userSchema);
