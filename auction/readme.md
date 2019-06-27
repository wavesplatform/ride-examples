# Auction

This is an auction dApp.
You can start auction for any token(s) for some period of time (counted in blocks).
If somebody took part in the auction, then the organizer will get the winners bid, and the winner will get token(s).
Everyone who particapated, but didn't win - will have ability to get their money back after the auction end.

## Starting auction
Everybody can start an auction with invokeScript 'startAuction' attaching Tokens to it.
Auction lasts for 'duration' blocks provided as an argument to 'startAuction'.
Organizer also sets 'startPrice' and 'priceAsset' for bids.

# Bidding
Before auction finish anybody can bid. The bid is only accepted if it is greater than current winning bid.
If the same address will bid again, his new bid will be added to the previous ones.

#Withdraw
Calling 'withdraw':
- if called by the participant who haven't won - returning his bid
- if called by the winner or organizer - transfering bid of the winner to organizer and token(s) to the winner