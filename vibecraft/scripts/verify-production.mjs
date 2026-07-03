const productionUrl = process.env.VIBECRAFT_PRODUCTION_URL || 'https://vibecraft.rubberduck.sk';
const origin = new URL(productionUrl).origin;
const shouldCallMistral = process.env.VIBECRAFT_VERIFY_MISTRAL === '1';

const checks = [];

const record = (name, passed, detail) => {
  checks.push({ name, passed, detail });
};

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

try {
  const homepage = await fetch(productionUrl, { method: 'HEAD' });
  record('homepage HEAD', homepage.status === 200, `${homepage.status}`);
} catch (error) {
  record('homepage HEAD', false, error instanceof Error ? error.message : 'unknown error');
}

try {
  const preflight = await fetch(`${origin}/api/mistral`, {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
    },
  });
  const allowedOrigin = preflight.headers.get('access-control-allow-origin');
  const allowMethods = preflight.headers.get('access-control-allow-methods') || '';

  record(
    'mistral OPTIONS',
    preflight.status === 204
      && allowedOrigin === origin
      && allowMethods.includes('POST'),
    `${preflight.status}, origin=${allowedOrigin || 'none'}, methods=${allowMethods || 'none'}`
  );
} catch (error) {
  record('mistral OPTIONS', false, error instanceof Error ? error.message : 'unknown error');
}

if (shouldCallMistral) {
  try {
    const response = await fetch(`${origin}/api/mistral`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
      },
      body: JSON.stringify({
        systemPrompt: 'Reply with exactly OK.',
        userPrompt: 'Health check',
        model: 'mistral-large-latest',
      }),
    });
    const data = await response.json().catch(() => ({}));

    record(
      'mistral POST',
      response.status === 200 && data.content === 'OK.',
      `${response.status}, provider=${data.provider || 'none'}, keySlot=${data.keySlot || 'none'}`
    );
  } catch (error) {
    record('mistral POST', false, error instanceof Error ? error.message : 'unknown error');
  }
} else {
  record('mistral POST', true, 'skipped; set VIBECRAFT_VERIFY_MISTRAL=1 to call the model');
}

for (const check of checks) {
  console.log(`${check.passed ? 'PASS' : 'FAIL'} ${check.name}: ${check.detail}`);
}

if (checks.some((check) => !check.passed)) {
  fail('Production verification failed.');
}
