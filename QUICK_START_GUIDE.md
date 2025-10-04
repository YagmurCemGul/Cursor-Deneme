# Quick Start Guide - AI Service Features

## 🚀 Getting Started

### 1. Choose Your AI Provider

You now have 5 AI providers to choose from:

#### OpenAI (ChatGPT)
- **Best for**: General use, high quality
- **Cost**: Moderate ($$)
- **Setup**: Get API key from https://platform.openai.com/api-keys

#### Google Gemini
- **Best for**: Budget-conscious users
- **Cost**: Low ($)
- **Setup**: Get API key from https://makersuite.google.com/app/apikey

#### Anthropic Claude
- **Best for**: Long documents, complex tasks
- **Cost**: High ($$$)
- **Setup**: Get API key from https://console.anthropic.com/settings/keys

#### Azure OpenAI ⭐ NEW
- **Best for**: Enterprise users, compliance requirements
- **Cost**: Moderate ($$)
- **Setup**: 
  1. Create Azure OpenAI resource
  2. Get API key, endpoint, and deployment name
  3. Configure in extension settings

#### Ollama (Local AI) ⭐ NEW
- **Best for**: Privacy, offline use, zero cost
- **Cost**: FREE
- **Setup**:
  1. Install Ollama from https://ollama.ai
  2. Run: `ollama run llama2` (or your preferred model)
  3. Extension connects to http://localhost:11434

## 📊 Usage Statistics

Track your API usage automatically:

### View Statistics
1. Open extension
2. Go to "Usage Statistics" tab
3. See:
   - Total API calls
   - Tokens used
   - Total cost
   - Success rate
   - Per-provider breakdown

### Export Data
- Click "Export" button to download JSON
- Use for external analysis or reporting

## 💰 Cost Calculator

### Automatic Cost Tracking
Every API call automatically:
- Counts tokens used
- Calculates cost
- Stores in history

### Compare Costs
Use A/B Testing to compare costs across providers for same task.

## 🔄 Batch Processing

Process multiple CVs at once:

### How to Use
1. Select multiple CV profiles
2. Choose operation (optimize CV or generate cover letter)
3. Set job description
4. Click "Start Batch Processing"
5. Monitor progress in real-time

### Configuration Options
- **Parallel Limit**: How many requests at once (default: 3)
- **Delay**: Time between batches (default: 1000ms)
- **Continue on Error**: Keep going if one fails

## 🎯 A/B Testing

Compare different AI providers:

### Steps
1. Click "A/B Test" in extension
2. Select 2-3 providers to compare
3. Enter CV data and job description
4. Click "Run Test"
5. Review results side-by-side
6. Rate each result (1-5 stars)
7. Select the best one

### Comparison Metrics
- Output quality
- Token usage
- Cost
- Speed (duration)
- Your ratings

## ✍️ Custom Prompts

Create your own AI prompts:

### Create Prompt
1. Go to "Custom Prompts" tab
2. Click "New Prompt"
3. Fill in:
   - Name
   - Category (CV optimization, cover letter, general)
   - System prompt
   - User prompt template
   - Variables (use {{variableName}} syntax)
4. Save

### Use Custom Prompt
1. Select operation (optimize CV, generate cover letter)
2. Choose "Use Custom Prompt"
3. Select your prompt
4. System fills in variables automatically

### Default Templates
5 templates included:
- Standard CV Optimization
- Senior Position CV Optimization
- Technical Role CV Optimization
- Standard Cover Letter
- Career Change Cover Letter

## 🏠 Ollama Setup (Local AI)

### Installation
```bash
# macOS / Linux
curl https://ollama.ai/install.sh | sh

# Windows
Download from https://ollama.ai/download
```

### Running a Model
```bash
# Llama 2 (7B)
ollama run llama2

# Llama 3 (8B)
ollama run llama3

# Mistral (7B)
ollama run mistral

# Code Llama (for technical CVs)
ollama run codellama
```

### Configure Extension
1. Open AI Settings
2. Select "Ollama (Local AI)"
3. Verify endpoint: `http://localhost:11434`
4. Select model you're running
5. Save

