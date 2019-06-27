const auctionDuration = 2

const WAVES = 10 ** 8;

const SETSCRIPT_FEE = 0.01 * WAVES
const ISSUE_FEE = 1 * WAVES
const INV_FEE = 0.005 * WAVES
const ADD_FEE = 0.004 * WAVES

var issueTxId
var auctionId
var auctionStartTx
var customer2Before

async function rememberBalances(text, forAddress, tokenId) {
    const tokenBal = await assetBalance(tokenId, forAddress)
    const wavesBal = await balance(forAddress)

    console.log (text + ": " + wavesBal + " WAVES, " + tokenBal + " NFT")

    return [wavesBal, tokenBal]
}


describe('Auction test Suite', async function(){
    
    this.timeout(100000)
    
    before(async function () {
        await setupAccounts({auction: SETSCRIPT_FEE, customer1: ISSUE_FEE + 2*INV_FEE, customer2: (0.1 + 0.2 + 0.3) * WAVES, customer3: (0.22) * WAVES});

        const compiledDApp = compile(file('auction.ride'))
        const ssTx = setScript({script:compiledDApp/*, fee:1400000*/}, accounts.auction )
        await broadcast(ssTx)

        const issueTx = issue({name:"MyNFTtest", description:"", quantity:1, decimals:0, reissuable:false}, accounts.customer1)
        await broadcast(issueTx)
        await waitForTx(issueTx.id)
        issueTxId = issueTx.id
        console.log("NFT Token id: " + issueTxId)
        await waitForTx(ssTx.id)

    })
 
    it('Customer1: Start Auction', async function(){
        const invTx = invokeScript({fee:INV_FEE, 
            dApp: address(accounts.auction),
            call: {
                function:"startAuction",
                args:[
                    {type:"integer", value: auctionDuration}, 
                    {type:"integer", value: 1000000}, 
                    {type:"string", value: "WAVES"}
                ]}, 
                payment: [
                    {amount: 1, assetId:issueTxId }
                ]
            }, accounts.customer1)

        await broadcast(invTx)
        auctionStartTx = await waitForTx(invTx.id)
        auctionId = auctionStartTx.id

        console.log("Start auction height : " + auctionStartTx.height)
    })

    it('Unable to bid less then start price', async function(){
        const invTx = invokeScript({fee:INV_FEE, dApp: address(accounts.auction), call: {function:"bid", args:[{type:"string", value: auctionId}]}, 
                        payment: [{amount: 999999, assetId:null }]}, 
                        accounts.customer2)
        expect(broadcast(invTx)).rejectedWith("Bid must be more then 1000000")
    })
    
    it('Customer2: bid 0.1 WAVES', async function(){

        customer2Before = await balance(address(accounts.customer2))

        const invTx = invokeScript({fee:INV_FEE, dApp: address(accounts.auction), call: {function:"bid", args:[{type:"string", value: auctionId}]}, 
                        payment: [{amount: 10000000, assetId:null }]}, 
                        accounts.customer2)
        await broadcast(invTx)
        await waitForTx(invTx.id)
    })

    it('Customer3: bid 0.1 WAVES - should fail', async function(){
        const invTx = invokeScript({fee:INV_FEE, dApp: address(accounts.auction), call: {function:"bid", args:[{type:"string", value: auctionId}]}, 
                        payment: [{amount: 10000000, assetId:null }]}, 
                        accounts.customer3)
        expect(broadcast(invTx)).rejectedWith("Bid must be more then 10000000")
    })

    it('Customer3: bid 0.2 WAVES - now should work', async function(){
        const invTx = invokeScript({fee:INV_FEE, dApp: address(accounts.auction), call: {function:"bid", args:[{type:"string", value: auctionId}]}, 
                        payment: [{amount: 20000000, assetId:null }]}, 
                        accounts.customer3)
        const resp = await broadcast(invTx)
        await waitForTx(invTx.id)
    })

    it('Previous bid returned to bidder', async function(){
        const customer2After = await balance(address(accounts.customer2))
        expect(customer2After).to.equal(customer2Before - INV_FEE, "Bid must be returned")
    })    
   
    it('Wait for auction end', async function(){
        const timeout = 180000
	    this.timeout(timeout)
        console.log("Cur height: " + await currentHeight())
        console.log("Waiting " + (auctionStartTx.height + auctionDuration))
        await waitForHeight(auctionStartTx.height + auctionDuration, {timeout})//waitForTxWithNConfirmations(auctionStartTx, auctionDuration, {timeout})
    })

    it('Customer2: bid 0.3 WAVES after acution end - should fail', async function(){
        const invTx = invokeScript({fee:INV_FEE, dApp: address(accounts.auction), call: {function:"bid", args:[{type:"string", value: auctionId}]}, 
                        payment: [{amount: 30000000, assetId:null }]}, 
                        accounts.customer2)
        expect(broadcast(invTx)).rejectedWith("Auction already finished")
    })

    it('Customer3: Winner take prize', async function(){
        
        console.log("Cur height: " + await currentHeight())

        const winAmount = 20000000
        
        const nftBalBefore = await assetBalance(issueTxId, address(accounts.customer3))
        const wavesBalanceBefore = await balance(address(accounts.customer1))
        
        const winnerBefore = await rememberBalances("Customer3 (winner): ", address(accounts.customer3), issueTxId)
        const organizerBefore = await rememberBalances("Customer1 (organizer): ", address(accounts.customer1), issueTxId)

        const invTx = invokeScript({fee:INV_FEE, dApp: address(accounts.auction), call: {function:"withdraw", args:[{type:"string", value: auctionId}]}, 
                        payment: []}, 
                        accounts.customer3)
        await broadcast(invTx)
        await waitForTx(invTx.id)
        console.log("withdraw tx sent")

        const winnerAfter = await rememberBalances("Customer3 (winner): ", address(accounts.customer3), issueTxId)
        const organizerAfter = await rememberBalances("Customer1 (organizer): ", address(accounts.customer1), issueTxId)

        expect(winnerAfter[0]).to.equal(winnerBefore[0] - INV_FEE, "WAVES Balance of winner is reduced only by fee")
        expect(winnerAfter[1]).to.equal(winnerBefore[1] + 1, "Winner get's his auction prize")

    })
})