export default `const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const os = require('os');

console.log('Node.js', process.version);
console.log('Platform:', os.platform());
console.log('CWD:', path.basename(process.cwd()));
console.log('Hash:', crypto.createHash('sha256').update('online-compiler').digest('hex').slice(0, 16));

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ route: req.url, modules: ['fs', 'path', 'http', 'crypto'] }));
});

server.listen(0, () => {
  const { port } = server.address();
  console.log('HTTP demo on port', port);
  server.close();
});
`;
