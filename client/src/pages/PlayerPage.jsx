import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import UploadAvatar from "../components/UploadAvatar"; // імпорт компонента

export default function PlayerPage() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPlayer();
  }, []);

  const fetchPlayer = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/players/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setPlayer(res.data.player);
      setStats(res.data.stats);
      setAvatarUrl(res.data.player.avatarUrl);
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

      {/* Відображення аватара або форми завантаження */}
      {avatarUrl ? (
        <img src={avatarUrl} alt="avatar" width="120" />
      ) : (
        <UploadAvatar 
          playerId={player._id} 
          onUploaded={(url) => setAvatarUrl(url)} 
        />
      )}

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
