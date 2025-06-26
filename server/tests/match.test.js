const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let server;
let mongod;

jest.setTimeout(20000);

describe('Match API Routes with Live Updates', () => {
  let organizerToken;
  let coachToken;
  let tournament;
  let teamA;
  let teamB;
  let match;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri();

    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const entry = require('../index');
    app = entry.app;
    server = entry.server;

    // Register organizer
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Org', email: 'org@example.com', password: 'pass', role: 'organizer' })
      .expect(201);

    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'org@example.com', password: 'pass' })
      .expect(200);

    organizerToken = resLogin.body.token;

    // Create tournament
    const resT = await request(app)
      .post('/api/tournaments')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({ name: 'Cup', location: 'City', startDate: '2025-08-01', endDate: '2025-08-10' })
      .expect(201);

    tournament = resT.body;

    // Register coach
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Coach', email: 'coach@example.com', password: 'pw', role: 'coach' })
      .expect(201);

    const resC = await request(app)
      .post('/api/auth/login')
      .send({ email: 'coach@example.com', password: 'pw' })
      .expect(200);

    coachToken = resC.body.token;

    // Create Team A
    const resA = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'TeamA', tournament: tournament._id })
      .expect(201);

    teamA = resA.body;

    // Create Team B
    const resB = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ name: 'TeamB', tournament: tournament._id })
      .expect(201);

    teamB = resB.body;

    // Create Match
    const resM = await request(app)
      .post('/api/matches')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({ tournament: tournament._id, teamA: teamA._id, teamB: teamB._id, date: '2025-08-05T15:00:00Z', location: 'Stadium' })
      .expect(201);

    match = resM.body;
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await mongod.stop();
    server.close();
  });

  test('Fetch matches publicly', async () => {
    const res = await request(app)
      .get('/api/matches')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('Fetch single match publicly', async () => {
    const res = await request(app)
      .get(`/api/matches/${match._id}`)
      .expect(200);

    expect(res.body._id).toBe(match._id);
  });

  test('Update match details', async () => {
    const res = await request(app)
      .put(`/api/matches/${match._id}`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({ location: 'New Stadium' })
      .expect(200);

    expect(res.body.location).toBe('New Stadium');
  });

  test('Update match score', async () => {
    const res = await request(app)
      .put(`/api/matches/${match._id}/score`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({ scoreA: 2, scoreB: 1 })
      .expect(200);

    expect(res.body.match.score.teamA).toBe(2);
    expect(res.body.match.score.teamB).toBe(1);
  });

  test('Delete match', async () => {
    await request(app)
      .delete(`/api/matches/${match._id}`)
      .set('Authorization', `Bearer ${organizerToken}`)
      .expect(200);

    await request(app)
      .get(`/api/matches/${match._id}`)
      .expect(404);
  });
});