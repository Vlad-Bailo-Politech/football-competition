import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface User {
    _id: string;
    name: string;
}

interface Team {
    _id: string;
    name: string;
    coach: string;
    players: string[];
    tournament: string;
}

export default function EditTeam() {
    const { token } = useAuth();
    const { teamId } = useParams<{ teamId: string }>();
    const navigate = useNavigate();

    const [team, setTeam] = useState<Team | null>(null);
    const [coaches, setCoaches] = useState<User[]>([]);
    const [players, setPlayers] = useState<User[]>([]);
    const [playerIds, setPlayerIds] = useState<string[]>([]);
    const [error, setError] = useState('');

    const api = axios.create({
        baseURL: 'http://localhost:5000/api/organizer',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        if (!teamId) return;

        api.get(`/teams/${teamId}`)
            .then(res => {
                setTeam(res.data);
                setPlayerIds(res.data.players);
            })
            .catch(() => setError('Не вдалося завантажити команду'));
    }, [teamId]);

    useEffect(() => {
        if (team) {
            api.get<User[]>(`/tournaments/${team.tournament}/available-coaches`)
                .then(res => setCoaches(res.data.concat({ _id: team.coach, name: 'Поточний тренер' })));

            api.get<User[]>(`/tournaments/${team.tournament}/available-players`)
                .then(res => setPlayers(res.data.concat(team.players.map(id => ({ _id: id, name: 'Гравець (поточний)' })))));
        }
    }, [team]);

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        if (team) setTeam({ ...team, [name]: value });
    };

    const togglePlayer = (playerId: string) => {
        if (playerIds.includes(playerId)) {
            setPlayerIds(ids => ids.filter(id => id !== playerId));
        } else {
            setPlayerIds(ids => [...ids, playerId]);
        }
    };

    const updateTeam = async () => {
        if (!team) return;

        try {
            await api.put(`/teams/${teamId}`, {
                name: team.name,
                coach: team.coach,
                players: playerIds
            });

            navigate(-1);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Помилка оновлення команди');
        }
    };

    if (!team) return <p>Завантаження...</p>;

    return (
        <div className="container mx-auto py-8 max-w-xl">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Редагування команди</h1>
                <Button variant="outline" onClick={() => navigate(-1)}>← Назад</Button>
            </div>

            <div className="space-y-4">
                <div>
                    <Label>Назва команди</Label>
                    <Input name="name" value={team.name} onChange={handleChange} />
                </div>

                <div>
                    <Label>Тренер</Label>
                    <Select value={team.coach} onValueChange={value => setTeam({ ...team, coach: value })}>
                        <SelectTrigger>
                            <SelectValue placeholder="Виберіть тренера" />
                        </SelectTrigger>
                        <SelectContent>
                            {coaches.map(coach => (
                                <SelectItem key={coach._id} value={coach._id}>
                                    {coach.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>Гравці</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {players.map(player => (
                            <label key={player._id} className="flex items-center space-x-2">
                                <Checkbox
                                    checked={playerIds.includes(player._id)}
                                    onCheckedChange={() => togglePlayer(player._id)}
                                />
                                <span>{player.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {error && <p className="text-red-500">{error}</p>}

                <Button onClick={updateTeam} className="w-full">Зберегти зміни</Button>
            </div>
        </div>
    );
}
