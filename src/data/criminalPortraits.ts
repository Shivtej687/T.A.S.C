// Biometric Mugshot Composite Engine
// Generates self-contained, 100% offline biometric police mugshot portraits with height grid, accurate facial features, and criminal placards

export interface CriminalPortraitConfig {
  skinTone: string;
  faceShape: 'square' | 'round' | 'oval' | 'lean' | 'angular';
  hairStyle: 'slicked' | 'receding' | 'short' | 'curly' | 'balding' | 'turban' | 'topi' | 'bandana' | 'beret' | 'wild' | 'female_tied';
  hairColor: string;
  facialHair: 'none' | 'stubble' | 'underworld_mustache' | 'giant_handlebar' | 'dense_beard' | 'henna_beard' | 'grey_beard' | 'goatee';
  glasses?: 'aviators' | 'spectacles' | 'tinted' | 'none';
  attire: 'mafia_suit' | 'jungle_camo' | 'terrorist_tee' | 'tactical_hoodie' | 'white_kurta' | 'safari_suit' | 'pathani_suit' | 'doctor_coat' | 'prison_uniform' | 'bandit_vest' | 'saree' | 'casual_jacket';
  attireColor?: string;
  headwearColor?: string;
  specialFeature?: 'tilak' | 'scar' | 'wrinkles' | 'earrings' | 'mole' | 'scowl' | 'bloodshot_eyes';
}

