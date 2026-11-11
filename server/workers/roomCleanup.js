/**
 * Room Cleanup Worker
 * Periodically cleans up inactive rooms
 */

const cron = require('node-cron');
const roomManager = require('../services/roomManager');
const { LIVEKIT_CONFIG } = require('../config/livekit');

class RoomCleanupWorker {
    constructor() {
        this.isRunning = false;
        this.job = null;
        this.deleteJob = null;
    }

    /**
     * Start the cleanup worker
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️  Room cleanup worker is already running');
            return;
        }

        // Run every 5 minutes - clean up empty/inactive in-memory rooms
        this.job = cron.schedule('*/5 * * * *', async () => {
            console.log('🧹 Running room cleanup...');
            try {
                await roomManager.cleanupInactiveRooms();
                console.log('✅ Room cleanup completed');
            } catch (error) {
                console.error('❌ Room cleanup failed:', error);
            }
        });

        // Run every 6 hours - delete rooms inactive for more than 24 hours from database
        this.deleteJob = cron.schedule('0 */6 * * *', async () => {
            console.log('🗑️  Running old room deletion...');
            try {
                const deletedCount = await roomManager.deleteOldInactiveRooms(24); // 24 hours
                console.log(`✅ Deleted ${deletedCount} rooms inactive for 24+ hours`);
            } catch (error) {
                console.error('❌ Old room deletion failed:', error);
            }
        });

        this.isRunning = true;
        console.log('✅ Room cleanup worker started (runs every 5 minutes)');
        console.log('✅ Old room deletion worker started (runs every 6 hours, deletes 24h+ inactive rooms)');
    }

    /**
     * Stop the cleanup worker
     */
    stop() {
        if (this.job) {
            this.job.stop();
        }
        if (this.deleteJob) {
            this.deleteJob.stop();
        }
        this.isRunning = false;
        console.log('🛑 Room cleanup workers stopped');
    }

    /**
     * Run cleanup manually (for testing)
     */
    async runNow() {
        console.log('🧹 Running manual room cleanup...');
        try {
            await roomManager.cleanupInactiveRooms();
            console.log('✅ Manual cleanup completed');
        } catch (error) {
            console.error('❌ Manual cleanup failed:', error);
        }
    }

    /**
     * Run old room deletion manually (for testing)
     */
    async deleteOldRoomsNow(hoursInactive = 24) {
        console.log(`🗑️  Running manual deletion of rooms inactive for ${hoursInactive}+ hours...`);
        try {
            const deletedCount = await roomManager.deleteOldInactiveRooms(hoursInactive);
            console.log(`✅ Manual deletion completed: ${deletedCount} rooms deleted`);
            return deletedCount;
        } catch (error) {
            console.error('❌ Manual deletion failed:', error);
            return 0;
        }
    }
}

// Singleton instance
const cleanupWorker = new RoomCleanupWorker();

module.exports = cleanupWorker;
