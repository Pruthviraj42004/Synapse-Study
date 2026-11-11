const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const API_KEY = 'test-api-key-123';

console.log('🧪 Testing Custom LLM API Streaming...\n');

/**
 * Test the streaming chat endpoint
 */
function testStreaming() {
    const data = JSON.stringify({
        messages: [
            {
                role: 'user',
                content: 'Tell me a short story about a robot learning to paint.'
            }
        ],
        stream: true
    });

    const url = new URL(`${BASE_URL}/api/chat`);

    const options = {
        method: 'POST',
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'Content-Length': data.length
        }
    };

    console.log('📤 Sending request to:', `${BASE_URL}/api/chat`);
    console.log('📝 Prompt: Tell me a short story about a robot learning to paint.\n');
    console.log('📡 Streaming response:\n');
    console.log('─'.repeat(60));

    const req = http.request(options, (res) => {
        let fullResponse = '';

        res.on('data', (chunk) => {
            const lines = chunk.toString().split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const jsonData = JSON.parse(line.substring(6));

                        if (jsonData.chunk) {
                            process.stdout.write(jsonData.chunk);
                            fullResponse += jsonData.chunk;
                        }

                        if (jsonData.done) {
                            console.log('\n' + '─'.repeat(60));
                            console.log('\n✅ Streaming completed successfully!');
                            console.log(`📊 Total characters received: ${fullResponse.length}`);

                            if (jsonData.conversationId) {
                                console.log(`💬 Conversation ID: ${jsonData.conversationId}`);
                            }
                        }

                        if (jsonData.error) {
                            console.error('\n❌ Error:', jsonData.error);
                        }
                    } catch (e) {
                        // Ignore parse errors for non-JSON lines
                    }
                }
            }
        });

        res.on('end', () => {
            console.log('\n\n🏁 Test completed!\n');
        });
    });

    req.on('error', (error) => {
        console.error('\n❌ Request failed:', error.message);
        console.log('\n💡 Make sure the server is running: npm start\n');
    });

    req.write(data);
    req.end();
}

/**
 * Test health endpoint first
 */
function checkHealth() {
    console.log('🔍 Checking server health...\n');

    http.get(`${BASE_URL}/health`, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const health = JSON.parse(data);
                console.log('✅ Server is running');
                console.log(`⏱️  Uptime: ${Math.floor(health.uptime)} seconds\n`);

                // Proceed to streaming test
                setTimeout(testStreaming, 500);
            } catch (e) {
                console.error('❌ Invalid health check response');
            }
        });
    }).on('error', (error) => {
        console.error('❌ Server is not running!');
        console.log('💡 Start the server first: npm start\n');
    });
}

// Start the test
checkHealth();
