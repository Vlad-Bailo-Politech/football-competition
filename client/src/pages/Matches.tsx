import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MatchCard from '@/components/MatchCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MatchFromServer {
  _id: string;
  teamA: { _id: string; name: string };
  teamB: { _id: string; name: string };
  tournament: { _id: string; name: string };
  date: string;
  status: 'scheduled' | 'live' | 'finished';
  score: { teamA: number | null; teamB: number | null };
}

interface Match {
  id: string;
  homeTeam: { id: string; name: string; score: number | null };
  awayTeam: { id: string; name: string; score: number | null };
  status: 'live' | 'finished' | 'upcoming';
  startTime: string;
  venue: string;
  tournament: string;
  minute?: number;
}

const Matches = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await axios.get<MatchFromServer[]>('http://localhost:5000/api/public/all-matches');
      const transformedMatches = res.data.map((match): Match => ({
        id: match._id,
        homeTeam: { id: match.teamA._id, name: match.teamA.name, score: match.score.teamA },
        awayTeam: { id: match.teamB._id, name: match.teamB.name, score: match.score.teamB },
        status: match.status === 'scheduled' ? 'upcoming' : match.status as 'live' | 'finished' | 'upcoming',
        startTime: match.date,
        venue: '', // Можеш змінити, якщо буде поле
        tournament: match.tournament.name,
        minute: match.status === 'live' ? calculateMatchMinute(match.date) : undefined
      }));

      setMatches(transformedMatches);
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchMinute = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);
    return diffMinutes > 0 ? diffMinutes : 0;
  };

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
              {loading ? (
                <p className="text-center">Завантаження...</p>
              ) : (
                <>
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
                </>
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
