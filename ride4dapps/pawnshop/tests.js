const seedWithWaves = "create genesis wallet devnet-0"
const nonce = 34
const ownerSeed = "owner"
const dappSeed = "dapp " + nonce
const userSeed = "user " + nonce
const tokenIssuer = "issuer " + nonce
const tokenIssuerAddress = address(tokenIssuer)
const dappAddress = address(dappSeed)
const userAddress = address(userSeed)
const m = 100000000

describe('Pawnshop test suite', () => {

    it('fund accounts', async function(){
        console.log(nonce)
        const ttx = massTransfer({transfers : [
            { amount: 10*m, recipient: tokenIssuerAddress },
            { amount: 2000*m, recipient: dappAddress }, // 2k waves
            { amount: 10*m, recipient: address(ownerSeed) },
            { amount: 10*m, recipient: userAddress }]} ,
             seedWithWaves)
        await broadcast(ttx)
        await waitForTx(ttx.id)
    })

    var tokenId = null
    it('issuer issues a token', async function(){
        const ttx = issue({name: "SUPERBTC", description: "Gateway-backed BTC", quantity: 2400000000000}, tokenIssuer)
        await broadcast(ttx)
        tokenId = ttx.id
        await waitForTx(ttx.id)
    })
    
    it('dapp deploys script', async function(){
        const ttx = setScript({ script: compile(file("pawnshop.ride"))}, dappSeed)
        await broadcast(ttx)
        await waitForTx(ttx.id)
    })

    it('dapp sets token and rate', async function(){
    console.log(tokenId)
     const ttx = invokeScript({
            dappAddress: dappAddress,
            call: {
                function:"initToken",
                args:[
                {type: "string", value: tokenId },
                {type: "integer", value: 1000} //
            ]}, 
            payment: []},
            ownerSeed

            )
        await broadcast(ttx)
        await waitForTx(ttx.id)
    })

    it('issuer send some tokens to user', async function(){
        const ttx = transfer({amount: 10*m, recipient: tokenIssuerAddress, assetId : tokenId }, tokenIssuer)
        await broadcast(ttx)
        await waitForTx(ttx.id)
    })

    
    it('user gets some waves', async function(){
        const ttx = transfer({amount: 10*m, recipient: userAddress, assetId : tokenId },tokenIssuer )
        await broadcast(ttx)
        await waitForTx(ttx.id)
    })

    it('user borrows 1000 waves for 1 btc [actual rate: ~2000 waves for btc]', async function(){
     console.log(tokenId)
     const ttx = invokeScript({
            dappAddress: dappAddress,
            call: {
                function:"borrow", args:[]}, 
            payment: [{amount: 1*m, assetId: tokenId}]},
            userSeed
            )
        await broadcast(ttx)
        await waitForTx(ttx.id)
    })

    it('buys back 1 btc waves for 1000 waves that were borrowed', async function(){
     const ttx = invokeScript({
            dappAddress: dappAddress,
            call: {
                function:"buyBack", args:[]}, 
            payment: [{amount: 1000*m, asset:null }]},
            userSeed
            )
        await broadcast(ttx)
        await waitForTx(ttx.id)
    })
})


