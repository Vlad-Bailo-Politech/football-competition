const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let server;
let mongod;

jest.setTimeout(20000);

describe('Team API Endpoints', () => {
    let coachToken;
    let player;
    let team;
    let tournament;
    let organizerToken;

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
            .send({ name: 'Organizer', email: 'org@example.com', password: 'pw', role: 'organizer' })
            .expect(201);

        const resOrganizerLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'org@example.com', password: 'pw' })
            .expect(200);

        organizerToken = resOrganizerLogin.body.token;

        // Register coach
        await request(app)
            .post('/api/auth/register')
            .send({ name: 'Coach', email: 'coach@example.com', password: 'pw', role: 'coach' })
            .expect(201);

        const resCoachLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'coach@example.com', password: 'pw' })
            .expect(200);

        coachToken = resCoachLogin.body.token;

        // Register player
        await request(app)
            .post('/api/auth/register')
            .send({ name: 'Player', email: 'player@example.com', password: 'pw', role: 'player' })
            .expect(201);

        const resPlayerLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'player@example.com', password: 'pw' })
            .expect(200);

        player = resPlayerLogin.body.user;

        // Create tournament (ORGANIZER)
        const resTournament = await request(app)
            .post('/api/tournaments')
            .set('Authorization', `Bearer ${organizerToken}`) // <-- ВАЖЛИВО
            .send({
                name: 'Test Tournament',
                location: 'City',
                startDate: '2025-08-01',
                endDate: '2025-08-10',
            })
            .expect(201);

        tournament = resTournament.body;

        // Create team
        const resTeam = await request(app)
            .post('/api/teams')
            .set('Authorization', `Bearer ${coachToken}`)
            .send({
                name: 'Test Team',
                tournament: tournament._id
            })
            .expect(201);

        team = resTeam.body;
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await mongod.stop();
        server.close();
    });

    test('Fetch all teams publicly', async () => {
        const res = await request(app)
            .get('/api/teams')
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test('Fetch team by ID publicly', async () => {
        const res = await request(app)
            .get(`/api/teams/${team._id}`)
            .expect(200);

        expect(res.body._id).toBe(team._id);
        expect(res.body.name).toBe('Test Team');
    });

    test('Add player to team', async () => {
        const res = await request(app)
            .put(`/api/teams/${team._id}/add-player`)
            .set('Authorization', `Bearer ${coachToken}`)
            .send({ playerId: player._id })
            .expect(200);

        expect(res.body.message).toBe('Player added');
        expect(res.body.team.players).toContain(player._id);
    });

    test('Remove player from team', async () => {
        const res = await request(app)
            .put(`/api/teams/${team._id}/remove-player`)
            .set('Authorization', `Bearer ${coachToken}`)
            .send({ playerId: player._id })
            .expect(200);

        expect(res.body.message).toBe('Player removed');
        expect(res.body.team.players).not.toContain(player._id);
    });

    test('Update team', async () => {
        const res = await request(app)
            .put(`/api/teams/${team._id}`)
            .set('Authorization', `Bearer ${coachToken}`)
            .send({ name: 'Updated Team' })
            .expect(200);

        expect(res.body.name).toBe('Updated Team');
    });

    test('Delete team', async () => {
        const res = await request(app)
            .delete(`/api/teams/${team._id}`)
            .set('Authorization', `Bearer ${coachToken}`)
            .expect(200);

        expect(res.body.message).toBe('Team deleted');
    });
});
