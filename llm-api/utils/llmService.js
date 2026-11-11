const OpenAI = require('openai');
const logger = require('./logger');

class LLMService {
    constructor() {
        this.provider = process.env.LLM_PROVIDER || 'openai';
        this.initializeProvider();
    }

    initializeProvider() {
        if (this.provider === 'openai') {
            if (!process.env.OPENAI_API_KEY) {
                logger.warn('OPENAI_API_KEY not set. Falling back to Groq.');
                this.provider = 'groq';
            } else {
                this.client = new OpenAI({
                    apiKey: process.env.OPENAI_API_KEY
                });
                this.defaultModel = process.env.OPENAI_DEFAULT_MODEL || 'gpt-3.5-turbo';
                logger.info('Using OpenAI as LLM provider');
                return;
            }
        }

        if (this.provider === 'groq') {
            if (!process.env.GROQ_API_KEY) {
                logger.error('GROQ_API_KEY not set! Cannot use intelligent responses.');
                this.provider = 'mock';
                this.defaultModel = 'mock-model';
                return;
            }
            this.client = new OpenAI({
                apiKey: process.env.GROQ_API_KEY,
                baseURL: 'https://api.groq.com/openai/v1'
            });
            this.defaultModel = process.env.GROQ_DEFAULT_MODEL || 'llama-3.3-70b-versatile';
            logger.info('Using Groq as LLM provider');
        } else {
            // Mock provider for testing
            this.defaultModel = 'mock-model';
            logger.info('Using mock LLM provider');
        }
    }

    /**
     * Main streaming function - INTELLIGENT RESPONSES
     */
    async *streamChat(messages, model = null) {
        const selectedModel = model || this.defaultModel;

        try {
            if (this.provider === 'mock') {
                yield* this.mockStreamResponse(messages);
                return;
            }

            // REAL LLM STREAMING - Answers ANY question intelligently
            const stream = await this.client.chat.completions.create({
                model: selectedModel,
                messages: messages,
                stream: true,
                temperature: 0.7,
                max_tokens: 2048
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    yield content;
                }
            }
        } catch (error) {
            logger.error('LLM streaming error:', error);
            throw new Error(`LLM service error: ${error.message}`);
        }
    }

    async *mockStreamResponse(messages) {
        const lastMessage = messages[messages.length - 1];
        const userContent = lastMessage?.content || 'Hello';

        const responses = [
            `Mock response to: "${userContent}". `,
            'To use real AI responses, set OPENAI_API_KEY or GROQ_API_KEY in .env!'
        ];

        for (const part of responses) {
            await new Promise(resolve => setTimeout(resolve, 100));
            yield part;
        }
    }

    /**
     * Non-streaming responses - INTELLIGENT RESPONSES
     */
    async getCompletion(messages, model = null) {
        const selectedModel = model || this.defaultModel;

        try {
            if (this.provider === 'mock') {
                const lastMessage = messages[messages.length - 1];
                return `Mock response to: "${lastMessage?.content}". Set OPENAI_API_KEY or GROQ_API_KEY for intelligent responses!`;
            }

            // REAL LLM COMPLETION - Answers ANY question intelligently
            const response = await this.client.chat.completions.create({
                model: selectedModel,
                messages: messages,
                temperature: 0.7,
                max_tokens: 2048
            });

            return response.choices[0].message.content;
        } catch (error) {
            logger.error('LLM completion error:', error);
            throw new Error(`LLM service error: ${error.message}`);
        }
    }

    getAvailableModels() {
        const models = {
            openai: [
                'gpt-4',
                'gpt-4-turbo-preview',
                'gpt-3.5-turbo',
                'gpt-3.5-turbo-16k'
            ],
            groq: [
                'llama-3.3-70b-versatile',
                'llama-3.1-70b-versatile',
                'mixtral-8x7b-32768',
                'llama2-70b-4096',
                'gemma-7b-it'
            ],
            mock: ['mock-model']
        };

        return models[this.provider] || [];
    }
}

module.exports = new LLMService();
