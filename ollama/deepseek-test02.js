import express from 'express';
import ollama from 'ollama';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
        <h1>Ollama Chat Test API</h1>
        <p>Send POST requests to /chat with a JSON body containing a "prompt" field.</p>
        <p>Example: { "prompt": "Tell me about yourself" }</p>
    `);
});

app.post('/chat', async (req, res) => {
    const prompt = req.body.prompt;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const message = {
        role: 'user',
        content: prompt
    };

    try {
        const response = await ollama.chat({
            model: process.env.MODEL,
            messages: [message],
            stream: true
        });
        
        let finalResponse = '';
        for await (const part of response) {
            finalResponse += part.message.content;
        }

        res.json({ response: finalResponse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
