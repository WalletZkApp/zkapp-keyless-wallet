Summary
This proposal outlines a standard API interface for smart contract wallets to enable basic functionality such as depositing and withdrawing MINA. The goal is to make it possible for other zkApp applications to reuse wallets, and the interface includes pure view functions and mutation functions requiring @method, as well as events associated with the wallet.

Specification
Wallet

Interface Description

```
type IWallet = {
  // pure view functions which don't need @method
  //

  //balanceOf custom erc20 token within the wallet
  balanceOf(erc20: PublicKey): UInt64;

  // mutations which need @method
  //

  // deposit amount of MINA to the contract
  deposit(amount: UInt64): Bool;

  // withdraw amount of MINA from contract to an address
  withdraw(to: PublicKey, amount: UInt64): Bool;

  // transfer an erc20 token from contract to an address
  transfer(erc20: PublicKey,  to: PublicKey, value:UInt64): Bool;

  events: {
    Deposit: ProvablePure<{
      to: PublicKey;
      sender: PublicKey;
      amount: UInt64;
    }>;
    Withdraw: ProvablePure<{
      from: PublicKey;
      to: PublicKey;
      value: UInt64;
    }>;
    Transfer: ProvablePure<{
      from: PublicKey;
      to: PublicKey;
      value: UInt64;
    }>;
  };
};
```
