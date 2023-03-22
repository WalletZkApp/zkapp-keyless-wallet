import { Field, MerkleWitness, PublicKey, Poseidon, Struct } from 'snarkyjs';

export { Guardian, GuardianWitness };

class GuardianWitness extends MerkleWitness(4) {}

class Guardian extends Struct({
  publicKey: PublicKey,
  guardianId: Field,
  nullifier: Field,
}) {
  static from(publicKey: PublicKey, guardianId: Field, nullifier: Field) {
    return new Guardian({ publicKey, guardianId, nullifier });
  }

  static empty() {
    return Guardian.from(PublicKey.empty(), Field(0), Field(0));
  }

  hash(): Field {
    return Poseidon.hash(
      this.publicKey
        .toFields()
        .concat(this.guardianId.toFields())
        .concat(this.nullifier.toFields())
    );
  }
}
