// ATTENTION: Tests can work incorrectly if you use nodes with cashed requests for balances
// It could happen that 'nodes-testnet.wavesnodes.com' has that kind of cache

const WAVES = 10 ** 8;

const SETSCRIPT_FEE = 0.01 * WAVES
const ISSUE_FEE = 1 * WAVES
const INV_FEE = 0.005 * WAVES
const ADD_FEE = 0.004 * WAVES
const MIN_FEE = 0.001 * WAVES

const BET_TYPE_NUMBER = 0
const BET_TYPE_RED_BLACK = 1
const BET_TYPE_EVEN_ODD = 2
const BET_TYPE_DESK_HALF = 3
const BET_TYPE_DESK_THIRD = 4
const BET_TYPE_ROW = 5

const betAmount = 1.5 * WAVES

async function rememberBalances(text, forAddress) {
    const wavesBal = await balance(forAddress)

    console.log (text + ": " + wavesBal + " WAVES")

    return wavesBal
}

function makeBet(casinoPubKey, roundId, betAmount, betType, guess, playerPubKey) {

    const bet = invokeScript({fee:INV_FEE, dApp: address(casinoPubKey), 
        call: {function:"bet", args:[{type:"string", value: roundId}, {type:"integer", value: betType}, {type:"integer", value: guess}]}, 
        payment: [{amount: betAmount, assetId:null }]}, 
        playerPubKey)

    console.log("Bet. round: '" + roundId + "', amount: " + betAmount / 10 ** 8 + ", betType: " + betType + ", guess: '" + guess + "'")
    return bet
}

function withdraw(casinoPubKey, roundId, playerPubKey) {

    const withdrawTx = invokeScript({fee:INV_FEE, dApp: address(casinoPubKey), 
        call: {function:"withdraw", args:[{type:"string", value: roundId}]}, 
        payment: []}, 
        playerPubKey)

    return withdrawTx
}

async function oracleStopRound(oraclePublicKey, roundId) {

    const stopRound = data({data:[{key:roundId + '_stop', value:true, type: 'boolean'}]}, oraclePublicKey)

    await broadcast(stopRound)
    await waitForTx(stopRound.id)
    console.log("Stop round: " + roundId)
}

func makeOracleResultForNumber() {
    const s = "0" + theAnswer
    // TODO:
    // Currently emulating just bet on number. These "12345" digits must be calculated in other way
    // "1" must be changed to black/red indication
    // "2" must be changed to even/odd indication
    // etc.
    return s.substr(s.length - 2) + "12345"
}

async function oraclePublishCorrectAnswer(oraclePublicKey, roundId, theAnswer) {

    const answerStr = makeOracleResultForNumber(theAnswer)

    const oraclePublishAnswer = data({data:[{key:roundId, value:answerStr, type: 'string'}]}, oraclePublicKey)

    await broadcast(oraclePublishAnswer)
    await waitForTx(oraclePublishAnswer.id)
    console.log("Published result for round '" + roundId + "': " + answerStr)
}


describe('Casino script test suite', async function () {

    this.timeout(100000);

    before(async function () {

        await setupAccounts({casino: SETSCRIPT_FEE + 35 * betAmount, 
                             player1: 2*betAmount + 2*INV_FEE, 
                            player2: betAmount + 2*INV_FEE, 
                            player3: betAmount + 2*INV_FEE, 
                            oracle: 2 * INV_FEE});
        
        const scriptC = compile(file('casino.ride').replace('$ORACLE_ADDRESS', address(accounts.oracle)));
        const ssTx = setScript({script:scriptC}, accounts.casino);
        await broadcast(ssTx);
        await waitForTx(ssTx.id)
        console.log('Script has been set')
    });    

    const roundId = "Round 1"
    const correctAnswer = 12

    it('Making bets', async function(){
        
        const bet1 = makeBet(accounts.casino, roundId, betAmount, BET_TYPE_NUMBER, 11, accounts.player1)
        await broadcast(bet1)
        const bet2 = makeBet(accounts.casino, roundId, betAmount, BET_TYPE_NUMBER, 10, accounts.player2)
        await broadcast(bet2)
        const bet3 = makeBet(accounts.casino, roundId, betAmount, BET_TYPE_NUMBER, correctAnswer, accounts.player3)
        await broadcast(bet3)

        await waitForTx(bet1.id)
        await waitForTx(bet2.id)
        await waitForTx(bet3.id)
    })

    it('Inability to make bet after freeze round', async function(){

        await oracleStopRound(accounts.oracle, roundId)
        
        const bet1 = makeBet(accounts.casino, roundId, betAmount, BET_TYPE_NUMBER, 14, accounts.player1)
        await expect(broadcast(bet1)).rejectedWith("This round is already played")
        console.log("Bet must failed because round finished")        
    })

    it('Withdraw test', async function(){

        await oraclePublishCorrectAnswer(accounts.oracle, roundId, correctAnswer)
        
        const withdraw1 = withdraw(accounts.casino, roundId, accounts.player1) 
        const withdraw2 = withdraw(accounts.casino, roundId, accounts.player2) 
        const withdraw3 = withdraw(accounts.casino, roundId, accounts.player3) 

        const casinoBefore = await rememberBalances("casino before: ", address(accounts.casino))
        const winnerBefore = await rememberBalances("winner before: ", address(accounts.player3))

        expect(broadcast(withdraw1)).rejectedWith("You won nothing this round")
        expect(broadcast(withdraw2)).rejectedWith("You won nothing this round")
        await broadcast(withdraw3)
        await waitForTx(withdraw3.id)

        const casinoAfter = await rememberBalances("casino after: ", address(accounts.casino))
        const winnerAfter = await rememberBalances("winner after: ", address(accounts.player3))

        expect(casinoAfter).to.equal(casinoBefore - 36 * betAmount, "Casino account reduced by win amount")
        expect(winnerAfter).to.equal(winnerBefore + 36 * betAmount - INV_FEE, "Winner account got win amount")
    })


})
