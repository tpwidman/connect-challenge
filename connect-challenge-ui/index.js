const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB();
exports.handler = async (event) => {
    const params = {
      Limit: 5,
      TableName: process.env.TABLE_NAME
    }
    const result = await docClient.scan(params).promise();
    const output = result.Items.map(item => {
        const phoneNumber = item.phoneNumber.S;
        const bestVanityOrdered = item.bestVanityOrdered.L;
        const createdAt = item.createdAt.S;
        return {
            "phoneNumber": phoneNumber,
            "bestVanityOrdered": bestVanityOrdered.map(({ S }) => S).join(', '),
            "createdAt": createdAt
        }
    })
    const response = {
        statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
          },
        body: JSON.stringify(output)
    };
    return response;
};