export const CRIMINAL_FEATURE_MAP: Record<string, Partial<CriminalPortraitConfig>> = {
  // CRIM-IN-001: Dawood Ibrahim
  'CRIM-IN-001': {
    skinTone: '#b5845c',
    faceShape: 'square',
    hairStyle: 'slicked',
    hairColor: '#1c1c1c',
    facialHair: 'underworld_mustache',
    glasses: 'aviators',
    attire: 'mafia_suit',
    attireColor: '#15253b',
    specialFeature: 'scowl'
  },
  // CRIM-IN-002: Ajmal Kasab
  'CRIM-IN-002': {
    skinTone: '#c6956e',
    faceShape: 'round',
    hairStyle: 'short',
    hairColor: '#111111',
    facialHair: 'goatee',
    glasses: 'none',
    attire: 'terrorist_tee',
    attireColor: '#4b6070',
    specialFeature: 'scowl'
  },
  // CRIM-IN-003: Veerappan
  'CRIM-IN-003': {
    skinTone: '#8c5936',
    faceShape: 'lean',
    hairStyle: 'curly',
    hairColor: '#1a1a1a',
    facialHair: 'giant_handlebar',
    glasses: 'none',
    attire: 'jungle_camo',
    attireColor: '#394833',
    specialFeature: 'wrinkles'
  },
  // CRIM-IN-004: Yakub Memon
  'CRIM-IN-004': {
    skinTone: '#bd8e68',
    faceShape: 'oval',
    hairStyle: 'short',
    hairColor: '#222222',
    facialHair: 'stubble',
    glasses: 'spectacles',
    attire: 'mafia_suit',
    attireColor: '#2d3748'
  },
  // CRIM-IN-005: Vikas Dubey
  'CRIM-IN-005': {
    skinTone: '#be916d',
    faceShape: 'round',
    hairStyle: 'short',
    hairColor: '#4a4a4a',
    facialHair: 'underworld_mustache',
    glasses: 'spectacles',
    attire: 'casual_jacket',
    attireColor: '#1f2937',
    specialFeature: 'wrinkles'
  },
  // CRIM-IN-006: Afzal Guru
  'CRIM-IN-006': {
    skinTone: '#c49977',
    faceShape: 'oval',
    hairStyle: 'short',
    hairColor: '#1f1f1f',
    facialHair: 'dense_beard',
    glasses: 'none',
    attire: 'white_kurta',
    attireColor: '#475569'
  },
  // CRIM-IN-007: Lawrence Bishnoi
  'CRIM-IN-007': {
    skinTone: '#ba8963',
    faceShape: 'angular',
    hairStyle: 'slicked',
    hairColor: '#111111',
    facialHair: 'stubble',
    glasses: 'none',
    attire: 'tactical_hoodie',
    attireColor: '#0f172a',
    specialFeature: 'scowl'
  },
  // CRIM-IN-008: Abu Salem
  'CRIM-IN-008': {
    skinTone: '#bd8b62',
    faceShape: 'angular',
    hairStyle: 'slicked',
    hairColor: '#1a1a1a',
    facialHair: 'none',
    glasses: 'none',
    attire: 'casual_jacket',
    attireColor: '#33271e'
  },
  // CRIM-IN-009: Chhota Rajan
  'CRIM-IN-009': {
    skinTone: '#b27f58',
    faceShape: 'round',
    hairStyle: 'balding',
    hairColor: '#2b2b2b',
    facialHair: 'underworld_mustache',
    glasses: 'none',
    attire: 'safari_suit',
    attireColor: '#374151',
    specialFeature: 'mole'
  },
  // CRIM-IN-010: Goldy Brar
  'CRIM-IN-010': {
    skinTone: '#c7966f',
    faceShape: 'round',
    hairStyle: 'turban',
    hairColor: '#111111',
    headwearColor: '#0f172a',
    facialHair: 'dense_beard',
    glasses: 'none',
    attire: 'tactical_hoodie',
    attireColor: '#1e293b'
  },
  // CRIM-IN-011: Atiq Ahmed
  'CRIM-IN-011': {
    skinTone: '#be8c64',
    faceShape: 'round',
    hairStyle: 'balding',
    hairColor: '#6b7280',
    facialHair: 'underworld_mustache',
    glasses: 'none',
    attire: 'white_kurta',
    attireColor: '#f1f5f9',
    specialFeature: 'wrinkles'
  },
  // CRIM-IN-012: Mukhtar Ansari
  'CRIM-IN-012': {
    skinTone: '#ab764f',
    faceShape: 'angular',
    hairStyle: 'short',
    hairColor: '#4b5563',
    facialHair: 'giant_handlebar',
    glasses: 'none',
    attire: 'white_kurta',
    attireColor: '#e2e8f0'
  },
  // CRIM-IN-013: Phoolan Devi
  'CRIM-IN-013': {
    skinTone: '#945c38',
    faceShape: 'angular',
    hairStyle: 'bandana',
    hairColor: '#111111',
    headwearColor: '#dc2626',
    facialHair: 'none',
    glasses: 'none',
    attire: 'bandit_vest',
    attireColor: '#78350f',
    specialFeature: 'earrings'
  },
  // CRIM-IN-014: Abdul Karim Telgi
  'CRIM-IN-014': {
    skinTone: '#b5845d',
    faceShape: 'round',
    hairStyle: 'balding',
    hairColor: '#374151',
    facialHair: 'none',
    glasses: 'spectacles',
    attire: 'safari_suit',
    attireColor: '#475569',
    specialFeature: 'wrinkles'
  },
  // CRIM-IN-015: Auto Shankar
  'CRIM-IN-015': {
    skinTone: '#845030',
    faceShape: 'square',
    hairStyle: 'curly',
    hairColor: '#111111',
    facialHair: 'underworld_mustache',
    glasses: 'none',
    attire: 'prison_uniform',
    attireColor: '#ea580c'
  },
  // CRIM-IN-016: Manya Surve
  'CRIM-IN-016': {
    skinTone: '#ba8862',
    faceShape: 'angular',
    hairStyle: 'slicked',
    hairColor: '#1a1a1a',
    facialHair: 'underworld_mustache',
    glasses: 'aviators',
    attire: 'casual_jacket',
    attireColor: '#4b5563'
  },
  // CRIM-IN-017: Maya Dolas
  'CRIM-IN-017': {
    skinTone: '#b8855e',
    faceShape: 'lean',
    hairStyle: 'curly',
    hairColor: '#111111',
    facialHair: 'none',
    glasses: 'none',
    attire: 'casual_jacket',
    attireColor: '#1e3a8a',
    specialFeature: 'scowl'
  },
  // CRIM-IN-018: Charles Sobhraj
  'CRIM-IN-018': {
    skinTone: '#d4a883',
    faceShape: 'angular',
    hairStyle: 'beret',
    hairColor: '#374151',
    headwearColor: '#1e3a8a',
    facialHair: 'none',
    glasses: 'aviators',
    attire: 'safari_suit',
    attireColor: '#d97706'
  },
  // CRIM-IN-019: Yasin Bhatkal
  'CRIM-IN-019': {
    skinTone: '#c0926c',
    faceShape: 'oval',
    hairStyle: 'short',
    hairColor: '#111111',
    facialHair: 'dense_beard',
    glasses: 'none',
    attire: 'terrorist_tee',
    attireColor: '#334155'
  },
  // CRIM-IN-020: Raman Raghav
  'CRIM-IN-020': {
    skinTone: '#7c4928',
    faceShape: 'lean',
    hairStyle: 'wild',
    hairColor: '#374151',
    facialHair: 'dense_beard',
    glasses: 'none',
    attire: 'prison_uniform',
    attireColor: '#6b7280',
    specialFeature: 'bloodshot_eyes'
  },
  // CRIM-IN-021: Tiger Memon
  'CRIM-IN-021': {
    skinTone: '#b8865f',
    faceShape: 'square',
    hairStyle: 'short',
    hairColor: '#1c1c1c',
    facialHair: 'underworld_mustache',
    glasses: 'none',
    attire: 'mafia_suit',
    attireColor: '#1e293b'
  },
  // CRIM-IN-022: Chhota Shakeel
  'CRIM-IN-022': {
    skinTone: '#ba8761',
    faceShape: 'round',
    hairStyle: 'slicked',
    hairColor: '#111111',
    facialHair: 'underworld_mustache',
    glasses: 'tinted',
    attire: 'mafia_suit',
    attireColor: '#0f172a'
  },
  // CRIM-IN-023: Arun Gawli
  'CRIM-IN-023': {
    skinTone: '#b7835b',
    faceShape: 'oval',
    hairStyle: 'topi',
    hairColor: '#f8fafc',
    headwearColor: '#ffffff',
    facialHair: 'none',
    glasses: 'none',
    attire: 'white_kurta',
    attireColor: '#f8fafc'
  },
  // CRIM-IN-024: Karim Lala
  'CRIM-IN-024': {
    skinTone: '#d2a37e',
    faceShape: 'angular',
    hairStyle: 'turban',
    hairColor: '#f1f5f9',
    headwearColor: '#f8fafc',
    facialHair: 'grey_beard',
    glasses: 'none',
    attire: 'pathani_suit',
    attireColor: '#334155'
  },
  // CRIM-IN-025: Haji Mastan
  'CRIM-IN-025': {
    skinTone: '#b27f57',
    faceShape: 'angular',
    hairStyle: 'slicked',
    hairColor: '#e2e8f0',
    facialHair: 'none',
    glasses: 'aviators',
    attire: 'safari_suit',
    attireColor: '#f8fafc'
  },
  // CRIM-IN-026: Varadarajan Mudaliar
  'CRIM-IN-026': {
    skinTone: '#784626',
    faceShape: 'round',
    hairStyle: 'balding',
    hairColor: '#e2e8f0',
    facialHair: 'none',
    glasses: 'none',
    attire: 'white_kurta',
    attireColor: '#ffffff',
    specialFeature: 'tilak'
  },
  // CRIM-IN-027: Dhananjoy Chatterjee
  'CRIM-IN-027': {
    skinTone: '#ba855f',
    faceShape: 'lean',
    hairStyle: 'short',
    hairColor: '#111111',
    facialHair: 'stubble',
    glasses: 'none',
    attire: 'prison_uniform',
    attireColor: '#ea580c'
  },
  // CRIM-IN-028: Hafiz Saeed
  'CRIM-IN-028': {
    skinTone: '#cb9c78',
    faceShape: 'round',
    hairStyle: 'turban',
    hairColor: '#ffffff',
    headwearColor: '#ffffff',
    facialHair: 'henna_beard',
    glasses: 'spectacles',
    attire: 'white_kurta',
    attireColor: '#f8fafc'
  },
  // CRIM-IN-029: Maulana Masood Azhar
  'CRIM-IN-029': {
    skinTone: '#c79873',
    faceShape: 'round',
    hairStyle: 'turban',
    hairColor: '#1e293b',
    headwearColor: '#0f172a',
    facialHair: 'dense_beard',
    glasses: 'none',
    attire: 'pathani_suit',
    attireColor: '#1e293b'
  },
  // CRIM-IN-030: Zakiur Rehman Lakhvi
  'CRIM-IN-030': {
    skinTone: '#c2926c',
    faceShape: 'oval',
    hairStyle: 'short',
    hairColor: '#111111',
    facialHair: 'dense_beard',
    glasses: 'none',
    attire: 'pathani_suit',
    attireColor: '#334155'
  },
  // CRIM-IN-031: Syed Salahuddin
  'CRIM-IN-031': {
    skinTone: '#c99a76',
    faceShape: 'oval',
    hairStyle: 'short',
    hairColor: '#94a3b8',
    facialHair: 'grey_beard',
    glasses: 'none',
    attire: 'white_kurta',
    attireColor: '#475569'
  },
  // CRIM-IN-032: Gurpatwant Singh Pannun
  'CRIM-IN-032': {
    skinTone: '#be8c65',
    faceShape: 'square',
    hairStyle: 'turban',
    hairColor: '#111111',
    headwearColor: '#0f172a',
    facialHair: 'dense_beard',
    glasses: 'spectacles',
    attire: 'mafia_suit',
    attireColor: '#1e293b'
  },
  // CRIM-IN-033: Anandpal Singh
  'CRIM-IN-033': {
    skinTone: '#b5825a',
    faceShape: 'angular',
    hairStyle: 'turban',
    hairColor: '#111111',
    headwearColor: '#b45309',
    facialHair: 'giant_handlebar',
    glasses: 'none',
    attire: 'casual_jacket',
    attireColor: '#451a03'
  },
  // CRIM-IN-034: Sohrabuddin Sheikh
  'CRIM-IN-034': {
    skinTone: '#b37f57',
    faceShape: 'square',
    hairStyle: 'short',
    hairColor: '#111111',
    facialHair: 'underworld_mustache',
    glasses: 'none',
    attire: 'casual_jacket',
    attireColor: '#1e293b'
  },
  // CRIM-IN-035: Surinder Koli
  'CRIM-IN-035': {
    skinTone: '#8e5936',
    faceShape: 'lean',
    hairStyle: 'short',
    hairColor: '#111111',
    facialHair: 'none',
    glasses: 'none',
    attire: 'prison_uniform',
    attireColor: '#ea580c'
  },
  // CRIM-IN-036: Moninder Singh Pandher
  'CRIM-IN-036': {
    skinTone: '#c79772',
    faceShape: 'round',
    hairStyle: 'turban',
    hairColor: '#64748b',
    headwearColor: '#334155',
    facialHair: 'grey_beard',
    glasses: 'spectacles',
    attire: 'mafia_suit',
    attireColor: '#1e293b'
  },
  // CRIM-IN-037: Cyanide Mohan
  'CRIM-IN-037': {
    skinTone: '#945e39',
    faceShape: 'round',
    hairStyle: 'balding',
    hairColor: '#1e293b',
    facialHair: 'underworld_mustache',
    glasses: 'spectacles',
    attire: 'casual_jacket',
    attireColor: '#334155'
  },
  // CRIM-IN-038: Cyanide Mallika
  'CRIM-IN-038': {
    skinTone: '#875130',
    faceShape: 'round',
    hairStyle: 'female_tied',
    hairColor: '#111111',
    facialHair: 'none',
    glasses: 'none',
    attire: 'saree',
    attireColor: '#991b1b',
    specialFeature: 'tilak'
  },
  // CRIM-IN-039: Devender Sharma
  'CRIM-IN-039': {
    skinTone: '#bc8a64',
    faceShape: 'oval',
    hairStyle: 'balding',
    hairColor: '#64748b',
    facialHair: 'none',
    glasses: 'spectacles',
    attire: 'doctor_coat',
    attireColor: '#ffffff'
  },
  // CRIM-IN-040: Billa
  'CRIM-IN-040': {
    skinTone: '#ba8760',
    faceShape: 'angular',
    hairStyle: 'curly',
    hairColor: '#111111',
    facialHair: 'stubble',
    glasses: 'none',
    attire: 'prison_uniform',
    attireColor: '#ea580c'
  },
  // CRIM-IN-041: Ranga
  'CRIM-IN-041': {
    skinTone: '#af7b54',
    faceShape: 'square',
    hairStyle: 'short',
    hairColor: '#111111',
    facialHair: 'underworld_mustache',
    glasses: 'none',
    attire: 'prison_uniform',
    attireColor: '#ea580c'
  },
  // CRIM-IN-046: Neeraj Bawana
  'CRIM-IN-046': {
    skinTone: '#bc8a63',
    faceShape: 'square',
    hairStyle: 'short',
    hairColor: '#111111',
    facialHair: 'stubble',
    glasses: 'none',
    attire: 'tactical_hoodie',
    attireColor: '#0f172a',
    specialFeature: 'scowl'
  },
  // CRIM-IN-047: Kala Jathedi
  'CRIM-IN-047': {
    skinTone: '#b5825a',
    faceShape: 'round',
    hairStyle: 'short',
    hairColor: '#1a1a1a',
    facialHair: 'underworld_mustache',
    glasses: 'none',
    attire: 'casual_jacket',
    attireColor: '#1e293b'
  },
  // CRIM-IN-048: Jitender Gogi
  'CRIM-IN-048': {
    skinTone: '#bb8861',
    faceShape: 'square',
    hairStyle: 'short',
    hairColor: '#111111',
    facialHair: 'stubble',
    glasses: 'none',
    attire: 'casual_jacket',
    attireColor: '#334155'
  },
  // CRIM-IN-049: Tillu Tajpuria
  'CRIM-IN-049': {
    skinTone: '#b8845e',
    faceShape: 'round',
    hairStyle: 'short',
    hairColor: '#111111',
    facialHair: 'underworld_mustache',
    glasses: 'none',
    attire: 'casual_jacket',
    attireColor: '#1e293b'
  }
};

