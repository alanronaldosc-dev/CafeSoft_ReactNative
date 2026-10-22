const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { normalizeBackendUrl } = require('../src/config/backendUrl.cjs');

function loadClient() {
  let requestInterceptor;
  let responseInterceptor;
  let storedToken = 'token-prueba';
  let healthResponse = { data: { status: 'UP', database: 'UP' } };
  const created = { interceptors: {
    request: { use(fn) { requestInterceptor = fn; } },
    response: { use(ok, fail) { responseInterceptor = fail; } },
  }};
  let configuration, healthCall;
  const axios = {
    create(config) { configuration = config; return created; },
    async get(url, options) { healthCall = { url, options }; return healthResponse; },
  };
  let source = fs.readFileSync(require.resolve('../src/config/api.js'), 'utf8')
    .replace(/^import .*;\s*$/gm, '')
    .replace('export const BASE_URL', 'const BASE_URL')
    .replace('export async function', 'async function')
    .replace('export default api;', 'globalThis.result = { BASE_URL, api, checkBackendHealth };');
  const sandbox = { axios, SecureStore: { getItemAsync: async () => storedToken }, normalizeBackendUrl,
    process: { env: { EXPO_PUBLIC_API_URL: 'https://api.example.com/api' } }, __DEV__: false,
    console: { log() {}, warn() {} } };
  vm.runInNewContext(source, sandbox);
  return {
    ...sandbox.result, configuration,
    request: (c) => requestInterceptor(c), responseError: (e) => responseInterceptor(e),
    setToken(t) { storedToken=t; }, setHealth(h) { healthResponse=h; }, getHealthCall() { return healthCall; },
  };
}

test('conserva JWT y elimina Authorization obsoleto cuando ya no hay token', async () => {
  const c=loadClient();
  assert.equal((await c.request({headers:{}})).headers.Authorization,'Bearer token-prueba');
  c.setToken(null);
  assert.equal((await c.request({headers:{Authorization:'Bearer anterior'}})).headers.Authorization,undefined);
  assert.equal(c.configuration.baseURL,'https://api.example.com/api');
  assert.equal(c.configuration.timeout,90000);
});
test('conserva el rechazo 403 sin eliminar la sesion', async () => {
  const c=loadClient(), error={response:{status:403},config:{url:'/productos'}};
  await assert.rejects(c.responseError(error),e=>e===error);
  assert.equal((await c.request({headers:{}})).headers.Authorization,'Bearer token-prueba');
});
test('salud publica sin JWT y sin aceptar una base de datos DOWN', async () => {
  const c=loadClient();await c.checkBackendHealth();
  assert.equal(c.getHealthCall().url,'https://api.example.com/api/health');
  assert.equal(c.getHealthCall().options.headers,undefined);
  c.setHealth({data:{status:'UP',database:'DOWN'}});
  await assert.rejects(c.checkBackendHealth());
});
