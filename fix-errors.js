const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/onError:\s*\(\)\s*=>\s*toast\.error\((['"].*?['"])\)/g, 'onError: (error: any) => toast.error(error?.message || )');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(Updated );
    }
  }
});
