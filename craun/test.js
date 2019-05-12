const craunAppSeed = env.accounts[0];
const craunAppAddress = address(craunAppSeed);
const craunAppPubKey= publicKey(craunAppSeed);
const compiledCraunAppDApp = compile(file('craunApp'));

const craunUserSeed = env.accounts[1];
const craunUserAddress = address(craunUserSeed);

const craunGoalSeed = env.accounts[2];
const craunGoalAddress = address(craunGoalSeed);
const craunGoalPubKey= publicKey(craunGoalSeed);
const compiledCraunGoalDApp = compile(file('craunGoal'));

const goal = {
    title: 'Начать бегать',
    distance: 200,
    recordWeekDays: 'mon_tue_fri',
    archievePenalty: 200000000,
    failPenalty: 100000000,
    attemptsCount: 3,
    startDate: '12.05.2019',
    endDate: '19.05.2019',
}

describe('Create craunApp', () => {
  it('Server: create new craunApp account in Blockchain, setSript it with craunAppDApp', async function() {
      this.timeout(0);

      const setScriptTxParams = {
          script: compiledCraunAppDApp,
          fee: 1400000,
      };

      const setScriptTx = setScript(setScriptTxParams, craunAppSeed);

      const tx = await broadcast(setScriptTx);

      const minedTx = await waitForTx(tx.id)

      console.log(minedTx);
  })
})

describe('User money operations on craunApp account ', () => {
    it('Deposit User money to craunApp', async function() {
        this.timeout(0);

        const amount = 1000000000; // 10 waves

        const invokeScriptTxParams = {
            dApp: craunAppAddress,
            call: { function: 'deposit', args:[] },
            payment: [{ amount: amount, asset: null }]
        };

        const invokeScriptTx = invokeScript(invokeScriptTxParams, craunUserSeed);

        const tx = await broadcast(invokeScriptTx);

        const minedTx = await waitForTx(tx.id)

        console.log(minedTx);
    })

    it('Withdraw User money from craunApp', async function() {
      this.timeout(0);

      const invokeScriptTxParams = {
          dApp: craunAppAddress,
          call: { function: 'withdraw', args:[] },
          call:{
              function: 'withdraw',
              args: [{
                  type: "integer",
                  value: 500000000
              }]
          }
      };

      const invokeScriptTx = invokeScript(invokeScriptTxParams, craunUserSeed);

      const tx = await broadcast(invokeScriptTx);

      const minedTx = await waitForTx(tx.id)

      console.log(minedTx);
  })
})

describe('Create new goal for user', () => {
    it('Generate new goal account for goal in blockchain', function() {})

    it('SetSript goal account with craunGoalDApp', async function() {
        this.timeout(0);

        const setScriptTxParams = {
            script: compiledCraunGoalDApp,
            senderPublicKey: craunGoalPubKey,
            fee: 1400000
        };

        const setScriptTx = setScript(setScriptTxParams, craunGoalSeed);

        const tx = await broadcast(setScriptTx);

        const minedTx = await waitForTx(tx.id)

        console.log(minedTx);
    })

    it('Setup goal configuraton by invoking setup method in craunGoalDApp', async function() {
        this.timeout(0);
        
        const invokeScriptSetupTxParams = {
            dApp: craunGoalAddress,
            call:{
                function: 'setup',
                args: [{
                    type: "string",
                    value: craunUserAddress
                }, {
                    type: "string",
                    value: goal.title
                }, {
                    type: "integer",
                    value: goal.distance
                }, {
                    type: 'string',
                    value: goal.recordWeekDays
                },{
                    type: "integer",
                    value: goal.archievePenalty
                }, {
                    type: "integer",
                    value: goal.failPenalty
                }, {
                    type: "integer",
                    value: goal.attemptsCount
                }, {
                    type: "string",
                    value: goal.startDate
                },{
                    type: "string",
                    value: goal.endDate
                }]
            }
        };

        const invokeScriptSetupTx = invokeScript(invokeScriptSetupTxParams, craunUserSeed);

        const tx = await broadcast(invokeScriptSetupTx);

        const minedTx = await waitForTx(tx.id);

        console.log(minedTx);
    })

    it('Register user goal in craunAppAccount by invoking addGoal method in craunAppDApp', function() {
        const invokeScriptAddGoalParams = {
            dApp: craunAppAddress,
            call:{
                function: 'addGoal',
                args: [{
                    type: "string",
                    value: craunGoalAddress 
                }]
            }
        };

        const invokeScriptFrozeTx = invokeScript(invokeScriptAddGoalParams, craunUserSeed);

        const tx = await broadcast(invokeScriptFrozeTx);

        const minedTx = await waitForTx(tx.id);

        console.log(minedTx);
    })
})

describe('Track goal execution record', () => {
    it('Add record of goal execution by invoking addRecord method in craunGoalDApp', async function() {
        this.timeout(0);

        const params = {
            dApp: craunGoalAddress,
            call: {
                function: 'addRecord',
                args: [{
                    type: "string",
                    value: "15.05.2019" 
                }, {
                    type: "integer",
                    value: 100 
                }]
            },
        };

        const invokeScriptTx = invokeScript(params);

        const tx = await broadcast(invokeScriptTx);

        const minedTx = await waitForTx(tx.id)

        console.log(tx);
    })
})

describe('Check goal execution record', () => {
    it('Check goal execution by invoking checkUserGoal method on craunAppDApp)', async function() {
        this.timeout(0);

        const params = {
            dApp: craunAppAddress,
            call: {
                function: 'checkUserGoal',
                args: [{
                    type: "string",
                    value: craunGoalAddress 
                }, {
                    type: "string",
                    value: craunUserAddress 
                }, {
                    type: "string",
                    value: "13.05.2019"
                }]
            },
        };

        const invokeScriptTx = invokeScript(params, craunUserSeed);

        const tx = await broadcast(invokeScriptTx);

        const minedTx = await waitForTx(tx.id)

        console.log(tx);
    })
})
