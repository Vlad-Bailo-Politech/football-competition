import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Match {
    _id: string;
    teamA: { _id: string; name: string };
    teamB: { _id: string; name: string };
    date: string;
    status: 'scheduled' | 'live' | 'finished';
    score: { teamA: number | null; teamB: number | null };
}

export default function EditMatch() {
    const { token } = useAuth();
    const { tournamentId, matchId } = useParams<{ tournamentId: string; matchId: string }>();
    const navigate = useNavigate();

    const [match, setMatch] = useState<Match | null>(null);
    const [scoreA, setScoreA] = useState<number>(0);
    const [scoreB, setScoreB] = useState<number>(0);
    const [status, setStatus] = useState<'scheduled' | 'live' | 'finished'>('scheduled');
    const [error, setError] = useState('');

    const api = axios.create({
        baseURL: 'http://localhost:5000/api/organizer',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        api.get<Match>(`/matches/${matchId}`)
            .then(res => {
                const currentMatch = res.data;
                setMatch(currentMatch);
                setScoreA(currentMatch.score.teamA ?? 0);
                setScoreB(currentMatch.score.teamB ?? 0);
                setStatus(currentMatch.status);
            })
            .catch(() => setError('Не вдалося завантажити матч'));
    }, [tournamentId, matchId]);

    const updateMatch = async () => {
        try {
            await api.put(`/matches/${matchId}`, {
                score: { teamA: scoreA, teamB: scoreB },
                status
            });
            navigate(`/organizer/tournaments/${tournamentId}/matches`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Помилка оновлення матчу');
        }
    };

    if (!match) return <p>Завантаження...</p>;

    return (
        <div className="container mx-auto py-8 max-w-xl">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Редагування матчу</h1>
                <Button variant="outline" onClick={() => navigate(-1)}>← Назад</Button>
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-lg font-semibold">{match.teamA.name} — {match.teamB.name}</p>
                </div>

                <div className="flex space-x-4 items-center">
                    <div>
                        <Label>{match.teamA.name}</Label>
                        <Input type="number" value={scoreA} onChange={e => setScoreA(Number(e.target.value))} />
                    </div>

                    <span className="text-xl">:</span>

                    <div>
                        <Label>{match.teamB.name}</Label>
                        <Input type="number" value={scoreB} onChange={e => setScoreB(Number(e.target.value))} />
                    </div>
                </div>

                <div>
                    <Label>Статус матчу</Label>
                    <Select value={status} onValueChange={value => setStatus(value as any)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Виберіть статус" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="scheduled">Запланований</SelectItem>
                            <SelectItem value="live">Триває</SelectItem>
                            <SelectItem value="finished">Завершений</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {error && <p className="text-red-500">{error}</p>}

                <Button onClick={updateMatch} className="w-full">Зберегти зміни</Button>
            </div>
        </div>
    );
}