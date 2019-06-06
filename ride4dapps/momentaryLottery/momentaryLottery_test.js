//
// Momentary Lottery tests
//

describe('Momentary Lotto', () => {
    const lottoAddress = "3Mu5kasZ85VY5xUCpPYoWr6fBzh6eGZwcnt"
    const someAssetId = "CJDViFTTV5gmR6Kb1xVtwNUb9fkSgjeWrsCRZWQkG8t6" //Should be on test account balance
    const betAmount = 1000000

    it('Play with function name', async function(){
        const tx = invokeScript({ fee: 500000, dApp: lottoAddress, call: {function: "lotto", args: []}, payment: [{assetId: null, amount: betAmount}]})
        await broadcast(tx)
        await waitForTx(tx.id)
    })

    it('Play with default function', async function(){
        const tx = invokeScript({ fee: 500000, dApp: lottoAddress, call: null, payment: [{assetId: null, amount: betAmount}]})
        await broadcast(tx)
        await waitForTx(tx.id)
    })

    it('Without payment', async function(){
        const tx = invokeScript({ fee: 500000, dApp: lottoAddress, call: null, payment: []})
        return expect(broadcast(tx)).to.eventually
            .be.rejectedWith("Should be with Payment in Waves")
    })

    it('With payment not in Waves', async function(){
        const tx = invokeScript({ fee: 500000, dApp: lottoAddress, call: null, payment: [{assetId: someAssetId, amount: betAmount}]})
        return expect(broadcast(tx)).to.eventually
            .be.rejectedWith("Payment should be in Waves")
    })

    it('Bet amount is too large', async function(){
        const lottoBalance = await balance(lottoAddress)
        const bet = Math.trunc(lottoBalance / 10)
        const tx = invokeScript({ fee: 500000, dApp: lottoAddress, call: null, payment: [{assetId: null, amount: bet}]})
        return expect(broadcast(tx)).to.eventually
            .be.rejectedWith("Payment should be less than")
    })
})