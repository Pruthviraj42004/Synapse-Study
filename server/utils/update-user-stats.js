const mongoose = require('mongoose');
const User = require('../models/User');
const StudyRoom = require('../models/StudyRoom');
require('dotenv').config();

const updateUserStats = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB Connected');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    // Update each user's stats
    let updatedCount = 0;
    for (const user of users) {
      // Count study rooms created by the user
      const createdRoomsCount = user.createdRooms ? user.createdRooms.length : 0;
      
      // Count joined study rooms
      const joinedRoomsCount = user.joinedRooms ? user.joinedRooms.length : 0;
      
      // Total study rooms (created + joined)
      const totalStudyRooms = createdRoomsCount + joinedRoomsCount;
      
      // For demo purposes, set some reasonable defaults for other stats
      const programmingSessions = Math.floor(Math.random() * 10) + totalStudyRooms;
      const codeProblems = Math.floor(Math.random() * 20) + programmingSessions;
      const totalStudyHours = Math.floor(Math.random() * 50) + totalStudyRooms * 2;
      
      // Update user stats
      user.stats = {
        studyRooms: totalStudyRooms,
        programmingSessions: programmingSessions,
        codeProblems: codeProblems,
        totalStudyHours: totalStudyHours
      };
      
      await user.save();
      updatedCount++;
      console.log(`Updated stats for user: ${user.name}`);
    }
    
    console.log(`Successfully updated stats for ${updatedCount} users`);

  } catch (error) {
    console.error('Error updating user stats:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB Connection Closed');
  }
};

// Run the function
updateUserStats();