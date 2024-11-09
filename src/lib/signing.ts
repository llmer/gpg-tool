import * as openpgp from 'openpgp';

export async function signMessage(
  message: string,
  privateKeyArmored: string,
  passphrase: string
): Promise<string> {
  try {
    const privateKey = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
      passphrase
    });

    const signed = await openpgp.sign({
      message: await openpgp.createMessage({ text: message }),
      signingKeys: privateKey,
      detached: false
    });

    return signed as string;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Signing failed: ${error.message}`);
    }
    throw new Error('Signing failed: Unknown error occurred');
  }
}

export async function verifyMessage(
  signedMessage: string,
  publicKeyArmored: string
): Promise<{ valid: boolean; message: string }> {
  try {
    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
    const message = await openpgp.readMessage({ armoredMessage: signedMessage });
    
    const { signatures } = await openpgp.verify({
      message,
      verificationKeys: publicKey
    });

    const valid = await signatures[0].verified;
    const originalMessage = message.getText();

    return {
      valid,
      message: originalMessage
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Verification failed: ${error.message}`);
    }
    throw new Error('Verification failed: Unknown error occurred');
  }
}