describe('Mixer test', () => {
    const dappAddress = "3Musn2zFuw3G71yg6G7PDRAq7CjWxK7Z4pk"

    const hash = "8N5gCoRKcCD4BxJNGn2kKUzMBieetEh4r7DUMHa1m2gq"

    it('Deposit funds', async function(){
        const tx = invokeScript({ fee: 500000, dappAddress: dappAddress, call:{function:"deposit",args:[{"type": "binary", "value": hash}]},
            payment: [{amount: 1000000, assetId: null}]})
        await broadcast(tx)
        await waitForTx(tx.id)
    })

    it('Withdraw funds', async function(){
        const tx = invokeScript({ fee: 500000, dappAddress: dappAddress, call:{function:"withdraw",args:[{"type": "integer", "value": 3}]}, payment: null)
        await broadcast(tx)
        await waitForTx(tx.id)
    })
})
