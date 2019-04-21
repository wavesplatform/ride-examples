const nonce = 1
const masterSeed = "master seed"
const bank = "myBankDappAcc"
const paymentAmount = 100000000
const bankAddress = address(bank)
const compiledDApp = compile(file('bank_dapp.ride'))
const customer = "customer acc bla" + nonce
const customerAddress = address(customer)
console.log(customerAddress)
const compiledLock = compile(file('account_lock.ride'))


describe('Bank Dapp test Suite', () => {

    it('Sets bank script', async function(){
        const ssBankTx = setScript({script:compiledDApp}, bank )
        await broadcast(ssBankTx)
        await waitForTx(ssBankTx.id)
    })

    it('Bank approves credit for customer', async function(){
        const invTx = invokeScript({
            additionalFee: 500000,
            dappAddress: bankAddress,
            call: {
                function: "approveCredit",
                args: [{
                    type: "string",
                    value: customerAddress
                }, {
                    type: "integer",
                    value: paymentAmount
                }, {
                    type: "integer",
                    value: 0
                }, {
                    type: "binary",
                    value: compiledLock
                }]
            }
        }, bank)

        await broadcast(invTx)
        await waitForTx(invTx.id)
    })

    it('Customer fails to get money without lock', async function(){
        const invTx = invokeScript({
                additionalFee: 500000,
                dappAddress: bankAddress,
                call: {
                    function: "getMoney",
                    args: [{
                        type: "string",
                        value: "3MpFRn3X9ZqcLimFoqNeZwPBnwP7Br5Fmgs"
                    }]
                }
            }, customer
        )
        await broadcast(invTx)
        await waitForTx(invTx.id)
    })

    it('Customer sets lock', async function(){
        const ssCustomerTx = setScript({script:compiledLock}, customer )
        await broadcast(ssCustomerTx)
        await waitForTx(ssCustomerTx.id)
    })

    it('Customer gets money with lock', async function(){
        const invTx = invokeScript({
                additionalFee: 500000,
                dappAddress: bankAddress,
                call: {
                    function: "getMoney",
                    args: [{
                        type: "string",
                        value: "E1pQfRVGQnMB3boWVkUgRTmkUfJprme6H2Asq8WP4dxK"
                    }]
                }
            }, customer
        )
        await broadcast(invTx)
        await waitForTx(invTx.id)
    })

    it('Customer returns money', async function () {
        const invTx = invokeScript({
            additionalFee: 500000,
            dappAddress: bankAddress,
            call: {
                function: "returnMoney",
                args: []
            },
            payment: [{
                amount: paymentAmount
            }]
        }, customer)
        await broadcast(invTx)
        await waitForTx(invTx.id)
    })
})


