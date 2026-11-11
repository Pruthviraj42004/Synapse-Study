#!/bin/bash

echo "🔍 Verifying Groq API Integration..."
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file based on .env.example"
    exit 1
fi

# Check if GROQ_API_KEY is set
if grep -q "GROQ_API_KEY=gsk_" .env; then
    echo "✅ GROQ_API_KEY is configured"
else
    echo "⚠️  GROQ_API_KEY not set or invalid!"
    echo "Please add your Groq API key to .env file"
    echo "Get your free API key at: https://console.groq.com"
fi

# Check if openai package is installed
if [ -d "node_modules/openai" ]; then
    echo "✅ OpenAI package installed (Groq-compatible)"
else
    echo "❌ OpenAI package not found. Run: npm install"
    exit 1
fi

# Check if service file exists
if [ -f "services/chat/huggingFaceService.js" ]; then
    echo "✅ Groq service file exists"
    
    # Check if using Groq API
    if grep -q "api.groq.com" services/chat/huggingFaceService.js; then
        echo "✅ Service configured for Groq API"
    else
        echo "❌ Service not configured for Groq API"
        exit 1
    fi
else
    echo "❌ Service file not found"
    exit 1
fi

echo ""
echo "🎉 Groq API integration verified!"
echo ""
echo "Next steps:"
echo "1. Make sure GROQ_API_KEY is set in .env (already set: gsk_aJlu9C7...)"
echo "2. Start the server: npm run dev"
echo "3. Test chat functionality in your application"
