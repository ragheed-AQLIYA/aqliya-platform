const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/**/error.tsx');
let count = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const oldImport = 'import { createClientLogger } from';
  
  if (content.includes(oldImport) && !content.includes('import { clientLogger } from')) {
    content = content.replace(
      "import { createClientLogger } from \"@/lib/observability/client-logger\";",
      "import { clientLogger } from \"@/lib/observability/client-logger\";"
    );
    fs.writeFileSync(file, content, 'utf8');
    count++;
  }
}
console.log('Files updated:', count);
