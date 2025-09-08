import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

export async function generateChatResponse(prompt: string, language: string, history: any[]): Promise<string> {
  const chat = model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 100,
    },
  });

  const result = await chat.sendMessageStream(`Translate the following text to ${language}: ${prompt}`);

  let text = '';
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    text += chunkText;
  }

  return text;
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  const prompt = `Translate the following text to ${targetLanguage}: ${text}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}
