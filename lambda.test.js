const AWS = require('aws-sdk');
const AWSMock = require('aws-sdk-mock');
const { handler: createExpenseHandler } = require('../createExpense/index');
const { handler: updateExpenseHandler } = require('../updateExpense/index');
const { handler: getExpensesHandler } = require('../getExpenses/index');
const { handler: deleteExpenseHandler } = require('../deleteExpense/index');

describe('Expense Lambda Functions', () => {
  
  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  it('should create a new expense', async () => {
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      callback(null, { Attributes: { expenseId: '1234' } });
    });

    const event = {
      body: JSON.stringify({
        userId: 'user123',
        amount: 50,
        category: 'Food',
        description: 'Lunch',
        date: '2025-05-17',
      }),
    };
    const result = await createExpenseHandler(event);
    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body).expenseId).toBeDefined();
  });

  it('should update an existing expense', async () => {
    AWSMock.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
      callback(null, { Attributes: { expenseId: 'existingExpenseId' } });
    });

    const event = {
      body: JSON.stringify({
        expenseId: 'existingExpenseId',
        userId: 'user123',
        amount: 100,
        category: 'Food',
        description: 'Dinner',
        date: '2025-05-18',
      }),
    };
    const result = await updateExpenseHandler(event);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).expenseId).toBe('existingExpenseId');
  });

  it('should get all expenses for a user', async () => {
    AWSMock.mock('DynamoDB.DocumentClient', 'scan', (params, callback) => {
      callback(null, {
        Items: [
          { expenseId: '1234', description: 'Lunch', amount: 50, date: '2025-05-17' },
          { expenseId: '5678', description: 'Dinner', amount: 100, date: '2025-05-18' }
        ]
      });
    });

    const event = {
      queryStringParameters: {
        userId: 'user123',
      },
    };
    const result = await getExpensesHandler(event);
    expect(result.statusCode).toBe(200);
    const
