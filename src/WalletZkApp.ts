import {
  Bool,
  Circuit,
  Field,
  isReady,
  method,
  SmartContract,
  state,
  State,
  Poseidon,
} from 'snarkyjs';

import {
  // Biometric,
  // BiometricWitness,
  GuardianWitness,
} from './index.js';

export { WalletZkApp };

await isReady;

const MAIN_PASSWORD = Poseidon.hash([Field(1)]);

let w = {
  isLeft: false,
  sibling: Field(0),
};
let dummyWitness = Array.from(Array(GuardianWitness.height - 1).keys()).map(
  () => w
);

// we need the initiate tree root in order to tell the contract about our off-chain storage
let initialCommitment: Field = Field(0);

class WalletZkApp extends SmartContract {
  @state(Field) mainPassword = State<Field>();
  @state(Field) commitedBiometrics = State<Field>();
  @state(Field) committedGuardians = State<Field>();
  @state(Field) guardianCounter = State<Field>();
  @state(Bool) useBiometrics = State<Bool>();

  init() {
    super.init();
    this.mainPassword.set(MAIN_PASSWORD);
    this.commitedBiometrics.set(initialCommitment);
    this.committedGuardians.set(initialCommitment);
    this.guardianCounter.set(Field(0));
  }

  @method addBiometrics(
    hashedPassword: Field,
    biometricRoot: Field,
    activate: Bool
  ) {
    let mainPassword = this.mainPassword.get();
    this.mainPassword.assertEquals(mainPassword);

    let commitedBiometrics = this.commitedBiometrics.get();
    this.commitedBiometrics.assertEquals(commitedBiometrics);

    let useBiometrics = this.useBiometrics.get();
    this.useBiometrics.assertEquals(useBiometrics);

    // check that the password is correct
    hashedPassword.assertEquals(mainPassword);

    this.commitedBiometrics.set(biometricRoot);
    this.useBiometrics.set(activate);
  }

  @method addGuadians(
    hashedPassword: Field,
    guardianRoot: Field,
    counter: Field
  ) {
    let commitmentGuardians = this.committedGuardians.get();
    this.committedGuardians.assertEquals(commitmentGuardians);

    let useBiometrics = this.useBiometrics.get();
    this.useBiometrics.assertEquals(useBiometrics);

    let mainPassword = this.mainPassword.get();
    this.mainPassword.assertEquals(mainPassword);

    // check that the password is correct
    hashedPassword.assertEquals(mainPassword);

    this.committedGuardians.set(guardianRoot);
    this.guardianCounter.set(counter);
  }

  // @method addGuardians(value: Field, biometric: Biometric, path: BiometricWitness, guardianRoot: Field, counter: Field) {
  //   // should be guard by owner's biometrics
  //   let commitmentBiometrics = this.commitedBiometrics.get();
  //   this.commitedBiometrics.assertEquals(commitmentBiometrics);

  //   facialScan.biometricHash.assertEquals(value);

  //   // we check that the hashed biometric is within the committed Merkle Tree
  //   path.calculateRoot(biometric.hash()).assertEquals(commitmentBiometrics);

  //   let commitmentGuardians = this.committedGuardians.get();
  //   this.committedGuardians.assertEquals(commitmentGuardians);

  //   this.committedGuardians.set(guardianRoot);
  //   this.guardianCounter.set(counter);
  // }
}
