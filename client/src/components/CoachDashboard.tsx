// src/pages/CoachDashboard.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Player {
  _id: string;
  name: string;
}

interface Team {
  _id: string;
  name: string;
  players: Player[];
}

const CoachDashboard = () => {
  const { token, user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [newPlayerId, setNewPlayerId] = useState('');
  const [message, setMessage] = useState('');

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/coach',
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchTeam = async () => {
    try {
      const res = await api.get(`/my-team`);
      setTeam(res.data);
    } catch (err) {
      console.error('Error fetching team:', err);
    }
  };

  const fetchAllPlayers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/public/players');
      setAllPlayers(res.data);
    } catch (err) {
      console.error('Error fetching players:', err);
    }
  };

  useEffect(() => {
    fetchTeam();
    fetchAllPlayers();
  }, []);

  const handleAddPlayer = async () => {
    if (!newPlayerId || !team) return;
    try {
      await api.put(`/teams/${team._id}/add-player`, { playerId: newPlayerId });
      setMessage('Гравця додано');
      fetchTeam();
      setNewPlayerId('');
    } catch (err) {
      console.error('Error adding player:', err);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!team) return;
    try {
      await api.put(`/teams/${team._id}/remove-player`, { playerId });
      setMessage('Гравця видалено');
      fetchTeam();
    } catch (err) {
      console.error('Error removing player:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Панель Тренера
          </h1>

          {team ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Моя команда: {team.name}</h2>

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Гравці команди</h3>
                  <ul className="space-y-2">
                    {team.players.map((player) => (
                      <li key={player._id} className="flex justify-between items-center border p-2 rounded">
                        <span>{player.name}</span>
                        <Button variant="destructive" size="sm" onClick={() => handleRemovePlayer(player._id)}>
                          Видалити
                        </Button>
                      </li>
                    ))}
                    {team.players.length === 0 && <p className="text-gray-500">Немає гравців у команді</p>}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Додати гравця</h3>
                  <div className="flex space-x-2 mb-4">
                    <select
                      value={newPlayerId}
                      onChange={(e) => setNewPlayerId(e.target.value)}
                      className="border p-2 rounded w-full"
                    >
                      <option value="">Оберіть гравця</option>
                      {allPlayers.map((player) => (
                        <option key={player._id} value={player._id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                    <Button onClick={handleAddPlayer} className="bg-football-green text-white">
                      Додати
                    </Button>
                  </div>
                </div>
              </div>

              {message && <p className="text-blue-600">{message}</p>}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Завантаження команди...</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default CoachDashboard;
