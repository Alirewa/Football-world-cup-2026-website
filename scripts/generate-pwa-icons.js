// Run once: node scripts/generate-pwa-icons.js
// Requires: npm install sharp
const sharp = require('sharp')
const path  = require('path')
const fs    = require('fs')

const sizes = [72, 96, 128, 192, 512]
const svgPath = path.join(__dirname, '../public/icons/icon.svg')
const outDir  = path.join(__dirname, '../public/icons')

async function main() {
  const svgBuffer = fs.readFileSync(svgPath)
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon-${size}.png`))
    console.log(`Generated icon-${size}.png`)
  }
}
main().catch(console.error)
