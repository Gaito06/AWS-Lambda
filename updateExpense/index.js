const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const { userId, expenseId } = event.pathParameters;
    const body = JSON.parse(event.body);

    const params = {
        TableName: 'Expenses',
        Key: {
            userId: userId,
            expenseId: expenseId
        },
        UpdateExpression: 'set amount = :a, category = :c, description = :d, date = :dt',
        ExpressionAttributeValues: {
            ':a': body.amount,
            ':c': body.category,
            ':d': body.description,
            ':dt': body.date
        },
        ReturnValues: 'ALL_NEW'
    };

    try {
        const result = await dynamoDB.update(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(result.Attributes)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to update expense" })
        };
    }
};
