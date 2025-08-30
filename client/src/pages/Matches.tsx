import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MatchCard from '@/components/MatchCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// спільний тип статусу
export type MatchStatus = 'upcoming' | 'live' | 'finished';

interface MatchFromServer {
  _id: string;
  homeTeam: { _id: string; name: string } | null;
  awayTeam: { _id: string; name: string } | null;
  tournament: { _id: string; name: string };
  date: string;
  status: 'upcoming' | 'active' | 'finished'; // від сервера
  score: { home: number; away: number };
  location?: string;
}

interface Match {
  id: string;
  homeTeam: { id: string; name: string; score: number };
  awayTeam: { id: string; name: string; score: number };
  status: MatchStatus; // використання спільного типу
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
      const res = await axios.get<MatchFromServer[]>('http://localhost:5000/api/public/matches');
      const transformedMatches = res.data.map((match): Match => ({
        id: match._id,
        homeTeam: {
          id: match.homeTeam?._id ?? "unknown",
          name: match.homeTeam?.name ?? "Unknown",
          score: match.score.home
        },
        awayTeam: {
          id: match.awayTeam?._id ?? "unknown",
          name: match.awayTeam?.name ?? "Unknown",
          score: match.score.away
        },
        // перетворюємо "active" з сервера у "live"
        status: match.status === 'active' ? 'live' : match.status,
        startTime: match.date,
        venue: match.location ?? '',
        tournament: match.tournament?.name ?? "Unknown Tournament",
        minute: match.status === 'active' ? calculateMatchMinute(match.date) : undefined
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
