const AWS = require('aws-sdk');
const AWSMock = require('aws-sdk-mock');
const { handler: createExpenseHandler } = require('../createExpense/index');
const { handler: updateExpenseHandler } = require('../updateExpense/index');
const { handler: getExpensesHandler } = require('../getExpenses/index');
const { handler: deleteExpenseHandler } = require('../deleteExpense/index');

describe('Expense Lambda Functions', () => {
  
  // Mock DynamoDB methods before each test
  beforeEach(() => {
    AWSMock.setSDKInstance(AWS);
  });

  afterEach(() => {
    AWSMock.restore();
  });

  it('should create a new expense', async () => {
    // Mock the DynamoDB put method
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
    // Mock the DynamoDB update method
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
    // Mock the DynamoDB scan method
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
    const expenses = JSON.parse(result.body);
    expect(expenses.length).toBeGreaterThan(0);
    expect(expenses[0].expenseId).toBe('1234');
  });

  it('should delete an existing expense', async () => {
    // Mock the DynamoDB delete method
    AWSMock.mock('DynamoDB.DocumentClient', 'delete', (params, callback) => {
      callback(null, { Attributes: { expenseId: 'existingExpenseId' } });
    });

    const event = {
      body: JSON.stringify({
        expenseId: 'existingExpenseId',
      }),
    };
    const result = await deleteExpenseHandler(event);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).message).toBe('Expense deleted successfully');
  });

});
