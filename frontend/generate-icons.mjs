/**
 * Generates PWA icons (192x192 and 512x512 PNGs) from the SVG icon.
 * Run once: node generate-icons.mjs
 * Requires: npm install -D sharp
 */
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const svg   = readFileSync(join(__dir, 'public/icons/icon.svg'))

await sharp(svg).resize(192, 192).png().toFile(join(__dir, 'public/icons/icon-192.png'))
console.log('✓ icon-192.png')

await sharp(svg).resize(512, 512).png().toFile(join(__dir, 'public/icons/icon-512.png'))
console.log('✓ icon-512.png')

console.log('Icons generated in public/icons/')
