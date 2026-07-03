import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

const moduleSource = await readFile(new URL('../api/mistral.ts', import.meta.url), 'utf8');
const transpiled = ts.transpileModule(moduleSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2023,
  },
}).outputText;
const { default: handler } = await import(
  `data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}`
);

const allowedOrigin = 'https://vibecraft.rubberduck.sk';
const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };

const makeReq = ({
  body,
  headers = {},
  method = 'POST',
} = {}) => ({
  method,
  headers,
  async *[Symbol.asyncIterator]() {
    if (body !== undefined) {
      yield typeof body === 'string' ? body : JSON.stringify(body);
    }
  },
});

const makeRes = () => {
  const headers = {};
  let body = '';

  const res = {
    statusCode: 200,
    setHeader(name, value) {
      headers[name.toLowerCase()] = value;
    },
    end(payload = '') {
      body += payload;
    },
  };

  return {
    res,
    get body() {
      return body ? JSON.parse(body) : null;
    },
    get headers() {
      return headers;
    },
    get statusCode() {
      return res.statusCode;
    },
  };
};

const validHeaders = {
  'content-type': 'application/json',
  origin: allowedOrigin,
};

const validBody = {
  systemPrompt: 'Reply briefly.',
  userPrompt: 'Say OK.',
  model: 'mistral-large-latest',
};

test.beforeEach(() => {
  process.env.MISTRAL_API_KEY_1 = 'test-key-1';
  process.env.MISTRAL_API_KEY_2 = 'test-key-2';
  process.env.MISTRAL_MODEL = 'mistral-large-latest';
  globalThis.fetch = async () => new Response(JSON.stringify({
    choices: [{ message: { content: 'OK.' } }],
  }), {
    headers: { 'content-type': 'application/json' },
    status: 200,
  });
});

test.afterEach(() => {
  process.env = { ...originalEnv };
  globalThis.fetch = originalFetch;
});

test('rejects invalid method', async () => {
  const response = makeRes();

  await handler(makeReq({ headers: validHeaders, method: 'GET' }), response.res);

  assert.equal(response.statusCode, 405);
  assert.equal(response.body.error, 'Method not allowed.');
  assert.equal(response.headers['cache-control'], 'no-store');
});

test('rejects non-json requests', async () => {
  const response = makeRes();

  await handler(makeReq({
    body: validBody,
    headers: { origin: allowedOrigin, 'content-type': 'text/plain' },
  }), response.res);

  assert.equal(response.statusCode, 415);
  assert.equal(response.body.error, 'Content-Type must be application/json.');
});

test('rejects missing prompts', async () => {
  const response = makeRes();

  await handler(makeReq({ body: {}, headers: validHeaders }), response.res);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, 'systemPrompt and userPrompt are required.');
});

test('rejects disallowed model', async () => {
  let fetchCalled = false;
  globalThis.fetch = async () => {
    fetchCalled = true;
    return new Response('{}');
  };
  const response = makeRes();

  await handler(makeReq({
    body: { ...validBody, model: 'unbounded-expensive-model' },
    headers: validHeaders,
  }), response.res);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, 'Unsupported model.');
  assert.equal(fetchCalled, false);
});

test('rejects disallowed origin', async () => {
  const response = makeRes();

  await handler(makeReq({
    body: validBody,
    headers: { ...validHeaders, origin: 'https://attacker.example' },
  }), response.res);

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.error, 'Origin is not allowed.');
});

test('accepts allowed origin with valid payload using mocked fetch', async () => {
  let fetchRequest;
  globalThis.fetch = async (url, init) => {
    fetchRequest = { url, init };
    return new Response(JSON.stringify({
      choices: [{ message: { content: 'OK.' } }],
    }), {
      headers: { 'content-type': 'application/json' },
      status: 200,
    });
  };
  const response = makeRes();

  await handler(makeReq({ body: validBody, headers: validHeaders }), response.res);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.content, 'OK.');
  assert.equal(response.body.provider, 'mistral');
  assert.equal(response.body.keySlot, 1);
  assert.equal(fetchRequest.url, 'https://api.mistral.ai/v1/chat/completions');
  assert.equal(fetchRequest.init.headers.Authorization, 'Bearer test-key-1');
  assert.equal(JSON.parse(fetchRequest.init.body).model, 'mistral-large-latest');
  assert.equal(response.headers['access-control-allow-origin'], allowedOrigin);
});

test('accepts the exact current Vercel deployment origin', async () => {
  process.env.VERCEL_URL = 'vibecraft-preview-h4ck3d.vercel.app';
  const previewOrigin = 'https://vibecraft-preview-h4ck3d.vercel.app';
  const response = makeRes();

  await handler(makeReq({
    body: validBody,
    headers: { ...validHeaders, origin: previewOrigin },
  }), response.res);

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['access-control-allow-origin'], previewOrigin);
});
