const fs = require('fs');
const https = require('https');
const path = require('path');

const AUDIO_DIR = 'public/audio';
const JSON_FILE = 'public/data/99-names-with-audio.json';

// Source URLs from alasmaulhusna.org
const sourceUrls = [
  'https://alasmaulhusna.org/audio/names-of-allah/1-ar-rahman.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/2-ar-raheem.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/3-al-malik.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/4-al-qaddus.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/5-as-salam.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/6-al-mumin.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/7-al-muhaymin.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/8-al-aziz.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/9-al-jabbar.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/10-al-mutakabbir.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/11-al-khaliq.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/12-al-bari.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/13-al-musawwir.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/14-al-ghaffar.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/15-al-qahhar.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/16-al-wahhab.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/17-ar-razzaq.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/18-al-fattah.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/19-al-alim.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/20-al-qabid.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/21-al-basit.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/22-al-khafid.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/23-ar-rafi.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/24-al-muizz.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/25-al-mudhill.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/26-as-sami.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/27-al-basir.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/28-al-hakam.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/29-al-adl.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/30-al-latif.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/31-al-khabir.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/32-al-halim.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/33-al-azeem.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/34-al-ghafur.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/35-ash-shakur.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/36-al-ali.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/37-al-kabir.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/38-al-hafiz.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/39-al-muqeet.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/40-al-haseeb.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/41-al-jaleel.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/42-al-kareem.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/43-ar-raqeeb.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/44-al-mujeeb.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/45-al-waasi.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/46-al-hakeem.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/47-al-wadud.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/48-al-majid.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/49-al-baith.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/50-ash-shaheed.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/51-al-haqq.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/52-al-wakeel.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/53-al-qawi.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/54-al-matin.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/55-al-waliyy.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/56-al-hamid.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/57-al-muhsi.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/58-al-mubdi.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/59-al-muid.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/60-al-muhyi.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/61-al-mumit.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/62-al-hayy.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/63-al-qayyum.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/64-al-wajid.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/65-al-majid.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/66-al-wahid.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/67-al-ahad.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/68-as-samad.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/69-al-qadir.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/70-al-muqtadir.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/71-al-muqaddim.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/72-al-muakhkhir.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/73-al-awwal.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/74-al-akhir.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/75-az-zahir.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/76-al-batin.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/77-al-wali.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/78-al-muta-ali.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/79-al-barr.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/80-at-tawwab.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/81-al-muntaqim.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/82-al-afuw.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/83-ar-rauf.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/84-malikul-mulk.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/85-dhul-jalali-wal-ikram.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/86-al-muqsit.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/87-al-jami.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/88-al-ghaniyy.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/89-al-mughni.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/90-al-mani.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/91-ad-darr.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/92-an-nafi.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/93-an-nur.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/94-al-hadi.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/95-al-badi.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/96-al-baqi.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/97-al-warith.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/98-ar-rashid.mp3',
  'https://alasmaulhusna.org/audio/names-of-allah/99-as-sabur.mp3',
];

// Load our 99 Names data to get target filenames
const namesData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));

// Create audio directory if it doesn't exist
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    }).on('error', (err) => {
      fs.unlink(destPath, () => {}); // Delete incomplete file
      reject(err);
    });
  });
}

async function main() {
  console.log('Downloading audio files for 99 Names of Allah...\n');

  let success = 0;
  let failed = 0;

  for (let i = 0; i < 99; i++) {
    const name = namesData[i];
    const sourceUrl = sourceUrls[i];
    const targetFilename = name.audioSrc.split('/').pop();
    const targetPath = path.join(AUDIO_DIR, targetFilename);

    const num = String(i + 1).padStart(2, '0');
    process.stdout.write(`[${num}/99] ${name.transliteration}... `);

    try {
      await downloadFile(sourceUrl, targetPath);
      console.log('✓');
      success++;
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
      failed++;
    }
  }

  console.log(`\nDone! Downloaded ${success} audio files.`);
  if (failed > 0) {
    console.log(`Failed: ${failed}`);
  }
}

main();
