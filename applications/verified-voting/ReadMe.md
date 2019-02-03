# Sponsored KYC voting


Any user can init a voting with answers "pros" or "cons" with verified users.
Any voting process should be registered at Voting Registrar Account 

#### Voting initiator account, voting assets (VA) and Voting Registrar Account (VR) should be scripted
Scripts can guarantee:
1. Voter selected only one choice "pros" or "cons" (send a token to one of these addresses)
2. Vote initiator payed fee for voting procedure
3. Voting finished at max voting height
4. Minimal voting interval is 100 blocks
  
  
## Script and voting details

Voting Registrar Account should contain script that checks new voting registration process and users' voting
Before setting script to VR account data with addresses for voting answers should be created

Data format:  

| Type      | Key      | Value     |
| --------- |:--------:| ---------:|
| String    | pros     |  Address  |
| String    | cons     |  Address  |

#### After applying VotingRegistrar script users can initiate votes.

#### Voting Initiator (VI) account sets a data with verified accounts

Data format:

| Type      | Key       | Value     |
| --------- |:---------:| ---------:|
| Boolean   | Address   |  true     |

#### To register a new voting VI account should
1. Script own account using VotingInitiatorSmartAccount script
⋅⋅* Store tx id (setScriptTxId)
⋅⋅* Script is standard for all VI accounts.
⋅⋅* Script should not be modified as it's hash would be checked at voting registration process
2. Issue new asset with properties
⋅⋅* reissuable  = false
⋅⋅* token decimals = 0
⋅⋅* quantity is equal to number of voters
⋅⋅* description = voting question
3. Send Waves to pay fees for all voters. Save transaction Id (feeTransferId) 
Transaction properties:
⋅⋅* amount = token quantity * 900_000 (where 900_000 is fee for one transfer tx - smartaccount fee + smartasset fee)
⋅⋅* attachment = assetId 
4. Sign and send DataTransaction from VR account.
Transaction properties:
⋅⋅* proof at index 0 = feeTransferId
⋅⋅* proof at index 1 = signature. Tx should be signed by Voting Initiator account
Data format:

| Type      | Key        | Value             |
| --------- |:----------:| -----------------:|
| Integer   | assetID    | max voting height |
| Binary    | VI Address | setScriptTxId     |

If data appllied to VR account then you can start voting process

### Voting process
User should register as a voter at Voting Initiator account and send his vote from VR account
1. To register as a voter user signs (not send) a transfer transaction and saves tx id and signature
Transaction properties:
⋅⋅* amount = 1
⋅⋅* fee = 900_000
⋅⋅* attachment = voter public key
2. Sends a data transaction from VR account:
Transaction properties:
⋅⋅* proof at index 0 = Voter public key
⋅⋅* proof at index 1 = signature. Tx should be signed by Voter account 
Data format:

| Type      | Key           | Value                        |
| --------- |:-------------:| ----------------------------:|
| Binary    | Voter Address | Signature + TransferTxId     |

 Signature + TransferTxId = signature bytes should be placed first and TransferTxId bytes are concated to signature

3. Sends signed a transfer transaction to one of the voting results address. 