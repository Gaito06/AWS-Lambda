const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { userId } = event.requestContext.authorizer.claims;
  const { expenseId } = JSON.parse(event.body);

  const params = {
    TableName: "Expenses",
    Key: { userId, expenseId },
  };

  try {
    await dynamoDb.delete(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Expense deleted" }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify(err) };
  }
};
