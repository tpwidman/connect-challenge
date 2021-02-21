const test = require('ava');
const AWS = require('aws-sdk');
const awsMock = require('aws-sdk-mock');
const _ = require('lodash');
const {
    instances,
    app
} = require('../../index');
const event = require('./sample-connect-event.json');

test.afterEach(t => {
    awsMock.restore();
})
test.serial('Testing app handler', async t => {
    awsMock.mock("DynamoDB", "putItem")
    const result = await app(event, {db: new AWS.DynamoDB(), tableName: "ConnectChallenge"});
    t.is(result.vanityNumbersCount, 3);
    t.is(typeof result.vanityNumbersString, "string");
});
test.serial('Testing app handler with a funky phone number', async t => {
    const eventWithFunkyPhoneNumber = _.cloneDeep(event);
    eventWithFunkyPhoneNumber.Details.ContactData.CustomerEndpoint.Address = "1111111"
    awsMock.mock("DynamoDB", "putItem")
    const result = await app(eventWithFunkyPhoneNumber, {db: new AWS.DynamoDB(), tableName: "ConnectChallenge"});
    t.is(result.vanityNumbersCount, 0);
});
test.serial('Testing app handler - error handling', async t => {
    const err = await t.throwsAsync(() => app(event, {db: {}, tableName: "ConnectChallenge"}));
    t.true(err instanceof Error);
});
test.serial('Testing instances function', t => {
    t.throws(() => instances({}));
})