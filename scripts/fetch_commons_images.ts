import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'photos');

const COMMONS_SEARCH: { id: string; search: string }[] = [
  { id: 'CRIM-IN-010', search: 'Goldy Brar' },
  { id: 'CRIM-IN-014', search: 'Abdul Karim Telgi' },
  { id: 'CRIM-IN-015', search: 'Auto Shankar' },
  { id: 'CRIM-IN-023', search: 'Arun Gawli' },
  { id: 'CRIM-IN-027', search: 'Dhananjoy Chatterjee' },
  { id: 'CRIM-IN-030', search: 'Zakiur Rehman Lakhvi' },
  { id: 'CRIM-IN-031', search: 'Syed Salahuddin' },
  { id: 'CRIM-IN-032', search: 'Gurpatwant Singh Pannun' },
  { id: 'CRIM-IN-034', search: 'Sohrabuddin Sheikh' },
  { id: 'CRIM-IN-035', search: 'Surinder Koli' },
  { id: 'CRIM-IN-036', search: 'Moninder Singh Pandher' },
  { id: 'CRIM-IN-037', search: 'Cyanide Mohan' },
  { id: 'CRIM-IN-038', search: 'Cyanide Mallika' },
  { id: 'CRIM-IN-039', search: 'Devender Sharma' },
  { id: 'CRIM-IN-040', search: 'Billa Ranga' },
  { id: 'CRIM-IN-041', search: 'Geeta Chopra kidnapping' },
  { id: 'CRIM-IN-042', search: 'Joshi Abhyankar' },
  { id: 'CRIM-IN-043', search: 'Joshi Abhyankar serial murders' },
  { id: 'CRIM-IN-044', search: 'Santokh Singh' },
  { id: 'CRIM-IN-045', search: 'Shabnam Ali' },
  { id: 'CRIM-IN-046', search: 'Neeraj Bawana' },
  { id: 'CRIM-IN-047', search: 'Kala Jathedi' },
  { id: 'CRIM-IN-048', search: 'Jitender Gogi' },
  { id: 'CRIM-IN-049', search: 'Tillu Tajpuria' },
  { id: 'CRIM-IN-054', search: 'Thug Behram' },
  { id: 'CRIM-IN-055', search: 'Nirav Modi' },
  { id: 'CRIM-IN-056', search: 'Mehul Choksi' },
  { id: 'CRIM-IN-063', search: 'Sunder Bhati' },
  { id: 'CRIM-IN-064', search: 'Shiv Murat Dwivedi' }
];

async function run() {
  for (const item of COMMONS_SEARCH) {
    const targetFile = path.join(OUTPUT_DIR, `${item.id}.jpg`);
    if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 2000) continue;

    try {
      // Search Wikimedia Commons files
      const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(item.search)}&gsrlimit=3&prop=imageinfo&iiprop=url|size&format=json`;
      const res = await fetch(url, { headers: { 'User-Agent': 'MidnightVoidApp/1.0 (contact@midnightvoid.gov.in)' } });
      const data = await res.json() as any;
      const pages = data.query?.pages || {};

      for (const page of Object.values(pages) as any[]) {
        const fileUrl = page.imageinfo?.[0]?.url;
        if (fileUrl && (fileUrl.endsWith('.jpg') || fileUrl.endsWith('.png') || fileUrl.endsWith('.jpeg'))) {
          const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(fileUrl)}&w=480&output=jpg`;
          const imgRes = await fetch(proxyUrl);
          if (imgRes.ok) {
            const buf = Buffer.from(await imgRes.arrayBuffer());
            if (buf.length > 2000) {
              fs.writeFileSync(targetFile, buf);
              console.log(`[COMMONS SAVED] ${item.id} from ${page.title} (${buf.length} bytes)`);
              break;
            }
          }
        }
      }
    } catch (e: any) {
      console.log(`Error ${item.id}:`, e.message);
    }
  }
}

run();
