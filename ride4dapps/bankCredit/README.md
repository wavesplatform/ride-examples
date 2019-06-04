# Bank credit dApp
We assume that customer account have some value by itself
#### E.g: 
* Account could control another dapp
* It is tied to his passport via government service
* Owning an account provides ownership of some real world thing
* Customer completed some complex KYC with this account on third party service

## Workflow 
1. Bank approves credit for some address via `approveCredit` function. It defines client address, amount of money, target height to return and account script for client.
2. Customer sets `lock script` fon his account.
3. Customer can get money if he provides proof, that script was indeed set on his account
4. Customer can cancel credit contract via 'cancelCredit' if he didn't take the money
5. Customer can return money via 'returnMoney' function

## Simplifications for this version:
a) This version does not account interest, but it can be easily added via additional argument to 'approveCredit'
b) This version does not separate different credit contracts for one account. For now it is possible to have only one. Having multiple contracts can also be implemented with contract id's

## Account lock script:
Customer sets account script, which forbids setting another account script. After target height script forbids any operations other than calling dApp functions. If contract status is in `["returned", "canceled"]`, script allows to unset itself
