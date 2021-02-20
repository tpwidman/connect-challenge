const log = require('./logUtil');
/**
 * 
 * @param {Object} db initialized DB client
 * @param {String} phoneNumber initial phone number stored as string
 * @param {String[]} vanityNumbers output vanity numbers stored as string set
 * @param {String} tableName name of table in the put
 */
async function storeInDynamo(db, phoneNumber, vanityNumbers, tableName){
    log.info(`Storing new record in dynamo for ${phoneNumber} with ${vanityNumbers.length} vanity numbers`);
    const params = {
        TableName: tableName,
        Item: {
            phoneNumber: {
                S: phoneNumber
            },
            bestVanityOrdered: {
                SS: vanityNumbers
            }
        }
    }
    return db.putItem(params).promise();
}
module.exports = {
    storeInDynamo
}