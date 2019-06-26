const wvs = 10 ** 8;

describe('wallet test suite', async function () {

    this.timeout(100000);

    before(async function () {
        await setupAccounts(
            {foofoofoofoofoofoofoofoofoofoofoo: 10 * wvs,
                 barbarbarbarbarbarbarbarbarbar: 2 * wvs,
                  wallet: 0.05 * wvs});
        const script = compile(file('wallet.ride'));
        const ssTx = setScript({script}, accounts.wallet);
        await broadcast(ssTx);
        await waitForTx(ssTx.id)
        console.log('Script has been set')
    });
    
    it('Can deposit', async function () {

        const iTxFoo = invokeScript({
            dApp: address(accounts.wallet),
            call: {function: "deposit"},
            payment: [{assetId: null, amount: 0.9 * wvs}]
        }, accounts.foofoofoofoofoofoofoofoofoofoofoo);


        const iTxBar = invokeScript({
            dApp: address(accounts.wallet),
            call: {function: "deposit"},
            payment: [{assetId: null, amount: 1.9 * wvs}]
        }, accounts.barbarbarbarbarbarbarbarbarbar)


        await broadcast(iTxFoo);
        await broadcast(iTxBar);
        await waitForTx(iTxFoo.id);
        await waitForTx(iTxBar.id);
    })

    it('Cannot withdraw more than was deposited', async function () {
        const iTxFoo = invokeScript({
            dApp: address(accounts.wallet),
            call: {
                function: "withdraw",
                args: [{type:'integer', value: 2 * wvs}]
            },

        }, accounts.foofoofoofoofoofoofoofoofoofoofoo);

        expect(broadcast(iTxFoo)).to.be.rejectedWith("Not enough balance")
    })

    it('Can withdraw', async function () {
        const iTxFoo = invokeScript({
            dApp: address(accounts.wallet),
            call: {
                function: "withdraw",
                args: [{ type: 'integer', value: 0.9 * wvs }]
            },

        }, accounts.foofoofoofoofoofoofoofoofoofoofoo);
        await broadcast(iTxFoo)
    })
})