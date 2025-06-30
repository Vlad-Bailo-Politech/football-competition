import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Team {
  _id: string;
  name: string;
}

interface Tournament {
  _id: string;
  teams: Team[];
}

export default function SetupTournament() {
  const { token } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState('');

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/organizer',
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    if (!id) return;
    api
      .get<Tournament>(`/tournaments/${id}`)
      .then(res => setTeams(res.data.teams || []))
      .catch(() => setTeams([]));
  }, [id]);

  const addTeam = async () => {
    if (!teamName.trim() || !id) return;
    setError('');
    try {
      // створюємо нову команду на сервері
      const resTeam = await api.post('/teams', { name: teamName, tournament: id });
      // додаємо команду в турнір
      await api.put(`/tournaments/${id}/add-team`, { teamId: resTeam.data._id });
      setTeams(t => [...t, resTeam.data]);
      setTeamName('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Помилка додавання');
    }
  };

  const generateBrackets = async () => {
    if (!id) return;
    try {
      await api.post(`/tournaments/${id}/generate`);
      navigate(`/organizer/tournaments/${id}/matches`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Помилка генерації');
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-xl">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Налаштування турніру</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>← Назад</Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Назва команди</Label>
          <div className="flex space-x-2">
            <Input
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Введіть назву"
            />
            <Button onClick={addTeam}>Додати</Button>
          </div>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          {teams.map(t => (
            <Card key={t._id} className="p-2">
              <CardHeader><CardTitle>{t.name}</CardTitle></CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Button onClick={generateBrackets} className="w-full">
            Генерувати турнірну сітку
          </Button>
        </div>
      </div>
    </div>
  );
}
