// lib/validate.js
function parseCurrencyBR(value){ if(typeof value!=='string') return NaN; const v=value.replace(/\./g,'').replace(',','.').trim(); return parseFloat(v); }
function sanitizeText(s){ return String(s||'').trim().replace(/\s+/g,' '); }

function validateProductForm(data){
  const errors=[];
  const nome=sanitizeText(data.nome);
  const categoria=sanitizeText(data.categoria);
  const preco=parseCurrencyBR(String(data.preco||'').replace('R$','').trim());
  const quantidade=parseInt(data.quantidade,10);
  const dataValidade=sanitizeText(data.dataValidade);
  const fornecedorEmail=sanitizeText(data.fornecedorEmail);
  const descricao=sanitizeText(data.descricao);

  if(!nome) errors.push('Informe o nome do produto.');
  if(!categoria) errors.push('Informe a categoria.');
  if(!Number.isFinite(preco)||preco<=0) errors.push('Preço deve ser um número válido maior que 0 (ex.: 1499,90).');
  if(!Number.isFinite(quantidade)||quantidade<0) errors.push('Quantidade deve ser um inteiro válido (0 ou mais).');

  if (dataValidade) {
    const d = new Date(dataValidade);
    const today = new Date(); today.setHours(0,0,0,0);
    if (!(d instanceof Date) || isNaN(d) || d < today) {
      errors.push('Data de validade (se informada) deve ser hoje ou futura.');
    }
  }

  if (fornecedorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fornecedorEmail)) {
    errors.push('E-mail do fornecedor inválido.');
  }

  return {
    ok: errors.length===0,
    errors,
    parsed:{ nome,categoria,preco,quantidade,dataValidade,fornecedorEmail,descricao }
  };
}

function calcularTotais(p){
  const totalBruto=p.preco*p.quantidade;
  const descontos={'Eletrônicos':0.05,'Alimentos':0.10,'Vestuário':0.08};
  const percDesc=descontos[p.categoria]||0;
  const valorDesc=totalBruto*percDesc;
  const totalLiquido=totalBruto-valorDesc;
  return { totalBruto, percDesc, valorDesc, totalLiquido };
}