### Benefits
- ✅ 100% private - data never leaves your computer
- ✅ Free - no API costs
- ✅ Offline - works without internet
- ✅ Fast - no network latency

## 🔐 Azure OpenAI Setup

### Prerequisites
1. Azure subscription
2. Azure OpenAI resource created
3. Model deployed (GPT-4, GPT-4o, etc.)

### Configuration
1. Open AI Settings
2. Select "Azure OpenAI Service"
3. Enter:
   - **Endpoint**: `https://your-resource-name.openai.azure.com`
   - **Deployment Name**: Your deployment name (e.g., "gpt-4")
   - **API Key**: From Azure portal
4. Select model
5. Test connection
6. Save

### Advantages
- Enterprise security
- Compliance (GDPR, HIPAA, etc.)
- Data residency control
- SLA guarantees
- Integration with Azure services

## 📈 Best Practices

### Cost Optimization
1. Use Ollama for testing/drafts (free)
2. Use GPT-4o-mini for final versions (cheap)
3. Save expensive models (GPT-4, Claude Opus) for important applications
4. Monitor usage statistics regularly
5. Set up batch processing to reduce per-request overhead

### Quality Optimization
1. Run A/B tests to find best provider for your field
2. Create custom prompts for your industry
3. Use appropriate model:
   - Technical roles: Claude or GPT-4
   - General: GPT-4o-mini or Gemini
   - Senior positions: GPT-4 or Claude Opus
4. Iterate: Generate, review, regenerate

### Privacy Best Practices
1. Use Ollama for sensitive information
2. Use Azure OpenAI for enterprise data
3. Never include SSN, passwords, or personal IDs in CV
4. Review generated content before sending

## 🆘 Troubleshooting

### Ollama Not Connecting
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve

# Pull a model if needed
ollama pull llama2
```

### Azure OpenAI Errors
- Check endpoint format: Must include `https://`
- Verify deployment name matches Azure portal
- Ensure API key is correct
- Check Azure subscription status

### High Costs
1. Check usage statistics
2. Switch to cheaper model (GPT-4o-mini)
3. Use Ollama for testing
4. Reduce batch parallel limit

### Poor Quality Results
1. Try A/B testing with different providers
2. Create custom prompt with more specific instructions
3. Use higher-tier model (GPT-4, Claude Sonnet)
4. Provide more detailed job description

## 📚 Resources

- **Documentation**: See `AI_SERVICE_FEATURES_IMPLEMENTATION.md`
- **Turkish Docs**: See `AI_SERVIS_OZELLIKLERI_TR.md`
- **OpenAI Pricing**: https://openai.com/pricing
- **Gemini Pricing**: https://ai.google.dev/pricing
- **Claude Pricing**: https://www.anthropic.com/pricing
- **Azure OpenAI**: https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/
- **Ollama Models**: https://ollama.ai/library

## 💡 Tips & Tricks

### Save Money
- Use Ollama for iterating on prompts
- Batch process multiple CVs at once
- Use GPT-4o-mini instead of GPT-4 when possible
- Monitor token usage to avoid surprises

### Improve Quality
- Create custom prompts for your industry
- Use A/B testing to find best provider
- Iterate: test different models and prompts
- Provide detailed, well-structured job descriptions

### Stay Organized
- Name custom prompts clearly
- Tag A/B tests with meaningful names
- Export usage stats monthly
- Review and update custom prompts regularly

### Go Fast
- Use batch processing for multiple CVs
- Set parallel limit to 5 for faster processing
- Use faster models (GPT-4o-mini, Gemini Flash, Claude Haiku)
- Keep Ollama running in background for instant responses

## 🎯 Common Use Cases

### Job Seeker
1. Use Ollama to draft CV optimizations (free)
2. Use GPT-4o-mini for final cover letters (cheap, good quality)
3. A/B test important applications
4. Track costs to stay in budget

### Recruiter
1. Use batch processing for multiple candidates
2. Custom prompts for your industry
3. Azure OpenAI for enterprise compliance
4. Usage stats for reporting

### Career Coach
1. Custom prompts for different career levels
2. A/B test to show clients options
3. Ollama for client privacy
4. Cost tracking for billing

---

Need help? Check the full documentation or create an issue on GitHub.
