import forge from "node-forge";

/**
 * Function to generate the Chat ID and its Salt!
 *
 * To enerate the ID we are using the senderId + the recipientId,
 * and the salt is a random byte sequence
 * @param senderId
 * @param recipientId
 * @returns
 */
export const generateChatId = (senderId: string, recipientId: string) => {
  const sum = parseInt(senderId) + parseInt(recipientId);
  const newId = forge.sha256.create().update(sum.toString()).digest().toHex();
  const chatSalt = forge.util.bytesToHex(forge.random.getBytesSync(16));
  return { id: newId, salt: chatSalt };
};

/**
 * Function to encrypt one message
 * We receive the message (plain text), the message timestamp,
 * the chat ID and its salt.
 *
 * With these params we use `sha256` and `pbkdf2` to generate both
 * Key and IV
 *
 * With these info we can use the AES-GCM algorithm to encrypt the text.
 *
 * it returns the encrypted text and the Authentication Tag (MAC)
 * concatenated!
 *
 * @param message
 * @param timestamp
 * @param chatId
 * @param salt
 * @returns
 */
export const encryptMessage = (
  message: string,
  timestamp: string,
  chatId: string,
  salt: string
) => {
  const keyPass = forge.sha256.create().update(chatId).digest().toHex();
  const key = forge.pkcs5.pbkdf2(keyPass, salt, 1000, 32);

  const ivPass = forge.sha256.create().update(timestamp).digest().toHex();
  const iv = forge.pkcs5.pbkdf2(ivPass, salt, 1000, 12);

  const cipher = forge.cipher.createCipher("AES-GCM", key);

  cipher.start({ iv: iv });
  cipher.update(forge.util.createBuffer(message));
  cipher.finish();

  // Cipher Text
  const encrypted = cipher.output.toHex();
  // tag = MAC
  const tag = cipher.mode.tag.toHex();

  return `${encrypted}-${tag}`;
};

/**
 * Function to decrypt the message, returning the plain text!
 * We need the same params of the Encryption function and
 * the message should be the encrypted text (with encrypted text and Auth tag
 * concatenated)
 *
 * @param message
 * @param timestamp
 * @param chatId
 * @param salt
 * @returns
 */
export const decryptMessage = (
  message: string,
  timestamp: string,
  chatId: string,
  salt: string
) => {
  const encrypted = message.split("-")[0];
  const tag = message.split("-")[1];

  const keyPass = forge.sha256.create().update(chatId).digest().toHex();
  const key = forge.pkcs5.pbkdf2(keyPass, salt, 1000, 32);

  const ivPass = forge.sha256.create().update(timestamp).digest().toHex();
  const iv = forge.pkcs5.pbkdf2(ivPass, salt, 1000, 12);

  const decipher = forge.cipher.createDecipher("AES-GCM", key);
  decipher.start({
    iv: iv,
    tag: forge.util.createBuffer(forge.util.hexToBytes(tag)),
  });

  decipher.update(forge.util.createBuffer(forge.util.hexToBytes(encrypted)));

  const pass = decipher.finish();

  // if this is false, then it is not valid!
  if (pass) return decipher.output.toString();

  return "NOT VALID";
};
