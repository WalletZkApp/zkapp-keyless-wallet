import { Field, Poseidon, isReady } from 'snarkyjs';
import { Biometric } from './Biometric.js';

describe('Biometric', () => {
  beforeAll(async () => {
    await isReady;
  });
  describe('#Biometric().from', () => {
    it('create a new Biometric', async () => {
      const biometricHash = Field.random();
      const biometric = Biometric.from(biometricHash);
      expect(biometric.biometricHash).toEqual(biometricHash);
    });
  });

  describe('#empty().from', () => {
    it('create a new Biometric', async () => {
      const biometric = Biometric.empty();
      expect(biometric.biometricHash).toEqual(Field(0));
    });
  });

  describe('#hash()', () => {
    it('should return hash of the Biometric', async () => {
      const randomHash = Field.random();
      const biometricHash = Poseidon.hash(randomHash.toFields());
      const newBiometric = Biometric.from(randomHash);
      expect(newBiometric.hash()).toEqual(biometricHash);
    });
  });
});
