import {
  Bool,
  Field,
  isReady,
  method,
  SmartContract,
  state,
  State,
  Poseidon,
  // PrivateKey,
} from 'snarkyjs';
import { Nullifier } from './Nullifier';

export { WalletZkApp, MAIN_PASSWORD };

await isReady;

// generate a random salt
const salt = Field.random();
const MAIN_PASSWORD = Poseidon.hash([salt, Field(1)]);

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

  @method generateNullifier(nullifier: Nullifier) {
    nullifier.generateNullifier();
  }
}
