import { Field, Poseidon, PrivateKey, PublicKey, isReady } from 'snarkyjs';
import { Guardian } from './Guardian.js';

describe('Guardian', () => {
  beforeAll(async () => {
    await isReady;
  });
  describe('#Guardian().from', () => {
    it('create a new guardian', async () => {
      const guardianAccount = PrivateKey.random().toPublicKey();
      const guardian = Guardian.from(guardianAccount, Field(100), Field(1));
      expect(guardian.publicKey).toEqual(guardianAccount);
      expect(guardian.guardianId).toEqual(Field(100));
      expect(guardian.nullifier).toEqual(Field(1));
    });
  });

  describe('#empty().from', () => {
    it('create a new guardian', async () => {
      const guardian = Guardian.empty();
      expect(guardian.publicKey).toEqual(PublicKey.empty());
      expect(guardian.guardianId).toEqual(Field(0));
      expect(guardian.nullifier).toEqual(Field(0));
    });
  });

  describe('#hash()', () => {
    it('should return hash of the guardian', async () => {
      const guardianAccount = PrivateKey.random().toPublicKey();
      const guardianHash = Poseidon.hash(
        guardianAccount.toFields().concat(Field(1)).concat(Field(2))
      );
      const newGuardian = Guardian.from(guardianAccount, Field(1), Field(2));
      expect(newGuardian.hash()).toEqual(guardianHash);
    });
  });
});
