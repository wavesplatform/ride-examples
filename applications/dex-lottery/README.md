# Simple DEX Lottery

Simple lottery concept on DEX.
When player place order it will have some chance to be matched with "winning" buy order or with "losing" buy order.
"Losing" order is needed to prevent multiple plays with one token.
Smart asset script prevents player from placing an order with price more than 1 wavelet and amount more than 1.
Winning chance is determined with Matcher exchange TX proof bytes, that should prevent "gaming" lottery.
Probability of winning is about 121/256.
The Lottery is played with Waves pair and "tickets" can be sold at any other pair.

### Setting up

1. Issue smart asset with script
2. Set Data TX with boolean `isOpen` at `false`
3. Place buy order for 1 wavelet at `Asset/WAVES` pair
4. Place buy order for winning price at `Asset/WAVES` pair
5. Place sell orders at any other pair
6. Set account script
7. Set Data TX with boolean `isOpen` at `true`
8. Lottery is ready!

### Lottery cycle

Set up some script to start cycle after each play, because your winning order will be dropped.

If winning order is cancelled or filled:
1. Clear account script
2. Set Data TX with boolean `isOpen` at `false`
3. Place buy order for winning price at `Asset/WAVES` pair
4. Set account script
5. Set Data TX with boolean `isOpen` at `true`
6. Lottery is ready!