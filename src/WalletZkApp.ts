import {
  AccountUpdate,
  Bool,
  Field,
  isReady,
  method,
  SmartContract,
  state,
  State,
  Poseidon,
  PublicKey,
  Permissions,
  ProvablePure,
  provablePure,
  UInt64,
  Mina,
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

type IWallet = {
  // mutations which need @method
  deposit(amount: UInt64): Bool; // emits "Deposit" event
  withdraw(to: PublicKey, amount: UInt64): Bool; // emits "Withdraw" event
  // events
  events: {
    Deposit: ProvablePure<{
      from: PublicKey;
      to: PublicKey;
      amount: UInt64;
    }>;
    Withdraw: ProvablePure<{
      from: PublicKey;
      to: PublicKey;
      amount: UInt64;
    }>;
  };
};
class WalletZkApp extends SmartContract implements IWallet {
  @state(Field) mainPassword = State<Field>();
  @state(Field) commitedBiometrics = State<Field>();
  @state(Field) committedGuardians = State<Field>();
  @state(Field) guardianCounter = State<Field>();
  @state(Bool) useBiometrics = State<Bool>();

  @state(Bool) paused = State<Bool>();

  events = {
    Deposit: provablePure({
      from: PublicKey,
      to: PublicKey,
      amount: UInt64,
    }),
    Withdraw: provablePure({
      from: PublicKey,
      to: PublicKey,
      amount: UInt64,
    }),
    Paused: provablePure({
      account: PublicKey,
    }),
    Unpaused: provablePure({
      account: PublicKey,
    }),
  };

  init() {
    super.init();
    this.mainPassword.set(MAIN_PASSWORD);
    this.commitedBiometrics.set(initialCommitment);
    this.committedGuardians.set(initialCommitment);
    this.guardianCounter.set(Field(0));
    this.account.permissions.set({
      ...Permissions.default(),
      send: Permissions.proofOrSignature(),
    });
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

  @method deposit(amount: UInt64): Bool {
    let paused = this.paused.get();
    this.paused.assertEquals(paused);
    // should not be paused
    paused.assertEquals(Bool(false));

    amount.assertGreaterThan(UInt64.from(0));

    const senderBalance = Mina.getBalance(this.sender);
    senderBalance.assertGreaterThanOrEqual(amount);

    const payerUpdate = AccountUpdate.create(this.sender);
    payerUpdate.requireSignature();
    payerUpdate.send({ to: this.address, amount: amount });

    this.emitEvent('Deposit', {
      from: this.sender,
      to: this.address,
      amount: amount,
    });
    return Bool(true);
  }

  @method withdraw(to: PublicKey, amount: UInt64): Bool {
    let paused = this.paused.get();
    this.paused.assertEquals(paused);
    // should not be paused
    paused.assertEquals(Bool(false));

    // TODO: check that the sender is the owner of the wallet or
    // or knows the main password
    // or proof of biometrics
    amount.assertGreaterThan(UInt64.from(0));

    const walletBalance = Mina.getBalance(this.address);
    walletBalance.assertGreaterThanOrEqual(amount);

    this.send({ to: to, amount });

    this.emitEvent('Withdraw', {
      from: this.address,
      to: to,
      amount: amount,
    });
    return Bool(true);
  }

  @method pause() {
    // TODO: check that the sender is the owner of the wallet or
    // or knows the main password
    // or proof of biometrics
    let paused = this.paused.get();
    this.paused.assertEquals(paused);

    paused.assertEquals(Bool(false));

    this.paused.set(Bool(true));
    this.emitEvent('Paused', {
      account: this.sender,
    });
  }

  @method unpause() {
    let paused = this.paused.get();
    this.paused.assertEquals(paused);

    paused.assertEquals(Bool(true));

    this.paused.set(Bool(false));
    this.emitEvent('Unpaused', {
      account: this.sender,
    });
  }

  @method generateNullifier(nullifier: Nullifier) {
    nullifier.generateNullifier();
  }
}
