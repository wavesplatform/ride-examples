# Waves Magic 8 Ball

Don't know what to do?
You want an answer to THE question?
Magic 8 Ball - it’s the fastest way to seek advice!
DApp uses an innovative(not) method of pseudorandom answer generation to give you the best possible answer.
And it also ensures that same question should get a different answer.

### Deploying

1. Compile RIDE script
2. Deploy smart script to DApp account
3. You ready to go!

### How to use

1. Prepare Invoke script TX with function name `tellme` and single argument: `question: string`
2. Broadcast your TX
3. Your question and answer should be written to DApp data state
4. Question key: `yourb58address_q`
5. Answer key: `yourb58address_a`

### DApp on Testnet

Code for [RIDE IDE](https://ide.wavesplatform.com/) console
```
const question = "Should i do that?"
const invokeTX = invokeScript({ fee: 500000, dappAddress: "3N27HUMt4ddx2X7foQwZRmpFzg5PSzLrUgU", call:{function:"tellme",args:[{"type": "string", "value": question}]}, payment: null})
broadcast(invokeTX)
```