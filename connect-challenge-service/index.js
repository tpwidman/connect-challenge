const laconia = require("@laconia/core");
const AWS = require("aws-sdk");
const convert = require("./lib/convert");
const log = require("./lib/logUtil");
const { storeInDynamo } = require("./lib/dbMethods");

exports.instances = ({ env }) => ({
  db: new AWS.DynamoDB({
    apiVersion: "2012-08-10",
  }),
  tableName: env.TABLE_NAME,
});

exports.app = async (event, { db, tableName }) => {
  try {
    const initialNumber = event.Details.ContactData.CustomerEndpoint.Address;
    const bestVanityNumbers = convert.getVanity(initialNumber);
    if (bestVanityNumbers.length > 0) {
      await storeInDynamo(db, initialNumber, bestVanityNumbers, tableName);
    }
    const bestThree = bestVanityNumbers.slice(0, 3);
    return {
      vanityNumbersCount: bestThree.length,
      vanityNumbersString: bestThree.join(", "),
    };
  } catch (error) {
    log.error(error.message);
    throw error;
  }
};

exports.handler = laconia(exports.app).register(exports.instances);
