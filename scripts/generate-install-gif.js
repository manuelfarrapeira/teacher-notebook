/**
 * Generates an animated GIF (486x286) for the Squirrel.Windows installer splash screen.
 * Uses the app's "Refined Academic" color palette.
 *
 * Usage: node scripts/generate-install-gif.js
 * Output: public/install-loading.gif
 */

const GifWriter = require('omggif').GifWriter;
const fs = require('fs');
const path = require('path');

const WIDTH = 486;
const HEIGHT = 286;
const NUM_FRAMES = 12;
const FRAME_DELAY = 12; // centiseconds (120ms per frame)

// --- Color palette (Refined Academic) ---
const COLORS = {
  bg:          [250, 248, 245],   // #faf8f5 warm paper
  primary:     [44,  95,  74],    // #2c5f4a sage green
  primaryLight:[232, 240, 236],   // #e8f0ec
  accent:      [196, 131, 60],    // #c4833c copper
  text:        [45,  52,  54],    // #2d3436
  textMuted:   [122, 128, 120],   // #7a8078
  white:       [255, 255, 255],
  border:      [224, 216, 207],   // #e0d8cf
  dotInactive: [210, 204, 196],   // lighter gray for inactive dots
};

// Color palette entries as [r,g,b]
const colorEntries = [
  COLORS.bg,           // 0
  COLORS.primary,      // 1
  COLORS.primaryLight, // 2
  COLORS.accent,       // 3
  COLORS.text,         // 4
  COLORS.textMuted,    // 5
  COLORS.white,        // 6
  COLORS.border,       // 7
  COLORS.dotInactive,  // 8
];

// Color index constants
const CI = {
  bg: 0,
  primary: 1,
  primaryLight: 2,
  accent: 3,
  text: 4,
  textMuted: 5,
  white: 6,
  border: 7,
  dotInactive: 8,
};

// omggif palette: array of 0xRRGGBB integers, length must be power of 2 (2..256)
const globalPalette = [];
for (const [r, g, b] of colorEntries) {
  globalPalette.push((r << 16) | (g << 8) | b);
}
// Pad to 16 (next power of 2 above 9)
while (globalPalette.length < 16) {
  globalPalette.push(0x000000);
}

// --- Drawing helpers ---
function fillRect(pixels, x0, y0, w, h, colorIdx) {
  for (let y = y0; y < y0 + h && y < HEIGHT; y++) {
    for (let x = x0; x < x0 + w && x < WIDTH; x++) {
      pixels[y * WIDTH + x] = colorIdx;
    }
  }
}

function fillCircle(pixels, cx, cy, r, colorIdx) {
  const r2 = r * r;
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2) {
          pixels[y * WIDTH + x] = colorIdx;
        }
      }
    }
  }
}

function fillRoundedRect(pixels, x0, y0, w, h, radius, colorIdx) {
  fillRect(pixels, x0 + radius, y0, w - 2 * radius, h, colorIdx);
  fillRect(pixels, x0, y0 + radius, w, h - 2 * radius, colorIdx);
  // Corners
  for (const [cx, cy] of [
    [x0 + radius, y0 + radius],
    [x0 + w - radius - 1, y0 + radius],
    [x0 + radius, y0 + h - radius - 1],
    [x0 + w - radius - 1, y0 + h - radius - 1],
  ]) {
    fillCircle(pixels, cx, cy, radius, colorIdx);
  }
}

// Simple 5x7 bitmap font for uppercase + some chars
const FONT = {
  'T': [0b11111,0b00100,0b00100,0b00100,0b00100,0b00100,0b00100],
  'E': [0b11111,0b10000,0b10000,0b11110,0b10000,0b10000,0b11111],
  'A': [0b01110,0b10001,0b10001,0b11111,0b10001,0b10001,0b10001],
  'C': [0b01110,0b10001,0b10000,0b10000,0b10000,0b10001,0b01110],
  'H': [0b10001,0b10001,0b10001,0b11111,0b10001,0b10001,0b10001],
  'R': [0b11110,0b10001,0b10001,0b11110,0b10010,0b10001,0b10001],
  'N': [0b10001,0b11001,0b10101,0b10011,0b10001,0b10001,0b10001],
  'O': [0b01110,0b10001,0b10001,0b10001,0b10001,0b10001,0b01110],
  'B': [0b11110,0b10001,0b10001,0b11110,0b10001,0b10001,0b11110],
  'K': [0b10001,0b10010,0b10100,0b11000,0b10100,0b10010,0b10001],
  ' ': [0b00000,0b00000,0b00000,0b00000,0b00000,0b00000,0b00000],
  'I': [0b01110,0b00100,0b00100,0b00100,0b00100,0b00100,0b01110],
  'S': [0b01110,0b10001,0b10000,0b01110,0b00001,0b10001,0b01110],
  'L': [0b10000,0b10000,0b10000,0b10000,0b10000,0b10000,0b11111],
  'G': [0b01110,0b10001,0b10000,0b10111,0b10001,0b10001,0b01110],
  'D': [0b11100,0b10010,0b10001,0b10001,0b10001,0b10010,0b11100],
  'P': [0b11110,0b10001,0b10001,0b11110,0b10000,0b10000,0b10000],
  'U': [0b10001,0b10001,0b10001,0b10001,0b10001,0b10001,0b01110],
  'W': [0b10001,0b10001,0b10001,0b10101,0b10101,0b11011,0b10001],
  'Y': [0b10001,0b10001,0b01010,0b00100,0b00100,0b00100,0b00100],
  'F': [0b11111,0b10000,0b10000,0b11110,0b10000,0b10000,0b10000],
  'M': [0b10001,0b11011,0b10101,0b10101,0b10001,0b10001,0b10001],
  'V': [0b10001,0b10001,0b10001,0b10001,0b01010,0b01010,0b00100],
  '.': [0b00000,0b00000,0b00000,0b00000,0b00000,0b00000,0b00100],
  'X': [0b10001,0b10001,0b01010,0b00100,0b01010,0b10001,0b10001],
};

