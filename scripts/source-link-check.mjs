const defaultSleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function requestOnce(url, method, request, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await request(url, { method, redirect: "follow", signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function checkSourceLink(item, { request = fetch, sleep = defaultSleep, attempts = 3, timeoutMs = 15_000 } = {}) {
  let lastFailure;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      let response = await requestOnce(item.url, "HEAD", request, timeoutMs);
      if (response.status === 403 || response.status === 405) {
        if (response.body) await response.body.cancel();
        response = await requestOnce(item.url, "GET", request, timeoutMs);
      }
      if (response.body) await response.body.cancel();
      if (response.ok) return { item, attempts: attempt, status: response.status };
      lastFailure = new Error(`${item.owner}: source returned HTTP ${response.status}: ${item.url}`);
      if (response.status !== 429 && response.status < 500) break;
    } catch (error) {
      lastFailure = new Error(`${item.owner}: source check failed (${error.name}): ${item.url}`);
    }
    if (attempt < attempts) await sleep(250 * 2 ** (attempt - 1));
  }
  throw lastFailure || new Error(`${item.owner}: source check failed: ${item.url}`);
}
