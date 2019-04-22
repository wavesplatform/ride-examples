const nonce = 4
const masterSeed = "master seed for my tests"
const bank = "myBankDappAcc" + nonce
const paymentAmount = 50000000
const bankAddress = address(bank)
const compiledDApp = compile(file('bank_dapp.ride'))
const customer = "customer acc bla" + nonce
const customerAddress = address(customer)
const compiledLock = compile(file('account_lock.ride'))

// You can define test suites with 'describe' syntax
describe('Bank Dapp test Suite', () => {
    before(async() => {
        const mtTx= massTransfer({transfers:[
                {amount: 60000000, recipient: bankAddress},
                {amount: 60000000, recipient: customerAddress}
            ]}, masterSeed)
        await broadcast(mtTx)
        await waitForTx
    })

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
        await expect(broadcast(invTx)).rejectedWith()
    })

//    it('Customer sets lock', async function(){
//         const ssCustomerTx = setScript({script:compiledLock}, customer )
//         await broadcast(ssCustomerTx)
//         await waitForTx(ssCustomerTx.id)
//     })

    it('Customer sets lock and gets money', async function(){

        const ssCustomerTx = setScript({script:compiledLock}, customer )
        await broadcast(ssCustomerTx)
        await waitForTx(ssCustomerTx.id)

        const invTx = invokeScript({
            additionalFee: 500000,
            dappAddress: bankAddress,
            call: {
                function: "getMoney",
                args: [{
                    type: "string",
                    value: ssCustomerTx.id
                }]
            }
        }, customer)
        await broadcast(invTx)
        await waitForTx(invTx.id)
    })

    it('Customer returns money', async function(){

        const invTx = invokeScript({
            additionalFee: 500000,
            dappAddress: bankAddress,
            call: {
                function: "returnMoney",
                args: []
            },
            payment:[{
                amount: paymentAmount
            }]
        }, customer)
        console.log(await broadcast(invTx))
        await waitForTx(invTx.id)
    })
})


