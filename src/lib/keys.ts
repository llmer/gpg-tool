import * as openpgp from 'openpgp';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
  fingerprint: string;
}

export async function generateKeyPair(
  name: string,
  email: string,
  passphrase: string
): Promise<KeyPair> {
  try {
    const { privateKey, publicKey } = await openpgp.generateKey({
      type: 'rsa',
      rsaBits: 4096,
      userIDs: [{ name, email }],
      passphrase,
    });

    const privKey = await openpgp.readPrivateKey({ armoredKey: privateKey });
    const fingerprint = privKey.getFingerprint();

    return {
      publicKey,
      privateKey,
      fingerprint,
    };
  } catch (error) {
    console.error('Key generation error:', error);
    throw new Error('Failed to generate GPG key pair');
  }
}

export async function importKeyPair(
  publicKeyArmored: string,
  privateKeyArmored: string
): Promise<KeyPair> {
  try {
    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
    const privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });
    
    return {
      publicKey: publicKeyArmored,
      privateKey: privateKeyArmored,
      fingerprint: privateKey.getFingerprint(),
    };
  } catch (error) {
    console.error('Key import error:', error);
    throw new Error('Invalid key format or corrupted keys');
  }
}

export function saveKeyPair(keyPair: KeyPair): void {
  try {
    const encryptedData = window.btoa(JSON.stringify(keyPair));
    localStorage.setItem('gpg-keypair', encryptedData);
  } catch (error) {
    console.error('Key storage error:', error);
    throw new Error('Failed to save keys to local storage');
  }
}

export function loadKeyPair(): KeyPair | null {
  try {
    const stored = localStorage.getItem('gpg-keypair');
    if (!stored) return null;
    return JSON.parse(window.atob(stored));
  } catch (error) {
    console.error('Key loading error:', error);
    return null;
  }
}

export function removeKeyPair(): void {
  localStorage.removeItem('gpg-keypair');
}