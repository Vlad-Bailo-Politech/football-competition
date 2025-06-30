
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MatchCard from '@/components/MatchCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Matches = () => {
  const [activeTab, setActiveTab] = useState('all');

  const matches = [
    {
      id: '1',
      homeTeam: { id: '1', name: 'Динамо Київ', score: 3 },
      awayTeam: { id: '2', name: 'Шахтар Донецьк', score: 1 },
      status: 'finished' as const,
      startTime: '2024-01-14T19:00:00',
      venue: 'НСК Олімпійський',
      tournament: 'Прем\'єр-ліга України',
      minute: 90
    },
    {
      id: '2',
      homeTeam: { id: '3', name: 'Металіст Харків', score: 2 },
      awayTeam: { id: '4', name: 'Зоря Луганськ', score: 2 },
      status: 'upcoming' as const,
      startTime: '2024-01-15T21:00:00',
      venue: 'Металіст Арена',
      tournament: 'Кубок України',
    },
    {
      id: '3',
      homeTeam: { id: '5', name: 'Ворскла Полтава' },
      awayTeam: { id: '6', name: 'Олімпік Донецьк' },
      status: 'upcoming' as const,
      startTime: '2024-01-16T17:00:00',
      venue: 'Ворскла Арена',
      tournament: 'Прем\'єр-ліга України'
    },
    {
      id: '4',
      homeTeam: { id: '7', name: 'Дніпро-1' },
      awayTeam: { id: '8', name: 'Александрія' },
      status: 'upcoming' as const,
      startTime: '2024-01-17T19:30:00',
      venue: 'Дніпро Арена',
      tournament: 'Прем\'єр-ліга України'
    }
  ];

  const filteredMatches = matches.filter(match => {
    if (activeTab === 'all') return true;
    return match.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Матчі
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Всі матчі турнірів: зіграні, поточні та майбутні
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-1/2">
              <TabsTrigger value="all">Всі</TabsTrigger>
              <TabsTrigger value="live">В ефірі</TabsTrigger>
              <TabsTrigger value="finished">Зіграні</TabsTrigger>
              <TabsTrigger value="upcoming">Майбутні</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onClick={() => console.log('Navigate to match:', match.id)}
                  />
                ))}
              </div>

              {filteredMatches.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Немає матчів у цій категорії
                  </p>
                </div>
              )}
            </TabsContent>

          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Matches;
