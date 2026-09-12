const fs = require('fs');
const path = require('path');
const { PNG } = require('./apps/web/node_modules/pngjs');

function createPngIcon(size, filename) {
  const png = new PNG({ width: size, height: size });

  const orangeR = 249, orangeG = 115, orangeB = 22; // #f97316
  const whiteR = 255, whiteG = 255, whiteB = 255;
  const darkR = 15, darkG = 23, darkB = 42; // #0f172a

  const center = size / 2;
  const radius = size * 0.42;
  const innerRadius = size * 0.32;
  const bowlRadius = size * 0.12;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background rounded box
      const cornerRadius = size * 0.22;
      const inBoxX = Math.abs(dx) <= (center - cornerRadius);
      const inBoxY = Math.abs(dy) <= (center - cornerRadius);
      const cornerDist = Math.sqrt(
        Math.pow(Math.max(0, Math.abs(dx) - (center - cornerRadius)), 2) +
        Math.pow(Math.max(0, Math.abs(dy) - (center - cornerRadius)), 2)
      );

      if (inBoxX || inBoxY || cornerDist <= cornerRadius) {
        png.data[idx] = orangeR;
        png.data[idx + 1] = orangeG;
        png.data[idx + 2] = orangeB;
        png.data[idx + 3] = 255;

        // Outer Thali Ring
        if (Math.abs(dist - radius) < size * 0.02) {
          png.data[idx] = whiteR;
          png.data[idx + 1] = whiteG;
          png.data[idx + 2] = whiteB;
        }

        // Inner Thali Ring
        if (Math.abs(dist - innerRadius) < size * 0.01) {
          png.data[idx] = whiteR;
          png.data[idx + 1] = whiteG;
          png.data[idx + 2] = whiteB;
        }

        // Center Bowl
        if (dist <= bowlRadius) {
          png.data[idx] = whiteR;
          png.data[idx + 1] = whiteG;
          png.data[idx + 2] = whiteB;
        }

        // Center dot
        if (dist <= bowlRadius * 0.6) {
          png.data[idx] = orangeR;
          png.data[idx + 1] = orangeG;
          png.data[idx + 2] = orangeB;
        }
      } else {
        // Transparent outside
        png.data[idx + 3] = 0;
      }
    }
  }

  const outPath = path.join(__dirname, 'apps', 'web', 'public', filename);
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated ${filename} (${size}x${size})`);
}

createPngIcon(192, 'icon-192.png');
createPngIcon(512, 'icon-512.png');
createPngIcon(180, 'apple-touch-icon.png');
