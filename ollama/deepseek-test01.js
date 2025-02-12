import ollama from 'ollama';

const prompt = 'Hi. Tell me a few words about yourself';
const message = {
    role: 'user',
    content: prompt
};
const response = await ollama.chat({
    model: 'deepseek-r1:7b',
    messages: [message],
    stream: true
});
let finalResponse = '';

for await (const part of response) {
    console.log(part);
    finalResponse += part.message.content;
};

console.log(finalResponse);
