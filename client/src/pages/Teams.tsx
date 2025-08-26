import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface Team {
  _id: string;
  name: string;
  tournament: { name: string };
  players: string[];
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/public/teams');
      setTeams(res.data);
    } catch (err) {
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Команди
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Всі команди зареєстровані в системі
            </p>
          </div>

          {loading ? (
            <p className="text-center">Завантаження...</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <Card
                  key={team._id}
                  className="football-card cursor-pointer group"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-4xl">⚽</div>
                      <div>
                        <CardTitle className="text-xl group-hover:text-football-green transition-colors">
                          {team.name}
                        </CardTitle>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {team.tournament?.name || 'Без турніру'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-football-green" />
                        <span className="text-sm">{team.players.length} гравців</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        Активна
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Teams;
