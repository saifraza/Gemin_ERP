# MCP Integration Guide

## 🚀 Quick Start

### 1. Add API Keys to Railway

Add these environment variables to your `mcp-orchestrator` service in Railway:

```bash
ANTHROPIC_API_KEY=your-anthropic-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
DEEPSEEK_API_KEY=your-deepseek-api-key-here
```

Note: The actual API keys should be added directly in Railway's environment variables section, not committed to the repository.

### 2. Deploy Changes

Railway will automatically redeploy the service with the new environment variables.

### 3. Test the Integration

Run the test script:
```bash
./test-llm-integration.sh
```

### 4. Use the AI Chat

1. Go to your dashboard at https://erp-web-production.up.railway.app/dashboard
2. Scroll down to see the AI Chat component
3. Try these example queries:
   - "What is the current factory status?"
   - "Show me sugar division production data"
   - "Analyze equipment efficiency"
   - "What's the GST calculation for ₹100,000 sugar sale?"

## 🤖 Available Models

### Gemini 1.5 Pro
- **Best for**: Vision tasks, Indian business context, long documents
- **Strengths**: Understands GST, PAN, ₹ currency, Indian names
- **Use cases**: Document analysis, invoice processing, visual inspection

### Claude 3 Opus  
- **Best for**: Complex reasoning, code generation, detailed analysis
- **Strengths**: Deep understanding, safety, nuanced explanations
- **Use cases**: Factory optimization, troubleshooting, report generation

### GPT-4 Turbo
- **Best for**: General tasks, tool calling, function execution
- **Strengths**: Versatile, good at following instructions, tool integration
- **Use cases**: Data extraction, API calls, structured outputs

### DeepSeek Chat
- **Best for**: Code generation, technical tasks, cost optimization
- **Strengths**: Excellent at coding, very cost-effective (10x cheaper than Gemini!)
- **Use cases**: Code generation, debugging, technical documentation, long conversations
- **Special**: Best value for money - only $0.0001 per 1K input tokens!

### Auto Selection
- **How it works**: Automatically picks the best model based on your query
- **Examples**:
  - "Calculate GST..." → Gemini (Indian context)
  - "Analyze efficiency..." → Claude (reasoning)
  - "Process this image..." → Gemini (vision)

## 📡 API Endpoints

### Chat Endpoint
```bash
POST /api/mcp/chat
{
  "prompt": "Your question here",
  "model": "auto" | "gemini" | "claude",
  "context": {} // Optional context
}
```

### Test LLM
```bash
POST /api/mcp/test-llm
{
  "model": "gemini",
  "prompt": "What is 2+2?"
}
```

### List Models
```bash
GET /api/mcp/models
```

### Execute Tools
```bash
POST /api/mcp/tools/execute
{
  "tool": "factory_status",
  "input": {
    "division": "SUGAR",
    "timeRange": "24h"
  }
}
```

## 🛠️ Available MCP Tools

### factory_status
Get real-time factory status including production metrics, equipment status, and alerts.

**Input**:
- `factoryId` (optional): Specific factory ID
- `division` (optional): SUGAR, ETHANOL, POWER, FEED, or ALL
- `timeRange`: realtime, 1h, 24h, 7d, or 30d

### production_forecast
AI-powered production forecasting based on historical data.

**Input**:
- `division`: SUGAR, ETHANOL, POWER, or FEED
- `duration`: 24h, 7d, 30d, or 90d
- `factors` (optional): Array of factors to consider

### anomaly_detector
Detect anomalies in production, equipment, or quality metrics.

**Input**:
- `system`: System name to analyze
- `sensitivity`: low, medium, or high

## 🔧 Troubleshooting

### API Keys Not Working
1. Verify keys are added to Railway environment variables
2. Check service logs in Railway dashboard
3. Ensure service has redeployed after adding keys

### Chat Not Responding
1. Check browser console for errors
2. Verify API Gateway is running
3. Test with curl: `curl https://api-gateway-production-00e9.up.railway.app/health`

### Model Selection Issues
- If auto-selection isn't working as expected, manually specify the model
- Check the LLM router logic in `/services/mcp-orchestrator/src/llm/router.ts`

## 📊 Usage Monitoring

Monitor your API usage:
- Gemini: Check Google AI Studio dashboard
- Claude: Check Anthropic console
- Track costs per model in the response `usage` field

## 🚀 Next Steps

1. **Implement More Tools**: Add tools for inventory, maintenance, quality control
2. **Create Custom Prompts**: Tailor prompts for your specific factory operations
3. **Add Voice Interface**: Integrate Whisper AI for voice commands
4. **Build Dashboards**: Create AI-powered analytics dashboards
5. **Train Custom Models**: Fine-tune models on your factory data

## 💡 Pro Tips

1. **Use Context**: Pass relevant context to get better responses
2. **Batch Queries**: Combine related questions for efficiency  
3. **Cache Responses**: Store frequent queries to reduce API calls
4. **Monitor Costs**: Set up alerts for API usage limits
5. **Test Thoroughly**: Always test with real factory scenarios