
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, MapPin } from 'lucide-react';

const Tournaments = () => {
  const navigate = useNavigate();

  const tournaments = [
    {
      id: '1',
      name: 'Прем\'єр-ліга України 2024',
      status: 'active',
      teams: 16,
      matches: 240,
      startDate: '2024-02-01',
      endDate: '2024-11-30',
      location: 'Україна',
      logo: '🏆'
    },
    {
      id: '2',
      name: 'Кубок України 2024',
      status: 'active',
      teams: 32,
      matches: 31,
      startDate: '2024-03-15',
      endDate: '2024-05-25',
      location: 'Україна',
      logo: '🏆'
    },
    {
      id: '3',
      name: 'Аматорська ліга Києва',
      status: 'upcoming',
      teams: 12,
      matches: 66,
      startDate: '2024-04-01',
      endDate: '2024-10-15',
      location: 'Київ',
      logo: '⚽'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'finished': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активний';
      case 'upcoming': return 'Очікується';
      case 'finished': return 'Завершено';
      default: return status;
    }
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => (
              <Card 
                key={tournament.id} 
                className="football-card cursor-pointer group"
                onClick={() => handleTournamentClick(tournament.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl mb-2">{tournament.logo}</div>
                    <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                      {getStatusText(tournament.status)}
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
                      <span className="text-sm">{tournament.teams} команд</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-football-green" />
                      <span className="text-sm">{tournament.matches} матчів</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-football-green" />
                      <span className="text-sm">
                        {new Date(tournament.startDate).toLocaleDateString('uk-UA')} - 
                        {new Date(tournament.endDate).toLocaleDateString('uk-UA')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-football-green" />
                      <span className="text-sm">{tournament.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tournaments;
