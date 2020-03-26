# Momentary Lottery dApp

Momentary Lottery fully on blockchain
Win chance is 50/50 with pay rate 1.9x

### Deploying

1. Compile RIDE script
2. Deploy smart script to dApp account
3. You are ready to go!

### How to use

1. Prepare Invoke script TX with function name `lotto` or Default function with payment in Waves
2. Broadcast your TX
3. dApp will resolve bet and transfer you winning amount or nothing (tough luck)


### dApp on Testnet

Code for [RIDE IDE](https://ide.wavesplatform.com/) console
```JS
const betAmount = 1000000
const invokeTX = invokeScript({ fee: 500000, dApp: "3Mu5kasZ85VY5xUCpPYoWr6fBzh6eGZwcnt", call: null, payment: [{assetId: null, amount: 1000000}]})
broadcast(invokeTX)
```