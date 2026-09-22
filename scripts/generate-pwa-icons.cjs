const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function createPng(width, height, drawFn) {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return crc ^ -1;
  }

  function createChunk(type, data) {
    const len = data.length;
    const chunk = Buffer.alloc(12 + len);
    chunk.writeUInt32BE(len, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);
    const crc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data]));
    chunk.writeInt32BE(crc, 8 + len);
    return chunk;
  }

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Distance from point (px, py) to line segment (x1, y1) -> (x2, y2)
function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// Point in polygon test
function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function makeShieldDrawer(scaleFactor = 1.0) {
  return function(x, y, w, h) {
    const nx = x / w; // 0 to 1
    const ny = y / h; // 0 to 1

    // Background: Dark Cyber Navy #0b0f19
    let r = 11, g = 15, b = 25, a = 255;

    // Shield coordinates mapped relative to center (0.5, 0.5)
    const cx = 0.5;
    const cy = 0.48;
    const s = 0.38 * scaleFactor;

    // Outer shield polygon
    const outerShield = [
      [cx, cy - s * 0.95],
      [cx + s * 0.85, cy - s * 0.65],
      [cx + s * 0.85, cy + s * 0.15],
      [cx + s * 0.5, cy + s * 0.70],
      [cx, cy + s * 0.95],
      [cx - s * 0.5, cy + s * 0.70],
      [cx - s * 0.85, cy + s * 0.15],
      [cx - s * 0.85, cy - s * 0.65],
    ];

    const innerShield = [
      [cx, cy - s * 0.82],
      [cx + s * 0.72, cy - s * 0.55],
      [cx + s * 0.72, cy + s * 0.12],
      [cx + s * 0.42, cy + s * 0.60],
      [cx, cy + s * 0.82],
      [cx - s * 0.42, cy + s * 0.60],
      [cx - s * 0.72, cy + s * 0.12],
      [cx - s * 0.72, cy - s * 0.55],
    ];

    const inOuter = pointInPoly(nx, ny, outerShield);
    const inInner = pointInPoly(nx, ny, innerShield);

    // Glowing shield border
    if (inOuter && !inInner) {
      // Cyan to Blue Gradient
      const grad = (ny - (cy - s)) / (2 * s);
      r = Math.round(6 + (59 - 6) * grad);
      g = Math.round(182 + (130 - 182) * grad);
      b = Math.round(212 + (246 - 212) * grad);
    } else if (inInner) {
      // Inside Shield: Dark Slate Blue #0f172a
      r = 15; g = 23; b = 42;
    }

    // Checkmark inside shield: (cx - 0.35s, cy) -> (cx - 0.05s, cy + 0.35s) -> (cx + 0.4s, cy - 0.25s)
    const p1 = [cx - s * 0.42, cy + s * 0.02];
    const p2 = [cx - s * 0.08, cy + s * 0.38];
    const p3 = [cx + s * 0.48, cy - s * 0.28];

    const d1 = distToSegment(nx, ny, p1[0], p1[1], p2[0], p2[1]);
    const d2 = distToSegment(nx, ny, p2[0], p2[1], p3[0], p3[1]);
    const checkDist = Math.min(d1, d2);
    const checkThickness = 0.045 * scaleFactor;

    if (checkDist < checkThickness) {
      // Crisp Cyan Checkmark #38bdf8 with slight soft antialiasing
      const intensity = Math.max(0, 1 - (checkDist / checkThickness) ** 2);
      r = Math.round(r * (1 - intensity) + 56 * intensity);
      g = Math.round(g * (1 - intensity) + 189 * intensity);
      b = Math.round(b * (1 - intensity) + 248 * intensity);
    }

    return [r, g, b, a];
  };
}

const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Generating PWA icons in:', outDir);

// Standard 192x192
const p192 = createPng(192, 192, makeShieldDrawer(1.0));
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), p192);

// Standard 512x512
const p512 = createPng(512, 512, makeShieldDrawer(1.0));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), p512);

// Maskable 512x512 (Safe zone with 15% inner padding)
const pMaskable = createPng(512, 512, makeShieldDrawer(0.75));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), pMaskable);

// Apple Touch Icon 180x180
const pApple = createPng(180, 180, makeShieldDrawer(0.9));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), pApple);

// Favicon PNG (32x32)
const pFavicon = createPng(32, 32, makeShieldDrawer(1.0));
fs.writeFileSync(path.join(outDir, 'favicon.ico'), pFavicon);

console.log('All PWA icons generated successfully!');
