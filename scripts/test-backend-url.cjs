const assert = require('node:assert/strict');
const { test } = require('node:test');
const { normalizeBackendUrl } = require('../src/config/backendUrl.cjs');

test('normaliza HTTPS y barras finales', () => {
  assert.equal(normalizeBackendUrl(' https://api.example.com/api/ '), 'https://api.example.com/api');
});
test('rechaza URL ausente, incompleta o con credenciales', () => {
  for (const value of ['', 'incorrecta', 'https://api.example.com', 'https://user:pass@api.example.com/api', 'https://api.example.com/api?token=123']) {
    assert.throws(() => normalizeBackendUrl(value));
  }
});
test('solo permite HTTP en desarrollo', () => {
  assert.throws(() => normalizeBackendUrl('http://10.0.2.2:8080/api'));
  assert.equal(normalizeBackendUrl('http://10.0.2.2:8080/api', true), 'http://10.0.2.2:8080/api');
});
