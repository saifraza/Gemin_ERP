# AI Assistant Setup Guide

## Quick Start

The AI Assistant feature requires at least one LLM API key to be configured in Railway.

### Step 1: Get an API Key

Choose at least one provider:

1. **Google Gemini (Recommended for Indian context)**
   - Go to https://makersuite.google.com/app/apikey
   - Create a new API key
   - Free tier available

2. **Anthropic Claude**
   - Go to https://console.anthropic.com/
   - Create an API key
   - Requires payment setup

3. **OpenAI GPT-4**
   - Go to https://platform.openai.com/api-keys
   - Create an API key
   - Requires payment setup

4. **DeepSeek (Most cost-effective)**
   - Go to https://platform.deepseek.com/
   - Create an API key
   - Very affordable pricing

### Step 2: Add to Railway

1. Go to your Railway project
2. Click on the **mcp-orchestrator** service
3. Go to **Variables** tab
4. Add your API key(s):

```bash
# Add at least one of these:
GEMINI_API_KEY=your-actual-gemini-key
ANTHROPIC_API_KEY=your-actual-anthropic-key
OPENAI_API_KEY=your-actual-openai-key
DEEPSEEK_API_KEY=your-actual-deepseek-key
```

5. Railway will automatically redeploy

### Step 3: Test

1. Go to your ERP dashboard
2. Open the AI Assistant (bot icon)
3. Select a model from the dropdown
4. Type "Hello" to test

## Model Comparison

| Model | Cost | Best For | Speed |
|-------|------|----------|-------|
| Gemini | $$ | Indian context, GST/PAN | Fast |
| Claude | $$$ | Analysis, reasoning | Medium |
| GPT-4 | $$$ | General tasks, tools | Medium |
| DeepSeek | $ | Code, cost savings | Fast |

## Troubleshooting

### "No AI API keys configured" Error
- Make sure you added at least one API key to Railway
- Check that the key is valid (not the placeholder text)
- Wait for Railway to redeploy after adding keys

### "Failed to process chat request" Error
- Check Railway logs for the mcp-orchestrator service
- Verify the API key is correct
- Check if you have credits/quota with the provider

### Model Selection Not Working
- Clear your browser cache
- Refresh the page
- Check browser console for errors

## Free Options

1. **Google Gemini** - Best free option
   - 60 requests per minute free
   - Good for testing and light usage

2. **Local Development**
   - You can run without API keys locally
   - The AI features will show helpful error messages