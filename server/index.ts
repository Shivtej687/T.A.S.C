import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

import { handleGetPhoto } from './routes/photos';
import { handleBiometricScan, handleEraseFeature } from './routes/biometrics';
import { handleAISearch } from './routes/search';
import { handleCommsChat } from './routes/comms';
import { handleGeminiChat } from './routes/geminiChat';

const PHOTOS_DIR = path.join(process.cwd(), 'public', 'photos');

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (apiKey) {
    if (!aiClient) {
      aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
  }
  if (!aiClient) {
    const key = apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
    if (key) {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

export async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser for JSON with base64 image support (up to 30mb)
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ limit: '30mb', extended: true }));

  // Serve static public directory (photos, officers, leaders, defence, field)
  app.use(express.static(path.join(process.cwd(), 'public'), {
    maxAge: '1d',
    immutable: false
  }));

  // Route Handlers
  app.get('/api/photo/:id', handleGetPhoto);

  app.post('/api/biometrics/scan', (req: Request, res: Response) => {
    handleBiometricScan(req, res, getAI());
  });

  app.post('/api/biometrics/erase-feature', (req: Request, res: Response) => {
    handleEraseFeature(req, res, getAI());
  });

  app.post('/api/ai-search', (req: Request, res: Response) => {
    handleAISearch(req, res, getAI());
  });

  app.post('/api/comms/chat', (req: Request, res: Response) => {
    handleCommsChat(req, res, getAI());
  });

  app.post('/api/gemini/chat', (req: Request, res: Response) => {
    handleGeminiChat(req, res, getAI());
  });

  // Health check route
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Midnight Void Defence Intel Server running on http://localhost:${PORT}`);
  });
}

startServer();
