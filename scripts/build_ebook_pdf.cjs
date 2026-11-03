const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const htmlPath = path.resolve(__dirname, '../ebook/index.html');
const pdfPath = path.resolve(__dirname, '../ebook/amami_spring_flora_complete.pdf');

console.log('--- 奄美の春の草花さんぽ 電子書籍【完全版】PDFビルド開始 ---');
console.log('HTML ソース:', htmlPath);
console.log('出力先 PDF:', pdfPath);

if (!fs.existsSync(htmlPath)) {
  console.error('エラー: HTMLファイルが見つかりません:', htmlPath);
  process.exit(1);
}

const args = [
  '--headless=new',
  '--disable-gpu',
  '--allow-file-access-from-files',
  '--virtual-time-budget=12000',
  '--no-pdf-header-footer',
  `--print-to-pdf=${pdfPath}`,
  `file:///${htmlPath.replace(/\\/g, '/')}`
];

spawnSync(chromePath, args, { stdio: 'inherit' });

if (fs.existsSync(pdfPath)) {
  const stat = fs.statSync(pdfPath);
  console.log(`成功: PDFが生成されました (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
} else {
  console.error('エラー: PDFの生成に失敗しました。');
}
