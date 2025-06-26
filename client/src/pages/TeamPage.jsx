import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import UploadTeamLogo from "../components/UploadTeamLogo";

export default function TeamPage() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/teams/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setTeam(res.data);
      setLogoUrl(res.data.logoUrl);
    } catch (err) {
      console.error("Помилка завантаження команди", err);
    }
  };

  if (!team) {
    return <div style={{ padding: 20 }}>Завантаження...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>{team.name}</h2>

      {/* Підвантаження логотипу або форма завантаження */}
      {logoUrl ? (
        <img src={logoUrl} alt="team logo" width="120" />
      ) : (
        <UploadTeamLogo
          teamId={team._id}
          onUploaded={(url) => setLogoUrl(url)}
        />
      )}

      <p><strong>Тренер:</strong> {team.coach?.name} ({team.coach?.email})</p>
      <p><strong>Турнір:</strong> {team.tournament?.name}</p>

      <h4>Гравці:</h4>
      {team.players.length === 0 ? (
        <p>Ще немає гравців</p>
      ) : (
        <ul>
          {team.players.map(player => (
            <li key={player._id}>
              <Link to={`/players/${player._id}`}>{player.name}</Link> ({player.email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
