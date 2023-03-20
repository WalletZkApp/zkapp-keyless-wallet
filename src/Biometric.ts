import { Field, MerkleWitness, PublicKey, Poseidon, Struct } from 'snarkyjs';

export { Biometric, BiometricWitness };

class BiometricWitness extends MerkleWitness(4) {}

class Biometric extends Struct({
  biometricHash: Field,
}) {
  static from(value: Field) {
    return new Biometric({ biometricHash: value });
  }

  hash(): Field {
    return Poseidon.hash(this.biometricHash.toFields());
  }
}
