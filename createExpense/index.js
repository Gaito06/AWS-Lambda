const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const body = JSON.parse(event.body);

    const expenseItem = {
        userId: body.userId,
        expenseId: uuidv4(),
        amount: body.amount,
        category: body.category,
        description: body.description,
        date: body.date
    };

    const params = {
        TableName: 'Expenses',
        Item: expenseItem
    };

    try {
        await dynamoDB.put(params).promise();
        return {
            statusCode: 201,
            body: JSON.stringify(expenseItem)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to create expense" })
        };
    }
};
