import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CoachDashboard() {
    const [team, setTeam] = useState(null);
    const [playerEmail, setPlayerEmail] = useState("");
    const [user, setUser] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const u = localStorage.getItem("user");
        if (u) {
            setUser(JSON.parse(u));
        }
    }, []);

    useEffect(() => {
        if (token && user) {
            fetchTeam();
        }
    }, [user]);

    if (!user) return <div>Loading user...</div>;

    const fetchTeam = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/teams", {
                headers: getAuthHeaders()
            });

            const myTeam = res.data.find(t => t.coach._id === user._id);
            if (myTeam) setTeam(myTeam);
        } catch (err) {
            console.error("Error fetching team", err);
        }
    };

    const createTeam = async (e) => {
        e.preventDefault();
        const name = e.target.name.value;
        const logoUrl = e.target.logoUrl.value;
        const tournamentId = e.target.tournament.value;

        try {
            const res = await axios.post("http://localhost:5000/api/teams", {
                name,
                logoUrl,
                tournament: tournamentId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTeam(res.data);
        } catch (err) {
            alert("Помилка створення команди");
        }
    };

    const addPlayer = async (e) => {
        e.preventDefault();
        try {
            const userRes = await axios.get("http://localhost:5000/api/users/by-email", {
                params: { email: playerEmail },
                headers: { Authorization: `Bearer ${token}` }
            });

            const playerId = userRes.data._id;

            await axios.put(`http://localhost:5000/api/teams/${team._id}/add-player`, {
                playerId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchTeam();
            setPlayerEmail("");
        } catch (err) {
            alert("Не вдалося додати гравця");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Панель Тренера</h2>
            <h3>{user.name}</h3>

            {!team ? (
                <form onSubmit={createTeam}>
                    <h4>Створити свою команду</h4>
                    <input name="name" placeholder="Назва команди" required /><br /><br />
                    <input name="logoUrl" placeholder="Посилання на логотип" /><br /><br />
                    <input name="tournament" placeholder="ID турніру" required /><br /><br />
                    <button type="submit">Створити</button>
                </form>
            ) : (
                <div>
                    <h4>Ваша команда: {team.name}</h4>
                    <img src={team.logoUrl} alt="logo" width="100" />
                    <h5>Гравці:</h5>
                    <ul>
                        {team.players.map(p => (
                            <li key={p._id}>{p.name} ({p.email})</li>
                        ))}
                    </ul>

                    <form onSubmit={addPlayer}>
                        <h5>Додати гравця за email:</h5>
                        <input
                            value={playerEmail}
                            onChange={e => setPlayerEmail(e.target.value)}
                            placeholder="Email гравця"
                            required
                        />
                        <button type="submit">Додати</button>
                    </form>
                </div>
            )}
        </div>
    );
}