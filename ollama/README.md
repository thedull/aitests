# Ollama Chat API

A simple Express API for interacting with Ollama models.

## Setup

1. Make sure you have Ollama installed and running
2. Create or update your `.env` file:
```plaintext
MODEL=deepseek-r1:7b
```
3. Install dependencies:
```bash
npm install
```
4. Start the server:
```bash
node --env-file=<.env file> deepseek-test02.js
```

## Usage

### Check API Status
```bash
curl http://localhost:3000
```

### Send a Chat Request
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Tell me about yourself"}'
```

The response will be in JSON format:
```json
{
    "response": "AI assistant's response here..."
}
```

## Error Handling

If you send a request without a prompt, you'll receive:
```json
{
    "error": "Prompt is required"
}
```
