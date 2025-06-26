const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let server;
let mongod;

jest.setTimeout(20000);

describe('Tournament API Endpoints', () => {
  let organizerToken;
  let tournament;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();

    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const entry = require('../index');
    app = entry.app;
    server = entry.server;

    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Org', email: 'org2@example.com', password: 'pass', role: 'organizer' })
      .expect(201);

    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'org2@example.com', password: 'pass' })
      .expect(200);

    organizerToken = resLogin.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongod.stop();
    server.close();
  });

  test('Create tournament', async () => {
    const res = await request(app)
      .post('/api/tournaments')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        name: 'Test Tournament',
        location: 'Test City',
        startDate: '2025-08-01',
        endDate: '2025-08-10',
        format: 'group'
      })
      .expect(201);

    tournament = res.body;
    expect(tournament.name).toBe('Test Tournament');
  });

  test('Fetch all tournaments publicly', async () => {
    const res = await request(app)
      .get('/api/tournaments')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('Fetch one tournament by ID', async () => {
    const res = await request(app)
      .get(`/api/tournaments/${tournament._id}`)
      .expect(200);

    expect(res.body._id).toBe(tournament._id);
  });

  test('Update tournament', async () => {
    const res = await request(app)
      .put(`/api/tournaments/${tournament._id}`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({ location: 'Updated City' })
      .expect(200);

    expect(res.body.location).toBe('Updated City');
  });

  test('Delete tournament', async () => {
    await request(app)
      .delete(`/api/tournaments/${tournament._id}`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .expect(200);

    await request(app)
      .get(`/api/tournaments/${tournament._id}`)
      .expect(404);
  });
});