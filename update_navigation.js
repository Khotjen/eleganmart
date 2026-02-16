const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');
const htmlFiles = [
  'about.html',
  'produk.html', 
  'cart.html',
  'produk-detail.html',
  'checkout.html',
  'order-sukses.html',
  'akun.html',
  'pesanan.html',
  'lupa-password.html',
  'kontak.html',
  'faq.html',
  'tracking.html'
];

const targetPattern = '          <a class="btn-ghost" href="/login">Login</a>';
const replacement = '          <a class="btn-ghost" href="/login">Login</a>\n          <a class="btn-ghost" href="/register">Daftar</a>';

htmlFiles.forEach(file => {
  const filePath = path.join(PUBLIC_DIR, file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    if (content.includes(targetPattern)) {
      content = content.replace(targetPattern, replacement);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated: ${file}`);
    } else {
      console.log(`Pattern not found in: ${file}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log('Navigation update completed!');