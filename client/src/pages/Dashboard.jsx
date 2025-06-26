import React, { useEffect, useState } from "react";
import axios from "axios";
import CreateTournament from "../components/CreateTournament";
import CreateMatch from "../components/CreateMatch";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [tournaments, setTournaments] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const u = localStorage.getItem("user");
        if (!token || !u) return;

        setUser(JSON.parse(u));
        fetchTournaments(token);
    }, []);

    const fetchTournaments = async (token) => {
        try {
            const res = await axios.get("http://localhost:5000/api/tournaments", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTournaments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreated = (newTournament) => {
        setTournaments(prev => [...prev, newTournament]);
    };

    if (!user) return <div>Not logged in</div>;

    return (
        <div style={{ padding: 20 }}>
            <h2>Привіт, {user.name}</h2>
            <h3>Роль: {user.role}</h3>

            {user.role === "organizer" && (
                <CreateTournament onCreated={handleCreated} />
            )}

            {user.role === "organizer" && (
                <CreateMatch />
            )}

            <h4 style={{ marginTop: 30 }}>Список турнірів:</h4>
            <ul>
                {tournaments.map(t => (
                    <li key={t._id}>{t.name} ({t.location})</li>
                ))}
            </ul>
        </div>
    );
}
