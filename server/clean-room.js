require('dotenv').config();
const mongoose = require('mongoose');

async function cleanRoom() {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        console.log('Using MongoDB URI:', mongoUri ? mongoUri.substring(0, 30) + '...' : 'NOT SET');
        await mongoose.connect(mongoUri);

        const StudyRoom = require('./models/StudyRoom');

        const roomId = process.argv[2] || '693e885e4ef968114fd39432';
        const room = await StudyRoom.findById(roomId);

        if (room) {
            console.log('Room:', room.name);
            console.log('Max participants:', room.maxParticipants);
            console.log('Current participants:', room.participants.length);
            room.participants.forEach((p, i) => console.log(`  ${i + 1}. User ID: ${p.user?.toString()}`));

            // Clear stale participants - keep only the creator
            const creatorId = room.creator.toString();
            room.participants = room.participants.filter(p => p.user?.toString() === creatorId);
            await room.save();

            console.log('\n✅ Cleared! Remaining participants:', room.participants.length);
        } else {
            console.log('Room not found with ID:', roomId);
        }

        await mongoose.disconnect();
        console.log('Done');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

cleanRoom();
