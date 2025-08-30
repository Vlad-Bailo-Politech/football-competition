import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import LogoutButton from '@/components/LogoutButton';
import { Calendar, MapPin, Trophy, Users, Clock, CheckCircle, Circle, PlayCircle, ArrowLeft } from 'lucide-react';
import AsyncSelect from 'react-select/async';

// Types
interface Tournament {
    _id: string;
    name: string;
    description: string;
    logo?: string;
    location: string;
    startDate: string;
    endDate: string;
    teams: Team[];
    matches: Match[];
}

interface Team {
    _id: string;
    name: string;
    logoUrl?: string;
    players?: any[];
}

interface Match {
    _id: string;
    tournament: string | Tournament;
    homeTeam: Team;
    awayTeam: Team;
    date: string;
    location: string;
    status: 'upcoming' | 'active' | 'finished';
    score: {
        home: number;
        away: number;
    };
}

interface TournamentFormData {
    name: string;
    description: string;
    logo?: File;
    location: string;
    startDate: string;
    endDate: string;
    teams: string[];
    rounds: 1 | 2;
}

const OrganizerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [createStep, setCreateStep] = useState(1);
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [generatedMatches, setGeneratedMatches] = useState<Partial<Match>[]>([]);

    const [formData, setFormData] = useState<TournamentFormData>({
        name: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        teams: [],
        rounds: 1
    });

    const api = axios.create({
        baseURL: 'http://localhost:5000/api/organizer',
        headers: { Authorization: `Bearer ${token}` }
    });

    // Fetch tournaments
    const fetchTournaments = async () => {
        try {
            const res = await api.get<Tournament[]>('/tournaments');
            setTournaments(res.data);
            if (res.data.length > 0 && !selectedTournament) {
                setSelectedTournament(res.data[0]);
            }
        } catch (err) {
            console.error('Error fetching tournaments:', err);
            toast({
                title: "Помилка",
                description: "Не вдалося завантажити турніри",
                variant: "destructive"
            });
        }
    };

    // Fetch all teams
    const fetchTeams = async () => {
        try {
            const res = await api.get<Team[]>('/teams');
            setAllTeams(res.data);
        } catch (err) {
            console.error('Error fetching teams:', err);
        }
    };

    useEffect(() => {
        fetchTournaments();
        fetchTeams();
    }, []);

    // Load teams for AsyncSelect
    const loadTeams = async (inputValue: string) => {
        const filtered = inputValue
            ? allTeams.filter(t => t.name.toLowerCase().includes(inputValue.toLowerCase()))
            : allTeams;

        return filtered.map(t => ({ value: t._id, label: t.name }));
    };

    // Generate matches for tournament
    const generateMatches = () => {
        const matches: Partial<Match>[] = [];
        const teamIds = formData.teams;

        if (teamIds.length < 2) {
            toast({
                title: "Помилка",
                description: "Потрібно мінімум 2 команди для генерації матчів",
                variant: "destructive"
            });
            return;
        }

        // Generate round-robin matches
        for (let round = 1; round <= formData.rounds; round++) {
            for (let i = 0; i < teamIds.length; i++) {
                for (let j = i + 1; j < teamIds.length; j++) {
                    const homeTeamId = round === 1 ? teamIds[i] : teamIds[j];
                    const awayTeamId = round === 1 ? teamIds[j] : teamIds[i];

                    matches.push({
                        homeTeam: allTeams.find(t => t._id === homeTeamId)!,
                        awayTeam: allTeams.find(t => t._id === awayTeamId)!,
                        date: formData.startDate,
                        location: formData.location,
                        status: 'upcoming',
                        score: { home: 0, away: 0 }
                    });
                }
            }
        }

        setGeneratedMatches(matches);
        setCreateStep(2);
    };

    // Handle match details update
    const updateMatchDetails = (index: number, field: 'date' | 'location', value: string) => {
        const updated = [...generatedMatches];
        updated[index] = { ...updated[index], [field]: value };
        setGeneratedMatches(updated);
    };

    // Create tournament
    const handleCreateTournament = async () => {
        try {
            const fd = new FormData();
            fd.append('name', formData.name);
            fd.append('description', formData.description);
            fd.append('location', formData.location);
            fd.append('startDate', formData.startDate);
            fd.append('endDate', formData.endDate);
            formData.teams.forEach(t => fd.append('teams', t));
            if (formData.logo) fd.append('logo', formData.logo);

            // Create tournament
            const tournamentRes = await api.post('/tournaments', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const tournamentId = tournamentRes.data._id;

            // Create matches
            for (const match of generatedMatches) {
                await api.post('/matches', {
                    tournament: tournamentId,
                    homeTeam: match.homeTeam?._id,
                    awayTeam: match.awayTeam?._id,
                    date: match.date,
                    location: match.location,
                    status: 'upcoming'
                });
            }

            toast({
                title: "Успіх",
                description: "Турнір створено успішно"
            });

            setCreateDialogOpen(false);
            setCreateStep(1);
            setFormData({
                name: '',
                description: '',
                location: '',
                startDate: '',
                endDate: '',
                teams: [],
                rounds: 1
            });
            setGeneratedMatches([]);
            fetchTournaments();
        } catch (err: any) {
            toast({
                title: "Помилка",
                description: err.response?.data?.message || "Не вдалося створити турнір",
                variant: "destructive"
            });
        }
    };

    // Delete tournament
    const deleteTournament = async (id: string) => {
        try {
            await api.delete(`/tournaments/${id}`);
            toast({
                title: "Успіх",
                description: "Турнір та всі його матчі видалені"
            });
            fetchTournaments(); // оновити список
            setSelectedTournament(null);
        } catch (err: any) {
            toast({
                title: "Помилка",
                description: err.response?.data?.message || "Не вдалося видалити турнір",
                variant: "destructive"
            });
        }
    };

    // Update match result/status
    const updateMatch = async (matchId: string, updates: Partial<Match>) => {
        try {
            await api.put(`/matches/${matchId}`, updates);
            toast({
                title: "Успіх",
                description: "Матч оновлено"
            });
            fetchTournaments();
        } catch (err: any) {
            toast({
                title: "Помилка",
                description: "Не вдалося оновити матч",
                variant: "destructive"
            });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'upcoming': return <Circle className="h-4 w-4" />;
            case 'active': return <PlayCircle className="h-4 w-4 text-primary" />;
            case 'finished': return <CheckCircle className="h-4 w-4 text-green-600" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming': return 'default';
            case 'active': return 'secondary';
            case 'finished': return 'success';
            default: return 'default';
        }
    };

    // Додаємо локальний стейт
    const [editedMatches, setEditedMatches] = useState<Record<string, Partial<Match>>>({});

    // Оновлення локального стану при зміні
    const handleLocalChange = (matchId: string, field: keyof Match | 'homeScore' | 'awayScore', value: any) => {
        setEditedMatches(prev => {
            const current = prev[matchId] || {};
            if (field === 'homeScore') {
                return { ...prev, [matchId]: { ...current, score: { ...current.score, home: Number(value) } } };
            }
            if (field === 'awayScore') {
                return { ...prev, [matchId]: { ...current, score: { ...current.score, away: Number(value) } } };
            }
            return { ...prev, [matchId]: { ...current, [field]: value } };
        });
    };

    // Збереження в API
    const handleSaveMatch = async (matchId: string) => {
        if (!editedMatches[matchId]) return;
        await updateMatch(matchId, editedMatches[matchId]);
        setEditedMatches(prev => {
            const newState = { ...prev };
            delete newState[matchId];
            return newState;
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
            <div className="container mx-auto py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Панель організатора
                        </h1>
                        <p className="text-muted-foreground mt-2">Вітаємо, {user?.name || 'Організатор'}</p>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <LogoutButton />
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Panel - Tournaments List */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5" />
                                        Мої турніри
                                    </CardTitle>
                                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm">Створити</Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    {createStep === 1 ? 'Створити турнір - Крок 1' : 'Створити турнір - Крок 2'}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    {createStep === 1
                                                        ? 'Заповніть основну інформацію про турнір'
                                                        : 'Налаштуйте розклад матчів'}
                                                </DialogDescription>
                                            </DialogHeader>

                                            {createStep === 1 ? (
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label>Назва турніру</Label>
                                                        <Input
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            placeholder="Чемпіонат міста"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Опис</Label>
                                                        <Textarea
                                                            value={formData.description}
                                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                            placeholder="Опис турніру..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Локація</Label>
                                                        <Input
                                                            value={formData.location}
                                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                            placeholder="Стадіон..."
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label>Дата початку</Label>
                                                            <Input
                                                                type="date"
                                                                value={formData.startDate}
                                                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Дата завершення</Label>
                                                            <Input
                                                                type="date"
                                                                value={formData.endDate}
                                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label>Команди</Label>
                                                        <AsyncSelect
                                                            isMulti
                                                            cacheOptions
                                                            loadOptions={loadTeams}
                                                            defaultOptions
                                                            value={formData.teams.map(tid => {
                                                                const team = allTeams.find(t => t._id === tid);
                                                                return team ? { value: team._id, label: team.name } : { value: tid, label: tid };
                                                            })}
                                                            onChange={(selected) =>
                                                                setFormData({ ...formData, teams: selected.map(s => s.value) })
                                                            }
                                                            placeholder="Виберіть команди..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Кількість кіл</Label>
                                                        <select
                                                            className="w-full border rounded-md p-2"
                                                            value={formData.rounds}
                                                            onChange={(e) => setFormData({ ...formData, rounds: Number(e.target.value) as 1 | 2 })}
                                                        >
                                                            <option value={1}>1 коло</option>
                                                            <option value={2}>2 кола</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <Label>Логотип (необов'язково)</Label>
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) setFormData({ ...formData, logo: file });
                                                            }}
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={generateMatches}
                                                        disabled={!formData.name || formData.teams.length < 2}
                                                        className="w-full"
                                                    >
                                                        Далі - Генерувати матчі
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="text-sm text-muted-foreground">
                                                        Згенеровано {generatedMatches.length} матчів
                                                    </div>
                                                    <div className="max-h-[400px] overflow-y-auto space-y-3">
                                                        {generatedMatches.map((match, idx) => (
                                                            <Card key={idx}>
                                                                <CardContent className="p-4">
                                                                    <div className="font-medium mb-2">
                                                                        {match.homeTeam?.name} vs {match.awayTeam?.name}
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div>
                                                                            <Label className="text-xs">Дата і час</Label>
                                                                            <Input
                                                                                type="datetime-local"
                                                                                value={match.date}
                                                                                onChange={(e) => updateMatchDetails(idx, 'date', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-xs">Локація</Label>
                                                                            <Input
                                                                                value={match.location}
                                                                                onChange={(e) => updateMatchDetails(idx, 'location', e.target.value)}
                                                                                placeholder="Поле №1"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" onClick={() => setCreateStep(1)}>
                                                            Назад
                                                        </Button>
                                                        <Button onClick={handleCreateTournament} className="flex-1">
                                                            Створити турнір
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {tournaments.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">
                                            У вас ще немає турнірів
                                        </p>
                                    ) : (
                                        tournaments.map(tournament => (
                                            <Card
                                                key={tournament._id}
                                                className={`cursor-pointer transition-colors ${selectedTournament?._id === tournament._id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'hover:bg-secondary/50'
                                                    }`}
                                                onClick={() => setSelectedTournament(tournament)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className="font-semibold">{tournament.name}</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {tournament.teams.length} команд
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline">
                                                            {tournament.matches.length} матчів
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel - Tournament Details */}
                    <div className="lg:col-span-2">
                        {selectedTournament ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-2xl">
                                        {selectedTournament.name}
                                        <Button className="flex items-right"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteTournament(selectedTournament._id)}
                                        >
                                            Видалити турнір
                                        </Button>
                                    </CardTitle>
                                    <CardDescription>{selectedTournament.description}</CardDescription>
                                    <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {selectedTournament.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(selectedTournament.startDate).toLocaleDateString()} -
                                            {new Date(selectedTournament.endDate).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {selectedTournament.teams.length} команд
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue="matches">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="matches">Матчі</TabsTrigger>
                                            <TabsTrigger value="teams">Команди</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="matches" className="space-y-3">
                                            {selectedTournament.matches.length === 0 ? (
                                                <p className="text-center py-8 text-muted-foreground">
                                                    Матчі ще не створені
                                                </p>
                                            ) : (
                                                selectedTournament.matches.map(match => (
                                                    <Card key={match._id}>
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    {getStatusIcon(match.status)}
                                                                    <Badge variant={getStatusColor(match.status) as any}>
                                                                        {match.status === 'upcoming' && 'Заплановано'}
                                                                        {match.status === 'active' && 'Триває'}
                                                                        {match.status === 'finished' && 'Завершено'}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <Clock className="h-4 w-4" />
                                                                    {new Date(match.date).toLocaleString()}
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-3 items-center gap-4">
                                                                <div className="text-right">
                                                                    <p className="font-medium">{match.homeTeam.name}</p>
                                                                </div>
                                                                <div className="text-center">
                                                                    <div className="flex items-center justify-center gap-2">
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            value={editedMatches[match._id]?.score?.home ?? match.score.home}
                                                                            onChange={(e) => handleLocalChange(match._id, 'homeScore', e.target.value)}
                                                                            className="w-16 text-center"
                                                                        />
                                                                        <span className="text-xl font-bold">:</span>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            value={editedMatches[match._id]?.score?.away ?? match.score.away}
                                                                            onChange={(e) => handleLocalChange(match._id, 'awayScore', e.target.value)}
                                                                            className="w-16 text-center"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{match.awayTeam.name}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between mt-3">
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <MapPin className="h-4 w-4" />
                                                                    {match.location}
                                                                </div>
                                                                <select
                                                                    value={editedMatches[match._id]?.status ?? match.status}
                                                                    onChange={(e) => handleLocalChange(match._id, 'status', e.target.value)}
                                                                    className="border rounded-md px-2 py-1 text-sm"
                                                                >
                                                                    <option value="upcoming">Заплановано</option>
                                                                    <option value="active">Триває</option>
                                                                    <option value="finished">Завершено</option>
                                                                </select>
                                                            </div>

                                                            <Button
                                                                size="sm"
                                                                className="ml-2"
                                                                onClick={() => handleSaveMatch(match._id)}
                                                                disabled={!editedMatches[match._id]}
                                                            >
                                                                Зберегти
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                ))
                                            )}
                                        </TabsContent>

                                        <TabsContent value="teams" className="space-y-3">
                                            {selectedTournament.teams.map(team => (
                                                <Card key={team._id}>
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            {team.logoUrl && (
                                                                <img
                                                                    src={team.logoUrl}
                                                                    alt={team.name}
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                />
                                                            )}
                                                            <div>
                                                                <h4 className="font-medium">{team.name}</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {team.players?.length || 0} гравців
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="py-16 text-center text-muted-foreground">
                                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Виберіть турнір зі списку або створіть новий</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboard;