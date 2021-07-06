# R4D Mixer
This is an example of the crypto coins mixer

1. A user can send money with an arbitrary Blake2b256 hash
2. After that, anyone with address matching that hash and knowing how much bytes of address used can take the money back

Try now: https://mixer.waves.today (Requires Waves Keeper with InvokeScript support **in TESTNET mode**)

# Example
1. Taken destination address is `3Musn2zFuw3G71yg6G7PDRAq7CjWxK7Z4pk` and complexity is 3, caller takes first 3 and last 3 bytes of it: `3Mu + 4pk`, hashes it with Blake2b256 and invokes `deposit(hash)` with attached Waves payment
2. Then owner of `3Musn2zFuw3G71yg6G7PDRAq7CjWxK7Z4pk` invokes `withdraw(3)`, script compares his address with stored hash and withdraws all money associated with it
3. You can tune complexity from 1 to 9
    1. With low complexity everyone can generate address that matches the resulting hash, but then no one can prove that you took the money
    2. So with complexity = 9 address should match exactly, and it's safe but there is no [plausible deniability](https://en.wikipedia.org/wiki/Plausible_deniability)
