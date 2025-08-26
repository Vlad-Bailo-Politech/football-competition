import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Team {
    _id: string;
    name: string;
}

interface User {
    _id: string;
    name: string;
}

interface Tournament {
    _id: string;
    teams: Team[];
}

export default function SetupTournament() {
    const { token } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [teamName, setTeamName] = useState('');
    const [coachId, setCoachId] = useState('');
    const [playerIds, setPlayerIds] = useState<string[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [coaches, setCoaches] = useState<User[]>([]);
    const [players, setPlayers] = useState<User[]>([]);
    const [error, setError] = useState('');

    const api = axios.create({
        baseURL: 'http://localhost:5000/api/organizer',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        if (!id) return;

        // Завантаження турніру
        api.get<Tournament>(`/tournaments/${id}`)
            .then(res => setTeams(res.data.teams || []))
            .catch(() => setTeams([]));

        // Завантаження тренерів
        api.get<User[]>(`/tournaments/${id}/available-coaches`)
            .then(res => setCoaches(res.data));

        // Завантаження гравців
        api.get<User[]>(`/tournaments/${id}/available-players`)
            .then(res => setPlayers(res.data));

    }, [id]);

    const addTeam = async () => {
        if (!teamName.trim() || !id || !coachId) return;

        setError('');

        try {
            const resTeam = await api.post('/teams', {
                name: teamName,
                tournament: id,
                coach: coachId,
                players: playerIds
            });

            await api.put(`/tournaments/${id}/add-team`, { teamId: resTeam.data._id });

            setTeams(t => [...t, resTeam.data]);
            setTeamName('');
            setCoachId('');
            setPlayerIds([]);

            // Оновлюємо доступних тренерів і гравців
            api.get<User[]>(`/tournaments/${id}/available-coaches`)
                .then(res => setCoaches(res.data));

            api.get<User[]>(`/tournaments/${id}/available-players`)
                .then(res => setPlayers(res.data));

        } catch (err: any) {
            setError(err.response?.data?.message || 'Помилка додавання');
        }
    };

    const generateBrackets = async () => {
        if (!id) return;

        try {
            await api.post(`/tournaments/${id}/generate`);
            navigate(`/organizer/tournaments/${id}/matches`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Помилка генерації');
        }
    };

    const togglePlayer = (playerId: string) => {
        if (playerIds.includes(playerId)) {
            setPlayerIds(ids => ids.filter(id => id !== playerId));
        } else {
            setPlayerIds(ids => [...ids, playerId]);
        }
    };

    const deleteTeam = async (teamId: string) => {
        if (!window.confirm('Ви дійсно хочете видалити цю команду?')) return;

        try {
            await api.delete(`/teams/${teamId}`);

            // Оновлюємо локальний список команд
            setTeams(teams.filter(t => t._id !== teamId));

            // Оновлюємо доступних тренерів і гравців
            api.get<User[]>(`/tournaments/${id}/available-coaches`)
                .then(res => setCoaches(res.data));

            api.get<User[]>(`/tournaments/${id}/available-players`)
                .then(res => setPlayers(res.data));
        } catch (err) {
            console.error('Помилка видалення команди', err);
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-xl">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Налаштування турніру</h1>
                <Button variant="outline" onClick={() => navigate(-1)}>← Назад</Button>
            </div>

            <div className="space-y-4">
                <div>
                    <Label>Назва команди</Label>
                    <Input
                        value={teamName}
                        onChange={e => setTeamName(e.target.value)}
                        placeholder="Введіть назву"
                    />
                </div>

                <div>
                    <Label>Тренер</Label>
                    <Select value={coachId} onValueChange={setCoachId}>
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

                <Button onClick={addTeam} className="w-full">Додати команду</Button>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    {teams.map(t => (
                        <Card key={t._id} className="p-2 space-y-2">
                            <CardHeader>
                                <CardTitle>{t.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex space-x-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/organizer/teams/${t._id}/edit`)}
                                >
                                    Редагувати
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteTeam(t._id)}
                                >
                                    Видалити
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Button onClick={generateBrackets} className="w-full mt-6">
                    Генерувати турнірну сітку
                </Button>
            </div>
        </div>
    );
}
