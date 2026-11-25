import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'photos');

const EXTRA_MAP: { id: string; query: string }[] = [
  { id: 'CRIM-IN-010', query: 'Goldy Brar' },
  { id: 'CRIM-IN-014', query: 'Abdul Karim Telgi' },
  { id: 'CRIM-IN-015', query: 'Auto Shankar' },
  { id: 'CRIM-IN-023', query: 'Arun Gawli' },
  { id: 'CRIM-IN-027', query: 'Dhananjoy Chatterjee' },
  { id: 'CRIM-IN-030', query: 'Zakiur Rehman Lakhvi' },
  { id: 'CRIM-IN-031', query: 'Syed Salahuddin (militant)' },
  { id: 'CRIM-IN-032', query: 'Gurpatwant Singh Pannun' },
  { id: 'CRIM-IN-034', query: 'Sohrabuddin Sheikh' },
  { id: 'CRIM-IN-035', query: 'Surinder Koli' },
  { id: 'CRIM-IN-036', query: 'Moninder Singh Pandher' },
  { id: 'CRIM-IN-037', query: 'Mohan Kumar (serial killer)' },
  { id: 'CRIM-IN-038', query: 'Cyanide Mallika' },
  { id: 'CRIM-IN-039', query: 'Devender Sharma (doctor)' },
  { id: 'CRIM-IN-040', query: 'Billa and Ranga' },
  { id: 'CRIM-IN-041', query: 'Geeta and Sanjay Chopra kidnapping case' },
  { id: 'CRIM-IN-042', query: 'Joshi-Abhyankar serial murders' },
  { id: 'CRIM-IN-043', query: 'Joshi-Abhyankar serial murders' },
  { id: 'CRIM-IN-044', query: 'Santokh Singh' },
  { id: 'CRIM-IN-045', query: 'Shabnam Ali' },
  { id: 'CRIM-IN-046', query: 'Neeraj Bawana' },
  { id: 'CRIM-IN-047', query: 'Kala Jathedi' },
  { id: 'CRIM-IN-048', query: 'Jitender Gogi' },
  { id: 'CRIM-IN-049', query: 'Tillu Tajpuria' },
  { id: 'CRIM-IN-054', query: 'Thug Behram' },
  { id: 'CRIM-IN-055', query: 'Nirav Modi' },
  { id: 'CRIM-IN-056', query: 'Mehul Choksi' },
  { id: 'CRIM-IN-063', query: 'Sunder Bhati' },
  { id: 'CRIM-IN-064', query: 'Shiv Murat Dwivedi' }
];

async function run() {
  for (const item of EXTRA_MAP) {
    const targetFile = path.join(OUTPUT_DIR, `${item.id}.jpg`);
    if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 2000) continue;

    try {
      // 1. Try opensearch to find exact article title
      const openSearchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(item.query)}&limit=3&namespace=0&format=json`;
      const searchRes = await fetch(openSearchUrl, {
        headers: { 'User-Agent': 'MidnightVoid/1.0 (test@example.com)' }
      });
      const searchData = await searchRes.json() as any;
      const titles = searchData[1] || [];

      for (const title of titles) {
        const sumUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
        const sumRes = await fetch(sumUrl, {
          headers: { 'User-Agent': 'MidnightVoid/1.0 (test@example.com)' }
        });
        if (!sumRes.ok) continue;
        const sumData = await sumRes.json() as any;
        const img = sumData.originalimage?.source || sumData.thumbnail?.source;
        if (img) {
          const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(img)}&w=480&output=jpg`;
          const imgRes = await fetch(proxyUrl);
          if (imgRes.ok) {
            const buf = Buffer.from(await imgRes.arrayBuffer());
            if (buf.length > 2000) {
              fs.writeFileSync(targetFile, buf);
              console.log(`[SAVED] ${item.id} from ${title} (${buf.length} bytes)`);
              break;
            }
          }
        }
      }
    } catch (e: any) {
      console.log(`Error on ${item.id}:`, e.message);
    }
  }
}

run();
