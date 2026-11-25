import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const PHOTOS_DIR = path.join(process.cwd(), 'public', 'photos');

export function handleGetPhoto(req: Request, res: Response) {
  const id = String(req.params.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
  const jpgPath = path.join(PHOTOS_DIR, `${id}.jpg`);
  const svgPath = path.join(PHOTOS_DIR, `${id}.svg`);

  if (fs.existsSync(jpgPath)) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(jpgPath);
  }
  if (fs.existsSync(svgPath)) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(svgPath);
  }

  return res.status(404).json({ error: 'Photo not found' });
}
