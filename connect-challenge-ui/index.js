const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event) => {
    const params = {
      TableName: process.env.TABLE_NAME
    }
    const result = await docClient.scan(params).promise();
    const output = result.Items.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
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