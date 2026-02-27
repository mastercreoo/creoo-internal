import { createClient } from '@insforge/sdk';

const baseUrl = process.env.INSFORGE_API_BASE_URL;
const apiKey = process.env.INSFORGE_API_KEY;

if (!baseUrl || !apiKey) {
  throw new Error(
    'INSFORGE_API_BASE_URL and INSFORGE_API_KEY must be set in the environment.',
  );
}

export const insforge = createClient({
  baseUrl,
  anonKey: apiKey,
});

export const db = insforge.database;
