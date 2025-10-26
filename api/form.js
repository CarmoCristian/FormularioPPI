// api/form.js - GET form (serverless Vercel)
const { renderFormHTML } = require('../lib/validate');
module.exports = (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.end(renderFormHTML('/api'));
};
