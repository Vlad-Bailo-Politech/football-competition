const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let server;
let mongod;

jest.setTimeout(20000);

describe('Auth API Endpoints', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();
    process.env.JWT_SECRET = 'testsecret';

    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const entry = require('../index');
    app = entry.app;
    server = entry.server;
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongod.stop();
    server.close();
  });

  test('Register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'player',
      })
      .expect(201);

    expect(res.body.message).toBe('User created successfully');
  });

  test('Prevent duplicate registration', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate User',
        email: 'test@example.com',
        password: 'password123',
        role: 'player',
      })
      .expect(400);
  });

  test('Login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(200);

    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe('Test User');
    expect(res.body.user.role).toBe('player');
  });

  test('Login with incorrect password', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
      .expect(400);
  });

  test('Login with non-existent user', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      })
      .expect(400);
  });
});