import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export async function handleGeminiChat(req: Request, res: Response, aiInstance: GoogleGenAI | null) {
  try {
    const { messages, message, prompt } = req.body;
    const userQuery = message || prompt || (Array.isArray(messages) && messages[messages.length - 1]?.text);

    if (!userQuery || typeof userQuery !== 'string') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    let ai = aiInstance;
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
      }
    }

    if (!ai) {
      return res.json({
        reply: `**[T.A.S.C. GEMINI AI OFFLINE]**\n\nNo active Gemini API key detected in server environment. Please configure your \`GEMINI_API_KEY\` in environment settings to enable real-time Gemini AI capabilities.`
      });
    }

    // Build conversation context
    const systemInstruction = `You are the T.A.S.C. (Threat Analysis and Surveillance Cell) Gemini AI Intelligence Assistant for the Ministry of Defence, Government of India. You operate as an advanced, highly articulate, versatile AI like ChatGPT, specialized in tactical analysis, cyber defense, national security, intelligence briefings, technology, coding, and general knowledge. Always be helpful, precise, authoritative yet friendly, and format your answers with clean Markdown (bolding, headers, bullet points, and code blocks when appropriate).`;

    let formattedContents: any = [];
    if (Array.isArray(messages) && messages.length > 0) {
      formattedContents = messages.map((m: any) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text || m.content || '' }]
      }));
    } else {
      formattedContents = [{ role: 'user', parts: [{ text: userQuery }] }];
    }

    // Valid active Gemini API models
    const modelsToTry = ['gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
    let replyText = '';
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: formattedContents,
          config: {
            systemInstruction
          }
        });

        if (response && response.text) {
          replyText = response.text;
          break;
        }
      } catch (mErr: any) {
        lastError = mErr;
        console.log(`[Diagnostic] Gemini Chat fallback option evaluated for ${modelName}.`);
      }
    }

    if (!replyText) {
      console.log('All Gemini Chat models were busy.');
      return res.json({
        reply: "Secure tactical network communication is experiencing temporary latency. Please stand by, system automatically recovering."
      });
    }

    return res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Gemini Chat Route Error:', err);
    return res.status(500).json({
      error: 'Chat request failed',
      message: err.message || 'Internal server error'
    });
  }
}
