import OpenAI from "openai";

// Initialize OpenAI when needed
const getOpenAIClient = () => {

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error(
            "OpenAI API key is missing. Check backend/.env"
        );
    }

    return new OpenAI({
        apiKey: apiKey
    });

};


// Generate AI Response
export const generateAIResponse = async (message, history = []) => {

    const openai = getOpenAIClient();

    const messages = [

        {
            role: "system",
            content: `
You are AccessAble AI, an intelligent and friendly accessibility
and learning assistant.

Your responsibilities:

1. Explain academic topics in simple language.
2. Help students understand difficult concepts.
3. Support users with accessibility-related questions.
4. Provide clear, structured and helpful answers.
5. Use examples whenever useful.
6. Be patient, respectful and encouraging.
7. Keep answers easy to understand.

Avoid unnecessarily complicated terminology.
            `
        },

        ...history.map(item => ({
            role: item.role,
            content: item.content
        })),

        {
            role: "user",
            content: message
        }

    ];


    const completion = await openai.chat.completions.create({

        model: "gpt-4o-mini",

        messages: messages,

        temperature: 0.7,

        max_tokens: 700

    });


    return completion.choices[0].message.content;

};