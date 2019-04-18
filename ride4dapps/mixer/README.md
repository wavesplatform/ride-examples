# R4D Mixer
This is an example of crypto coins mixer

1. A user can send money with an arbitrary Blake2b256 hash
2. After that, anyone with address matching that hash and knowing how much bytes of address used can take the money back

Try now: https://cb73ac4e-d39f-4a9f-a196-3c46b445f8fe.pub.cloud.scaleway.com/ (Requires Waves Keeper with InvokeScript support in TESTNET mode)

# Example
1. Taken destination address is `3Musn2zFuw3G71yg6G7PDRAq7CjWxK7Z4pk` and complexity is 3, caller takes first 3 and last 3 bytes of it: `3Mu + 4pk`, hashes it with Blake2b256 and invokes `deposit(hash)` with attached Waves payment
2. Then owner of `3Musn2zFuw3G71yg6G7PDRAq7CjWxK7Z4pk` invokes `withdraw(3)`, script compares his address with stored hash and withdraws all money associated with it
