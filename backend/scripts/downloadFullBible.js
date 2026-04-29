const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('📖 Descarcare Biblie completa BVDCS...');
console.log('');
console.log('Optiuni disponibile:');
console.log('');
console.log('1. Mergi la: https://github.com/vithep/Romanian-Bible');
console.log('   - Descarca fisierul ro_BVDCS.json');
console.log('   - Plaseaza-l in backend/data/');
console.log('');
console.log('2. Sau foloseste API-ul:');
console.log('   https://bible-api.com/?translation=ro-bvdcs');
console.log('');
console.log('3. Sau instaleaza Python si ruleaza:');
console.log('   pip install requests');
console.log('   python downloadBible.py');