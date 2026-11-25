import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'photos');

// Comprehensive mapping of specific Wikipedia article pages and direct image file names
const TARGETS: { id: string; search: string[]; directUrl?: string }[] = [
  { id: 'CRIM-IN-007', search: ['Lawrence_Bishnoi', 'Sidhu_Moose_Wala'] },
  { id: 'CRIM-IN-008', search: ['Abu_Salem', 'Monica_Bedi'] },
  { id: 'CRIM-IN-010', search: ['Goldy_Brar', 'Satinderjit_Singh'] },
  { id: 'CRIM-IN-014', search: ['Abdul_Karim_Telgi', 'Telgi_scam'] },
  { id: 'CRIM-IN-015', search: ['Auto_Shankar', 'Gowri_Shankar'] },
  { id: 'CRIM-IN-023', search: ['Arun_Gawli', 'Dagdi_Chawl'] },
  { id: 'CRIM-IN-027', search: ['Dhananjoy_Chatterjee'] },
  { id: 'CRIM-IN-030', search: ['Zakiur_Rehman_Lakhvi'] },
  { id: 'CRIM-IN-031', search: ['Syed_Salahuddin'] },
  { id: 'CRIM-IN-032', search: ['Gurpatwant_Singh_Pannun'] },
  { id: 'CRIM-IN-034', search: ['Sohrabuddin_Sheikh'] },
  { id: 'CRIM-IN-035', search: ['Surinder_Koli', '2006_Noida_serial_murders'] },
  { id: 'CRIM-IN-036', search: ['Moninder_Singh_Pandher', '2006_Noida_serial_murders'] },
  { id: 'CRIM-IN-037', search: ['Mohan_Kumar_(serial_killer)', 'Cyanide_Mohan'] },
  { id: 'CRIM-IN-038', search: ['Cyanide_Mallika', 'KD_Kempamma'] },
  { id: 'CRIM-IN-039', search: ['Devender_Sharma_(serial_killer)'] },
  { id: 'CRIM-IN-040', search: ['Geeta_and_Sanjay_Chopra_kidnapping_case', 'Ranga_Billa'] },
  { id: 'CRIM-IN-041', search: ['Geeta_and_Sanjay_Chopra_kidnapping_case', 'Kuljeet_Singh'] },
  { id: 'CRIM-IN-042', search: ['Joshi-Abhyankar_serial_murders', 'Rajendra_Jakkal'] },
  { id: 'CRIM-IN-043', search: ['Joshi-Abhyankar_serial_murders', 'Dilip_Sutar'] },
  { id: 'CRIM-IN-044', search: ['Santokh_Singh_Kaler'] },
  { id: 'CRIM-IN-045', search: ['Shabnam_Ali', 'Amroha_murders'] },
  { id: 'CRIM-IN-046', search: ['Neeraj_Bawana'] },
  { id: 'CRIM-IN-047', search: ['Kala_Jathedi', 'Sandeep_alias_Kala_Jathedi'] },
  { id: 'CRIM-IN-048', search: ['Jitender_Gogi', 'Rohini_court_shooting'] },
  { id: 'CRIM-IN-049', search: ['Tillu_Tajpuria', 'Tihar_Jail'] },
  { id: 'CRIM-IN-050', search: ['2012_Delhi_gang_rape_and_murder', 'Mukesh_Singh'] },
  { id: 'CRIM-IN-051', search: ['2012_Delhi_gang_rape_and_murder', 'Vinay_Sharma'] },
  { id: 'CRIM-IN-052', search: ['2012_Delhi_gang_rape_and_murder', 'Pawan_Gupta'] },
  { id: 'CRIM-IN-053', search: ['2012_Delhi_gang_rape_and_murder', 'Akshay_Thakur'] },
  { id: 'CRIM-IN-054', search: ['Thug_Behram'] },
  { id: 'CRIM-IN-055', search: ['Nirav_Modi', 'Punjab_National_Bank_scam'] },
  { id: 'CRIM-IN-056', search: ['Mehul_Choksi', 'Gitanjali_Group'] },
  { id: 'CRIM-IN-057', search: ['Vijay_Mallya', 'Kingfisher_Airlines'] },
  { id: 'CRIM-IN-058', search: ['Lalit_Modi', 'Indian_Premier_League'] },
  { id: 'CRIM-IN-059', search: ['Subrata_Roy', 'Sahara_India_Pariwar'] },
  { id: 'CRIM-IN-060', search: ['Gurmeet_Ram_Rahim_Singh', 'Dera_Sacha_Sauda'] },
  { id: 'CRIM-IN-061', search: ['Asaram', 'Asaram_Bapu'] },
  { id: 'CRIM-IN-062', search: ['Nithyananda', 'Kailaasa'] },
  { id: 'CRIM-IN-063', search: ['Sunder_Lal_Bahuguna', 'Sunder_Bhati'] },
  { id: 'CRIM-IN-064', search: ['Shiv_Murat_Dwivedi', 'Icchadhari_Sant_Swami_Bhimanand_Ji_Maharaj_Chitrakootwale'] },
  { id: 'CRIM-IN-065', search: ['Pappu_Yadav', 'Rajesh_Ranjan'] }
];

async function fetchFromWiki(title: string) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MidnightVoidIntelApp/2.0 (contact@midnightvoid.gov.in)' }
    });
    if (!res.ok) return null;
    const data = await res.json() as any;
    return data.originalimage?.source || data.thumbnail?.source || null;
  } catch {
    return null;
  }
}

async function run() {
  for (const t of TARGETS) {
    const targetFile = path.join(OUTPUT_DIR, `${t.id}.jpg`);
    if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 2000) {
      console.log(`[EXISTS] ${t.id}`);
      continue;
    }

    let imgSrc: string | null = null;
    for (const title of t.search) {
      imgSrc = await fetchFromWiki(title);
      if (imgSrc) {
        console.log(`[FOUND] ${t.id} from ${title} => ${imgSrc}`);
        break;
      }
    }

    if (imgSrc) {
      try {
        const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(imgSrc)}&w=480&output=jpg`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.length > 1000) {
            fs.writeFileSync(targetFile, buf);
            console.log(`[SAVED] ${t.id} - ${buf.length} bytes`);
            continue;
          }
        }
      } catch (e: any) {
        console.log(`[ERROR downloading] ${t.id}: ${e.message}`);
      }
    }
  }
}

run();
