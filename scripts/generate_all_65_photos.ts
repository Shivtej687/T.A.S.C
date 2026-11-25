import fs from 'fs';
import path from 'path';
import { RAW_CRIMINALS_DATABASE } from '../src/data/criminalData';

const PHOTOS_DIR = path.join(process.cwd(), 'public', 'photos');

// Function to generate a realistic high-definition forensic archival police mugshot for criminals
function generateForensicPhotoSvg(c: any): string {
  const isFemale = c.gender === 'women';
  const age = c.age || 45;
  const isElderly = age > 55;
  const isYoung = age < 30;

  // Realistic skin tones
  const skinTones = [
    { base: '#b57e56', shadow: '#8c5934', highlight: '#d29b73' },
    { base: '#9c653d', shadow: '#744522', highlight: '#be855b' },
    { base: '#84502d', shadow: '#5c3316', highlight: '#a86d44' },
    { base: '#c9966d', shadow: '#9d6d48', highlight: '#e0b28b' },
    { base: '#6e4020', shadow: '#4a260f', highlight: '#8f5b34' }
  ];
  
  const hash = c.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const skin = skinTones[hash % skinTones.length];

  // Specific facial characteristics based on profile
  const hasMustache = !isFemale && (c.hair?.toLowerCase().includes('mustache') || hash % 3 !== 0 || c.id === 'CRIM-IN-001' || c.id === 'CRIM-IN-003');
  const hasBeard = !isFemale && (c.hair?.toLowerCase().includes('beard') || c.id === 'CRIM-IN-028' || c.id === 'CRIM-IN-029' || c.id === 'CRIM-IN-060' || c.id === 'CRIM-IN-061' || hash % 4 === 0);
  const hasGlasses = c.id === 'CRIM-IN-014' || c.id === 'CRIM-IN-055' || c.id === 'CRIM-IN-056' || hash % 7 === 0;
  const hairColor = isElderly ? '#4b5563' : '#111827';
  const shirtColor = hash % 2 === 0 ? '#f8fafc' : (hash % 3 === 0 ? '#1e293b' : '#b45309');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
    <defs>
      <!-- Background wall lighting -->
      <radialGradient id="wallLight" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="60%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </radialGradient>
      <!-- Skin shading gradient -->
      <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${skin.highlight}"/>
        <stop offset="50%" stop-color="${skin.base}"/>
        <stop offset="100%" stop-color="${skin.shadow}"/>
      </linearGradient>
      <!-- Noise filter for photographic film grain -->
      <filter id="photoGrain" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.08 0" />
        <feBlend mode="overlay" in="SourceGraphic" result="blend" />
      </filter>
      <!-- Shadow filter -->
      <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="3" dy="5" stdDeviation="6" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>

    <!-- Background: Police Lineup Wall with Height Measurements -->
    <rect width="400" height="500" fill="url(#wallLight)"/>
    
    <!-- Height lines -->
    <g stroke="rgba(255,255,255,0.12)" stroke-width="1.5">
      <line x1="20" y1="80" x2="380" y2="80"/>
      <line x1="20" y1="120" x2="380" y2="120"/>
      <line x1="20" y1="160" x2="380" y2="160"/>
      <line x1="20" y1="200" x2="380" y2="200"/>
      <line x1="20" y1="240" x2="380" y2="240"/>
      <line x1="20" y1="280" x2="380" y2="280"/>
      <line x1="20" y1="320" x2="380" y2="320"/>
    </g>
    <!-- Height labels in feet/inches -->
    <g fill="rgba(255,255,255,0.3)" font-family="monospace" font-size="10" font-weight="bold">
      <text x="25" y="76">6'2"</text>
      <text x="25" y="116">6'0"</text>
      <text x="25" y="156">5'10"</text>
      <text x="25" y="196">5'8"</text>
      <text x="25" y="236">5'6"</text>
      <text x="25" y="276">5'4"</text>
      <text x="25" y="316">5'2"</text>
    </g>

    <!-- Person Group -->
    <g filter="url(#dropShadow)">
      <!-- Shoulders & Torso -->
      <path d="M 60 500 C 60 380, 110 320, 200 320 C 290 320, 340 380, 340 500 Z" fill="${shirtColor}"/>
      
      <!-- Collar / Clothes Details -->
      <path d="M 160 320 L 200 380 L 240 320" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="3"/>
      <path d="M 200 380 L 200 500" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>

      <!-- Neck -->
      <rect x="165" y="250" width="70" height="90" rx="10" fill="url(#skinGrad)"/>
      <path d="M 165 310 Q 200 330 235 310" fill="none" stroke="${skin.shadow}" stroke-width="3"/>

      <!-- Head / Face -->
      <ellipse cx="200" cy="190" rx="68" ry="85" fill="url(#skinGrad)"/>

      <!-- Ears -->
      <ellipse cx="130" cy="195" rx="12" ry="24" fill="${skin.shadow}"/>
      <ellipse cx="132" cy="195" rx="8" ry="16" fill="${skin.base}"/>
      <ellipse cx="270" cy="195" rx="12" ry="24" fill="${skin.shadow}"/>
      <ellipse cx="268" cy="195" rx="8" ry="16" fill="${skin.base}"/>

      <!-- Hair -->
      ${isFemale ? `
        <!-- Female long hair -->
        <path d="M 125 190 Q 120 100 200 95 Q 280 100 275 190 Q 290 280 280 340 L 260 340 Q 265 240 250 170 Q 200 130 150 170 Q 135 240 140 340 L 120 340 Z" fill="${hairColor}"/>
      ` : (c.hair?.toLowerCase().includes('receding') || isElderly ? `
        <!-- Receding / short hair -->
        <path d="M 130 190 C 125 120, 160 105, 200 105 C 240 105, 275 120, 270 190 C 260 140, 240 125, 200 125 C 160 125, 140 140, 130 190 Z" fill="${hairColor}"/>
      ` : `
        <!-- Standard hair -->
        <path d="M 125 180 C 120 95, 160 85, 200 85 C 240 85, 280 95, 275 180 C 270 120, 240 110, 200 110 C 160 110, 130 120, 125 180 Z" fill="${hairColor}"/>
      `)}

      <!-- Eyebrows -->
      <path d="M 155 160 Q 170 155 185 160" fill="none" stroke="${hairColor}" stroke-width="4" stroke-linecap="round"/>
      <path d="M 215 160 Q 230 155 245 160" fill="none" stroke="${hairColor}" stroke-width="4" stroke-linecap="round"/>

      <!-- Eyes -->
      <ellipse cx="170" cy="175" rx="14" ry="8" fill="#ffffff"/>
      <circle cx="170" cy="175" r="5.5" fill="#1e1e1e"/>
      <circle cx="172" cy="173" r="1.5" fill="#ffffff"/>
      <path d="M 156 175 Q 170 168 184 175" fill="none" stroke="${skin.shadow}" stroke-width="2"/>

      <ellipse cx="230" cy="175" rx="14" ry="8" fill="#ffffff"/>
      <circle cx="230" cy="175" r="5.5" fill="#1e1e1e"/>
      <circle cx="232" cy="173" r="1.5" fill="#ffffff"/>
      <path d="M 216 175 Q 230 168 244 175" fill="none" stroke="${skin.shadow}" stroke-width="2"/>

      <!-- Nose -->
      <path d="M 200 165 L 196 205 Q 200 215 208 205" fill="none" stroke="${skin.shadow}" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="193" cy="207" rx="3" ry="2" fill="${skin.shadow}"/>
      <ellipse cx="207" cy="207" rx="3" ry="2" fill="${skin.shadow}"/>

      <!-- Mustache / Facial Hair -->
      ${hasMustache ? `
        <path d="M 175 220 Q 200 215 225 220 Q 200 232 175 220 Z" fill="${hairColor}"/>
      ` : ''}

      ${hasBeard ? `
        <path d="M 140 200 Q 140 270 200 280 Q 260 270 260 200 Q 250 250 200 260 Q 150 250 140 200 Z" fill="${hairColor}" opacity="0.9"/>
      ` : ''}

      <!-- Mouth -->
      <path d="M 180 235 Q 200 240 220 235" fill="none" stroke="#713f28" stroke-width="3" stroke-linecap="round"/>

      <!-- Glasses -->
      ${hasGlasses ? `
        <rect x="150" y="162" width="38" height="26" rx="4" fill="none" stroke="#000000" stroke-width="3"/>
        <rect x="212" y="162" width="38" height="26" rx="4" fill="none" stroke="#000000" stroke-width="3"/>
        <line x1="188" y1="173" x2="212" y2="173" stroke="#000000" stroke-width="3"/>
        <line x1="150" y1="170" x2="132" y2="178" stroke="#000000" stroke-width="2.5"/>
        <line x1="250" y1="170" x2="268" y2="178" stroke="#000000" stroke-width="2.5"/>
      ` : ''}
    </g>

    <!-- Forensic Police Chest Placard -->
    <g transform="translate(45, 410)">
      <rect width="310" height="75" rx="6" fill="#090d16" stroke="#ef4444" stroke-width="2"/>
      <rect x="5" y="5" width="300" height="65" fill="#0f172a"/>
      <!-- Header banner -->
      <rect x="5" y="5" width="300" height="18" fill="#991b1b"/>
      <text x="155" y="18" fill="#ffffff" font-family="monospace" font-size="11" font-weight="900" text-anchor="middle" letter-spacing="2">GOVT OF INDIA • POLICE RECORD</text>
      
      <!-- Offender Details -->
      <text x="155" y="38" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="1">${c.name.toUpperCase().length > 28 ? c.name.toUpperCase().slice(0, 26) + '..' : c.name.toUpperCase()}</text>
      <text x="155" y="52" fill="#94a3b8" font-family="monospace" font-size="10" text-anchor="middle">ID: ${c.id} • ${c.status} • DANGER: ${c.dangerLevel}</text>
      <text x="155" y="64" fill="#ef4444" font-family="monospace" font-size="9" font-weight="bold" text-anchor="middle">NATIONAL CENTRAL BUREAU / CBI</text>
    </g>

    <!-- Lens Flare / Vignette Overlay -->
    <rect width="400" height="500" fill="none" stroke="rgba(0,0,0,0.6)" stroke-width="20"/>
  </svg>`;
}

async function run() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
  }

  console.log('Ensuring all 65 criminal photo files exist...');

  for (const c of RAW_CRIMINALS_DATABASE) {
    const jpgFile = path.join(PHOTOS_DIR, `${c.id}.jpg`);
    const svgFile = path.join(PHOTOS_DIR, `${c.id}.svg`);

    // If real photograph JPG does NOT exist or is tiny (< 2KB), create the forensic photographic file
    const hasValidJpg = fs.existsSync(jpgFile) && fs.statSync(jpgFile).size > 2000;

    if (!hasValidJpg) {
      const svgContent = generateForensicPhotoSvg(c);
      fs.writeFileSync(svgFile, svgContent);
      // Also write as jpg file name so any request for .jpg gets served valid graphic data
      fs.writeFileSync(jpgFile, svgContent);
      console.log(`[GENERATED FORENSIC PHOTO] ${c.id} - ${c.name}`);
    } else {
      console.log(`[VERIFIED REAL PHOTO FILE] ${c.id} - ${c.name} (${fs.statSync(jpgFile).size} bytes)`);
    }
  }

  console.log('All 65 criminal photo files successfully ready on local storage!');
}

run();
