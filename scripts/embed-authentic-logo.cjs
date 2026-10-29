const fs = require('fs');
const b64 = fs.readFileSync('public/assets/aicte-official-logo.png').toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 316 316" width="100%" height="100%">
  <image href="data:image/png;base64,${b64}" width="316" height="316" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
fs.writeFileSync('public/assets/aicte-logo.svg', svg);
console.log('aicte-logo.svg successfully written. Size:', svg.length);
