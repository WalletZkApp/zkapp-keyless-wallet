import { getPublicKey } from '@noble/secp256k1';
import { Field, Struct } from 'snarkyjs';
import { computeHashMPk, computeNullifer } from './utils/signal';
import { hexToUint8Array, messageToUint8Array } from './utils/encoding';
import { stringFromFields } from 'snarkyjs/dist/node/lib/encoding';

export class Nullifier extends Struct({
  secret: String,
  message: String,
  nullifierX: String,
  nullifierY: String,
}) {
  static from(
    secret: string,
    message: string,
    nullifierX: string,
    nullifierY: string
  ) {
    return new Nullifier({ secret, message, nullifierX, nullifierY });
  }

  static empty() {
    return Nullifier.from('', '', '', '');
  }

  generateNullifier(): any {
    let encodedKey = hexToUint8Array(this.secret);
    let publicKey = getPublicKey(encodedKey, true);
    let encodedMessage = messageToUint8Array(this.message);
    let hashMPK = computeHashMPk(encodedMessage, Buffer.from(publicKey));
    let nullifier = computeNullifer(hashMPK, encodedKey);
    this.nullifierX = nullifier.x.toString(16);
    this.nullifierY = nullifier.y.toString(16);
    return nullifier;
  }
}
