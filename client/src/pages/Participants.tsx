
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Star, Award, Clock } from 'lucide-react';

const Participants = () => {
  const [activeTab, setActiveTab] = useState('players');
  const navigate = useNavigate();

  const players = [
    {
      id: '1',
      name: 'Андрій Шевченко',
      position: 'Нападник',
      team: 'Динамо Київ',
      age: 28,
      goals: 15,
      matches: 22,
      rating: 8.5,
      avatar: '⚽'
    },
    {
      id: '2',
      name: 'Віталій Миколенко',
      position: 'Захисник',
      team: 'Шахтар Донецьк',
      age: 25,
      goals: 2,
      matches: 20,
      rating: 7.8,
      avatar: '🛡️'
    }
  ];

  const coaches = [
    {
      id: '1',
      name: 'Мирон Маркевич',
      team: 'Динамо Київ',
      experience: 15,
      achievements: ['Чемпіон України', 'Кубок України'],
      matches: 45,
      wins: 30,
      avatar: '👨‍💼'
    }
  ];

  const referees = [
    {
      id: '1',
      name: 'Віктор Шендрик',
      category: 'FIFA',
      experience: 12,
      matches: 150,
      tournaments: ['Прем\'єр-ліга', 'Кубок України'],
      avatar: '👨‍⚖️'
    }
  ];

  const handleParticipantClick = (type: string, id: string) => {
    navigate(`/${type}/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Учасники
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Гравці, тренери та рефері зареєстровані в системі
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-1/2">
              <TabsTrigger value="players">Гравці</TabsTrigger>
              <TabsTrigger value="coaches">Тренери</TabsTrigger>
              <TabsTrigger value="referees">Рефері</TabsTrigger>
            </TabsList>

            <TabsContent value="players" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {players.map((player) => (
                  <Card 
                    key={player.id} 
                    className="football-card cursor-pointer group"
                    onClick={() => handleParticipantClick('players', player.id)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-4xl">{player.avatar}</div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-football-green transition-colors">
                            {player.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {player.position} • {player.age} років
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{player.team}</Badge>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="font-semibold text-lg">{player.goals}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Голи</div>
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{player.matches}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Матчі</div>
                        </div>
                        <div>
                          <div className="font-semibold text-lg text-football-green">{player.rating}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Рейтинг</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="coaches" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {coaches.map((coach) => (
                  <Card 
                    key={coach.id} 
                    className="football-card cursor-pointer group"
                    onClick={() => handleParticipantClick('coaches', coach.id)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-4xl">{coach.avatar}</div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-football-green transition-colors">
                            {coach.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Досвід: {coach.experience} років
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{coach.team}</Badge>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="font-semibold text-lg">{coach.matches}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Матчі</div>
                        </div>
                        <div>
                          <div className="font-semibold text-lg text-football-green">{coach.wins}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Перемоги</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">Досягнення:</div>
                        <div className="flex flex-wrap gap-1">
                          {coach.achievements.map((achievement, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {achievement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="referees" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {referees.map((referee) => (
                  <Card 
                    key={referee.id} 
                    className="football-card cursor-pointer group"
                    onClick={() => handleParticipantClick('referees', referee.id)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-4xl">{referee.avatar}</div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-football-green transition-colors">
                            {referee.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Категорія: {referee.category}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="font-semibold text-lg">{referee.experience}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Років досвіду</div>
                        </div>
                        <div>
                          <div className="font-semibold text-lg text-football-green">{referee.matches}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Матчі</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">Турніри:</div>
                        <div className="flex flex-wrap gap-1">
                          {referee.tournaments.map((tournament, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tournament}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Participants;
