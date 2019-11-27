const oneWaves = 100000000;
const compiledDApp = compile(file('oracles.ride'));


describe('Deploy dApp', () => {

    it('Deploying dApp script', async function () {
        await setupAccounts({
            'dApp': 2 * oneWaves
        });

        const ssDappTx = setScript({script: compiledDApp}, accounts.dApp)

        await broadcast(ssDappTx);
        await waitForTx(ssDappTx.id);
        console.log(`dApp address: ${address(accounts.dApp)}`);
    });

});

/*
describe('Happy path with open', () => {

    const requestId = 'temp_moscow@2019-08-25 12:00:01';
    const oraclesCount = 5;

    before(async() => {

        const startAccounts = {
            'requester': 10 * oneWaves
        };

        for (let k = 0; k < oraclesCount; k++) {
            startAccounts[`oracle${k}`] = oneWaves * 2;
        }

        await setupAccounts(startAccounts);
        
    });

    it('Requester creates new request', async function(){
        console.log(address(accounts.dApp));
        const invTx = invokeScript({
            additionalFee: 500000,
            dApp: address(accounts.dApp),
            call: {
                function: "request",
                args: [{
                    type: "string",
                    value: requestId
                }, {
                    type: "string",
                    value: 'Temperature//{lat: "55.7558N", lon: "37.6173E", at: "2019-08-25 12:00:01", responseFormat: "NN.NN"}'
                }, {
                    type: "integer",
                    value: 3
                }, {
                    type: "integer",
                    value: 5
                }, {
                    type: "string",
                    value: ""
                }, {
                    type: "integer",
                    value: 2000000
                }]
            },
            payment: [
                {
                    amount: oneWaves * 2,
                    assetId: null
                }
            ]
        }, accounts.requester)

        await broadcast(invTx)
        await waitForTx(invTx.id)
    });
    
    it('Response to request', async function(){

        // const questionData = accountDataByKey(dappAddress, `${requestId}_question`);
        // const questionParams = JSON.parse(questionData.split('//')[1]);
        // const weatherData = await fetch(`https://api.weather.yandex.ru/v1/informers?lat=${questionParams.lat}&lon=${questionParams.lon}`, {
        //     headers: {
        //         'X-Yandex-API-Key': 'de3c344d-72cd-4668-a1d8-231b9461fa41'
        //     }
        // });
        // console.log(questionParams, weatherData);

        const responses = [0, 1, 2, 3 , 4].map((index) => {
            return new Promise(async (resolve, reject) => {

                const registerInvTx = invokeScript({
                    additionalFee: 500000,
                    dApp: address(accounts.dApp),
                    call: {
                        function: "registerAsOracle",
                        args: [{
                            type: "string",
                            value: "Temperature"
                        }]
                    }
                }, accounts[`oracle${index}`])

                await broadcast(registerInvTx);
                await waitForTx(registerInvTx.id);

                const responseInvTx = invokeScript({
                    additionalFee: 500000,
                    dApp: address(accounts.dApp),
                    call: {
                        function: "response",
                        args: [{
                            type: "string",
                            value: requestId
                        },
                        {
                            type: "string",
                            value: index == 3 ? "12" : "42"
                        }]
                    }
                }, accounts[`oracle${index}`]);
                console.log(`Oracle #${index} is responding`);
                await broadcast(responseInvTx);
                await waitForTx(responseInvTx.id);
                console.log(`Oracle #${index} responded: ${responseInvTx.id}`);
                resolve();
            });
        });
        await Promise.all(responses)
        .then((res) => console.log("All oracles responded"));
    });

    it('Count results', async function(){
        const resultsInvTx = invokeScript({
            additionalFee: 500000,
            dApp: address(accounts.dApp),
            call: {
                function: "getResult",
                args: [{
                    type: "string",
                    value: requestId
                }]
            }
        }, accounts.requester)

        await broadcast(resultsInvTx);
        await waitForTx(resultsInvTx.id);
    });



    it('Take rewards', async function(){
        const responses = [0, 1, 2, 3, 4].map((index) => {
            return new Promise(async (resolve, reject) => {

                const takeRewardInvTx = invokeScript({
                    additionalFee: 500000,
                    dApp: address(accounts.dApp),
                    call: {
                        function: "takeReward",
                        args: [{
                            type: "string",
                            value: requestId
                        }]
                    }
                }, accounts[`oracle${index}`]);
                console.log(`Oracle #${index} is taking reward`);
                try{
                    await broadcast(takeRewardInvTx);
                    await waitForTx(takeRewardInvTx.id);
                    console.log(`Oracle #${index} took: ${takeRewardInvTx.id}`);
                    resolve();
                }catch(e){
                    console.log(e);
                    resolve();
                }
            });
        });
        await Promise.all(responses)
        .then((res) => console.log("All oracles took their money"));
    });
});
*/

