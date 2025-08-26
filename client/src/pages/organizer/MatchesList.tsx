import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Match {
    _id: string;
    teamA: { _id: string; name: string };
    teamB: { _id: string; name: string };
    date: string;
    location?: string;
    status: 'scheduled' | 'live' | 'finished';
    score: { teamA: number | null; teamB: number | null };
}

export default function MatchesList() {
    const { token } = useAuth();
    const { id: tournamentId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [matches, setMatches] = useState<Match[]>([]);
    const [error, setError] = useState('');

    const api = axios.create({
        baseURL: 'http://localhost:5000/api/organizer',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        if (!tournamentId) return;
        api
            .get<Match[]>(`/tournaments/${tournamentId}/matches`)
            .then(res => setMatches(res.data))
            .catch(err => {
                console.error(err);
                setError('Не вдалося завантажити матчі');
            });
    }, [tournamentId]);

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Матчі турніру</h1>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    ← Назад
                </Button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {matches.length === 0 ? (
                <p>Матчів поки немає. Згенеруйте сітку або додайте команди.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map(m => (
                        <Card key={m._id} className="hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {m.teamA.name} — {m.teamB.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    <strong>Дата:</strong>{' '}
                                    {new Date(m.date).toLocaleString()}
                                </p>
                                {m.location && (
                                    <p><strong>Локація:</strong> {m.location}</p>
                                )}
                                <p>
                                    <strong>Статус:</strong> {m.status}
                                </p>
                                {m.score.teamA != null && m.score.teamB != null ? (
                                    <p>
                                        <strong>Рахунок:</strong> {m.score.teamA} : {m.score.teamB}
                                    </p>
                                ) : (
                                    <p><em>Рахунок не встановлено</em></p>
                                )}
                                <div className="mt-4 flex space-x-2">
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            navigate(`/organizer/tournaments/${tournamentId}/matches/${m._id}/edit`)
                                        }
                                    >
                                        Редагувати
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Кнопка для перегляду таблиці */}
            <div className="mt-8">
                <Button
                    variant="outline"
                    onClick={() => navigate(`/organizer/tournaments/${tournamentId}/standings`)}
                >
                    Переглянути турнірну таблицю
                </Button>
            </div>
        </div>
    );
}
