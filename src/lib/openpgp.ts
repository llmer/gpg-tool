import { z } from 'zod';

const keySourceSchema = z.union([
  z.object({
    type: z.literal('fingerprint'),
    value: z.string().regex(/^[A-F0-9]{40}$/, 'Invalid fingerprint format'),
  }),
  z.object({
    type: z.literal('keyid'),
    value: z.string().regex(/^[A-F0-9]{16}$/, 'Invalid key ID format'),
  }),
  z.object({
    type: z.literal('email'),
    value: z.string().email('Invalid email address'),
  }),
]);

export type KeySource = z.infer<typeof keySourceSchema>;

function detectKeyType(input: string): KeySource {
  // Remove any whitespace and convert to uppercase
  const value = input.trim().toUpperCase();

  // Check for fingerprint (40 hex characters)
  if (/^[A-F0-9]{40}$/.test(value)) {
    return { type: 'fingerprint', value };
  }

  // Check for key ID (16 hex characters)
  if (/^[A-F0-9]{16}$/.test(value)) {
    return { type: 'keyid', value };
  }

  // Check for email
  if (/^[^@]+@[^@]+\.[^@]+$/.test(input.trim())) {
    return { type: 'email', value: input.trim() };
  }

  throw new Error(
    'Invalid format. Please provide:\n' +
    '• A 40-character fingerprint (hex)\n' +
    '• A 16-character key ID (hex)\n' +
    '• An email address'
  );
}

export async function fetchOpenPGPKey(input: string): Promise<string> {
  const source = detectKeyType(input);
  const baseUrl = 'https://keys.openpgp.org';
  let endpoint: string;

  switch (source.type) {
    case 'fingerprint':
      endpoint = `/vks/v1/by-fingerprint/${source.value}`;
      break;
    case 'keyid':
      endpoint = `/vks/v1/by-keyid/${source.value}`;
      break;
    case 'email':
      endpoint = `/vks/v1/by-email/${encodeURIComponent(source.value)}`;
      break;
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Accept': 'application/pgp-keys',
      },
    });

    if (!response.ok) {
      switch (response.status) {
        case 404:
          throw new Error(`No key found for ${source.type}: ${source.value}`);
        case 429:
          throw new Error('Rate limit exceeded. Please try again later.');
        default:
          throw new Error(`OpenPGP.org API error: ${response.status} ${response.statusText}`);
      }
    }

    const key = await response.text();
    if (!key.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----')) {
      throw new Error('Invalid key format received from server');
    }

    return key;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching OpenPGP key:', error.message);
      throw error;
    }
    console.error('Error fetching OpenPGP key:', error);
    throw new Error('An unexpected error occurred while fetching the key');
  }
}