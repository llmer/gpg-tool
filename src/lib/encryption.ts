import * as openpgp from 'openpgp';

export async function encryptFile(
  file: File,
  publicKeys: string[]
): Promise<{ encrypted: Uint8Array; filename: string }> {
  try {
    // Read the file as binary data
    const fileData = await file.arrayBuffer();
    
    // Create a message from the binary data
    const message = await openpgp.createMessage({
      binary: new Uint8Array(fileData)
    });

    // Parse all public keys
    const parsedPublicKeys = await Promise.all(
      publicKeys.map(key => openpgp.readKey({ armoredKey: key }))
    );

    // Encrypt the message for all recipients
    const encrypted = await openpgp.encrypt({
      message,
      encryptionKeys: parsedPublicKeys,
      format: 'binary'
    });

    // Ensure we handle the encrypted data as Uint8Array
    const encryptedData = encrypted as Uint8Array;

    return {
      encrypted: encryptedData,
      filename: `${file.name}.gpg`
    };
  } catch (error) {
    console.error('Encryption error:', error);
    if (error instanceof Error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
    throw new Error('Encryption failed: Unknown error occurred');
  }
}