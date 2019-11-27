const WAVES = 10 ** 8;

const SETSCRIPT_FEE = 0.01 * WAVES
const ISSUE_FEE = 1 * WAVES
const INV_FEE = 0.005 * WAVES
const ADD_FEE = 0.004 * WAVES

wavesOrder = 1 * WAVES

var tokenId

async function rememberBalances(text, forAddress) {
    const tokenBal = await assetBalance(tokenId, forAddress)
    const wavesBal = await balance(forAddress)

    console.log (text + ": " + wavesBal + " WAVES, " + tokenBal + " MyUSD")

    return [wavesBal, tokenBal]
}

describe('DEX script test suite', async function () {

    this.timeout(100000);

   before(async function () {
        await setupAccounts({dex: SETSCRIPT_FEE, trader1: ISSUE_FEE + 3*INV_FEE, trader2: INV_FEE + wavesOrder, matcher: 2 * INV_FEE});
        const script = compile(file('dex.ride').replace('$ADMIN_ADDRESS', address(accounts.matcher)));
        const ssTx = setScript({script}, accounts.dex);
        await broadcast(ssTx);

        const issueTx = issue({name:"MyUSD", description:"Test token for DEX sript", quantity:10**8, decimals:2, reissuable:false}, accounts.trader1)
        await broadcast(issueTx);

        tokenId = issueTx.id

        await waitForTx(ssTx.id)
        console.log('Script has been set')
        await waitForTx(issueTx.id)
        console.log('Token issued : ' + tokenId)
    });    

    it('Register trade pair WAVES/MyUSD', async function(){

        const invTxFailed = invokeScript({fee:INV_FEE, dApp: address(accounts.dex), call: {function:"registerTraidPair", args:[{type:"string", value: "WAVES"}, {type:"string", value: tokenId}, {type:"string", value:"WAVES/MyUSD"}]}, 
                        }, 
                        accounts.trader1)
        expect(broadcast(invTxFailed)).rejectedWith("Only administrator can register traiding pair")


        const invTx = invokeScript({fee:INV_FEE, dApp: address(accounts.dex), call: {function:"registerTraidPair", args:[{type:"string", value: "WAVES"}, {type:"string", value: tokenId}, {type:"string", value:"WAVES/MyUSD"}]}, 
                        }, 
                        accounts.matcher)
        await broadcast(invTx)
        await waitForTx(invTx.id)
    })

    it('Simple order match test', async function(){

        const trader1Before = await rememberBalances("Trader1", address(accounts.trader1))
        const trader2Before = await rememberBalances("Trader2", address(accounts.trader2))
        const dexBefore = await rememberBalances("DEX", address(accounts.dex))
        const matcherBefore = await rememberBalances("Matcher", address(accounts.matcher))

        const order1Tx = invokeScript({fee:INV_FEE, dApp: address(accounts.dex), 
                        call: {function:"order", args:[{type:"string", value: "WAVES"}, {type:"integer", value: 250}]}, 
                        payment: [{amount: 260, assetId:tokenId}]}, 
                        accounts.trader1)
        const order1broadcast = broadcast(order1Tx)
        console.log("Order1 broadcasted: " + "BUY WAVES (price 2.5). 2.6 MyUSD attached")

        const order2Tx = invokeScript({fee:INV_FEE, dApp: address(accounts.dex), 
                        call: {function:"order", args:[{type:"string", value: tokenId}, {type:"integer", value: 240}]}, 
                        payment: [{amount: wavesOrder, assetId:null }]}, 
                        accounts.trader2)
        await broadcast(order2Tx)
        console.log("Order2 broadcasted: " + "SELL WAVES (price 2.4). " + 1.0 * wavesOrder / WAVES + " WAVES attached")

        await order1broadcast

        await waitForTx(order1Tx.id)
        await waitForTx(order2Tx.id)

        const matchOrdersTx = invokeScript({fee:INV_FEE, dApp: address(accounts.dex), 
                        call: {function:"matchOrders", args:[{type:"string", value: order1Tx.id}, {type:"string", value: order2Tx.id}]}, 
                        }, 
                        accounts.matcher)
        await broadcast(matchOrdersTx)
        console.log("MatchOrder broadcasted: " + order1Tx.id + ", " + order2Tx.id)
        await waitForTx(matchOrdersTx.id)
        console.log("MatchOrder tx in blockchain")

        const trader1After = await rememberBalances("Trader1", address(accounts.trader1))
        const trader2After = await rememberBalances("Trader2", address(accounts.trader2))
        const dexAfter = await rememberBalances("DEX after", address(accounts.dex))
        const matcherAfter = await rememberBalances("Matcher after", address(accounts.matcher))

        const matcherComissionWaves = 100000
        const matcherComissionToken = 1

        expect( trader1After[0]).to.equal(trader1Before[0] - matcherComissionWaves - INV_FEE + wavesOrder, "1 assert")
        expect( trader1After[1] == trader1Before[1] - 260).to.equal(true, "2 assert")
        expect( trader2After[0] == trader2Before[0] - INV_FEE - wavesOrder).to.equal(true, "3 assert")
        expect( trader2After[1] == trader2Before[1] + 240 - matcherComissionToken).to.equal(true, "4 assert")
        expect( matcherAfter[0] == matcherBefore[0] + matcherComissionWaves - INV_FEE).to.equal(true, "5 assert")
        expect( matcherAfter[1] == matcherBefore[1] + matcherComissionToken).to.equal(true, "6 assert")
                
        expect( trader1After[1] + trader2After[1] + dexAfter[1] + matcherAfter[1]== trader1Before[1] + trader2Before[1] + dexBefore[1] + matcherBefore[1]).to.equal(true, "7 assert")
        expect( trader1After[0] + trader2After[0] + dexAfter[0] + matcherAfter[0]== trader1Before[0] + trader2Before[0] + dexBefore[0] + matcherBefore[0]- 3 * INV_FEE).to.equal(true, "8 assert")
    })

    it('Order cancel test', async function(){

        const tokenAmount = 500

        console.log("--------------------------")
        const traderBefore = await rememberBalances("Trader Before", address(accounts.trader1))

        const orderTx = invokeScript({fee:INV_FEE, dApp: address(accounts.dex), 
                        call: {function:"order", args:[{type:"string", value: "WAVES"}, {type:"integer", value: 250}]}, 
                        payment: [{amount: tokenAmount, assetId:tokenId}]}, 
                        accounts.trader1)
        await broadcast(orderTx)
        console.log("Order to cancel broadcasted: " + "BUY WAVES (price 2.5). 2.6 MyUSD attached")
        const resp = await waitForTx(orderTx.id)
        
        //await new Promise(resolve => setTimeout(() => resolve(), 15000))
        
        const traderMiddle = await rememberBalances("Trader Middle", address(accounts.trader1))
        expect(traderMiddle[0]).to.equal(traderBefore[0] - INV_FEE, "Balance in WAVES must be reduced only by comission")
        expect(traderMiddle[1]).to.equal(traderBefore[1] - tokenAmount, "Balance in Token must be the same after Cancel as before the order")


        const cancelOrderFailed = invokeScript({fee:INV_FEE, dApp: address(accounts.dex), 
                        call: {function:"cancelOrder", args:[{type:"string", value: orderTx.id}]} 
                        }, 
                        accounts.trader2)
        expect(broadcast(cancelOrderFailed)).rejectedWith("Only order owner can cancel it")


        const cancelOrder = invokeScript({fee:INV_FEE, dApp: address(accounts.dex), 
                        call: {function:"cancelOrder", args:[{type:"string", value: orderTx.id}]} 
                        }, 
                        accounts.trader1)
        await broadcast(cancelOrder)
        await waitForTx(cancelOrder.id)
        console.log("Order successfully canceled")

        const traderAfter = await rememberBalances("Trader After", address(accounts.trader1))
        expect(traderAfter[0]).to.equal(traderBefore[0] - 2 * INV_FEE, "Balance in WAVES must be reduced only by comission")
        expect(traderAfter[1]).to.equal(traderBefore[1], "Balance in Token must be the same after Cancel as before the order")
    })
})
