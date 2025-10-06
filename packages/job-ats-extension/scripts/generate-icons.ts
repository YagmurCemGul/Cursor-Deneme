/**
 * Icon generation script
 * Generates PNG icons from SVG source in multiple sizes
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SIZES = [16, 32, 48, 128, 256];
const SVG_PATH = path.join(__dirname, '../assets/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../public');

async function generateIcons() {
  console.log('🎨 Generating extension icons...\n');

  // Check if sharp is available, otherwise provide fallback instructions
  let sharp;
  try {
    sharp = require('sharp');
  } catch (error) {
    console.warn('⚠️  Sharp not installed. Using SVG directly as fallback.');
    console.log('To generate PNG icons, run: pnpm add -D sharp');
    console.log('For now, copying SVG as-is...\n');
    
    // Copy SVG as fallback
    for (const size of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon${size}.svg`);
      fs.copyFileSync(SVG_PATH, outputPath);
      console.log(`✓ Copied icon${size}.svg (fallback)`);
    }
    return;
  }

  const svgBuffer = fs.readFileSync(SVG_PATH);

  for (const size of SIZES) {
    try {
      const outputPath = path.join(OUTPUT_DIR, `icon${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      console.log(`✓ Generated icon${size}.png (${(stats.size / 1024).toFixed(2)} KB)`);
    } catch (error) {
      console.error(`✗ Failed to generate icon${size}.png:`, error);
    }
  }

  console.log('\n✨ Icon generation complete!');
}

generateIcons().catch(console.error);
