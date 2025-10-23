import { GoogleGenAI, Chat, FunctionDeclaration } from "@google/genai";
import { getSystemInstruction } from '../prompts/systemPrompt';
import { Task } from "../types";

// Lazily initialize the AI instance to prevent app crash on load if API key is missing.
let ai: GoogleGenAI | null = null;

/**
 * Gets the singleton instance of the GoogleGenAI client.
 * Throws an error if the API key is not configured.
 */
function getAiInstance(): GoogleGenAI {
  const API_KEY = process?.env?.API_KEY;
  if (!API_KEY) {
    // This error will be caught by the calling function's try/catch block in App.tsx
    throw new Error("API_KEY environment variable not set.");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
}


const generateIllustrationTool: FunctionDeclaration = {
    name: 'generate_illustration',
    description: 'Создаёт простую иллюстрацию для объяснения математической концепции или задачи. Используй это, когда картинка может помочь пониманию.',
    parameters: {
        type: 'OBJECT',
        properties: {
            description: {
                type: 'STRING',
                description: 'Подробное описание того, что нужно нарисовать. Например: "простой рисунок пиццы, разделенной на 8 равных частей, с 3 закрашенными частями, чтобы показать дробь 3/8".',
            },
        },
        required: ['description'],
    },
};

const showProblemTool: FunctionDeclaration = {
    name: 'show_problem',
    description: 'Показывает текст задачи из библиотеки по названию книги, главы и ID задачи.',
    parameters: {
        type: 'OBJECT',
        properties: {
            bookTitle: {
                type: 'STRING',
                description: 'Название книги, например "Задачник «Кванта»".',
            },
            chapterTitle: {
                type: 'STRING',
                description: 'Название главы, например "1970".',
            },
            taskId: {
                type: 'STRING',
                description: 'Идентификатор задачи, например "kvant_1970_1".',
            },
        },
        required: ['bookTitle', 'chapterTitle', 'taskId'],
    },
};

const showSolutionTool: FunctionDeclaration = {
    name: 'show_solution',
    description: 'Показывает текст решения задачи из библиотеки по названию книги, главы и ID задачи.',
    parameters: {
        type: 'OBJECT',
        properties: {
             bookTitle: {
                type: 'STRING',
                description: 'Название книги, например "Задачник «Кванта»".',
            },
            chapterTitle: {
                type: 'STRING',
                description: 'Название главы, например "1970".',
            },
            taskId: {
                type: 'STRING',
                description: 'Идентификатор задачи, например "kvant_1970_1".',
            },
        },
        required: ['bookTitle', 'chapterTitle', 'taskId'],
    },
};


export function startChat(
    availableBooks: string[],
    currentChapter?: { bookTitle: string; chapterTitle: string; tasks: Task[] }
): Chat {
    const aiInstance = getAiInstance();
    const chat = aiInstance.chats.create({
        model: 'gemini-2.5-pro',
        config: {
            systemInstruction: getSystemInstruction(availableBooks, currentChapter),
            temperature: 0.7,
            tools: [{ functionDeclarations: [generateIllustrationTool, showProblemTool, showSolutionTool] }],
        },
    });
    return chat;
}

export async function generateIllustration(prompt: string): Promise<string | null> {
    const aiInstance = getAiInstance();
    try {
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: ['IMAGE'],
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