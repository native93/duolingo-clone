#!/bin/bash

# Generate audio files for 99 Names using macOS TTS (Majed - Arabic voice)
# Usage: ./scripts/generate-audio.sh

AUDIO_DIR="public/audio"
JSON_FILE="public/data/99-names-with-audio.json"

# Create audio directory if it doesn't exist
mkdir -p "$AUDIO_DIR"

# Remove old audio files
rm -f "$AUDIO_DIR"/*.mp3

echo "Generating audio files for 99 Names of Allah..."

# Read JSON and generate audio for each name
# We'll use the Arabic text for proper pronunciation
node -e "
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const data = JSON.parse(fs.readFileSync('$JSON_FILE', 'utf-8'));

data.forEach((name, index) => {
  const num = String(name.number).padStart(2, '0');
  const filename = name.audioSrc.split('/').pop();
  const outputPath = path.join('$AUDIO_DIR', filename);

  // Use Arabic text for TTS (better pronunciation than transliteration)
  const arabicText = name.arabic;

  console.log(\`[\${num}/99] Generating: \${filename}\`);

  // Generate audio using macOS say command with Majed voice (Arabic)
  // First create AIFF, then convert to MP3
  const aiffPath = outputPath.replace('.mp3', '.aiff');

  try {
    // Generate AIFF with Arabic voice
    execSync(\`say -v Majed -o \"\${aiffPath}\" \"\${arabicText}\"\`, { stdio: 'inherit' });

    // Convert to MP3 using ffmpeg
    execSync(\`ffmpeg -y -i \"\${aiffPath}\" -acodec libmp3lame -ab 128k \"\${outputPath}\" 2>/dev/null\`, { stdio: 'inherit' });

    // Remove temporary AIFF file
    fs.unlinkSync(aiffPath);
  } catch (error) {
    console.error(\`Error generating \${filename}: \${error.message}\`);
  }
});

console.log('\\nDone! Generated audio files in $AUDIO_DIR');
"
