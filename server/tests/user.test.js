const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let server;
let mongod;

jest.setTimeout(20000);

describe('User API Endpoints', () => {
  let coachToken;
  let organizerToken;
  let coachUser;
  let organizerUser;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();

    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const entry = require('../index');
    app = entry.app;
    server = entry.server;

    // Register coach
    const resCoach = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Coach', email: 'coach@example.com', password: 'pw', role: 'coach' })
      .expect(201);

    coachUser = resCoach.body;

    const resCoachLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'coach@example.com', password: 'pw' })
      .expect(200);

    coachToken = resCoachLogin.body.token;

    // Register organizer
    const resOrganizer = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Organizer', email: 'organizer@example.com', password: 'pw', role: 'organizer' })
      .expect(201);

    organizerUser = resOrganizer.body;

    const resOrganizerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'organizer@example.com', password: 'pw' })
      .expect(200);

    organizerToken = resOrganizerLogin.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongod.stop();
    server.close();
  });

  test('Fetch logged-in user profile', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(200);

    expect(res.body.email).toBe('coach@example.com');
    expect(res.body.name).toBe('Coach');
    expect(res.body.password).toBeUndefined(); // Пароль не повинен повертатись
  });

  test('Access organizer-only route (forbidden for coach)', async () => {
    await request(app)
      .get('/api/users/admin-only')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect(403);
  });

  test('Access organizer-only route (allowed for organizer)', async () => {
    const res = await request(app)
      .get('/api/users/admin-only')
      .set('Authorization', `Bearer ${organizerToken}`)
      .expect(200);

    expect(res.text).toBe('You are an organizer!');
  });

  test('Fetch user by email (exists)', async () => {
    const res = await request(app)
      .get('/api/users/by-email')
      .set('Authorization', `Bearer ${coachToken}`)
      .query({ email: 'organizer@example.com' })
      .expect(200);

    expect(res.body.email).toBe('organizer@example.com');
  });

  test('Fetch user by email (not exists)', async () => {
    await request(app)
      .get('/api/users/by-email')
      .set('Authorization', `Bearer ${coachToken}`)
      .query({ email: 'nonexistent@example.com' })
      .expect(404);
  });
});