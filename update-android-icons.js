const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Script tự động tối ưu hóa và sinh icon chuẩn kích thước Android mipmap & drawable
const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

const densities = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

const drawableFolders = [
  'drawable',
  'drawable-hdpi',
  'drawable-mdpi',
  'drawable-xhdpi',
  'drawable-xxhdpi',
  'drawable-xxxhdpi',
];

function createScaledPNG(size) {
  const bytesPerPixel = 4;
  const rawData = Buffer.alloc(size * (size * bytesPerPixel + 1));

  let offset = 0;
  for (let y = 0; y < size; y++) {
    rawData[offset++] = 0;
    for (let x = 0; x < size; x++) {
      const nx = (x / size - 0.5) * 2;
      const ny = (y / size - 0.5) * 2;
      
      let r = 255, g = 255, b = 255, a = 255;
      const distCenter = Math.sqrt(nx * nx + ny * ny);

      if (distCenter < 0.35) {
        if (distCenter > 0.30) {
          r = 30; g = 58; b = 82;
        } else if (nx < 0) {
          r = 96; g = 165; b = 250;
        } else {
          r = 52; g = 211; b = 153;
        }
      }

      if (ny < 0 && ny > -0.75 && Math.abs(nx) < (0.4 - (ny + 0.25) * 0.9)) {
        if (Math.abs(Math.abs(nx) - (0.4 - (ny + 0.25) * 0.9)) < 0.08 || ny < -0.65) {
          r = 43; g = 122; b = 120;
        }
      }

      if (ny >= 0 && ny <= 0.65 && Math.abs(nx) <= 0.7) {
        if (Math.abs(Math.abs(nx) - 0.7) < 0.08 || Math.abs(ny - 0.65) < 0.08) {
          r = 43; g = 122; b = 120;
        }
      }

      const avatars = [
        { x: 0, y: -0.5 },
        { x: -0.5, y: -0.25 },
        { x: 0.5, y: -0.25 },
        { x: -0.5, y: 0.25 },
        { x: 0.5, y: 0.25 },
      ];
      avatars.forEach(av => {
        if (Math.sqrt((nx - av.x)**2 + (ny - av.y)**2) < 0.14) {
          r = 30; g = 58; b = 82;
        }
      });

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressedData),
    createChunk('IEND', Buffer.alloc(0))
  ]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crcBuf = Buffer.alloc(4 + len);
  buf.copy(crcBuf, 0, 4, 8 + len);
  buf.writeUInt32BE(crc32(crcBuf), 8 + len);
  return buf;
}

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

console.log('🤖 Đang sinh file Android Native Icons & Splashscreen Resources...');

densities.forEach(({ folder, size }) => {
  const folderPath = path.join(resDir, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const pngBuf = createScaledPNG(size);
  fs.writeFileSync(path.join(folderPath, 'ic_launcher.png'), pngBuf);
  fs.writeFileSync(path.join(folderPath, 'ic_launcher_round.png'), pngBuf);
  fs.writeFileSync(path.join(folderPath, 'ic_launcher_foreground.png'), pngBuf);

  console.log(` ✅ ${folder} (${size}x${size}px) updated!`);
});

// Sinh splashscreen_logo.png cho tất cả thư mục drawable
const defaultSplashBuf = createScaledPNG(192);
drawableFolders.forEach((folder) => {
  const folderPath = path.join(resDir, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  fs.writeFileSync(path.join(folderPath, 'splashscreen_logo.png'), defaultSplashBuf);
  console.log(` ✅ ${folder}/splashscreen_logo.png updated!`);
});

console.log('🎉 Tối ưu hóa Android Native Icons & Splash Resources thành công 100%!');