describe('[2] Happy path with white-list', () => {
    const requestId = 'random@BkpmDUk2c5u4AsmxLQ1kk';
    const oraclesCount = 5;
    const oracleSeedPrefix = 'oracleFromWhiteList';
    const oraclesInWhiteList = [0, 1, 2, 3];
    const oracleNotInWhiteList = 4;
    before(async () => {

        const startAccounts = {
            'requesterWithWhiteList': 10 * oneWaves
        };

        for (let k = 0; k < oraclesCount; k++) {
            startAccounts[`${oracleSeedPrefix}${k}`] = oneWaves * 2;
        }

        await setupAccounts(startAccounts);

    });

    it('[2]: Requester creates new request', async function () {
        try {
            console.info(`Oracles in the white list: ${oraclesInWhiteList.join(', ')}`)
            const oraclesWhiteList = oraclesInWhiteList.map((index) => {
                return publicKey(accounts[`oracle${index}`])
            }).join(", ");
            console.log(`White-list: ${oraclesWhiteList}`);
            const invTx = invokeScript({
                additionalFee: 500000,
                dApp: address(accounts.dApp),
                call: {
                    function: "request",
                    args: [{
                        // id
                        type: "string",
                        value: requestId
                    }, {
                        // question
                        type: "string",
                        value: 'Random//{round: 123456}'
                    }, {
                        // minResponsesCount
                        type: "integer",
                        value: 3
                    }, {
                        // maxResponsesCount
                        type: "integer",
                        value: 5
                    }, {
                        // white-list separated by ,
                        type: "string",
                        value: oraclesWhiteList
                    }, {
                        // tillHeight
                        type: "integer",
                        value: 2000000
                    }]
                },
                payment: [
                    {
                        amount: oneWaves * 2,
                        assetId: null
                    }
                ]
            }, accounts.requesterWithWhiteList);

            await broadcast(invTx);
            return await waitForTx(invTx.id);

        } catch (e) {
            console.log(e);
            return e;
        }
    });

    it('[2]: Response to request by white-listed oracle', async () => {
        const responses = oraclesInWhiteList.map((index) => {
            return new Promise(async (resolve, reject) => {
                try{
                    const registerInvTx = invokeScript({
                        additionalFee: 500000,
                        dApp: address(accounts.dApp),
                        call: {
                            function: "registerAsOracle",
                            args: [{
                                type: "string",
                                value: "Random"
                            }]
                        }
                    }, accounts[`${oracleSeedPrefix}${index}`]);

                    await broadcast(registerInvTx);
                    await waitForTx(registerInvTx.id);

                    const responseValue = index == 3 ? "12" : "42"
                    const responseInvTx = invokeScript({
                        additionalFee: 500000,
                        dApp: address(accounts.dApp),
                        call: {
                            function: "response",
                            args: [
                                {
                                    type: "string",
                                    value: requestId
                                },
                                {
                                    type: "string",
                                    value: responseValue
                                }
                            ]
                        }
                    }, accounts[`${oracleSeedPrefix}${index}`]);
                    console.log(`Oracle #${index} is responding with value: ${responseValue}`);
                    await broadcast(responseInvTx);
                    await waitForTx(responseInvTx.id);
                    console.log(`Oracle #${index} responded: ${responseInvTx.id}`);
                    resolve();
                }catch(e){
                    console.log(`Error while oracle #${index} response`, e);
                    reject();
                }
            });
        });
        return await Promise.all(responses)
            .then((res) => console.log("All white-listed oracles responded"));
    });


    it('[2]: Response to request by NON-white-listed oracle', async () => {
        try{
            const registerInvTx = invokeScript({
                additionalFee: 500000,
                dApp: address(accounts.dApp),
                call: {
                    function: "registerAsOracle",
                    args: [{
                        type: "string",
                        value: "Random"
                    }]
                }
            }, accounts[`${oracleSeedPrefix}${index}`]);

            await broadcast(registerInvTx);
            await waitForTx(registerInvTx.id);

            const responseValue = "42"
            const responseInvTx = invokeScript({
                additionalFee: 500000,
                dApp: address(accounts.dApp),
                call: {
                    function: "response",
                    args: [
                        {
                            type: "string",
                            value: requestId
                        },
                        {
                            type: "string",
                            value: responseValue
                        }
                    ]
                }
            }, accounts[`${oracleSeedPrefix}${oracleNotInWhiteList}`]);
            console.log(`Oracle #${oracleNotInWhiteList} is responding with value: ${responseValue}`);
            await broadcast(responseInvTx);
            await waitForTx(responseInvTx.id);
            console.log(`Oracle #${oracleNotInWhiteList} responded: ${responseInvTx.id}`);
            return reject();
        }catch(e){
            console.log(`Error while oracle #${oracleNotInWhiteList} response`, e);
            return resolve();
        }
    });

    it('[2]: Count results', async function () {
        const resultsInvTx = invokeScript({
            additionalFee: 500000,
            dApp: address(accounts.dApp),
            call: {
                function: "getResult",
                args: [{
                    type: "string",
                    value: requestId
                }]
            }
        }, accounts.requesterWithWhiteList);

        await broadcast(resultsInvTx);
        await waitForTx(resultsInvTx.id);
        const requestIdKey = `${requestId}_result`
        const result = await accountData(address(accounts.dApp), requestIdKey);
        console.log(`Result was successfully gathered: ${result}`);
        return true;
    });


    it('[2]: Take rewards', async function () {
        const responses = [0, 1, 2, 3, 4].map((index) => {
            return new Promise(async (resolve, reject) => {

                const takeRewardInvTx = invokeScript({
                    additionalFee: 500000,
                    dApp: address(accounts.dApp),
                    call: {
                        function: "takeReward",
                        args: [{
                            type: "string",
                            value: requestId
                        }]
                    }
                }, accounts[`${oracleSeedPrefix}${index}`]);
                console.log(`Oracle #${index} is taking reward`);
                try {
                    await broadcast(takeRewardInvTx);
                    await waitForTx(takeRewardInvTx.id);
                    console.log(`Oracle #${index} took: ${takeRewardInvTx.id}`);
                    resolve();
                } catch (e) {
                    console.log(`Error while taking reward for oracle ${index} with key ${accounts[`oracle${index}`]}`, e);
                    resolve();
                }
            });
        });
        return await Promise.all(responses).then((res) => console.log("All oracles took their money"));
    });
});