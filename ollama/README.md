# Ollama Chat API

A simple Express API for interacting with Ollama models, featuring conversation context preservation.

## Setup

1. Make sure you have Ollama installed and running
2. Create or update your `.env` file:
```plaintext
MODEL=deepseek-r1:7b
PORT=3000  # Optional, defaults to 3000
```
3. Install dependencies:
```bash
npm install
```
4. Start the server:
```bash
node --env-file=<.env file> deepseek-test03.js
```

## Features

- Conversation context preservation
- Automatic session cleanup after 30 minutes of inactivity
- Real-time response streaming
- Session management
- Detailed conversation history

## API Endpoints

### Create a New Session
```bash
curl -X POST http://localhost:3000/session
```
Response:
```json
{
    "sessionId": "generated-session-id"
}
```

### Send a Chat Message
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "your-session-id",
    "prompt": "Tell me about yourself"
  }'
```
Response:
```json
{
    "response": "AI assistant's response here...",
    "sessionId": "your-session-id",
    "messageCount": 2
}
```

### Get Conversation History
```bash
curl http://localhost:3000/session/your-session-id/messages
```
Response:
```json
{
    "sessionId": "your-session-id",
    "messages": [
        {"role": "user", "content": "Tell me about yourself"},
        {"role": "assistant", "content": "AI response..."}
    ],
    "messageCount": 2
}
```

### Clear a Session
```bash
curl -X DELETE http://localhost:3000/session/your-session-id
```
Response:
```json
{
    "message": "Session cleared successfully"
}
```

## Error Handling

### Session Not Found
```json
{
    "error": "Session not found. Create a new session first."
}
```

### Missing Parameters
```json
{
    "error": "Both sessionId and prompt are required"
}
```

## Session Management

- Sessions automatically expire after 30 minutes of inactivity
- Cleanup process runs every 5 minutes to remove expired sessions
- Each session maintains its own conversation history
- Messages are preserved in order for context-aware responses
