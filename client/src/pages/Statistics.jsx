import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeaders } from "../utils/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Statistics() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [data, setData] = useState([]);
  const tokenHeaders = getAuthHeaders();

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) fetchStandings(selectedTournament);
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tournaments", { headers: tokenHeaders });
      setTournaments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStandings = async (tournamentId) => {
    try {
      // reuse standings logic API or compute here
      const resMatches = await axios.get("http://localhost:5000/api/matches", { headers: tokenHeaders });
      const matches = resMatches.data.filter(m => m.tournament._id === tournamentId && m.scoreA != null && m.scoreB != null);

      const stats = {};
      matches.forEach(match => {
        const { teamA, teamB, scoreA, scoreB } = match;
        if (!stats[teamA._id]) stats[teamA._id] = { name: teamA.name, points: 0 };
        if (!stats[teamB._id]) stats[teamB._id] = { name: teamB.name, points: 0 };
        if (scoreA > scoreB) stats[teamA._id].points += 3;
        else if (scoreA < scoreB) stats[teamB._id].points += 3;
        else { stats[teamA._id].points += 1; stats[teamB._id].points += 1; }
      });

      const chartData = Object.values(stats).map(team => ({ name: team.name, Points: team.points }));
      setData(chartData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Статистика турніру</h2>
      <select value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)}>
        <option value="">Оберіть турнір</option>
        {tournaments.map(t => (
          <option key={t._id} value={t._id}>{t.name}</option>
        ))}
      </select>

      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Points" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}