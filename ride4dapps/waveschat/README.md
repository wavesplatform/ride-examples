# WavesChat
WavesChat is a decentralized messenger with an end-to-end encryption
Basically works like a chat-roulette with an
1. Optional channel
2. Optional payment, which forces to pay the same amount to talk with you 

Try now at https://a51a0717-d701-40a6-afe6-6e09662ca8d0.pub.cloud.scaleway.com (Requires Waves Keeper **with InvokeScript support in TESTNET mode**)

# How it works
1. First user (Bob) invokes script function `init(bobPublicKey)`
2. Second user (Alice) invokes `init(alicePublicKey)`
3. Script matches Bob's and Alice's public keys, so that they can get the recipients public key from data entry `Base58(Blake2b256(publicKey))`
4. Bob gets Alice's public key, encrypts message with it, and then invokes `sendMessage(bobPublicKey, cipherText)`
5. Bob to Alice conversation id is `Base58(Blake2b256(bobPublicKey + alicePublicKey))`, so Alice can get message count from `conversationId + "_n"` and messages from `conversationId + "_" + 0...msgCount` data entries accordingly, and decrypt it with her private key
