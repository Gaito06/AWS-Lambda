const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { userId } = event.requestContext.authorizer.claims;
  const { date, amount, category, description } = JSON.parse(event.body);
  const expenseId = uuidv4();

  const params = {
    TableName: "Expenses",
    Item: {
      userId,
      expenseId,
      date,
      amount,
      category,
      description,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Expense added", expenseId }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify(err) };
  }
};
