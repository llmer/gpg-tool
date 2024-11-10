import { fetchGitHubGPGKeys } from './github';
import { fetchOpenPGPKey } from './openpgp';

export type KeyProvider = 'github' | 'openpgp';

export interface RecipientSource {
  provider: KeyProvider;
  identifier: string;
}

export async function fetchPublicKey(source: RecipientSource): Promise<string> {
  switch (source.provider) {
    case 'github':
      const keys = await fetchGitHubGPGKeys(source.identifier);
      return keys[0];

    case 'openpgp':
      return await fetchOpenPGPKey(source.identifier);

    default:
      throw new Error(`Unsupported key provider: ${source.provider}`);
  }
}