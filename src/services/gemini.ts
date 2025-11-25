import { GoogleGenAI, Type } from "@google/genai";
import { AICommandResponse } from '../types';

class GeminiService {
    private ai: GoogleGenAI | null = null;

    constructor() {
        const apiKey = process.env.API_KEY;
        if (apiKey) {
            this.ai = new GoogleGenAI({ apiKey });
        }
    }

    async processCommand(command: string): Promise<AICommandResponse> {
        if (!this.ai) {
            const apiKey = process.env.API_KEY;
            if (!apiKey) throw new Error("API Key not found");
            this.ai = new GoogleGenAI({ apiKey });
        }

        const prompt = `
      You are an AI assistant helping a user control their computer via a remote app.
      The user gives a natural language command. You must translate this into a description of what will happen
      and a list of keyboard shortcuts or actions that would achieve this on a Windows PC.
      
      User Command: "${command}"
    `;

        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            actionDescription: {
                                type: Type.STRING,
                                description: "A short, user-friendly description of the action being performed."
                            },
                            macros: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                                description: "A list of simulated keys/steps, e.g. ['Win', 'type:notepad', 'Enter']"
                            }
                        },
                        required: ["actionDescription", "macros"]
                    }
                }
            });

            const text = response.text;
            if (!text) throw new Error("No response from AI");

            return JSON.parse(text) as AICommandResponse;

        } catch (error) {
            console.error("Gemini API Error:", error);
            return {
                actionDescription: "Failed to process AI command.",
                macros: []
            };
        }
    }
}

export const geminiService = new GeminiService();
