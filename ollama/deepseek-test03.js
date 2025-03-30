import express from 'express';
import ollama from 'ollama';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Store conversations with a cleanup mechanism
class ConversationManager {
    constructor(maxAge = 30 * 60 * 1000) { // 30 minutes default
        this.conversations = new Map();
        this.maxAge = maxAge;
        
        // Run cleanup every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    createSession() {
        const sessionId = crypto.randomBytes(16).toString('hex');
        this.conversations.set(sessionId, {
            messages: [],
            lastAccessed: Date.now()
        });
        return sessionId;
    }

    getSession(sessionId) {
        const session = this.conversations.get(sessionId);
        if (session) {
            session.lastAccessed = Date.now();
            return session;
        }
        return null;
    }

    addMessage(sessionId, message) {
        const session = this.getSession(sessionId);
        if (!session) return false;
        
        session.messages.push(message);
        return true;
    }

    clearSession(sessionId) {
        return this.conversations.delete(sessionId);
    }

    cleanup() {
        const now = Date.now();
        for (const [sessionId, session] of this.conversations.entries()) {
            if (now - session.lastAccessed > this.maxAge) {
                this.conversations.delete(sessionId);
            }
        }
    }
}

const conversationManager = new ConversationManager();

app.get('/', (req, res) => {
    res.send(`
        <h1>Ollama Chat Test API with Context</h1>
        <p>Available endpoints:</p>
        <ul>
            <li>POST /session - Create a new chat session</li>
            <li>POST /chat - Send a message (requires sessionId)</li>
            <li>GET /session/:sessionId/messages - Get conversation history</li>
            <li>DELETE /session/:sessionId - Clear a chat session</li>
        </ul>
    `);
});

app.post('/session', (req, res) => {
    const sessionId = conversationManager.createSession();
    res.json({ sessionId });
});

app.post('/chat', async (req, res) => {
    const { sessionId, prompt } = req.body;
    console.log(`Processing chat request for session ${sessionId}`);
    
    if (!sessionId || !prompt) {
        return res.status(400).json({ 
            error: 'Both sessionId and prompt are required' 
        });
    }

    const session = conversationManager.getSession(sessionId);
    if (!session) {
        return res.status(404).json({ 
            error: 'Session not found. Create a new session first.' 
        });
    }

    const message = {
        role: 'user',
        content: prompt
    };

    try {
        console.log('Adding user message to history');
        conversationManager.addMessage(sessionId, message);

        console.log('Sending request to Ollama');
        const response = await ollama.chat({
            model: process.env.MODEL,
            messages: session.messages,
            stream: true
        });
        
        let finalResponse = '';
        console.log('Processing streamed response');
        for await (const part of response) {
            finalResponse += part.message.content;
        }

        console.log('Adding assistant response to history');
        conversationManager.addMessage(sessionId, {
            role: 'assistant',
            content: finalResponse
        });

        console.log('Sending response to client');
        res.json({ 
            response: finalResponse,
            sessionId,
            messageCount: session.messages.length
        });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/session/:sessionId/messages', (req, res) => {
    const { sessionId } = req.params;
    const session = conversationManager.getSession(sessionId);
    
    if (!session) {
        return res.status(404).json({ 
            error: 'Session not found' 
        });
    }

    res.json({ 
        sessionId,
        messages: session.messages,
        messageCount: session.messages.length
    });
});

app.delete('/session/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    if (conversationManager.clearSession(sessionId)) {
        res.json({ message: 'Session cleared successfully' });
    } else {
        res.status(404).json({ error: 'Session not found' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});