/**
 * Builds a deterministic SVG Biometric Police Mugshot Data URI based on criminal properties.
 * 100% self-contained, zero external network dependency, always visible.
 */
export function generateCriminalMugshotSvg(criminal: {
  id: string;
  name: string;
  alias?: string;
  gender?: 'men' | 'women';
  status?: string;
  dangerLevel?: string;
}): string {
  const customConfig = CRIMINAL_FEATURE_MAP[criminal.id] || {};
  
  // Default values based on ID / Hash for consistent portraits
  const hash = criminal.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const isFemale = criminal.gender === 'women' || criminal.name.toLowerCase().includes('devi') || criminal.name.toLowerCase().includes('mallika') || criminal.name.toLowerCase().includes('shabnam');
  
  const skinTone = customConfig.skinTone || (isFemale ? '#875130' : (hash % 3 === 0 ? '#b8865f' : hash % 3 === 1 ? '#a8734c' : '#c99974'));
  const faceShape = customConfig.faceShape || (hash % 4 === 0 ? 'square' : hash % 4 === 1 ? 'oval' : hash % 4 === 2 ? 'round' : 'angular');
  const hairStyle = customConfig.hairStyle || (isFemale ? 'female_tied' : (hash % 6 === 0 ? 'short' : hash % 6 === 1 ? 'slicked' : hash % 6 === 2 ? 'balding' : hash % 6 === 3 ? 'turban' : hash % 6 === 4 ? 'curly' : 'receding'));
  const hairColor = customConfig.hairColor || '#141414';
  const headwearColor = customConfig.headwearColor || '#0f172a';
  const facialHair = customConfig.facialHair || (isFemale ? 'none' : (hash % 4 === 0 ? 'underworld_mustache' : hash % 4 === 1 ? 'dense_beard' : hash % 4 === 2 ? 'stubble' : 'none'));
  const glasses = customConfig.glasses || (hash % 5 === 0 ? 'spectacles' : 'none');
  const attire = customConfig.attire || (isFemale ? (criminal.name.toLowerCase().includes('phoolan') ? 'bandit_vest' : 'saree') : (hash % 4 === 0 ? 'mafia_suit' : hash % 4 === 1 ? 'tactical_hoodie' : hash % 4 === 2 ? 'white_kurta' : 'casual_jacket'));
  const attireColor = customConfig.attireColor || '#1e293b';
  const specialFeature = customConfig.specialFeature || (isFemale ? 'tilak' : 'scowl');

  // Status colors
  const status = criminal.status || 'WANTED';
  const statusColor = status === 'WANTED' ? '#ef4444' : status === 'INCARCERATED' ? '#f59e0b' : status === 'DECEASED' ? '#64748b' : '#10b981';

  // SVG Construction
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="100%" height="100%">
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#141c2b" />
      <stop offset="60%" stop-color="#0c121e" />
      <stop offset="100%" stop-color="#070a10" />
    </linearGradient>
    
    <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${skinTone}" />
      <stop offset="100%" stop-color="${darkenColor(skinTone, 25)}" />
    </linearGradient>

    <linearGradient id="clothGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${attireColor}" />
      <stop offset="100%" stop-color="${darkenColor(attireColor, 35)}" />
    </linearGradient>

    <pattern id="policeGrid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" stroke-width="0.8" opacity="0.6" />
    </pattern>
    
    <radialGradient id="vignette" cx="50%" cy="50%" r="65%">
      <stop offset="60%" stop-color="transparent" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.85)" />
    </radialGradient>
  </defs>

  <!-- Background Screen -->
  <rect width="400" height="520" fill="url(#bgGrad)" />
  <rect width="400" height="520" fill="url(#policeGrid)" />

  <!-- Police Lineup Height Marks -->
  <g opacity="0.4" stroke="#38bdf8" stroke-width="1.2">
    <!-- 6'6" (Y=90) -->
    <line x1="20" y1="90" x2="60" y2="90" stroke-width="2" />
    <line x1="340" y1="90" x2="380" y2="90" stroke-width="2" />
    <text x="35" y="85" fill="#38bdf8" font-family="monospace" font-size="10" font-weight="bold">6'6"</text>
    
    <!-- 6'0" (Y=130) -->
    <line x1="20" y1="130" x2="70" y2="130" stroke-width="2" />
    <line x1="330" y1="130" x2="380" y2="130" stroke-width="2" />
    <text x="35" y="125" fill="#38bdf8" font-family="monospace" font-size="10" font-weight="bold">6'0"</text>

    <!-- 5'6" (Y=170) -->
    <line x1="20" y1="170" x2="60" y2="170" stroke-width="1.5" />
    <line x1="340" y1="170" x2="380" y2="170" stroke-width="1.5" />
    <text x="35" y="165" fill="#38bdf8" font-family="monospace" font-size="10" font-weight="bold">5'6"</text>

    <!-- 5'0" (Y=210) -->
    <line x1="20" y1="210" x2="70" y2="210" stroke-width="2" />
    <line x1="330" y1="210" x2="380" y2="210" stroke-width="2" />
    <text x="35" y="205" fill="#38bdf8" font-family="monospace" font-size="10" font-weight="bold">5'0"</text>

    <!-- Sub-divisions -->
    <line x1="20" y1="110" x2="45" y2="110" opacity="0.6" />
    <line x1="355" y1="110" x2="380" y2="110" opacity="0.6" />
    <line x1="20" y1="150" x2="45" y2="150" opacity="0.6" />
    <line x1="355" y1="150" x2="380" y2="150" opacity="0.6" />
    <line x1="20" y1="190" x2="45" y2="190" opacity="0.6" />
    <line x1="355" y1="190" x2="380" y2="190" opacity="0.6" />
  </g>

  <!-- Biometric HUD Targeting Rings in Top Corners -->
  <g opacity="0.35">
    <circle cx="50" cy="45" r="18" fill="none" stroke="#06b6d4" stroke-dasharray="3,3" />
    <circle cx="50" cy="45" r="8" fill="none" stroke="#06b6d4" />
    <text x="75" y="48" fill="#06b6d4" font-family="monospace" font-size="8" letter-spacing="1">BIO-MATCH 98.4%</text>

    <circle cx="350" cy="45" r="18" fill="none" stroke="#ef4444" stroke-dasharray="4,2" />
    <text x="240" y="48" fill="#ef4444" font-family="monospace" font-size="8" letter-spacing="1">REC-STATUS: POSITIVE</text>
  </g>

  <!-- SUBJECT BODY & SHOULDERS -->
  <g id="bodyGroup">
    <!-- Shoulder & Torso Base -->
    <path d="M 60 440 L 90 320 Q 140 285 200 285 Q 260 285 310 320 L 340 440 Z" fill="url(#clothGrad)" stroke="#090d16" stroke-width="3" />

    <!-- Specific Attire Details -->
    ${renderAttireDetails(attire, attireColor)}

    <!-- Neck -->
    <path d="M 165 240 L 165 295 Q 200 315 235 295 L 235 240 Z" fill="url(#skinGrad)" stroke="${darkenColor(skinTone, 40)}" stroke-width="1.5" />
    <!-- Neck shadow / collarbone -->
    <path d="M 180 290 Q 200 302 220 290" fill="none" stroke="${darkenColor(skinTone, 40)}" stroke-width="2" opacity="0.6" />
  </g>

  <!-- SUBJECT HEAD & FACE -->
  <g id="headGroup">
    <!-- Ears -->
    <ellipse cx="128" cy="188" rx="14" ry="24" fill="url(#skinGrad)" stroke="${darkenColor(skinTone, 35)}" stroke-width="1.5" />
    <ellipse cx="272" cy="188" rx="14" ry="24" fill="url(#skinGrad)" stroke="${darkenColor(skinTone, 35)}" stroke-width="1.5" />
    <path d="M 127 180 Q 132 188 128 196" fill="none" stroke="${darkenColor(skinTone, 40)}" stroke-width="1.5" />
    <path d="M 273 180 Q 268 188 272 196" fill="none" stroke="${darkenColor(skinTone, 40)}" stroke-width="1.5" />

    <!-- Face Base according to faceShape -->
    ${renderFaceShape(faceShape, skinTone)}

    <!-- Cheekbones / Contouring Shadows -->
    <path d="M 148 180 Q 155 215 168 235" fill="none" stroke="${darkenColor(skinTone, 25)}" stroke-width="2" opacity="0.4" />
    <path d="M 252 180 Q 245 215 232 235" fill="none" stroke="${darkenColor(skinTone, 25)}" stroke-width="2" opacity="0.4" />

    <!-- Eyebrows -->
    <path d="M 150 152 Q 170 146 186 153" fill="none" stroke="${hairColor}" stroke-width="4.5" stroke-linecap="round" />
    <path d="M 250 152 Q 230 146 214 153" fill="none" stroke="${hairColor}" stroke-width="4.5" stroke-linecap="round" />

    <!-- Eyes -->
    <g id="eyes">
      <!-- Left Eye -->
      <ellipse cx="168" cy="165" rx="13" ry="7" fill="#f8fafc" stroke="${darkenColor(skinTone, 50)}" stroke-width="1.5" />
      <circle cx="168" cy="165" r="5" fill="#18181b" />
      <circle cx="166" cy="163" r="1.5" fill="#ffffff" />
      <!-- Left Eyelid crease -->
      <path d="M 154 158 Q 168 153 182 158" fill="none" stroke="${darkenColor(skinTone, 40)}" stroke-width="1.2" opacity="0.7" />

      <!-- Right Eye -->
      <ellipse cx="232" cy="165" rx="13" ry="7" fill="#f8fafc" stroke="${darkenColor(skinTone, 50)}" stroke-width="1.5" />
      <circle cx="232" cy="165" r="5" fill="#18181b" />
      <circle cx="230" cy="163" r="1.5" fill="#ffffff" />
      <!-- Right Eyelid crease -->
      <path d="M 218 158 Q 232 153 246 158" fill="none" stroke="${darkenColor(skinTone, 40)}" stroke-width="1.2" opacity="0.7" />
    </g>

    <!-- Nose -->
    <path d="M 200 155 L 195 198 Q 186 206 193 210 Q 200 213 207 210 Q 214 206 205 198 L 201 155" fill="${darkenColor(skinTone, 15)}" stroke="${darkenColor(skinTone, 40)}" stroke-width="1.5" />
    <!-- Nostrils -->
    <circle cx="193" cy="208" r="2.2" fill="#1f140e" />
    <circle cx="207" cy="208" r="2.2" fill="#1f140e" />

    <!-- Mouth & Lips -->
    <path d="M 180 234 Q 200 231 220 234" fill="none" stroke="${darkenColor(skinTone, 50)}" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 184 234 Q 200 242 216 234" fill="${darkenColor(skinTone, 20)}" stroke="${darkenColor(skinTone, 45)}" stroke-width="1" opacity="0.8" />

    <!-- Special Features (Tilak, Scowl, Wrinkles, Earrings) -->
    ${renderSpecialFeatures(specialFeature, isFemale, skinTone)}

    <!-- Facial Hair (Mustache / Beard / Handlebar) -->
    ${renderFacialHair(facialHair, hairColor)}

    <!-- Hair or Headwear (Turban, Beret, Topi, etc.) -->
    ${renderHairOrHeadwear(hairStyle, hairColor, headwearColor, isFemale)}

    <!-- Glasses / Aviators -->
    ${renderGlasses(glasses)}
  </g>

  <!-- Biometric Mesh Overlays -->
  <g opacity="0.25" stroke="#38bdf8" stroke-width="0.7" fill="none">
    <line x1="168" y1="165" x2="232" y2="165" stroke-dasharray="2,2" />
    <line x1="200" y1="140" x2="200" y2="250" stroke-dasharray="2,2" />
    <circle cx="200" cy="165" r="45" stroke-dasharray="4,4" />
    <rect x="140" y="135" width="120" height="125" rx="10" stroke-dasharray="3,3" />
  </g>

  <!-- Vignette Glow -->
  <rect width="400" height="520" fill="url(#vignette)" pointer-events="none" />

  <!-- POLICE CRIMINAL SLATE / ID PLACARD -->
  <g id="policeSlate" transform="translate(30, 395)">
    <!-- Slate Background -->
    <rect width="340" height="105" rx="6" fill="#090d16" stroke="#223049" stroke-width="2" />
    <rect x="4" y="4" width="332" height="97" rx="4" fill="#0f172a" stroke="#334155" stroke-width="1" />

    <!-- Top Agency Header -->
    <rect x="5" y="5" width="330" height="22" fill="#090d16" />
    <text x="170" y="19" fill="#94a3b8" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle" letter-spacing="2">
      NATIONAL CRIME RECORDS BUREAU // TASC
    </text>

    <!-- Criminal Name -->
    <text x="170" y="46" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="800" text-anchor="middle">
      ${escapeXml(truncateText(criminal.name.toUpperCase(), 28))}
    </text>

    <!-- Alias / Identifier -->
    <text x="170" y="64" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">
      ALIAS: "${escapeXml(truncateText(criminal.alias || 'UNKNOWN', 30))}"
    </text>

    <!-- Bottom ID and Status Badge Bar -->
    <line x1="15" y1="74" x2="325" y2="74" stroke="#1e293b" stroke-width="1" />
    
    <text x="20" y="91" fill="#cbd5e1" font-family="monospace" font-size="11" font-weight="bold">
      ${criminal.id}
    </text>

    <!-- Status Pill Box -->
    <rect x="235" y="79" width="90" height="18" rx="3" fill="${statusColor}" fill-opacity="0.2" stroke="${statusColor}" stroke-width="1" />
    <text x="280" y="92" fill="${statusColor}" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">
      ${status}
    </text>
  </g>

  <!-- Outer Frame Border -->
  <rect x="4" y="4" width="392" height="512" fill="none" stroke="#1e293b" stroke-width="2" />
  <!-- Corner Tactical Brackets -->
  <path d="M 6 24 L 6 6 L 24 6" fill="none" stroke="#38bdf8" stroke-width="2.5" />
  <path d="M 376 6 L 394 6 L 394 24" fill="none" stroke="#38bdf8" stroke-width="2.5" />
  <path d="M 6 496 L 6 514 L 24 514" fill="none" stroke="#38bdf8" stroke-width="2.5" />
  <path d="M 376 514 L 394 514 L 394 496" fill="none" stroke="#38bdf8" stroke-width="2.5" />
</svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Sub-renderers for Facial & Attire Components
function renderFaceShape(shape: string, skinTone: string): string {
  const borderCol = darkenColor(skinTone, 40);
  switch (shape) {
    case 'square':
      return `<path d="M 135 150 Q 135 100 200 100 Q 265 100 265 150 L 265 210 Q 265 258 200 265 Q 135 258 135 210 Z" fill="url(#skinGrad)" stroke="${borderCol}" stroke-width="2" />`;
    case 'round':
      return `<path d="M 130 160 Q 130 100 200 100 Q 270 100 270 160 Q 270 265 200 265 Q 130 265 130 160 Z" fill="url(#skinGrad)" stroke="${borderCol}" stroke-width="2" />`;
    case 'lean':
      return `<path d="M 140 150 Q 140 100 200 100 Q 260 100 260 150 L 255 210 Q 245 268 200 272 Q 155 268 145 210 Z" fill="url(#skinGrad)" stroke="${borderCol}" stroke-width="2" />`;
    case 'angular':
      return `<path d="M 136 150 Q 138 100 200 100 Q 262 100 264 150 L 260 215 L 200 268 L 140 215 Z" fill="url(#skinGrad)" stroke="${borderCol}" stroke-width="2" />`;
    case 'oval':
    default:
      return `<ellipse cx="200" cy="180" rx="66" ry="85" fill="url(#skinGrad)" stroke="${borderCol}" stroke-width="2" />`;
  }
}

