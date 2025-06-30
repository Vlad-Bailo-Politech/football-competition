// src/pages/organizer/OrganizerDashboard.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface Tournament {
  _id: string;
  name: string;
  gender: 'male' | 'female';
  season: string;
  location: string;
  startDate: string;
  groupStage: boolean;
  groupLegs: number;
  playoff: boolean;
  teams: { _id: string; name: string }[];
}

export default function OrganizerDashboard() {
  const { token } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/organizer',
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    api
      .get<Tournament[]>('/tournaments')
      .then(res => setTournaments(res.data))
      .catch(() => setTournaments([]));
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Мої турніри</h1>
        <Button onClick={() => navigate('/organizer/tournaments/new')}>
          Створити новий
        </Button>
      </div>

      {tournaments.length === 0 ? (
        <p>У вас поки немає жодного турніру.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map(t => (
            <Card key={t._id} className="hover:shadow-lg">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>{t.name}</CardTitle>
                <Badge variant="outline" className="capitalize">
                  {t.gender === 'male' ? 'Чоловіча' : 'Жіноча'}
                </Badge>
              </CardHeader>
              <CardContent>
                <p><strong>Сезон:</strong> {t.season}</p>
                <p><strong>Локація:</strong> {t.location}</p>
                <p><strong>Початок:</strong>{' '}
                  {new Date(t.startDate).toLocaleDateString()}
                </p>
                <p className="mt-2">
                  <strong>Команд:</strong> {t.teams.length}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(`/organizer/tournaments/${t._id}`)
                    }
                  >
                    Редагувати
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(`/organizer/tournaments/${t._id}/setup`)
                    }
                  >
                    Налаштування
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(`/organizer/tournaments/${t._id}/matches`)
                    }
                  >
                    Матчі
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
