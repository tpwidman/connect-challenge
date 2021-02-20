const laconia = require("@laconia/core");
const AWS = require('aws-sdk');
const convert = require('./lib/convert');
const log = require('./lib/logUtil');
const { storeInDynamo } = require('./lib/dbMethods');

const instances = ({ env }) => ({
    db = new AWS.DynamoDB({
        apiVersion: '2012-08-10'
    }),
    tableName: env.table
  });
  
exports.app = async (event, { db, tableName }) => {
    try {
        const initialNumber = event.Details.ContactData.CustomerEndpoint.Address;
        const bestVanityNumbers = convert.getVanity(initialNumber);
        await storeInDynamo(db, initialNumber, bestVanityNumbers, tableName);
        return {
            VanityNumbersList: bestVanityNumbers.slice(0, 2).join(', '),
        }
    } catch (error){
        log.error(error.message);
        throw error;
    }
};
  
exports.handler = laconia(exports.app).register(instances);