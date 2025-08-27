import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface User {
  _id: string;
  name: string;
  role: string;
  photo?: string | null;
  birthDate?: string | null; // ISO-рядок з бекенду
  team?: {
    _id: string;
    name: string;
  } | null;
}

const Participants = () => {
  const [activeTab, setActiveTab] = useState('players');
  const [players, setPlayers] = useState<User[]>([]);
  const [coaches, setCoaches] = useState<User[]>([]);
  const [referees, setReferees] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllParticipants();
  }, []);

  const fetchAllParticipants = async () => {
    try {
      const [playersRes, coachesRes, refereesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/public/players'),
        axios.get('http://localhost:5000/api/public/coaches'),
        axios.get('http://localhost:5000/api/public/referees'),
      ]);

      setPlayers(playersRes.data);
      setCoaches(coachesRes.data);
      setReferees(refereesRes.data);
    } catch (err) {
      console.error('Error fetching participants:', err);
    }
  };

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

            {/* Гравці */}
            <TabsContent value="players" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {players.map((player) => (
                  <Card
                    key={player._id}
                    className="football-card cursor-pointer group"
                    onClick={() => handleParticipantClick('players', player._id)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        {player.photo ? (
                          <img
                            src={`http://localhost:5000${player.photo}`}
                            alt={player.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="text-4xl">⚽</div>
                        )}
                        <div>
                          <CardTitle className="text-lg group-hover:text-football-green transition-colors">
                            {player.name}
                          </CardTitle>
                          {/* <p className="text-sm text-gray-600 dark:text-gray-400">
                            Роль: {player.role}
                          </p> */}
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Дата народження:{" "}
                            {player.birthDate
                              ? new Date(player.birthDate).toLocaleDateString("uk-UA")
                              : "—"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Команда: {player.team ? player.team.name : "Немає"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Гравець</Badge>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Тренери */}
            <TabsContent value="coaches" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {coaches.map((coach) => (
                  <Card
                    key={coach._id}
                    className="football-card cursor-pointer group"
                    onClick={() => handleParticipantClick('coaches', coach._id)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        {coach.photo ? (
                          <img
                            src={`http://localhost:5000${coach.photo}`}
                            alt={coach.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="text-4xl">👨‍💼</div>
                        )}
                        <div>
                          <CardTitle className="text-lg group-hover:text-football-green transition-colors">
                            {coach.name}
                          </CardTitle>
                          {/* <p className="text-sm text-gray-600 dark:text-gray-400">
                            Роль: {coach.role}
                          </p> */}
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Дата народження:{" "}
                            {coach.birthDate
                              ? new Date(coach.birthDate).toLocaleDateString("uk-UA")
                              : "—"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Команда: {coach.team ? coach.team.name : "Немає"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Тренер</Badge>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Рефері */}
            <TabsContent value="referees" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {referees.map((referee) => (
                  <Card
                    key={referee._id}
                    className="football-card cursor-pointer group"
                    onClick={() => handleParticipantClick('referees', referee._id)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        {referee.photo ? (
                          <img
                            src={`http://localhost:5000${referee.photo}`}
                            alt={referee.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="text-4xl">👨‍⚖️</div>
                        )}
                        <div>
                          <CardTitle className="text-lg group-hover:text-football-green transition-colors">
                            {referee.name}
                          </CardTitle>
                          {/* <p className="text-sm text-gray-600 dark:text-gray-400">
                            Роль: {referee.role}
                          </p> */}
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Дата народження:{" "}
                            {referee.birthDate
                              ? new Date(referee.birthDate).toLocaleDateString("uk-UA")
                              : "—"}
                          </p>
                          {/* <p className="text-sm text-gray-600 dark:text-gray-400">
                            Команда: {referee.team ? referee.team.name : "Немає"}
                          </p> */}
                        </div>
                      </div>
                      <Badge variant="secondary">Рефері</Badge>
                    </CardHeader>
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