function renderAttireDetails(attire: string, color: string): string {
  switch (attire) {
    case 'mafia_suit':
      return `
        <!-- White Shirt Collar -->
        <polygon points="175,290 200,340 225,290 215,280 185,280" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" />
        <!-- Red/Dark Tie -->
        <polygon points="195,310 205,310 208,390 200,410 192,390" fill="#991b1b" stroke="#7f1d1d" stroke-width="1.5" />
        <!-- Suit Lapels -->
        <path d="M 145 295 L 180 375 L 140 440" fill="none" stroke="#090d16" stroke-width="4" />
        <path d="M 255 295 L 220 375 L 260 440" fill="none" stroke="#090d16" stroke-width="4" />
        <!-- Pocket Square -->
        <rect x="250" y="360" width="22" height="6" fill="#f8fafc" />
      `;
    case 'jungle_camo':
      return `
        <!-- Camo Fatigue Patterns -->
        <path d="M 100 340 Q 130 360 110 390 Q 90 410 120 440" fill="#1e2d19" opacity="0.7" />
        <path d="M 280 340 Q 250 360 270 390 Q 300 410 270 440" fill="#2d3d24" opacity="0.7" />
        <path d="M 180 330 Q 200 350 185 390" fill="#473a24" opacity="0.7" />
        <!-- Bandolier Ammo Strap -->
        <path d="M 100 320 L 290 440" stroke="#78350f" stroke-width="16" />
        <line x1="120" y1="332" x2="270" y2="428" stroke="#ca8a04" stroke-width="8" stroke-dasharray="6,6" />
      `;
    case 'bandit_vest':
      return `
        <!-- Bandolier Straps Crossed -->
        <line x1="90" y1="320" x2="300" y2="440" stroke="#451a03" stroke-width="16" />
        <line x1="110" y1="332" x2="280" y2="428" stroke="#eab308" stroke-width="8" stroke-dasharray="5,5" />
        <line x1="310" y1="320" x2="100" y2="440" stroke="#451a03" stroke-width="16" />
        <line x1="290" y1="332" x2="120" y2="428" stroke="#eab308" stroke-width="8" stroke-dasharray="5,5" />
      `;
    case 'terrorist_tee':
      return `
        <!-- Crewneck collar -->
        <path d="M 165 295 Q 200 325 235 295" fill="none" stroke="#1e293b" stroke-width="5" />
        <!-- Chest logo / print -->
        <circle cx="200" cy="360" r="15" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.4" />
      `;
    case 'tactical_hoodie':
      return `
        <!-- Hoodie Neck & Drawstrings -->
        <path d="M 155 290 Q 200 340 245 290" fill="none" stroke="#090d16" stroke-width="7" />
        <path d="M 175 320 L 175 375" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
        <path d="M 225 320 L 225 375" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" />
      `;
    case 'white_kurta':
      return `
        <!-- Kurta Mandarin Collar -->
        <path d="M 175 285 L 175 370" stroke="#cbd5e1" stroke-width="2" />
        <circle cx="175" cy="310" r="2.5" fill="#64748b" />
        <circle cx="175" cy="335" r="2.5" fill="#64748b" />
        <circle cx="175" cy="360" r="2.5" fill="#64748b" />
      `;
    case 'doctor_coat':
      return `
        <!-- Stethoscope & White Coat Lapels -->
        <polygon points="175,290 200,340 225,290" fill="#38bdf8" />
        <path d="M 160 300 Q 200 400 240 300" fill="none" stroke="#0284c7" stroke-width="5" />
        <circle cx="200" cy="380" r="8" fill="#94a3b8" stroke="#0284c7" stroke-width="2" />
      `;
    case 'prison_uniform':
      return `
        <!-- Inmate Jumpsuit Collar & Chest ID -->
        <path d="M 165 295 Q 200 330 235 295" fill="none" stroke="#7c2d12" stroke-width="4" />
        <rect x="230" y="340" width="50" height="20" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
        <text x="255" y="354" fill="#000000" font-family="monospace" font-size="8" font-weight="bold" text-anchor="middle">PRISONER</text>
      `;
    case 'saree':
      return `
        <!-- Saree Pallu across shoulder -->
        <path d="M 120 440 L 260 290 Q 290 320 280 440 Z" fill="#7f1d1d" stroke="#581c87" stroke-width="2" />
        <!-- Gold Saree Border -->
        <path d="M 120 440 L 260 290" stroke="#facc15" stroke-width="4" />
      `;
    case 'safari_suit':
    default:
      return `
        <!-- Safari Suit V-neck & Pocket flaps -->
        <polygon points="175,290 200,340 225,290 215,280 185,280" fill="none" stroke="#1f2937" stroke-width="3" />
        <rect x="120" y="350" width="35" height="15" fill="${darkenColor(color, 20)}" stroke="#1f2937" stroke-width="1.5" />
        <rect x="245" y="350" width="35" height="15" fill="${darkenColor(color, 20)}" stroke="#1f2937" stroke-width="1.5" />
      `;
  }
}

