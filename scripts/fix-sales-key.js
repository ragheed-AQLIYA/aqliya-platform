const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}', { 
  ignore: ['**/node_modules/**', '**/__tests__/**'] 
});

let count = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('productKey: "sales_os"')) {
    content = content.replace(/productKey:\s*"sales_os"/g, 'productKey: "salesos"');
    fs.writeFileSync(file, content, 'utf8');
    count++;
    console.log(file);
  }
}
console.log('Files fixed:', count);
