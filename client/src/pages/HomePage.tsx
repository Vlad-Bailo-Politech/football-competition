
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MatchCard from '@/components/MatchCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trophy, Users, TrendingUp, ArrowRight, Clock } from 'lucide-react';

const HomePage = () => {
  const [language] = useState<'ua' | 'en'>('ua');

  // Mock data for demonstration
  const featuredMatches = [
    {
      id: '1',
      homeTeam: { id: '1', name: 'Динамо Київ', score: 2 },
      awayTeam: { id: '2', name: 'Шахтар Донецьк', score: 1 },
      status: 'finished' as const,
      startTime: '2024-01-15T19:00:00',
      venue: 'НСК Олімпійський',
      tournament: 'Прем\'єр-ліга України',
      minute: 90
    },
    {
      id: '2',
      homeTeam: { id: '3', name: 'Металіст Харків', score: 1 },
      awayTeam: { id: '4', name: 'Зоря Луганськ', score: 1 },
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
    }
  ];

  const news = [
    {
      id: '1',
      title: 'Старт нового сезону Прем\'єр-ліги України',
      excerpt: 'Сьогодні розпочинається новий сезон найвищого дивізіону українського футболу. 16 команд поборються за чемпіонський титул.',
      date: '2024-01-15',
      category: 'Новини ліги',
      image: '/placeholder.svg?height=200&width=400'
    },
    {
      id: '2',
      title: 'Трансферне вікно: найгучніші переходи',
      excerpt: 'Огляд найбільш резонансних трансферів зимового вікна. Які команди посилились найкраще?',
      date: '2024-01-14',
      category: 'Трансфери',
      image: '/placeholder.svg?height=200&width=400'
    },
    {
      id: '3',
      title: 'Збірна готується до відбіркових матчів',
      excerpt: 'Національна команда України розпочала підготовку до відбіркових матчів Євро-2024.',
      date: '2024-01-13',
      category: 'Збірна',
      image: '/placeholder.svg?height=200&width=400'
    }
  ];

  const stats = [
    { icon: Trophy, label: 'Активних турнірів', value: '12' },
    { icon: Users, label: 'Зареєстрованих команд', value: '148' },
    { icon: Calendar, label: 'Матчів цього місяця', value: '64' },
    { icon: TrendingUp, label: 'Переглядів трансляцій', value: '2.4M' }
  ];

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
                <Button size="lg" variant="secondary" className="bg-white text-football-green hover:bg-gray-100">
                  <Trophy className="w-5 h-5 mr-2" />
                  Переглянути турніри
                </Button>
                <Button size="lg" variant="secondary" className="bg-white text-football-green hover:bg-gray-100">
                  <Users className="w-5 h-5 mr-2" />
                  Зареєструвати команду
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6">
                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-football-green" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
              {featuredMatches.map((match) => (
                <MatchCard 
                  key={match.id} 
                  match={match}
                  onClick={() => console.log('Navigate to match:', match.id)}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