function renderFacialHair(style: string, color: string): string {
  switch (style) {
    case 'giant_handlebar': // Veerappan
      return `
        <g id="giantHandlebar">
          <!-- Massive sweeping thick mustache extending past cheeks -->
          <path d="M 195 220 Q 150 205 105 185 Q 115 220 170 235 Q 200 240 230 235 Q 285 220 295 185 Q 250 205 205 220 Z" fill="${color}" stroke="#000000" stroke-width="1.5" />
        </g>
      `;
    case 'underworld_mustache': // Dawood / Tiger Memon
      return `
        <g id="underworldMustache">
          <path d="M 172 224 Q 200 218 228 224 Q 235 234 220 237 Q 200 232 180 237 Q 165 234 172 224 Z" fill="${color}" stroke="#000000" stroke-width="1" />
        </g>
      `;
    case 'dense_beard': // Afzal Guru / Goldy Brar / Yasin Bhatkal
      return `
        <g id="denseBeard">
          <path d="M 140 185 Q 135 260 200 280 Q 265 260 260 185 Q 255 240 235 245 Q 200 248 165 245 Q 145 240 140 185 Z" fill="${color}" opacity="0.95" />
          <path d="M 170 222 Q 200 216 230 222 Q 235 234 200 236 Q 165 234 170 222 Z" fill="${color}" />
        </g>
      `;
    case 'henna_beard': // Hafiz Saeed
      return `
        <g id="hennaBeard">
          <path d="M 140 185 Q 135 265 200 285 Q 265 265 260 185 Q 255 240 235 245 Q 200 248 165 245 Q 145 240 140 185 Z" fill="#b45309" opacity="0.95" />
          <path d="M 170 222 Q 200 216 230 222 Q 235 234 200 236 Q 165 234 170 222 Z" fill="#b45309" />
        </g>
      `;
    case 'grey_beard': // Karim Lala / Mukhtar Ansari
      return `
        <g id="greyBeard">
          <path d="M 138 185 Q 130 270 200 290 Q 270 270 262 185 Q 255 240 235 245 Q 200 248 165 245 Q 145 240 138 185 Z" fill="#94a3b8" opacity="0.95" />
          <path d="M 168 220 Q 200 214 232 220 Q 238 234 200 236 Q 162 234 168 220 Z" fill="#94a3b8" />
        </g>
      `;
    case 'goatee': // Kasab
      return `
        <g id="goatee">
          <ellipse cx="200" cy="254" rx="12" ry="10" fill="${color}" />
          <path d="M 180 225 Q 200 220 220 225 Q 215 232 200 230 Q 185 232 180 225 Z" fill="${color}" />
        </g>
      `;
    case 'stubble':
      return `
        <g id="stubble" opacity="0.4">
          <path d="M 145 200 Q 140 255 200 265 Q 260 255 255 200 Q 245 245 200 248 Q 155 245 145 200 Z" fill="${color}" />
        </g>
      `;
    case 'none':
    default:
      return '';
  }
}

