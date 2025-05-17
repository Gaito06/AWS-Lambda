const { handler } = require('../createExpense/index');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

jest.mock('aws-sdk', () => {
    const mockDocumentClient = {
        put: jest.fn().mockReturnValue({
            promise: jest.fn().mockResolvedValue('Success'),
        }),
    };

    return {
        DynamoDB: {
            DocumentClient: jest.fn(() => mockDocumentClient),
        },
    };
});

jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('1234-uuid-5678')
}));

describe('Lambda function tests for creating expense', () => {

    it('should return 201 and created expense for valid input', async () => {
        const event = {
            body: JSON.stringify({
                userId: 'user123',
                amount: 100,
                category: 'Food',
                description: 'Dinner',
                date: '2025-05-16',
            }),
        };

        const result = await handler(event);

        expect(result.statusCode).toBe(201);
        expect(JSON.parse(result.body).expenseId).toBe('1234-uuid-5678');
        expect(JSON.parse(result.body).userId).toBe('user123');
        expect(JSON.parse(result.body).amount).toBe(100);
        expect(JSON.parse(result.body).category).toBe('Food');
        expect(JSON.parse(result.body).description).toBe('Dinner');
        expect(JSON.parse(result.body).date).toBe('2025-05-16');
    });

    it('should return 400 for missing required fields', async () => {
        const event = {
            body: JSON.stringify({
                userId: 'user123',
                amount: 100,
                category: 'Food',
            }),
        };

        const result = await handler(event);

        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).message).toBe('Missing required fields');
    });

    it('should return 400 for invalid amount', async () => {
        const event = {
            body: JSON.stringify({
                userId: 'user123',
                amount: 'invalidAmount',
                category: 'Food',
                description: 'Dinner',
                date: '2025-05-16',
            }),
        };

        const result = await handler(event);

        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).message).toBe('Invalid data input');
    });

    it('should return 500 if DynamoDB fails', async () => {
        const mockPut = jest.fn().mockReturnValue({
            promise: jest.fn().mockRejectedValue(new Error('DynamoDB Error')),
        });
        const { DynamoDB } = require('aws-sdk');
        DynamoDB.DocumentClient.prototype.put = mockPut;

        const event = {
            body: JSON.stringify({
                userId: 'user123',
