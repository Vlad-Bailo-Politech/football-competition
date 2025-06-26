const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let server;
let mongod;

jest.setTimeout(20000);

describe('Player API Endpoints', () => {
    let coachToken;
    let organizerToken;
    let player;
    let team;
    let tournament;

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
            .send({ name: 'Organizer', email: 'organizer@example.com', password: 'pw', role: 'organizer' })
            .expect(201);

        const resOrganizerLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'organizer@example.com', password: 'pw' })
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

        // Create tournament
        const resTournament = await request(app)
            .post('/api/tournaments')
            .set('Authorization', `Bearer ${organizerToken}`)
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
                tournament: tournament._id,
            })
            .expect(201);

        team = resTeam.body;

        // Add player to team
        await request(app)
            .put(`/api/teams/${team._id}/add-player`)
            .set('Authorization', `Bearer ${coachToken}`)
            .send({ playerId: player._id })
            .expect(200);

        // Create a match with initial score
        await request(app)
            .post('/api/matches')
            .set('Authorization', `Bearer ${organizerToken}`)
            .send({
                tournament: tournament._id,
                teamA: team._id,
                teamB: team._id,
                date: '2025-08-05T15:00:00Z',
                location: 'Test Stadium',
                score: { teamA: 0, teamB: 0 }
            })
            .expect(201);
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await mongod.stop();
        server.close();
    });

    test('Fetch all players publicly', async () => {
        const res = await request(app)
            .get('/api/players')
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test('Fetch single player publicly', async () => {
        try {
            const res = await request(app)
                .get(`/api/players/${player._id}`);
            expect(res.status).toBe(200);
            expect(res.body.player._id).toBe(player._id.toString());
            expect(res.body.stats.games).toBe(1);
        } catch (err) {
            console.error(err); // 👈 покаже конкретну помилку
            throw err;
        }
    });

    test('Fetch player ranking', async () => {
        const res = await request(app)
            .get('/api/players/ranking')
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
    });
});