function renderHairOrHeadwear(style: string, hairColor: string, headwearColor: string, isFemale: boolean): string {
  switch (style) {
    case 'turban': // Sikh turban or Pathani turban
      return `
        <g id="turban">
          <!-- Main Turban Wrap -->
          <ellipse cx="200" cy="115" rx="80" ry="45" fill="${headwearColor}" stroke="#090d16" stroke-width="2" />
          <path d="M 125 130 Q 200 75 275 130 Q 255 160 200 145 Q 145 160 125 130 Z" fill="${headwearColor}" stroke="#090d16" stroke-width="2" />
          <path d="M 160 100 Q 200 135 240 100" fill="none" stroke="${darkenColor(headwearColor, 20)}" stroke-width="3" />
        </g>
      `;
    case 'topi': // Arun Gawli White Topi
      return `
        <g id="gandhiTopi">
          <path d="M 130 135 Q 200 85 270 135 L 265 148 Q 200 115 135 148 Z" fill="${headwearColor}" stroke="#64748b" stroke-width="2" />
        </g>
      `;
    case 'bandana': // Phoolan Devi Red Bandana
      return `
        <g id="banditBandana">
          <path d="M 125 155 Q 200 110 275 155 L 275 135 Q 200 95 125 135 Z" fill="${headwearColor}" stroke="#7f1d1d" stroke-width="2" />
          <!-- Flowing dark hair under headband -->
          <path d="M 125 150 Q 110 210 115 260 L 135 260 Q 130 200 135 160 Z" fill="${hairColor}" />
          <path d="M 275 150 Q 290 210 285 260 L 265 260 Q 270 200 265 160 Z" fill="${hairColor}" />
        </g>
      `;
    case 'beret': // Charles Sobhraj
      return `
        <g id="beret">
          <ellipse cx="195" cy="115" rx="78" ry="32" fill="${headwearColor}" transform="rotate(-8 195 115)" stroke="#090d16" stroke-width="2" />
          <circle cx="190" cy="85" r="4" fill="${headwearColor}" />
        </g>
      `;
    case 'female_tied':
      return `
        <g id="femaleTiedHair">
          <path d="M 130 160 Q 130 85 200 85 Q 270 85 270 160 Q 240 120 200 120 Q 160 120 130 160 Z" fill="${hairColor}" stroke="#090d16" stroke-width="1.5" />
          <!-- Bun in Back -->
          <circle cx="200" cy="80" r="22" fill="${hairColor}" />
        </g>
      `;
    case 'slicked':
      return `
        <g id="slickedHair">
          <path d="M 132 155 Q 130 85 200 85 Q 270 85 268 155 Q 250 115 200 112 Q 150 115 132 155 Z" fill="${hairColor}" stroke="#090d16" stroke-width="1.5" />
        </g>
      `;
    case 'curly':
      return `
        <g id="curlyHair">
          <circle cx="140" cy="120" r="18" fill="${hairColor}" />
          <circle cx="165" cy="100" r="20" fill="${hairColor}" />
          <circle cx="200" cy="92" r="22" fill="${hairColor}" />
          <circle cx="235" cy="100" r="20" fill="${hairColor}" />
          <circle cx="260" cy="120" r="18" fill="${hairColor}" />
          <path d="M 130 155 Q 130 90 200 90 Q 270 90 270 155 Q 250 120 200 118 Q 150 120 130 155 Z" fill="${hairColor}" />
        </g>
      `;
    case 'balding':
      return `
        <g id="baldingHair">
          <!-- Hair only on sides -->
          <path d="M 130 145 Q 125 180 132 205 Q 138 180 142 155 Z" fill="${hairColor}" />
          <path d="M 270 145 Q 275 180 268 205 Q 262 180 258 155 Z" fill="${hairColor}" />
          <ellipse cx="200" cy="115" rx="55" ry="18" fill="url(#skinGrad)" />
        </g>
      `;
    case 'wild':
      return `
        <g id="wildHair">
          <path d="M 120 160 L 110 110 L 140 120 L 160 80 L 190 100 L 205 70 L 225 100 L 255 80 L 270 120 L 290 110 L 280 160 Q 250 120 200 120 Q 150 120 120 160 Z" fill="${hairColor}" stroke="#090d16" stroke-width="1.5" />
        </g>
      `;
    case 'receding':
    case 'short':
    default:
      return `
        <g id="shortHair">
          <path d="M 132 150 Q 132 92 200 92 Q 268 92 268 150 Q 248 118 200 118 Q 152 118 132 150 Z" fill="${hairColor}" stroke="#090d16" stroke-width="1.5" />
        </g>
      `;
  }
}

