const QRCode = require('qrcode');
const path = require('path');

async function generateIcons() {
  const icon192 = path.join(__dirname, 'public', 'icon-192.png');
  const icon512 = path.join(__dirname, 'public', 'icon-512.png');
  const icon180 = path.join(__dirname, 'public', 'apple-touch-icon.png');

  const appUrl = 'https://messmitra.app';

  await QRCode.toFile(icon192, appUrl, {
    width: 192,
    margin: 2,
    color: { dark: '#f97316', light: '#0f172a' },
  });

  await QRCode.toFile(icon512, appUrl, {
    width: 512,
    margin: 2,
    color: { dark: '#f97316', light: '#0f172a' },
  });

  await QRCode.toFile(icon180, appUrl, {
    width: 180,
    margin: 2,
    color: { dark: '#f97316', light: '#0f172a' },
  });

  console.log('✅ Generated icon-192.png, icon-512.png, apple-touch-icon.png');
}

generateIcons().catch(console.error);
