import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    let model;
    if (process.env.GROQ_API_KEY) {
      const groq = createOpenAI({ baseURL: 'https://api.groq.com/openai/v1', apiKey: process.env.GROQ_API_KEY });
      model = groq('llama-3.1-8b-instant');
    } else if (process.env.OPENROUTER_API_KEY) {
      const openrouter = createOpenAI({ baseURL: 'https://openrouter.ai/api/v1', apiKey: process.env.OPENROUTER_API_KEY });
      model = openrouter('google/gemini-flash-1.5');
    } else if (process.env.OPENAI_API_KEY) {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      model = openai('gpt-4o-mini');
    } else {
      throw new Error("No API key found for Groq, OpenRouter, or OpenAI.");
    }

    const result = await streamText({
      model,
      system: 'You are an expert AI coding assistant built into the CloudLab IDE. Help the user write, debug, and explain code. Keep your responses concise and well-formatted using markdown.',
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
