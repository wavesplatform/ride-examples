//
// Waves DApp Magic 8 ball tests
//

describe('8 ball', () => {
    const ballAddress = "3N27HUMt4ddx2X7foQwZRmpFzg5PSzLrUgU"
    const question = "Test" + Date.now()
    const tx = invokeScript({ fee: 500000, dappAddress: ballAddress, call:{function:"tellme",args:[{"type": "string", "value": question}]}, payment: null})

    it('Tx is mined in block', async function(){
        await broadcast(tx)
        await waitForTx(tx.id)
    })

    it('Question is in ball', async function(){
        await addressDataByKey(ballAddress, address()+"_q")
            .then(reslove => chai.expect(reslove).to.equal(question))
    })
})