import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Standings() {
    const [tournaments, setTournaments] = useState([]);
    const [matches, setMatches] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState("");
    const [table, setTable] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchTournaments();
    }, []);

    useEffect(() => {
        if (selectedTournament) {
            fetchMatches(selectedTournament);
        }
    }, [selectedTournament]);

    const fetchTournaments = async () => {
        const res = await axios.get("http://localhost:5000/api/tournaments", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setTournaments(res.data);
    };

    const fetchMatches = async (tournamentId) => {
        const res = await axios.get("http://localhost:5000/api/matches", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const filtered = res.data.filter(m => m.tournament?._id === tournamentId);
        setMatches(filtered);
        calculateTable(filtered);
    };

    const calculateTable = (matches) => {
        const stats = {};

        for (let match of matches) {
            if (match.scoreA == null || match.scoreB == null) continue;

            const teamA = match.teamA;
            const teamB = match.teamB;
            const scoreA = match.scoreA;
            const scoreB = match.scoreB;

            if (!stats[teamA._id]) stats[teamA._id] = initTeam(teamA.name);
            if (!stats[teamB._id]) stats[teamB._id] = initTeam(teamB.name);

            const a = stats[teamA._id];
            const b = stats[teamB._id];

            a.played += 1;
            b.played += 1;
            a.goalsFor += scoreA;
            a.goalsAgainst += scoreB;
            b.goalsFor += scoreB;
            b.goalsAgainst += scoreA;

            if (scoreA > scoreB) {
                a.wins += 1;
                a.points += 3;
                b.losses += 1;
            } else if (scoreA < scoreB) {
                b.wins += 1;
                b.points += 3;
                a.losses += 1;
            } else {
                a.draws += 1;
                b.draws += 1;
                a.points += 1;
                b.points += 1;
            }
        }

        const tableArr = Object.values(stats).map(team => ({
            ...team,
            goalDiff: team.goalsFor - team.goalsAgainst
        }));

        tableArr.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return b.goalDiff - a.goalDiff;
        });

        setTable(tableArr);
    };

    const initTeam = (name) => ({
        name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0
    });

    return (
        <div style={{ padding: 20 }}>
            <h2>Турнірна таблиця</h2>

            <select value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)}>
                <option value="">Оберіть турнір</option>
                {tournaments.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                ))}
            </select>

            {table.length > 0 && (
                <table border={1} cellPadding={8} style={{ marginTop: 20 }}>
                    <thead>
                        <tr>
                            <th>Команда</th>
                            <th>Ігри</th>
                            <th>В</th>
                            <th>Н</th>
                            <th>П</th>
                            <th>Забито</th>
                            <th>Пропущено</th>
                            <th>Різниця</th>
                            <th>Очки</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table.map((team, i) => (
                            <tr key={i}>
                                <td>{team.name}</td>
                                <td>{team.played}</td>
                                <td>{team.wins}</td>
                                <td>{team.draws}</td>
                                <td>{team.losses}</td>
                                <td>{team.goalsFor}</td>
                                <td>{team.goalsAgainst}</td>
                                <td>{team.goalDiff}</td>
                                <td>{team.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}