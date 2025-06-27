
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Target, TrendingUp } from 'lucide-react';

const Teams = () => {
  const navigate = useNavigate();

  const teams = [
    {
      id: '1',
      name: 'Динамо Київ',
      logo: '🔵',
      city: 'Київ',
      founded: 1927,
      players: 25,
      tournaments: ['Прем\'єр-ліга України', 'Кубок України'],
      wins: 18,
      draws: 5,
      losses: 2,
      goals: 45,
      status: 'active'
    },
    {
      id: '2',
      name: 'Шахтар Донецьк',
      logo: '🧡',
      city: 'Донецьк',
      founded: 1936,
      players: 28,
      tournaments: ['Прем\'єр-ліга України'],
      wins: 16,
      draws: 6,
      losses: 3,
      goals: 42,
      status: 'active'
    },
    {
      id: '3',
      name: 'Металіст Харків',
      logo: '🔴',
      city: 'Харків',
      founded: 1925,
      players: 22,
      tournaments: ['Кубок України'],
      wins: 12,
      draws: 4,
      losses: 6,
      goals: 34,
      status: 'active'
    }
  ];

  const handleTeamClick = (teamId: string) => {
    navigate(`/teams/${teamId}`);
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Card 
                key={team.id} 
                className="football-card cursor-pointer group"
                onClick={() => handleTeamClick(team.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-4xl">{team.logo}</div>
                    <div>
                      <CardTitle className="text-xl group-hover:text-football-green transition-colors">
                        {team.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {team.city} • Засновано {team.founded}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {team.tournaments.map((tournament, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tournament}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-football-green" />
                      <span className="text-sm">{team.players} гравців</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                      Активна
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Trophy className="w-3 h-3 text-football-green" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Перемоги</span>
                      </div>
                      <div className="font-semibold">{team.wins}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Target className="w-3 h-3 text-football-green" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Голи</span>
                      </div>
                      <div className="font-semibold">{team.goals}</div>
                    </div>
                  </div>
                  
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                    {team.wins}П {team.draws}Н {team.losses}П
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

export default Teams;
