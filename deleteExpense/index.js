const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const { userId, expenseId } = event.pathParameters;

    if (!userId || !expenseId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "User ID and Expense ID are required" })
        };
    }

    const params = {
        TableName: 'Expenses',
        Key: {
            'userId': userId,
            'expenseId': expenseId
        }
    };

    try {
        await dynamoDB.delete(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Expense deleted successfully" })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to delete expense" })
        };
    }
};
