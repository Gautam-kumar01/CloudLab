const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../node_modules/y-monaco/src/y-monaco.js');
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('monaco-editor/esm/vs/editor/editor.api.js', 'monaco-editor');
  fs.writeFileSync(file, content);
  console.log('y-monaco patched!');
} else {
  console.log('y-monaco not found');
}
