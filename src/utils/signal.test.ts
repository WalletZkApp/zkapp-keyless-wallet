import { hexToUint8Array, messageToUint8Array } from './encoding';
import { CURVE, getPublicKey, Point } from '@noble/secp256k1';
import { computeHashMPk, computeNullifer } from './signal';

const testKey =
  '519b423d715f8b581f4fa8ee59f4771a5b44c8130b4e3eacca54a56dda72b464';
export const encodedKey = hexToUint8Array(testKey);

export const testPublicKeyPoint = Point.fromPrivateKey(encodedKey);
export const testPublicKey = getPublicKey(encodedKey, true);
export const testMessageString = 'An example app message string';
export const encodedMessage = messageToUint8Array(testMessageString);

describe('signal', () => {
  describe('computeHashMPk', () => {
    it('should compute the correct hash', () => {
      const hashMPk = computeHashMPk(
        encodedMessage,
        Buffer.from(testPublicKey)
      );
      console.log('hashMPk', hashMPk);
    });
  });

  describe('nullifier', () => {
    it('should compute the correct nullifier', () => {
      console.log('testKey', testKey);
      console.log('testSecretKey', encodedKey);
      console.log('testPublicKey', Buffer.from(testPublicKey));
      const hashMPk = computeHashMPk(
        encodedMessage,
        Buffer.from(testPublicKey)
      );
      const nullifier = computeNullifer(hashMPk, encodedKey);
      console.log('nullifier x', nullifier.x.toString(16));
      console.log('nullifier y', nullifier.y.toString(16));
    });
  });
});
