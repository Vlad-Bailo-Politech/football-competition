import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, MapPin } from 'lucide-react';
import axios from 'axios';

const Tournaments = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/public/tournaments');
        console.log(response.data);

        if (Array.isArray(response.data)) {
          setTournaments(response.data);
        } else {
          console.error('Отримані дані не є масивом', response.data);
          setTournaments([]);
        }
      } catch (error) {
        console.error('Помилка при завантаженні турнірів', error);
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const getStatusColor = (startDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    return start <= today ? 'bg-green-500' : 'bg-blue-500';
  };

  const getStatusText = (startDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    return start <= today ? 'Активний' : 'Очікується';
  };

  const handleTournamentClick = (tournamentId: string) => {
    navigate(`/tournaments/${tournamentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Турніри
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Переглядайте всі активні та майбутні футбольні змагання
            </p>
          </div>

          {loading ? (
            <p className="text-center">Завантаження турнірів...</p>
          ) : tournaments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tournaments.map((tournament) => (
                <Card
                  key={tournament._id}
                  className="football-card cursor-pointer group"
                  onClick={() => handleTournamentClick(tournament._id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl mb-2">🏆</div>
                      <Badge className={`${getStatusColor(tournament.startDate)} text-white`}>
                        {getStatusText(tournament.startDate)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-football-green transition-colors">
                      {tournament.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-football-green" />
                        <span className="text-sm">{tournament.teams?.length || 0} команд</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-football-green" />
                        <span className="text-sm">
                          {tournament.groupStage
                            ? `Груповий етап (${tournament.groupLegs || 1} коло)`
                            : tournament.format === 'group'
                            ? 'Груповий етап'
                            : 'Без групового етапу'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-football-green" />
                        <span className="text-sm">
                          Початок: {new Date(tournament.startDate).toLocaleDateString('uk-UA')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-football-green" />
                        <span className="text-sm">{tournament.location}</span>
                      </div>
                    </div>

                    {tournament.organizer && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Організатор: {tournament.organizer.name}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center">Наразі турнірів немає.</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tournaments;
