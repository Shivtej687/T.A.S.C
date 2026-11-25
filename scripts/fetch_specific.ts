import fs from 'fs';
import path from 'path';

const SPECIFIC: { id: string; url: string }[] = [
  { id: 'CRIM-IN-055', url: 'https://en.wikipedia.org/api/rest_v1/page/summary/Nirav_Modi' },
  { id: 'CRIM-IN-031', url: 'https://en.wikipedia.org/api/rest_v1/page/summary/Syed_Salahuddin_(militant)' },
  { id: 'CRIM-IN-032', url: 'https://en.wikipedia.org/api/rest_v1/page/summary/Gurpatwant_Singh_Pannun' },
  { id: 'CRIM-IN-054', url: 'https://en.wikipedia.org/api/rest_v1/page/summary/Thug_Behram' },
  { id: 'CRIM-IN-030', url: 'https://en.wikipedia.org/api/rest_v1/page/summary/Zakiur_Rehman_Lakhvi' },
  { id: 'CRIM-IN-027', url: 'https://en.wikipedia.org/api/rest_v1/page/summary/Dhananjoy_Chatterjee' }
];

async function run() {
  for (const s of SPECIFIC) {
    try {
      const res = await fetch(s.url, { headers: { 'User-Agent': 'MidnightVoid/1.0' } });
      const data = await res.json() as any;
      const img = data.originalimage?.source || data.thumbnail?.source;
      if (img) {
        const proxy = `https://wsrv.nl/?url=${encodeURIComponent(img)}&w=480&output=jpg`;
        const imgRes = await fetch(proxy);
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          fs.writeFileSync(path.join(process.cwd(), 'public', 'photos', `${s.id}.jpg`), buf);
          console.log(`Saved ${s.id}`);
        }
      } else {
        console.log(`No img for ${s.id}`);
      }
    } catch (e: any) {
      console.log(`Error ${s.id}:`, e.message);
    }
  }
}

run();
