const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');

        // Check if user exists
        const existing = await User.findOne({ email: 'test@example.com' });
        if (existing) {
            console.log('Test user already exists');
            // Reset password for testing
            existing.password = 'oldpassword';
            await existing.save();
            console.log('Reset test user password to "oldpassword"');
        } else {
            const user = new User({
                email: 'test@example.com',
                password: 'oldpassword',
            });
            await user.save();
            console.log('Created test user: test@example.com / oldpassword');
        }

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
