# DEX
This is Decentralized Exchange EXAMPLE. It is not production ready.

The main idea:
Everybody can place orders.
When there are two suitable orders anybody can match them. As a result this person get fee for matching, and matched order owners get changed assets. 

## Registering traiding pair
First administrator needs to register traid pair with registerTraidPair() method
Need to provide amount and price asset identificators and the name of this trading asset pair

## Placing orders
After trading pair is registered, anybody can place order.
Trader need to invoke order() method. He provides id of the asset he wants to get, identifies the price and attaches asset which he wants to change.

Price has the same format as in Waves exchange transactions
It is integer value with decimals calculated by formula 8 + PriceAssetDecimals - AmountAssetDecimals 
For example in traiding pair WAVES/USD WAVES has decimals 8, and USD asset has decimals 2
So the price must be representend in form of integer with (8 + 2 - 8) = 2 decimals. 
So price 14 USD per WAVES must be represented as 1400

## Matching orders
When there are 2 orders which match, everybody can invoke 'matchOrders' function with id's of those orders
Id ot the order - it's the id of the 'order' invokeScript transaction
As a result of matching, address who invoked 'matchOrders' will get 0.1% of each order's matched part (if 0.1% is less then minimal amount of the asset - he will get minimal amount)
Matcher pays blockchain fee for the 'matchOrder' call - typicaly 0.005 WAVES

If there were two orders:
1. Trader1 : WAVES/USD BUY with price 260 (2.6 USD per WAVES) with attached 25.01 USD
2. Trader2 : WAVES/USD SELL with price 250 (2.5 USD per WAVES) with attached 100 WAVES

In result of the matching
- Trader 1 will get 1 WAVES, and his order will be closed 
- Trader 2 will get 2.5 USD, and his order will be updated in part of the attached WAVES - (100 WAVES - 1.001 * 1 WAVES) = 98.999 WAVES
- Matcher will get 0.001 WAVES and 0.01 USD as a fee for the matching.  
