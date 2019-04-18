describe('Messenger test', () => {
    const dappAddress = "3N7H98TgE5umm7vxwkdsLMVsny1icuu93Zh"

    const firstPK = "FxKjemCJ9s9yrG5RuDXAtGXZNsTsAr1FMhzNmUKG4GyE"
    const secondPK = "5nRF8WDnjWrGhZeYEV8zh7MG1kgpYbnJaEt5G3vsR4e2"

    const firstPKHash = "4CfQDi9nwsps25XA9yrMAw4XWFaG5NwLf6gFVjrTSGL7"

    it('Register for a chat', async function(){
        const tx = invokeScript({ fee: 500000, dappAddress: dappAddress, call:{function:"init",args:[{"type": "binary", "value": firstPK}, {"type": "string", "value": "test"}]},
            payment: [{amount: 1000000, assetId: null}]})
        const tx1 = invokeScript({ fee: 500000, dappAddress: dappAddress, call:{function:"init",args:[{"type": "binary", "value": secondPK}, {"type": "string", "value": "test"}]},
            payment: [{amount: 1000000, assetId: null}]})

        await broadcast(tx)
        await broadcast(tx1)
        await waitForTx(tx1.id)

        await addressDataByKey(dappAddress, firstPKHash)
            .then(result => chai.expect(result).to.equal(secondPK))
    })

    it('Send message', async function(){
        const tx = invokeScript({ fee: 500000, dappAddress: dappAddress, call:{function:"sendMessage",args:[{"type": "binary", "value": firstPK}, {"type": "binary", "value": "4CfQDi9nwsps25XA9yrMAw4XWFaG5NwLf6gFVjrTSGL7"}]},
            payment: [{amount: 1000000, assetId: null}]})

        await broadcast(tx)
        await waitForTx(tx.id)

        const conversationId = "Bw864nv4WkYURMK1V75FjizKEfMy7f7YsoZ1JVkBYmRS"
        await addressDataByKey(ballAddress, conversationId + "_n")
            .then(result => chai.expect(result).to.equal(1))

        await addressDataByKey(ballAddress, conversationId + "_1")
            .then(result => chai.expect(result).to.equal(firstPKHash))
    })
})