function drawText(pixels, text, startX, startY, scale, colorIdx) {
  let cursorX = startX;
  for (const ch of text) {
    const glyph = FONT[ch];
    if (!glyph) { cursorX += 4 * scale; continue; }
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (glyph[row] & (1 << (4 - col))) {
          fillRect(pixels, cursorX + col * scale, startY + row * scale, scale, scale, colorIdx);
        }
      }
    }
    cursorX += 6 * scale;
  }
  return cursorX;
}

function getTextWidth(text, scale) {
  return text.length * 6 * scale - scale;
}

// --- Generate frames ---
const bufSize = WIDTH * HEIGHT * NUM_FRAMES * 2 + 1024;
const buf = Buffer.alloc(bufSize);
const gif = new GifWriter(buf, WIDTH, HEIGHT, {
  palette: globalPalette,
  loop: 0, // infinite loop
});

for (let frame = 0; frame < NUM_FRAMES; frame++) {
  const pixels = new Uint8Array(WIDTH * HEIGHT);

  // Background
  pixels.fill(CI.bg);

  // Central card area
  const cardW = 360;
  const cardH = 160;
  const cardX = Math.floor((WIDTH - cardW) / 2);
  const cardY = Math.floor((HEIGHT - cardH) / 2);
  fillRoundedRect(pixels, cardX, cardY, cardW, cardH, 12, CI.white);

  // Top accent line on card
  fillRect(pixels, cardX + 12, cardY, cardW - 24, 4, CI.primary);

  // Title: "TEACHER NOTEBOOK"
  const title = 'TEACHER NOTEBOOK';
  const titleScale = 3;
  const titleW = getTextWidth(title, titleScale);
  const titleX = Math.floor((WIDTH - titleW) / 2);
  const titleY = cardY + 28;
  drawText(pixels, title, titleX, titleY, titleScale, CI.primary);

  // Subtitle: "INSTALLING..."
  const subtitle = 'INSTALLING...';
  const subScale = 2;
  const subW = getTextWidth(subtitle, subScale);
  const subX = Math.floor((WIDTH - subW) / 2);
  const subY = titleY + 7 * titleScale + 20;
  drawText(pixels, subtitle, subX, subY, subScale, CI.textMuted);

  // Animated dots (spinner) - 8 dots in a circle
  const dotsCount = 8;
  const dotRadius = 5;
  const orbitRadius = 18;
  const centerX = Math.floor(WIDTH / 2);
  const centerY = subY + 7 * subScale + 28;

  for (let i = 0; i < dotsCount; i++) {
    const angle = (i / dotsCount) * Math.PI * 2 - Math.PI / 2;
    const dx = Math.round(centerX + Math.cos(angle) * orbitRadius);
    const dy = Math.round(centerY + Math.sin(angle) * orbitRadius);

    // The "active" dot follows the frame
    const activeIdx = frame % dotsCount;
    const dist = (i - activeIdx + dotsCount) % dotsCount;

    let color;
    if (dist === 0) color = CI.primary;
    else if (dist === 1) color = CI.accent;
    else if (dist === 2) color = CI.primaryLight;
    else color = CI.dotInactive;

    const r = dist === 0 ? dotRadius + 1 : (dist <= 2 ? dotRadius : dotRadius - 1);
    fillCircle(pixels, dx, dy, r, color);
  }

  // Bottom border on card
  fillRect(pixels, cardX + 12, cardY + cardH - 4, cardW - 24, 4, CI.accent);

  gif.addFrame(0, 0, WIDTH, HEIGHT, pixels, { delay: FRAME_DELAY });
}

// Write to file
const outBytes = buf.slice(0, gif.end());
const outPath = path.join(__dirname, '..', 'public', 'install-loading.gif');
fs.writeFileSync(outPath, outBytes);
console.log(`✅ Generated ${outPath} (${outBytes.length} bytes)`);

