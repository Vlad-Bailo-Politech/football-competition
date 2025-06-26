import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";

export default function TeamPage() {
    const { id } = useParams(); // team ID from URL
    const [team, setTeam] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/teams/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeam(res.data);
        } catch (err) {
            console.error("Помилка завантаження команди", err);
        }
    };

    if (!team) return <div style={{ padding: 20 }}>Завантаження...</div>;

    return (
        <div style={{ padding: 20 }}>
            <h2>{team.name}</h2>
            {team.logoUrl && <img src={team.logoUrl} alt="logo" width="120" />}
            <p><strong>Тренер:</strong> {team.coach?.name}</p>
            <p><strong>Турнір:</strong> {team.tournament?.name}</p>

            <h4>Склад команди:</h4>
            {team.players.length === 0 ? (
                <p>Ще немає гравців</p>
            ) : (
                <ul>
                    {team.players.map(player => (
                        <li key={player._id}>
                            <Link to={`/players/${player._id}`}>{player.name}</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}