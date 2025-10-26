// server.js - local Express
const express = require('express');
const { validateProductForm, calcularTotais, renderFormHTML, renderResultHTML, renderErrorHTML } = require('./lib/validate');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.set('Content-Type','text/html; charset=utf-8');
  res.send(renderFormHTML(''));
});

app.post('/processa', (req, res) => {
  const v = validateProductForm(req.body);
  if (!v.ok) return res.status(400).send(renderErrorHTML(v.errors, ''));
  const totals = calcularTotais(v.parsed);
  res.status(200).send(renderResultHTML(v.parsed, totals));
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
