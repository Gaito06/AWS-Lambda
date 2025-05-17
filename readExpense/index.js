const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { userId } = event.requestContext.authorizer.claims;

  const params = {
    TableName: "Expenses",
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: {
      ":uid": userId,
    },
  };

  try {
    const data = await dynamoDb.query(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify(err) };
  }
};
