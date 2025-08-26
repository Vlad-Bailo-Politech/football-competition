import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Standing {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export default function StandingsTable() {
  const { token } = useAuth();
  const { id: tournamentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [standings, setStandings] = useState<Standing[]>([]);
  const [error, setError] = useState('');

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/organizer',
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    if (!tournamentId) return;
    api.get<Standing[]>(`/tournaments/${tournamentId}/standings`)
      .then(res => setStandings(res.data))
      .catch(err => {
        console.error(err);
        setError('Не вдалося завантажити турнірну таблицю');
      });
  }, [tournamentId]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Турнірна таблиця</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Назад
        </Button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {standings.length === 0 ? (
        <p>Турнірна таблиця поки порожня.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">№</th>
              <th className="border p-2 text-left">Клуб</th>
              <th className="border p-2">І</th>
              <th className="border p-2">В</th>
              <th className="border p-2">Н</th>
              <th className="border p-2">П</th>
              <th className="border p-2">ЗМ</th>
              <th className="border p-2">ПМ</th>
              <th className="border p-2">РМ</th>
              <th className="border p-2">О</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => (
              <tr key={team.teamId}>
                <td className="border p-2 text-center">{index + 1}</td>
                <td className="border p-2">{team.teamName}</td>
                <td className="border p-2 text-center">{team.played}</td>
                <td className="border p-2 text-center">{team.wins}</td>
                <td className="border p-2 text-center">{team.draws}</td>
                <td className="border p-2 text-center">{team.losses}</td>
                <td className="border p-2 text-center">{team.goalsFor}</td>
                <td className="border p-2 text-center">{team.goalsAgainst}</td>
                <td className="border p-2 text-center">{team.goalDiff}</td>
                <td className="border p-2 text-center font-bold">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}