function currencyBR(n){ return n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

function renderFormHTML(basePath){
return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cadastro de Produto — Atividade 2</title>
<style>
:root{--pri:#0ea5e9;--bg:#f8fafc;--card:#fff;--text:#0f172a;--muted:#475569;--border:#e2e8f0}
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:var(--bg);color:var(--text);}
header{padding:24px;text-align:center;background:#0284c7;color:#fff}
main{max-width:920px;margin:0 auto;padding:24px}
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px;box-shadow:0 8px 30px rgba(2,6,23,.05)}
label{display:block;margin:8px 0 4px}
input,select,textarea{width:100%;padding:10px;border:1px solid var(--border);border-radius:10px}
.grid{display:grid;gap:12px;grid-template-columns:1fr 1fr}
.btn{display:inline-block;margin-top:14px;padding:12px 18px;border-radius:12px;background:var(--pri);color:#fff;text-decoration:none;border:none;font-weight:700;cursor:pointer}
.muted{color:var(--muted)}
</style></head>
<body>
<header><h1>Cadastro de Produto</h1><p class="muted">Atividade 2 — Processamento de formulário com Express</p></header>
<main><div class="card">
<form method="POST" action="${basePath}/processa">
  <div class="grid">
    <div><label>Nome do produto*</label><input name="nome" required placeholder="Ex.: Notebook X200"></div>
    <div><label>Categoria*</label>
      <select name="categoria" required>
        <option value="">Selecione...</option>
        <option>Eletrônicos</option>
        <option>Alimentos</option>
        <option>Vestuário</option>
        <option>Outros</option>
      </select>
    </div>
  </div>
  <div class="grid">
    <div><label>Preço (R$)*</label><input name="preco" required inputmode="decimal" placeholder="Ex.: 1499,90"></div>
    <div><label>Quantidade*</label><input name="quantidade" required type="number" min="0" value="1"></div>
  </div>
  <div class="grid">
    <div><label>Data de Validade (opcional)</label><input name="dataValidade" type="date"></div>
    <div><label>E-mail do fornecedor (opcional)</label><input name="fornecedorEmail" type="email" placeholder="fornecedor@empresa.com"></div>
  </div>
  <div><label>Descrição</label><textarea name="descricao" rows="3" placeholder="Observações relevantes sobre o produto..."></textarea></div>
  <button class="btn" type="submit">Enviar</button>
</form>
</div></main></body></html>`;
}

function renderResultHTML(p,t){
const br=currencyBR; const safe=s=>String(s||'-');
return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Resultado — Cadastro de Produto</title>
<style>
:root{--pri:#0ea5e9;--bg:#f8fafc;--card:#fff;--text:#0f172a;--muted:#475569;--border:#e2e8f0}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:var(--bg);color:var(--text);}
header{padding:24px;text-align:center;background:#0284c7;color:#fff}
main{max-width:920px;margin:0 auto;padding:24px}
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px;box-shadow:0 8px 30px rgba(2,6,23,.05);margin-top:16px}
.grid{display:grid;gap:12px;grid-template-columns:1fr 1fr}
.pill{display:inline-block;padding:6px 10px;border-radius:999px;background:#e0f2fe;color:#075985;border:1px solid #bae6fd;margin-right:8px}
.big{font-size:34px;font-weight:800;color:#075985}
a{color:#075985}
</style></head>
<body>
<header><h1>Produto cadastrado</h1></header>
<main><div class="grid">
  <div class="card">
    <h2>Dados informados</h2>
    <p><strong>Nome:</strong> ${safe(p.nome)}</p>
    <p><strong>Categoria:</strong> ${safe(p.categoria)}</p>
    <p><strong>Preço:</strong> ${br(p.preco)}</p>
    <p><strong>Quantidade:</strong> ${p.quantidade}</p>
    <p><strong>Validade:</strong> ${p.dataValidade||'—'}</p>
    <p><strong>Fornecedor:</strong> ${p.fornecedorEmail||'—'}</p>
    <p><strong>Descrição:</strong> ${p.descricao||'—'}</p>
  </div>
  <div class="card">
    <h2>Totais</h2>
    <p><span class="pill">Total Bruto: ${br(t.totalBruto)}</span></p>
    <p><span class="pill">Desconto: ${Math.round(t.percDesc*100)}% (${br(t.valorDesc)})</span></p>
    <p>Total Líquido:</p>
    <p class="big">${br(t.totalLiquido)}</p>
    <p><a href="./">Voltar ao formulário</a></p>
  </div>
</div></main></body></html>`;
}

function renderErrorHTML(errors, basePath){
return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Erros no formulário</title>
<style>
:root{--bg:#f8fafc;--card:#fff;--text:#0f172a;--border:#e2e8f0}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:var(--bg);color:var(--text);}
header{padding:24px;text-align:center;background:#b91c1c;color:#fff}
main{max-width:920px;margin:0 auto;padding:24px}
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px;box-shadow:0 8px 30px rgba(2,6,23,.05);margin-top:16px}
.err{background:#fee2e2;border:1px solid #fecaca;color:#7f1d1d;padding:12px;border-radius:12px}
a{color:#0ea5e9}
</style></head>
<body>
<header><h1>Erros encontrados</h1></header>
<main>
  <div class="card err"><ul>${errors.map(e=>`<li>${e}</li>`).join('')}</ul></div>
  <p><a href="${basePath}">Voltar ao formulário</a></p>
</main></body></html>`;
}

module.exports={ validateProductForm, calcularTotais, renderFormHTML, renderResultHTML, renderErrorHTML, currencyBR };
