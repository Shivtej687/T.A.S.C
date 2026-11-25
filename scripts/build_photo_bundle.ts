import fs from 'fs';
import path from 'path';

const PHOTOS_DIR = path.join(process.cwd(), 'public', 'photos');
const OUTPUT_FILE = path.join(process.cwd(), 'criminalPhotoBundle.ts');

async function buildPhotoBundle() {
  const photoMap: Record<string, string> = {};

  for (let i = 1; i <= 65; i++) {
    const id = `CRIM-IN-${String(i).padStart(3, '0')}`;
    photoMap[id] = `/photos/${id}.jpg`;
  }

  const fileContent = `// High-performance photo resolution index for all 65 criminal dossiers
// Mapped to local persistent static assets served directly via Vite & Express
export const CRIMINAL_PHOTO_BUNDLE: Record<string, string> = ${JSON.stringify(photoMap, null, 2)};

export function getEmbeddedCriminalPhoto(id: string): string {
  return CRIMINAL_PHOTO_BUNDLE[id] || \`/photos/\${id}.jpg\`;
}
`;

  fs.writeFileSync(OUTPUT_FILE, fileContent);
  console.log(`Successfully generated criminalPhotoBundle.ts with ${Object.keys(photoMap).length} mapped criminal photos!`);
}

buildPhotoBundle();
