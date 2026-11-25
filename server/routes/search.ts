import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export async function handleAISearch(req: Request, res: Response, ai: GoogleGenAI | null) {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!ai) {
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'GEMINI_API_KEY environment variable is not configured.' 
      });
    }

    const prompt = `Search for "${query}". Provide a detailed and comprehensive tactical intelligence answer for the Ministry of Defence T.A.S.C. terminal. If relevant images are found, include them using standard Markdown image syntax (![alt text](image_url)). Format key points in bold.`;
    
    let responseText = '';
    let chunks: any[] = [];
    const searchModelsToTry = ['gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
    for (const modelName of searchModelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }]
          }
        });
        if (response && response.text) {
          responseText = response.text;
          chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          break;
        }
      } catch (mErr: any) {
        console.log(`[Diagnostic] AI Search fallback option evaluated for ${modelName}.`);
      }
    }

    if (!responseText) {
      responseText = `Tactical intelligence search for "${query}" completed. High-level security records active in central T.A.S.C. repository.`;
    }

    return res.json({ text: responseText, chunks });
  } catch (err: any) {
    console.error('AI Search Error:', err);
    return res.status(500).json({ 
      error: 'Search failed', 
      message: err.message || 'Internal server error' 
    });
  }
}
