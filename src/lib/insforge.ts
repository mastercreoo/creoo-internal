import { createClient } from '@insforge/sdk';

let _client: ReturnType<typeof createClient> | null = null;

function getClient(): ReturnType<typeof createClient> {
  if (_client) return _client;

  const baseUrl = process.env.INSFORGE_API_BASE_URL;
  const apiKey = process.env.INSFORGE_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      'INSFORGE_API_BASE_URL and INSFORGE_API_KEY must be set in .env.local',
    );
  }

  _client = createClient({ baseUrl, anonKey: apiKey });
  return _client;
}

// Lazy proxy — client is created only on first method call (safe for SSR imports)
function lazyProxy<T extends object>(getter: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop: string | symbol) {
      const target = getter();
      const val = (target as any)[prop];
      return typeof val === 'function' ? val.bind(target) : val;
    },
  });
}

export const insforge = lazyProxy(() => getClient());
export const db = lazyProxy(() => getClient().database);
