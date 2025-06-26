import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Matches() {
    const [matches, setMatches] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/matches", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMatches(res.data);
        } catch (err) {
            console.error("Помилка завантаження матчів", err);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Список матчів</h2>
            {matches.length === 0 ? (
                <p>Матчів ще немає.</p>
            ) : (
                <ul>
                    {matches.map((match) => (
                        <li key={match._id} style={{ marginBottom: 10 }}>
                            <strong>{match.teamA?.name || "???"}</strong> vs <strong>{match.teamB?.name || "???"}</strong>
                            <br />
                            🏟 {match.location} | 🕓 {new Date(match.date).toLocaleString()}
                            <br />
                            {match.scoreA !== undefined && match.scoreB !== undefined ? (
                                <>Рахунок: {match.scoreA} : {match.scoreB}</>
                            ) : (
                                <em>Рахунок ще не встановлено</em>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}