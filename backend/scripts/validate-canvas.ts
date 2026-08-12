import * as pdfjsLib from 'pdfjs-dist';
import { createCanvas } from 'canvas';
import path from 'path';
import fs from 'fs';

console.log('🔍 [Validation] Starting canvas and PDF.js validation...\n');

// Test 1: Check canvas module availability
console.log('✓ Test 1: Canvas module import');
try {
  const canvas = createCanvas(100, 100);
  console.log(`  ✅ Canvas module loaded successfully`);
  console.log(`  Canvas version: ${require('canvas/package.json').version}`);
} catch (error) {
  console.error(`  ❌ Failed to create canvas:`, error);
  process.exit(1);
}

// Test 2: Check PDF.js module availability
console.log('\n✓ Test 2: PDF.js module import');
try {
  console.log(`  ✅ PDF.js module loaded`);
  console.log(`  PDF.js version: ${require('pdfjs-dist/package.json').version}`);
} catch (error) {
  console.error(`  ❌ Failed to load PDF.js:`, error);
  process.exit(1);
}

// Test 3: Check PDF worker path
console.log('\n✓ Test 3: PDF.js worker path resolution');
try {
  const pdfjsWorkerPath = require.resolve('pdfjs-dist/build/pdf.worker.js');
  console.log(`  ✅ Worker path resolved: ${pdfjsWorkerPath}`);
  console.log(`  Worker exists: ${fs.existsSync(pdfjsWorkerPath)}`);
} catch (error) {
  console.error(`  ❌ Failed to resolve worker path:`, error);
  process.exit(1);
}

// Test 4: Verify node_modules structure
console.log('\n✓ Test 4: Node modules structure verification');
const checkPaths = [
  '/app/node_modules/canvas',
  '/app/node_modules/pdfjs-dist',
  '/app/backend/node_modules/canvas',
];

checkPaths.forEach(checkPath => {
  const exists = fs.existsSync(checkPath);
  console.log(`  ${exists ? '✅' : '⚠️ '} ${checkPath}: ${exists ? 'exists' : 'not found'}`);
});

// Test 5: Create a simple canvas and render
console.log('\n✓ Test 5: Canvas rendering test');
try {
  const testCanvas = createCanvas(200, 200);
  const ctx = testCanvas.getContext('2d');
  ctx.fillStyle = 'red';
  ctx.fillRect(10, 10, 50, 50);
  const buffer = testCanvas.toBuffer('image/png');
  console.log(`  ✅ Canvas rendering successful, buffer size: ${buffer.length} bytes`);
} catch (error) {
  console.error(`  ❌ Canvas rendering failed:`, error);
  process.exit(1);
}

console.log('\n✅ All validation tests passed!');
console.log('🎉 Canvas and PDF.js are properly configured.');
