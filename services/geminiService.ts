import { GoogleGenAI, Chat, FunctionDeclaration, Type, Modality } from "@google/genai";
import { getSystemInstruction } from '../prompts/systemPrompt';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development; in production, the key is expected to be set.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "" });

const generateIllustrationTool: FunctionDeclaration = {
    name: 'generate_illustration',
    description: 'Создаёт простую иллюстрацию для объяснения математической концепции или задачи. Используй это, когда картинка может помочь пониманию.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            description: {
                type: Type.STRING,
                description: 'Подробное описание того, что нужно нарисовать. Например: "простой рисунок пиццы, разделенной на 8 равных частей, с 3 закрашенными частями, чтобы показать дробь 3/8".',
            },
        },
        required: ['description'],
    },
};

const showProblemTool: FunctionDeclaration = {
    name: 'show_problem',
    description: 'Показывает текст задачи из встроенной библиотеки по номеру и разделу.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            section: {
                type: Type.STRING,
                description: 'Название раздела, например "Комбинаторика-1" или "Чётность-1".',
            },
            number: {
                type: Type.NUMBER,
                description: 'Номер задачи в разделе.',
            },
        },
        required: ['section', 'number'],
    },
};

const showSolutionTool: FunctionDeclaration = {
    name: 'show_solution',
    description: 'Показывает текст решения задачи из встроенной библиотеки по номеру и разделу.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            section: {
                type: Type.STRING,
                description: 'Название раздела, например "7 класс - Комбинаторика-1" или "8 класс - Чётность-1".',
            },
            number: {
                type: Type.NUMBER,
                description: 'Номер задачи в разделе.',
            },
        },
        required: ['section', 'number'],
    },
};


export function startChat(availableSections: string[]): Chat {
    if (!API_KEY) {
        // In a real app, you might want a more robust way to handle this,
        // but for this context, we'll proceed, and the API call will fail.
        console.error("Cannot start chat: API_KEY is missing.");
    }
    const chat = ai.chats.create({
        model: 'gemini-2.5-pro',
        config: {
            systemInstruction: getSystemInstruction(availableSections),
            temperature: 0.7,
            tools: [{ functionDeclarations: [generateIllustrationTool, showProblemTool, showSolutionTool] }],
        },
    });
    return chat;
}

export async function generateIllustration(prompt: string): Promise<string | null> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Image generation failed:", error);
        return null;
    }
}