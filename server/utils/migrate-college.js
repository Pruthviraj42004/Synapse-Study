const mongoose = require('mongoose');
const User = require('../models/User');
const StudyRoom = require('../models/StudyRoom');

/**
 * Migration script to add college field to existing users and study rooms
 * Run this script if you have existing data that needs to be updated
 */

const migrateCollegeField = async () => {
  try {
    console.log('Starting college field migration...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/study_study', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Update users without college field
    const usersWithoutCollege = await User.countDocuments({ college: { $exists: false } });
    console.log(`Found ${usersWithoutCollege} users without college field`);

    if (usersWithoutCollege > 0) {
      // Set a default college for existing users (you might want to handle this differently)
      await User.updateMany(
        { college: { $exists: false } },
        { $set: { college: 'rvce' } } // Default to RVCE, change as needed
      );
      console.log('Updated users with default college');
    }

    // Update study rooms without college field
    const roomsWithoutCollege = await StudyRoom.countDocuments({ college: { $exists: false } });
    console.log(`Found ${roomsWithoutCollege} study rooms without college field`);

    if (roomsWithoutCollege > 0) {
      // Set college based on creator's college
      const roomsToUpdate = await StudyRoom.find({ college: { $exists: false } }).populate('creator', 'college');
      
      for (const room of roomsToUpdate) {
        if (room.creator && room.creator.college) {
          await StudyRoom.findByIdAndUpdate(room._id, { college: room.creator.college });
        } else {
          // If creator doesn't have college, set default
          await StudyRoom.findByIdAndUpdate(room._id, { college: 'rvce' });
        }
      }
      console.log('Updated study rooms with college field');
    }

    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateCollegeField();
}

module.exports = migrateCollegeField;