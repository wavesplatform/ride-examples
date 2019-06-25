describe('Messenger test', () => {
    const dappAddress = "3N3st6Cp9ZLz8kmT33EY41AVjwKqBVebvyq"

    const firstPK = "FxKjemCJ9s9yrG5RuDXAtGXZNsTsAr1FMhzNmUKG4GyE"
    const secondPK = "5nRF8WDnjWrGhZeYEV8zh7MG1kgpYbnJaEt5G3vsR4e2"

    const firstPKHash = "4CfQDi9nwsps25XA9yrMAw4XWFaG5NwLf6gFVjrTSGL7"

    it('Register for a chat', async function(){
        const tx = invokeScript({ fee: 900000, dApp: dappAddress, call:{function:"init",args:[{"type": "binary", "value": firstPK}, {"type": "string", "value": "test"}]},
            payment: [{amount: 1000000, assetId: null}]})
        const tx1 = invokeScript({ fee: 900000, dApp: dappAddress, call:{function:"init",args:[{"type": "binary", "value": secondPK}, {"type": "string", "value": "test"}]},
            payment: [{amount: 1000000, assetId: null}]})

        await broadcast(tx)
        await broadcast(tx1)
        await waitForTx(tx1.id)
    })

    it('Send message', async function(){
        const tx = invokeScript({ fee: 900000, dApp: dappAddress, call:{function:"sendMessage",args:[{"type": "binary", "value": firstPK}, {"type": "binary", "value": "4CfQDi9nwsps25XA9yrMAw4XWFaG5NwLf6gFVjrTSGL7"}]},
            payment: [{amount: 1000000, assetId: null}]})

        await broadcast(tx)
        await waitForTx(tx.id)
    })
})
