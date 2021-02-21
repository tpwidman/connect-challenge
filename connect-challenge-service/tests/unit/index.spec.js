const test = require('ava');
const AWS = require('aws-sdk');
const awsMock = require('aws-sdk-mock');

const app = require('../../index').app;
const event = require('./sample-connect-event.json');
test.afterEach(t => {
    awsMock.restore();
})
test.serial('Testing app handler', async t => {
    awsMock.mock("DynamoDB", "putItem")
    const result = await app(event, {db: new AWS.DynamoDB(), tableName: "ConnectChallenge"});
    t.is(result.vanityNumbersCount, 3);
    t.is(typeof result.vanityNumbersString, "string");
    t.pass();
})