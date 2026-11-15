// Servidor local opcional: node preview.cjs. Não requer dependências.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.webp':'image/webp','.png':'image/png','.md':'text/plain; charset=utf-8'};
http.createServer((req,res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  if(pathname === '/') pathname = '/index.html';
  const file = path.resolve(root, '.' + pathname);
  if(!file.startsWith(root + path.sep) || !['/index.html','/style.css','/script.js'].includes(pathname) && !pathname.startsWith('/assets/')) { res.writeHead(404).end(); return; }
  fs.readFile(file,(err,data) => { if(err) {res.writeHead(404).end('Arquivo não encontrado');return;} res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'}).end(data); });
}).listen(4173,'127.0.0.1',() => console.log('Local: http://127.0.0.1:4173'));
