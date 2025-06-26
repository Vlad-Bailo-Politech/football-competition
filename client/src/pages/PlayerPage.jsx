import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function PlayerPage() {
    const { id } = useParams(); // player ID
    const [player, setPlayer] = useState(null);
    const [stats, setStats] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchPlayer();
    }, []);

    const fetchPlayer = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/players/${id}`, {
                headers: getAuthHeaders()
            });
            setPlayer(res.data.player);
            setStats(res.data.stats);
        } catch (err) {
            console.error("Помилка завантаження гравця", err);
        }
    };

    if (!player) return <div style={{ padding: 20 }}>Завантаження...</div>;

    return (
        <div style={{ padding: 20 }}>
            <h2>{player.name}</h2>
            <p><strong>Email:</strong> {player.email}</p>
            <p><strong>Команда:</strong> {player.team?.name}</p>
            <p><strong>Турнір:</strong> {player.team?.tournament?.name}</p>

            <h3>Статистика:</h3>
            {stats ? (
                <ul>
                    <li>Матчів: {stats.games}</li>
                    <li>Перемог: {stats.wins}</li>
                    <li>Нічиїх: {stats.draws}</li>
                    <li>Поразок: {stats.losses}</li>
                </ul>
            ) : (
                <p>Немає статистики</p>
            )}
        </div>
    );
}