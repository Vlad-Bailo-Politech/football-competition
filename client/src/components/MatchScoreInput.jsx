import React, { useState } from "react";
import axios from "axios";

export default function MatchScoreInput({ match, onUpdated }) {
    const [scoreA, setScoreA] = useState(match.scoreA ?? "");
    const [scoreB, setScoreB] = useState(match.scoreB ?? "");
    const token = localStorage.getItem("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/matches/${match._id}/score`, {
                scoreA,
                scoreB
            }, {
                headers: getAuthHeaders()
            });
            alert("Результат оновлено");
            if (onUpdated) onUpdated();
        } catch (err) {
            alert("Помилка оновлення рахунку");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
            <input
                type="number"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                placeholder="Голи команди A"
                required
                min={0}
            />
            {" : "}
            <input
                type="number"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                placeholder="Голи команди B"
                required
                min={0}
            />
            <button type="submit">Зберегти</button>
        </form>
    );
}