import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PlayerRanking() {
  const [ranking, setRanking] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/players/ranking", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRanking(res.data);
    } catch (err) {
      console.error("Помилка завантаження рейтингу", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Рейтинг гравців</h2>
      {ranking.length === 0 ? (
        <p>Немає даних для відображення.</p>
      ) : (
        <table border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>#</th>
              <th>Ім’я</th>
              <th>Команда</th>
              <th>Матчів</th>
              <th>Перемог</th>
              <th>Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((player, index) => (
              <tr key={player._id}>
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{player.team?.name || "-"}</td>
                <td>{player.stats.games}</td>
                <td>{player.stats.wins}</td>
                <td>
                  {player.stats.games > 0
                    ? ((player.stats.wins / player.stats.games) * 100).toFixed(1) + "%"
                    : "0%"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}