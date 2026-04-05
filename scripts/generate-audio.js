const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const AUDIO_DIR = 'public/audio';
const JSON_FILE = 'public/data/99-names-with-audio.json';

// Create audio directory if it doesn't exist
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// Load the 99 Names data
const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));

console.log('Generating audio files for 99 Names of Allah...\n');

let success = 0;
let failed = 0;

data.forEach((name) => {
  const num = String(name.number).padStart(2, '0');
  const filename = name.audioSrc.split('/').pop();
  const outputPath = path.join(AUDIO_DIR, filename);
  const aiffPath = outputPath.replace('.mp3', '.aiff');

  // Use transliteration for TTS (produces better pronunciation than Arabic with tashkeel)
  const textForTTS = name.transliteration;

  process.stdout.write(`[${num}/99] ${name.transliteration}... `);

  try {
    // Generate AIFF with Arabic voice (Majed)
    execSync(`say -v Majed -o "${aiffPath}" "${textForTTS}"`, { stdio: 'pipe' });

    // Convert to MP3 using ffmpeg
    execSync(`ffmpeg -y -i "${aiffPath}" -acodec libmp3lame -ab 128k "${outputPath}" 2>/dev/null`, { stdio: 'pipe' });

    // Remove temporary AIFF file
    fs.unlinkSync(aiffPath);

    console.log('✓');
    success++;
  } catch (error) {
    console.log('✗ Error:', error.message);
    failed++;
  }
});

console.log(`\nDone! Generated ${success} audio files.`);
if (failed > 0) {
  console.log(`Failed: ${failed}`);
}
