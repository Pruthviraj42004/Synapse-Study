/**
 * Persistence Layer for Y-WebSocket Server
 * 
 * Handles snapshot storage and retrieval using Redis
 * Falls back to in-memory storage if Redis is unavailable
 */

const Redis = require('ioredis');

class RedisPersistence {
    constructor(redisClient) {
        this.redis = redisClient;
        this.prefix = 'yjs:snapshot:';
    }

    /**
     * Save document snapshot
     * @param {string} roomId - Room identifier
     * @param {string} snapshot - Base64 encoded Y.js state
     */
    async saveSnapshot(roomId, snapshot) {
        const key = this.prefix + roomId;
        await this.redis.set(key, snapshot);

        // Set metadata
        await this.redis.hset(`${key}:meta`, {
            lastSaved: Date.now(),
            size: snapshot.length
        });
    }

    /**
     * Load document snapshot
     * @param {string} roomId - Room identifier
     * @returns {string|null} - Base64 encoded snapshot or null
     */
    async loadSnapshot(roomId) {
        const key = this.prefix + roomId;
        return await this.redis.get(key);
    }

    /**
     * Delete snapshot
     * @param {string} roomId - Room identifier
     */
    async deleteSnapshot(roomId) {
        const key = this.prefix + roomId;
        await this.redis.del(key);
        await this.redis.del(`${key}:meta`);
    }

    /**
     * List all snapshots
     * @returns {Array<string>} - Array of room IDs
     */
    async listSnapshots() {
        const keys = await this.redis.keys(this.prefix + '*:meta');
        return keys.map(key => key.replace(this.prefix, '').replace(':meta', ''));
    }

    /**
     * Cleanup old snapshots
     * @param {number} maxAge - Maximum age in milliseconds
     */
    async cleanupOldSnapshots(maxAge) {
        const snapshots = await this.listSnapshots();
        const now = Date.now();
        let cleaned = 0;

        for (const roomId of snapshots) {
            const meta = await this.redis.hgetall(`${this.prefix}${roomId}:meta`);
            const lastSaved = parseInt(meta.lastSaved || 0);

            if (now - lastSaved > maxAge) {
                await this.deleteSnapshot(roomId);
                cleaned++;
            }
        }

        return cleaned;
    }

    /**
     * Close Redis connection
     */
    async close() {
        await this.redis.quit();
    }
}

class InMemoryPersistence {
    constructor() {
        this.snapshots = new Map();
        console.warn('⚠️  Using in-memory persistence - snapshots will be lost on restart');
    }

    async saveSnapshot(roomId, snapshot) {
        this.snapshots.set(roomId, {
            data: snapshot,
            lastSaved: Date.now(),
            size: snapshot.length
        });
    }

    async loadSnapshot(roomId) {
        const snapshot = this.snapshots.get(roomId);
        return snapshot ? snapshot.data : null;
    }

    async deleteSnapshot(roomId) {
        this.snapshots.delete(roomId);
    }

    async listSnapshots() {
        return Array.from(this.snapshots.keys());
    }

    async cleanupOldSnapshots(maxAge) {
        const now = Date.now();
        let cleaned = 0;

        for (const [roomId, snapshot] of this.snapshots.entries()) {
            if (now - snapshot.lastSaved > maxAge) {
                this.snapshots.delete(roomId);
                cleaned++;
            }
        }

        return cleaned;
    }

    async close() {
        // No-op for in-memory
    }
}

/**
 * Create persistence layer
 * @returns {Promise<RedisPersistence|InMemoryPersistence>}
 */
async function createPersistence() {
    const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } = process.env;

    if (REDIS_HOST) {
        try {
            const redis = new Redis({
                host: REDIS_HOST,
                port: parseInt(REDIS_PORT) || 6379,
                password: REDIS_PASSWORD || undefined,
                db: parseInt(REDIS_DB) || 0,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                maxRetriesPerRequest: 3
            });

            // Test connection
            await redis.ping();
            console.log(`✅ Connected to Redis at ${REDIS_HOST}:${REDIS_PORT}`);

            const persistence = new RedisPersistence(redis);

            // Schedule cleanup of old snapshots
            const cleanupAge = parseInt(process.env.SNAPSHOT_CLEANUP_AGE) || 86400000; // 24 hours
            setInterval(async () => {
                try {
                    const cleaned = await persistence.cleanupOldSnapshots(cleanupAge);
                    if (cleaned > 0) {
                        console.log(`🧹 Cleaned up ${cleaned} old snapshots`);
                    }
                } catch (error) {
                    console.error('Snapshot cleanup error:', error.message);
                }
            }, 3600000); // Run every hour

            return persistence;

        } catch (error) {
            console.error('❌ Redis connection failed:', error.message);
            console.log('   Falling back to in-memory persistence');
            return new InMemoryPersistence();
        }
    } else {
        return new InMemoryPersistence();
    }
}

module.exports = {
    createPersistence,
    RedisPersistence,
    InMemoryPersistence
};
