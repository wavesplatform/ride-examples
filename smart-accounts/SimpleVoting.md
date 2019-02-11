# Sponsored Voting by any token with minimal fee

Any user can init voting with variats “pros”/”cons”

All votings should start from Registrar Account 
Sctipt already deployed to account with Registrar public key is azWhyNMQjEY9AQt2eySXXqR28NJwEbJTKy132zkVoTe

Script checks if initiator payed fee for voting.

To start voting initiator should set data transaction to it’s account with following data:

| Key   | Value   |
| ----- | ------- | 
| pros  | Address |
| cons  | Address | 

Initiator sends tokens for voting to Registrar account using Transfer transaction. Save transaction id (feeTransferId)
In attachment of transfer tx, initiator should put a voting question.

Then Initiator sends Waves to Registrar account to pay fee for voting users,
in transaction's attachment put the same voting question. Save transaction id (assetTransferId)

`waves_amount = tokens_count * 500_000`
 
 Initiator send a data transaction from Registrar account with following fields:
 
 | Key   | Value   | Type |
 | ----- | ------- | ----- | 
 | < Voting question sha256Hash >  | < Initiator Address > | String |
 | < Voting question sha256Hash >_height | < maxVotingHeight > | Int |
 | < Voting question sha256Hash >_asset | < voting assetId > | ByteString |
 
 Data transaction proofs should contain:

| Proof index   | Value   | 
| ----- | ------- | 
| 0  | feeTransferId | 
| 1  | assetTransferId | 
| 2  | initiator public key | 
| 3  | initiator signature |

Any user can vote, if one has at least one Waves token.


Voting (transafer tx from Registrar account) is allowed if 
1. User sends asset to pros/cons addresses
2. tx attachment equal to voting question
3. Amount equal to 1
4. fee = 500_000
5. proof[0] = voter public key
6. proof[1]  = voter signature
  