function renderGlasses(type: string): string {
  switch (type) {
    case 'aviators': // Dawood / Manya Surve / Sobhraj
      return `
        <g id="aviatorGlasses">
          <!-- Left Lens (Teardrop Aviator Shape) -->
          <path d="M 148 155 Q 170 152 184 156 L 182 178 Q 165 192 148 178 Z" fill="#0f172a" fill-opacity="0.88" stroke="#ca8a04" stroke-width="2.5" />
          <!-- Right Lens -->
          <path d="M 216 156 Q 230 152 252 155 L 252 178 Q 235 192 218 178 Z" fill="#0f172a" fill-opacity="0.88" stroke="#ca8a04" stroke-width="2.5" />
          <!-- Bridge Bar -->
          <line x1="184" y1="156" x2="216" y2="156" stroke="#ca8a04" stroke-width="2.5" />
          <line x1="182" y1="152" x2="218" y2="152" stroke="#ca8a04" stroke-width="1.5" />
          <!-- Specular Reflections -->
          <line x1="154" y1="160" x2="166" y2="174" stroke="#ffffff" stroke-width="2" opacity="0.6" stroke-linecap="round" />
          <line x1="222" y1="160" x2="234" y2="174" stroke="#ffffff" stroke-width="2" opacity="0.6" stroke-linecap="round" />
        </g>
      `;
    case 'spectacles': // Vikas Dubey / Telgi / Devender Sharma
      return `
        <g id="spectacles">
          <rect x="148" y="152" width="36" height="26" rx="4" fill="none" stroke="#334155" stroke-width="2.5" />
          <rect x="216" y="152" width="36" height="26" rx="4" fill="none" stroke="#334155" stroke-width="2.5" />
          <line x1="184" y1="162" x2="216" y2="162" stroke="#334155" stroke-width="2" />
        </g>
      `;
    case 'tinted':
      return `
        <g id="tintedGlasses">
          <rect x="145" y="155" width="40" height="22" rx="4" fill="#1e1b4b" fill-opacity="0.8" stroke="#6366f1" stroke-width="2" />
          <rect x="215" y="155" width="40" height="22" rx="4" fill="#1e1b4b" fill-opacity="0.8" stroke="#6366f1" stroke-width="2" />
          <line x1="185" y1="165" x2="215" y2="165" stroke="#6366f1" stroke-width="2" />
        </g>
      `;
    case 'none':
    default:
      return '';
  }
}

function renderSpecialFeatures(feature: string, isFemale: boolean, skinTone: string): string {
  switch (feature) {
    case 'tilak':
      return `
        <!-- Hindu Tilak (Vermilion / Sandalwood mark on forehead) -->
        <path d="M 197 125 L 203 125 L 201 145 L 199 145 Z" fill="#dc2626" />
        <circle cx="200" cy="148" r="3.5" fill="#dc2626" />
      `;
    case 'earrings':
      return `
        <!-- Traditional silver hoops on ears -->
        <circle cx="120" cy="198" r="7" fill="none" stroke="#e2e8f0" stroke-width="2.5" />
        <circle cx="280" cy="198" r="7" fill="none" stroke="#e2e8f0" stroke-width="2.5" />
      `;
    case 'mole':
      return `
        <circle cx="230" cy="205" r="2.5" fill="#1f140e" />
      `;
    case 'wrinkles':
      return `
        <!-- Forehead Wrinkles & Crow's feet -->
        <path d="M 165 125 Q 200 120 235 125" fill="none" stroke="${darkenColor(skinTone, 40)}" stroke-width="1.2" opacity="0.6" />
        <path d="M 160 135 Q 200 130 240 135" fill="none" stroke="${darkenColor(skinTone, 40)}" stroke-width="1.2" opacity="0.6" />
      `;
    case 'bloodshot_eyes':
      return `
        <!-- Dark circles and veins -->
        <path d="M 152 178 Q 168 186 184 178" fill="none" stroke="#7f1d1d" stroke-width="1.5" opacity="0.7" />
        <path d="M 216 178 Q 232 186 248 178" fill="none" stroke="#7f1d1d" stroke-width="1.5" opacity="0.7" />
      `;
    case 'scowl':
    default:
      return `
        <!-- Stern Brow furrow lines -->
        <line x1="196" y1="148" x2="196" y2="158" stroke="${darkenColor(skinTone, 40)}" stroke-width="1.5" opacity="0.6" />
        <line x1="204" y1="148" x2="204" y2="158" stroke="${darkenColor(skinTone, 40)}" stroke-width="1.5" opacity="0.6" />
      `;
  }
}

// Utility Helpers
function darkenColor(hex: string, percent: number): string {
  if (!hex.startsWith('#')) return '#000000';
  let num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) - Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) - Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) - Math.round(255 * (percent / 100));
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function truncateText(text: string, maxLen: number): string {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text;
}

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
