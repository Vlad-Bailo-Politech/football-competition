import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getAuthHeaders } from "../utils/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Standings() {
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [table, setTable] = useState([]);
  const tableRef = useRef(null);
  const tokenHeaders = getAuthHeaders();

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) fetchMatches(selectedTournament);
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tournaments", {
        headers: tokenHeaders
      });
      setTournaments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMatches = async (tournamentId) => {
    try {
      const res = await axios.get("http://localhost:5000/api/matches", {
        headers: tokenHeaders
      });
      const filtered = res.data.filter(m => m.tournament._id === tournamentId);
      setMatches(filtered);
      calculateTable(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateTable = (matches) => {
    const stats = {};
    for (let match of matches) {
      if (match.scoreA == null || match.scoreB == null) continue;
      const { teamA, teamB, scoreA, scoreB } = match;
      if (!stats[teamA._id]) stats[teamA._id] = initTeam(teamA.name);
      if (!stats[teamB._id]) stats[teamB._id] = initTeam(teamB.name);
      const a = stats[teamA._id];
      const b = stats[teamB._id];
      a.played++; b.played++;
      a.goalsFor += scoreA; a.goalsAgainst += scoreB;
      b.goalsFor += scoreB; b.goalsAgainst += scoreA;
      if (scoreA > scoreB) { a.wins++; a.points += 3; b.losses++; }
      else if (scoreA < scoreB) { b.wins++; b.points += 3; a.losses++; }
      else { a.draws++; b.draws++; a.points++; b.points++; }
    }
    const tableArr = Object.entries(stats).map(([id, team]) => ({ id, ...team, goalDiff: team.goalsFor - team.goalsAgainst }));
    tableArr.sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff);
    setTable(tableArr);
  };

  const initTeam = (name) => ({ name, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 });

  const exportPDF = async () => {
    if (!tableRef.current) return;
    const canvas = await html2canvas(tableRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = canvas.height * pdfWidth / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`standings_${selectedTournament}.pdf`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Турнірна таблиця</h2>
      <select value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)}>
        <option value="">Оберіть турнір</option>
        {tournaments.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
      </select>
      <button onClick={exportPDF} disabled={!table.length} style={{ marginLeft: 10 }}>
        Експорт у PDF
      </button>

      {table.length > 0 && (
        <div ref={tableRef} style={{ marginTop: 20 }}>
          <table border={1} cellPadding={8} style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Команда</th><th>Ігри</th><th>В</th><th>Н</th><th>П</th><th>Забито</th><th>Пропущено</th><th>Різниця</th><th>Очки</th>
              </tr>
            </thead>
            <tbody>
              {table.map((team, i) => (
                <tr key={i}>
                  <td>{team.name}</td><td>{team.played}</td><td>{team.wins}</td><td>{team.draws}</td><td>{team.losses}</td>
                  <td>{team.goalsFor}</td><td>{team.goalsAgainst}</td><td>{team.goalDiff}</td><td>{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}