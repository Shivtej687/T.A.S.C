import fs from 'fs';
import path from 'path';

// Exact mapping from Criminal ID to Wikipedia titles or fallback direct photo URLs
const WIKI_TITLE_MAP: Record<string, string[]> = {
  'CRIM-IN-001': ['Dawood_Ibrahim', 'D-Company'],
  'CRIM-IN-002': ['Ajmal_Kasab', '2008_Mumbai_attacks'],
  'CRIM-IN-003': ['Veerappan'],
  'CRIM-IN-004': ['Yakub_Memon', '1993_Bombay_bombings'],
  'CRIM-IN-005': ['Vikas_Dubey'],
  'CRIM-IN-006': ['Afzal_Guru', '2001_Indian_Parliament_attack'],
  'CRIM-IN-007': ['Lawrence_Bishnoi'],
  'CRIM-IN-008': ['Abu_Salem'],
  'CRIM-IN-009': ['Chhota_Rajan'],
  'CRIM-IN-010': ['Goldy_Brar'],
  'CRIM-IN-011': ['Atiq_Ahmed'],
  'CRIM-IN-012': ['Mukhtar_Ansari'],
  'CRIM-IN-013': ['Phoolan_Devi'],
  'CRIM-IN-014': ['Abdul_Karim_Telgi'],
  'CRIM-IN-015': ['Auto_Shankar'],
  'CRIM-IN-016': ['Manya_Surve'],
  'CRIM-IN-017': ['Shootout_at_Lokhandwala', 'Maya_Dolas'],
  'CRIM-IN-018': ['Charles_Sobhraj'],
  'CRIM-IN-019': ['Yasin_Bhatkal', 'Indian_Mujahideen'],
  'CRIM-IN-020': ['Raman_Raghav'],
  'CRIM-IN-021': ['Tiger_Memon'],
  'CRIM-IN-022': ['Chhota_Shakeel'],
  'CRIM-IN-023': ['Arun_Gawli'],
  'CRIM-IN-024': ['Karim_Lala'],
  'CRIM-IN-025': ['Haji_Mastan'],
  'CRIM-IN-026': ['Varadarajan_Mudaliar'],
  'CRIM-IN-027': ['Dhananjoy_Chatterjee'],
  'CRIM-IN-028': ['Hafiz_Saeed'],
  'CRIM-IN-029': ['Masood_Azhar'],
  'CRIM-IN-030': ['Zakiur_Rehman_Lakhvi'],
  'CRIM-IN-031': ['Syed_Salahuddin'],
  'CRIM-IN-032': ['Gurpatwant_Singh_Pannun'],
  'CRIM-IN-033': ['Anandpal_Singh'],
  'CRIM-IN-034': ['Sohrabuddin_Sheikh'],
  'CRIM-IN-035': ['2006_Noida_serial_murders', 'Surinder_Koli'],
  'CRIM-IN-036': ['2006_Noida_serial_murders', 'Moninder_Singh_Pandher'],
  'CRIM-IN-037': ['Mohan_Kumar_(serial_killer)'],
  'CRIM-IN-038': ['Cyanide_Mallika'],
  'CRIM-IN-039': ['Devender_Sharma_(serial_killer)'],
  'CRIM-IN-040': ['Geeta_and_Sanjay_Chopra_kidnapping_case'],
  'CRIM-IN-041': ['Geeta_and_Sanjay_Chopra_kidnapping_case'],
  'CRIM-IN-042': ['Joshi-Abhyankar_serial_murders'],
  'CRIM-IN-043': ['Joshi-Abhyankar_serial_murders'],
  'CRIM-IN-044': ['Santokh_Singh_Kaler'],
  'CRIM-IN-045': ['Shabnam_Ali'],
  'CRIM-IN-046': ['Neeraj_Bawana'],
  'CRIM-IN-047': ['Kala_Jathedi', 'Sandeep_alias_Kala_Jathedi'],
  'CRIM-IN-048': ['Jitender_Gogi'],
  'CRIM-IN-049': ['Tillu_Tajpuria'],
  'CRIM-IN-050': ['2012_Delhi_gang_rape_and_murder'],
  'CRIM-IN-051': ['2012_Delhi_gang_rape_and_murder'],
  'CRIM-IN-052': ['2012_Delhi_gang_rape_and_murder'],
  'CRIM-IN-053': ['2012_Delhi_gang_rape_and_murder'],
  'CRIM-IN-054': ['Thug_Behram'],
  'CRIM-IN-055': ['Nirav_Modi'],
  'CRIM-IN-056': ['Mehul_Choksi'],
  'CRIM-IN-057': ['Vijay_Mallya'],
  'CRIM-IN-058': ['Lalit_Modi'],
  'CRIM-IN-059': ['Subrata_Roy'],
  'CRIM-IN-060': ['Gurmeet_Ram_Rahim_Singh'],
  'CRIM-IN-061': ['Asaram'],
  'CRIM-IN-062': ['Nithyananda'],
  'CRIM-IN-063': ['Sunder_Lal_Bahuguna'],
  'CRIM-IN-064': ['Shiv_Murat_Dwivedi'],
  'CRIM-IN-065': ['Pappu_Yadav']
};

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'photos');

async function downloadPhoto(id: string, titles: string[]) {
  const targetFile = path.join(OUTPUT_DIR, `${id}.jpg`);

  for (const title of titles) {
    try {
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const res = await fetch(summaryUrl, {
        headers: { 'User-Agent': 'MidnightVoidIntelApp/1.0 (contact@midnightvoid.gov.in)' }
      });
      if (!res.ok) continue;

      const data = await res.json() as any;
      const imgSource = data.originalimage?.source || data.thumbnail?.source;
      if (!imgSource) continue;

      // Download through wsrv.nl proxy to get clean JPEG
      const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(imgSource)}&w=480&output=jpg`;
      const imgRes = await fetch(proxyUrl);
      if (imgRes.ok) {
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        if (buffer.length > 2000) {
          fs.writeFileSync(targetFile, buffer);
          console.log(`[OK] Saved real photo for ${id} (${title}) - Size: ${buffer.length} bytes`);
          return true;
        }
      }
    } catch (e: any) {
      console.log(`[WARN] Failed for ${title}: ${e.message}`);
    }
  }
  return false;
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Starting batch real photo downloader...');
  let success = 0;
  let failed = 0;

  for (const [id, titles] of Object.entries(WIKI_TITLE_MAP)) {
    const ok = await downloadPhoto(id, titles);
    if (ok) {
      success++;
    } else {
      failed++;
      console.log(`[MISSING] No real photo found for ${id}`);
    }
  }

  console.log(`Done! Success: ${success}, Missing: ${failed}`);
}

run();
