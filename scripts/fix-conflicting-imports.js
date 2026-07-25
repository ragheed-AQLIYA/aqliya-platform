const fs = require('fs');
const path = require('path');

const files = [
  'src/app/global-error.tsx',
  'src/app/(dashboard)/error.tsx', 
  'src/app/audit/error.tsx',
  'src/app/sales/error.tsx',
  'src/app/local-content/error.tsx'
];

let count = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const importLine = 'import { clientLogger } from "@/lib/observability/client-logger";';
  
  if (content.includes(importLine) && content.includes('const clientLogger = createClientLogger')) {
    // Remove the import line (with any following newlines)
    content = content
      .replace(importLine + '\r\n', '')
      .replace(importLine + '\n', '');
    
    // Clean up double newlines
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    fs.writeFileSync(file, content, 'utf8');
    count++;
    console.log('Fixed:', file);
  }
}
console.log('Files fixed:', count);
