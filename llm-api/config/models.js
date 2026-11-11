// Available LLM models configuration
const models = {
    openai: [
        {
            id: 'gpt-4',
            name: 'GPT-4',
            description: 'Most capable model, best for complex tasks',
            maxTokens: 8192
        },
        {
            id: 'gpt-4-turbo-preview',
            name: 'GPT-4 Turbo',
            description: 'Enhanced GPT-4 with improved performance',
            maxTokens: 128000
        },
        {
            id: 'gpt-3.5-turbo',
            name: 'GPT-3.5 Turbo',
            description: 'Fast and efficient for most tasks',
            maxTokens: 4096
        },
        {
            id: 'gpt-3.5-turbo-16k',
            name: 'GPT-3.5 Turbo 16K',
            description: 'Extended context window version',
            maxTokens: 16384
        }
    ],
    groq: [
        {
            id: 'mixtral-8x7b-32768',
            name: 'Mixtral 8x7B',
            description: 'High-performance mixture of experts model',
            maxTokens: 32768
        },
        {
            id: 'llama2-70b-4096',
            name: 'LLaMA2 70B',
            description: 'Meta\'s powerful open-source model',
            maxTokens: 4096
        },
        {
            id: 'gemma-7b-it',
            name: 'Gemma 7B',
            description: 'Google\'s lightweight instruction-tuned model',
            maxTokens: 8192
        }
    ],
    mock: [
        {
            id: 'mock-model',
            name: 'Mock Model',
            description: 'Testing model for development',
            maxTokens: 4096
        }
    ]
};

const getModelsByProvider = (provider) => {
    return models[provider] || [];
};

const getModelInfo = (provider, modelId) => {
    const providerModels = models[provider] || [];
    return providerModels.find(m => m.id === modelId);
};

const isValidModel = (provider, modelId) => {
    return !!getModelInfo(provider, modelId);
};

module.exports = {
    models,
    getModelsByProvider,
    getModelInfo,
    isValidModel
};
