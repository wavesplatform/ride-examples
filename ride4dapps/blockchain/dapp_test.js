const pubKey = '' // TODO SET!

describe('Blockchain tests', () => {

    it('genesis', async function(){
        const b = await balance();
        const h = await currentHeight()

        const invS = invokeScript({ dApp: address(env.accounts[1]), call: {function: "genesis", args: []} })
        await broadcast(invS)
    })

    it('register', async function(){
        const name = "bob1"
        const invS = invokeScript({ dApp: address(env.accounts[1]), call: {function: "register", args: [{type: "string", value: name}]}, payment: [{amount: 500000000, assetId: null}] })
        await broadcast(invS)
    })

    it('send tx', async function(){
        const script64 = Base64.encode("SEND alice 2")
        const gaz = 1
        const sig = sign(pubKey + gaz + script64)
        const invS = invokeScript({ dApp: address(env.accounts[1]), call: {function: "transaction", args: [
                {type: "string", value: sig},
                {type: "integer", value: gaz},
                {type: "string", value: script64}
            ]} })
        await broadcast(invS)
    })

})