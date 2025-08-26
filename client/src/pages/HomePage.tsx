import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MatchCard from '@/components/MatchCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, Calendar, TrendingUp, ArrowRight } from 'lucide-react';

interface ServerMatch {
  _id: string;
  teamA: { _id: string; name: string };
  teamB: { _id: string; name: string };
  date: string;
  location?: string;
  status: 'scheduled' | 'live' | 'finished';
  score: { teamA: number | null; teamB: number | null };
  tournamentName: string;
}

interface MatchCardFormat {
  id: string;
  homeTeam: { id: string; name: string; score?: number };
  awayTeam: { id: string; name: string; score?: number };
  startTime: string;
  venue: string;
  tournament: string;
  status: 'upcoming' | 'live' | 'finished';
  minute?: number;
}

interface Stats {
  tournamentCount: number;
  teamCount: number;
  matchCount: number;
  viewCount: number;
}

const HomePage = () => {
  const [matches, setMatches] = useState<MatchCardFormat[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMatches = await axios.get<ServerMatch[]>('http://localhost:5000/api/public/matches-of-the-day');
        const resStats = await axios.get<Stats>('http://localhost:5000/api/public/stats');

        const transformedMatches: MatchCardFormat[] = resMatches.data.map((match) => ({
          id: match._id,
          homeTeam: { id: match.teamA._id, name: match.teamA.name, score: match.score.teamA ?? undefined },
          awayTeam: { id: match.teamB._id, name: match.teamB.name, score: match.score.teamB ?? undefined },
          startTime: match.date,
          venue: match.location || 'Не вказано',
          tournament: match.tournamentName || 'Турнір',
          status: match.status === 'scheduled' ? 'upcoming' : match.status,
          minute: match.status === 'live' ? calculateMatchMinute(match.date) : undefined
        }));

        setMatches(transformedMatches);
        setStats(resStats.data);
      } catch (err) {
        console.error('Error loading data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateMatchMinute = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / 60000);
    return diffMinutes > 0 ? diffMinutes : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-football-gradient text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Футбольні змагання
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                Професійна система управління турнірами
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/tournaments">
                  <Button size="lg" variant="secondary" className="bg-white text-football-green hover:bg-gray-100">
                    <Trophy className="w-5 h-5 mr-2" />
                    Переглянути турніри
                  </Button>
                </Link>
                <Link to="/contacts">
                  <Button size="lg" variant="secondary" className="bg-white text-football-green hover:bg-gray-100">
                    <Users className="w-5 h-5 mr-2" />
                    Зареєструвати команду
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            {stats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-football-green" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tournamentCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Активних турнірів</div>
                  </CardContent>
                </Card>

                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <Users className="w-8 h-8 mx-auto mb-2 text-football-green" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.teamCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Зареєстрованих команд</div>
                  </CardContent>
                </Card>

                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-football-green" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.matchCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Матчів цього місяця</div>
                  </CardContent>
                </Card>

                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-football-green" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.viewCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Переглядів трансляцій</div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-center">Завантаження статистики...</p>
            )}
          </div>
        </section>

        {/* Featured Matches */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Матчі дня
              </h2>
              <Link to="/matches">
                <Button variant="outline" className="flex items-center">
                  Всі матчі
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <p>Завантаження матчів...</p>
              ) : matches.length > 0 ? (
                matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onClick={() => console.log('Navigate to match:', match.id)}
                  />
                ))
              ) : (
                <p>Матчів на сьогодні немає.</p>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
