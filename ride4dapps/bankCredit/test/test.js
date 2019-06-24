const wvs = 10 ** 8;

describe('Bank Dapp test Suite', () => {

    let lockTx;
    let removeLockTx;
    let paymentAmount = 0.4 * wvs

    before(async function() {
        this.timeout(0);

        await setupAccounts({bank: 0.5 * wvs, client: 0.1 * wvs});

        const compiledDapp = compile(file('bank_dapp.ride'))
        const bankAddress = address(accounts.bank)
        const lockScript = file('account_lock.ride')
            .replace(`base58'3MpFRn3X9ZqcLimFoqNeZwPBnwP7Br5Fmgs'`, `base58'${bankAddress}'`)

        const compiledLock = compile(lockScript)

        lockTx = setScript({script: compiledLock}, accounts.client)
        removeLockTx = setScript({script: null, additionalFee: 400000}, accounts.client)
        const dAppTx = setScript({script: compiledDapp}, accounts.bank)
        await broadcast(dAppTx)
        await waitForTx(dAppTx.id)
        console.log('Scrips were deployed')
    })

    it('Bank approves credit for customer', async function(){
        const invTx = invokeScript({
            additionalFee: 400000,
            dApp: address(accounts.bank),
            call: {
                function: "approveCredit",
                args: [{
                    type: "string",
                    value: address(accounts.client)
                }, {
                    type: "integer",
                    value: paymentAmount
                }, {
                    type: "integer",
                    value: 0
                }, {
                    type: "string",
                    value: lockTx.id
                }]
            }
        }, accounts.bank)

        await broadcast(invTx)
        await waitForTx(invTx.id)
    })

    it('Customer fails to get money without lock', async function(){
        const invTx = invokeScript({
                additionalFee: 500000,
                dApp: address(accounts.bank),
                call: {
                    function: "getMoney"
                }
            }, accounts.client)
        await expect(broadcast(invTx)).rejectedWith()
    })

    it('Customer sets lock and gets money', async function(){
        this.timeout(0)

        await broadcast(lockTx)
        await waitForTx(lockTx.id, {timeout: 1000000})

        const invTx = invokeScript({
            additionalFee: 500000,
            dApp: address(accounts.bank),
            call: {
                function: "getMoney"
            }
        }, accounts.client)
        await broadcast(invTx)
        await waitForTx(invTx.id, {timeout: 1000000})
    })

    it('Customer fails to remove lock', async function(){
        await expect(broadcast(removeLockTx)).rejectedWith()
    })

    it('Customer returns money and removes lock from his account', async function(){
        this.timeout(0)
        const invTx = invokeScript({
            additionalFee: 500000,
            dApp: address(accounts.bank),
            call: {
                function: "returnMoney",
                args: []
            },
            payment:[{
                amount: paymentAmount
            }]
        }, accounts.client)
        await broadcast(invTx);
        await waitForTx(invTx.id, {timeout: 1000000});
        await broadcast(removeLockTx)
    })
})


