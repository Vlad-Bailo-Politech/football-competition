import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [tournaments, setTournaments] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const u = localStorage.getItem("user");
        if (!token || !u) return;

        setUser(JSON.parse(u));
        axios.get("http://localhost:5000/api/tournaments", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setTournaments(res.data))
            .catch(err => console.error(err));
    }, []);

    if (!user) return <div>Not logged in</div>;

    return (
        <div style={{ padding: 20 }}>
            <h2>Welcome, {user.name}</h2>
            <h3>Role: {user.role}</h3>

            <h4>Your Tournaments:</h4>
            <ul>
                {tournaments.map(t => (
                    <li key={t._id}>{t.name} ({t.location})</li>
                ))}
            </ul>
        </div>
    );
}