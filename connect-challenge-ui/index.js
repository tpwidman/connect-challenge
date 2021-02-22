const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB();
exports.handler = async (event) => {
    const params = {
      TableName: process.env.TABLE_NAME
    }
    const results = await docClient.scan(params).promise();
    const response = {
        statusCode: 200,
        body: JSON.stringify(results.Items),
    };
    return response;
};
