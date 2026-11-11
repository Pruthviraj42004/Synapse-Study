/**
 * Admin Setup Script
 * Run this script once to make an existing account an admin
 * 
 * Usage: node scripts/setupAdmin.js your-email@example.com
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const setupAdmin = async () => {
    const email = process.argv[2];

    if (!email) {
        console.log('\n❌ Error: Please provide an email address');
        console.log('\nUsage: node scripts/setupAdmin.js your-email@example.com');
        console.log('\nExample: node scripts/setupAdmin.js admin@studysphere.com\n');
        process.exit(1);
    }

    try {
        // Connect to MongoDB
        console.log('\n🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(`\n❌ No user found with email: ${email}`);
            console.log('\nMake sure to register an account first, then run this script.');
            process.exit(1);
        }

        // Check if already admin
        if (user.role === 'admin') {
            console.log(`\n✅ User ${user.name} (${user.email}) is already an admin!`);
            process.exit(0);
        }

        // Update to admin
        user.role = 'admin';
        user.isVerified = true;
        await user.save();

        console.log('\n🎉 SUCCESS! Admin account created:\n');
        console.log('   Name:', user.name);
        console.log('   Email:', user.email);
        console.log('   Role:', user.role);
        console.log('   Verified:', user.isVerified);
        console.log('\nYou can now:');
        console.log('   • Verify teacher accounts');
        console.log('   • Access all admin features');
        console.log('   • Manage the platform\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('📤 Disconnected from MongoDB\n');
    }
};

setupAdmin();
