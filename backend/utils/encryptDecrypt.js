const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const secretKey = crypto
  .createHash('sha256')
  .update(process.env.SECRET_KEY || 'U2FsdGVkX19iZ2ZzYk4qL2IxUnVfN0Z')
  .digest();

const encrypt = (text) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return {
      iv: iv.toString('hex'),
      content: encrypted.toString('hex')
    };
  } catch (error) {
    console.error('Encryption failed:', error.message);
    throw new Error('Encryption failed');
  }
};

const decrypt = (hash) => {
  try {
    const decipher = crypto.createDecipheriv(
      algorithm,
      secretKey,
      Buffer.from(hash.iv, 'hex')
    );
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(hash.content, 'hex')),
      decipher.final()
    ]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption failed:', error.message);
    throw new Error('Decryption failed');
  }
};

module.exports = { encrypt, decrypt };
