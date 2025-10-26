// api/processa.js - POST process (serverless Vercel)
const { validateProductForm, calcularTotais, renderResultHTML, renderErrorHTML } = require('../lib/validate');

function collectBody(req){ return new Promise(resolve=>{ let data=''; req.on('data',c=>data+=c); req.on('end',()=>resolve(data)); }); }
function parseURLEncoded(body){ const params=new URLSearchParams(body); const obj={}; for(const [k,v] of params) obj[k]=v; return obj; }

module.exports = async (req, res) => {
  if(req.method!=='POST'){ res.statusCode=405; res.setHeader('Allow','POST'); return res.end('Use POST'); }
  const raw = await collectBody(req);
  const form = parseURLEncoded(raw);

  const v = validateProductForm(form);
  if(!v.ok){ res.statusCode=400; res.setHeader('Content-Type','text/html; charset=utf-8'); return res.end(renderErrorHTML(v.errors, '/api')); }

  const totals = calcularTotais(v.parsed);
  const html = renderResultHTML(v.parsed, totals);
  res.statusCode=200; res.setHeader('Content-Type','text/html; charset=utf-8'); res.end(html);
};
