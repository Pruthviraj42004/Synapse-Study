const User = require('../models/User');

// Migration script to add college field to existing users
const addCollegeToExistingUsers = async () => {
  try {
    console.log('Starting college field migration...');
    
    // Find users without college field
    const usersWithoutCollege = await User.find({ college: { $exists: false } });
    
    if (usersWithoutCollege.length === 0) {
      console.log('No users found without college field.');
      return;
    }
    
    console.log(`Found ${usersWithoutCollege.length} users without college field.`);
    
    // Update users with a default college (you can change this)
    const defaultCollege = 'rvce'; // R.V. College of Engineering as default
    
    const result = await User.updateMany(
      { college: { $exists: false } },
      { $set: { college: defaultCollege } }
    );
    
    console.log(`Migration completed. Updated ${result.modifiedCount} users with default college: ${defaultCollege}`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

module.exports = addCollegeToExistingUsers;