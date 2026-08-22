const ffmpeg = require('ffmpeg-static');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const inputPath = path.resolve(__dirname, '../../tharika-intro.mp4');
// Or check if it's in project root
const projectInput = path.resolve(process.cwd(), 'tharika-intro.mp4');
const finalInput = fs.existsSync(projectInput) ? projectInput : inputPath;
const outputPath = path.resolve(process.cwd(), 'public/tharika-intro.mp4');

console.log('Ffmpeg binary:', ffmpeg);
console.log('Input video:', finalInput, 'Size:', fs.statSync(finalInput).size);
console.log('Target output:', outputPath);

const args = [
  '-i', finalInput,
  '-vcodec', 'libx264',
  '-crf', '28',
  '-preset', 'fast',
  '-movflags', '+faststart',
  '-an',
  '-y',
  outputPath
];

const result = spawnSync(ffmpeg, args, { stdio: 'inherit' });

if (result.status === 0 && fs.existsSync(outputPath)) {
  const originalSize = fs.statSync(finalInput).size;
  const newSize = fs.statSync(outputPath).size;
  console.log(`\n Compression SUCCESS!`);
  console.log(`Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Compressed: ${(newSize / 1024 / 1024).toFixed(2)} MB (${Math.round((1 - newSize / originalSize) * 100)}% reduction)`);
} else {
  console.error('Compression failed:', result.error || result.stderr);
}
