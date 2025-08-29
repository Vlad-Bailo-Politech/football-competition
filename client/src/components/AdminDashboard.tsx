import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import LogoutButton from '@/components/LogoutButton';
import AsyncSelect from 'react-select/async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, UserCheck, Target, Award, ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';

// === Types ===
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'organizer' | 'coach' | 'player' | 'referee';
  photo?: string;
  birthDate?: string;
  team?: { _id: string; name: string };
}

interface Team {
  _id: string;
  name: string;
  logoUrl?: string;
  coach?: User;
  players?: User[];
  tournament?: { _id: string; name: string };
}

interface Tournament {
  _id: string;
  name: string;
}

// === Constants ===
const PAGE_SIZE = 10;
const ROLES: ('all' | User['role'])[] = ['all', 'organizer', 'coach', 'player', 'referee'];

const roleIcons = {
  organizer: Shield,
  coach: UserCheck,
  player: Target,
  referee: Award,
  all: Users
};

// === Component ===
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  // --- User form state ---
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: User['role'];
    photo?: File;
    birthDate?: string;
    team?: string;
  }>({
    name: '',
    email: '',
    password: '',
    role: 'organizer',
    birthDate: '',
    team: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Team form state ---
  const [teamForm, setTeamForm] = useState<{
    name: string;
    logoFile?: File;
    coach: string;
    tournament?: string;
    players: string[];
  }>({
    name: '',
    coach: '',
    players: [],
  });
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  const [message, setMessage] = useState('');

  // --- Filters & pagination ---
  const [roleFilter, setRoleFilter] = useState<'all' | User['role']>('all');
  const [page, setPage] = useState(1);
  const [teamPage, setTeamPage] = useState(1);

  // --- API client ---
  const api = axios.create({
    baseURL: 'http://localhost:5000/api/admin',
    headers: { Authorization: `Bearer ${token}` }
  });

  // --- Fetch data ---
  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити користувачів",
        variant: "destructive",
      });
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await api.get<Team[]>('/teams');
      setTeams(res.data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити команди",
        variant: "destructive",
      });
    }
  };

  const fetchTournaments = async () => {
    try {
      const res = await api.get<Tournament[]>('/tournaments');
      setTournaments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTeams();
    fetchTournaments();
  }, []);

  // --- Helpers ---
  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'organizer', birthDate: '', team: '' });
    setEditingId(null);
    setMessage('');
  };

  const resetTeamForm = () => {
    setTeamForm({ name: '', coach: '', tournament: '', players: [] });
    setEditingTeamId(null);
  };

  // --- Handlers (Users) ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "role" && value === "referee") {
      setFormData(f => ({ ...f, role: value as User['role'], team: '' }));
    } else {
      setFormData(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      if (formData.password) fd.append('password', formData.password);
      fd.append('role', formData.role);
      if (formData.photo) fd.append('photo', formData.photo);
      if (formData.birthDate) fd.append('birthDate', formData.birthDate);
      if (formData.team) fd.append('team', formData.team);

      if (editingId) {
        await api.put(`/users/${editingId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast({
          title: "Успішно",
          description: "Користувача оновлено",
        });
      } else {
        await api.post('/users', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast({
          title: "Успішно",
          description: "Користувача створено",
        });
      }

      resetForm();
      fetchUsers();
    } catch (err: any) {
      toast({
        title: "Помилка",
        description: err.response?.data?.message || 'Помилка при збереженні',
        variant: "destructive",
      });
    }
  };

  const startEdit = (u: User) => {
    setEditingId(u._id);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      birthDate: u.birthDate || '',
      team: u.role === 'referee' ? '' : (u.team?._id || ''),
    });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Видалити користувача?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast({
        title: "Успішно",
        description: "Користувача видалено",
      });
      fetchUsers();
    } catch (err: any) {
      toast({
        title: "Помилка",
        description: err.response?.data?.message || 'Помилка',
        variant: "destructive",
      });
    }
  };

  // --- Handlers (Teams) ---
  const handleTeamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTeamForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', teamForm.name);
      if (teamForm.logoFile) fd.append('logo', teamForm.logoFile);
      if (teamForm.coach) fd.append('coach', teamForm.coach);
      if (teamForm.tournament) fd.append('tournament', teamForm.tournament);
      teamForm.players.forEach(p => fd.append('players', p));

      if (editingTeamId) {
        await api.put(`/teams/${editingTeamId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast({
          title: "Успішно",
          description: "Команду оновлено",
        });
      } else {
        await api.post('/teams', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast({
          title: "Успішно",
          description: "Команду створено",
        });
      }

      resetTeamForm();
      fetchTeams();
    } catch (err: any) {
      toast({
        title: "Помилка",
        description: err.response?.data?.message || 'Помилка при збереженні команди',
        variant: "destructive",
      });
    }
  };

  const startEditTeam = (team: Team) => {
    setEditingTeamId(team._id);
    setTeamForm({
      name: team.name,
      coach: team.coach?._id || '',
      tournament: team.tournament?._id || '',
      players: team.players?.map(p => p._id) || [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Async loaders ---
  const loadPlayers = async (inputValue: string) => {
    try {
      const res = await api.get<User[]>(`/users`, {
        params: { role: "player", search: inputValue }
      });
      return res.data.map(p => ({ value: p._id, label: p.name }));
    } catch {
      return [];
    }
  };

  const loadTeams = async (inputValue: string) => {
    try {
      const res = await api.get<Team[]>(`/teams`);
      const teams = res.data;

      const filtered = inputValue
        ? teams.filter(t => t.name.toLowerCase().includes(inputValue.toLowerCase()))
        : teams;

      return filtered.map(t => ({ value: t._id, label: t.name }));
    } catch {
      return [];
    }
  };

  const loadTournaments = async (inputValue: string) => {
    try {
      const res = await api.get<Tournament[]>(`/tournaments`);
      const tournaments = res.data;

      const filtered = inputValue
        ? tournaments.filter(t =>
          t.name.toLowerCase().includes(inputValue.toLowerCase())
        )
        : tournaments;

      return filtered.map(t => ({ value: t._id, label: t.name }));
    } catch {
      return [];
    }
  };

  const loadCoaches = async (inputValue: string) => {
    try {
      const res = await api.get<User[]>(`/users`, {
        params: { role: "coach" }
      });
      const coaches = res.data;

      const filtered = inputValue
        ? coaches.filter(c => c.name.toLowerCase().includes(inputValue.toLowerCase()))
        : coaches;

      return filtered.map(c => ({ value: c._id, label: c.name }));
    } catch {
      return [];
    }
  };

  // --- Pagination logic ---
  const filtered = roleFilter === 'all' ? users : users.filter(u => u.role === roleFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const teamTotalPages = Math.max(1, Math.ceil(teams.length / PAGE_SIZE));
  const teamPageData = teams.slice((teamPage - 1) * PAGE_SIZE, teamPage * PAGE_SIZE);

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      borderColor: 'hsl(var(--border))',
      backgroundColor: 'hsl(var(--background))',
      '&:hover': {
        borderColor: 'hsl(var(--ring))',
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'hsl(var(--background))',
      border: '1px solid hsl(var(--border))',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? 'hsl(var(--primary))'
        : state.isFocused 
        ? 'hsl(var(--muted))' 
        : 'transparent',
      color: state.isSelected
        ? 'hsl(var(--primary-foreground))'
        : 'hsl(var(--foreground))',
      '&:hover': {
        backgroundColor: 'hsl(var(--muted))',
      },
    }),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Панель адміністратора
            </h1>
          </div>
          <LogoutButton />
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Користувачі
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Команди
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* User Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {editingId ? 'Редагувати користувача' : 'Створити користувача'}
                </CardTitle>
                <CardDescription>
                  Заповніть форму для {editingId ? 'редагування' : 'створення'} користувача
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ім'я</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        placeholder="Введіть ім'я"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        placeholder="example@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        {editingId ? 'Новий пароль (залиште порожнім)' : 'Пароль'}
                      </Label>
                      <Input 
                        id="password" 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required={!editingId} 
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Роль</Label>
                      <select 
                        id="role" 
                        name="role" 
                        value={formData.role} 
                        onChange={handleChange} 
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="organizer">Organizer</option>
                        <option value="coach">Coach</option>
                        <option value="player">Player</option>
                        <option value="referee">Referee</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Дата народження</Label>
                      <Input 
                        id="birthDate" 
                        type="date" 
                        name="birthDate" 
                        value={formData.birthDate} 
                        onChange={handleChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team">Команда</Label>
                      <AsyncSelect
                        cacheOptions
                        loadOptions={loadTeams}
                        defaultOptions
                        isClearable
                        value={formData.team
                          ? { value: formData.team, label: teams.find(t => t._id === formData.team)?.name || formData.team }
                          : null
                        }
                        onChange={(selected) =>
                          setFormData(f => ({ ...f, team: selected ? selected.value : '' }))
                        }
                        isDisabled={formData.role === 'referee' || formData.role === 'organizer'}
                        styles={selectStyles}
                        placeholder="Виберіть команду"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="photo">Фото</Label>
                      <Input 
                        id="photo" 
                        type="file" 
                        name="photo" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setFormData(f => ({ ...f, photo: file }));
                        }} 
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingId ? 'Зберегти зміни' : 'Створити користувача'}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Скасувати
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Role Filter */}
            <div className="flex flex-wrap gap-2">
              {ROLES.map(role => {
                const Icon = roleIcons[role];
                return (
                  <Button
                    key={role}
                    variant={roleFilter === role ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setRoleFilter(role); setPage(1); }}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {role === 'all' ? 'Усі' : role.charAt(0).toUpperCase() + role.slice(1)}
                  </Button>
                );
              })}
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Список користувачів</CardTitle>
                <CardDescription>
                  Всього користувачів: {filtered.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Ім'я</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Роль</th>
                        <th className="text-left p-4">Дата народження</th>
                        <th className="text-left p-4">Команда</th>
                        <th className="text-left p-4">Дії</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.map(u => (
                        <tr key={u._id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4 font-medium">{u.name}</td>
                          <td className="p-4 text-muted-foreground">{u.email}</td>
                          <td className="p-4">
                            <Badge variant="secondary">
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {u.birthDate ? new Date(u.birthDate).toLocaleDateString('uk-UA') : '-'}
                          </td>
                          <td className="p-4">{u.team?.name || '-'}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => startEdit(u)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => handleDelete(u._id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {pageData.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-muted-foreground">
                            Немає користувачів
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-4 mt-6">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                  >
                    Попередня
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Сторінка {page} з {totalPages}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages}
                  >
                    Наступна
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            {/* Team Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingTeamId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {editingTeamId ? 'Редагувати команду' : 'Створити команду'}
                </CardTitle>
                <CardDescription>
                  Заповніть форму для {editingTeamId ? 'редагування' : 'створення'} команди
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTeamSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teamName">Назва команди</Label>
                      <Input 
                        id="teamName" 
                        name="name" 
                        value={teamForm.name} 
                        onChange={handleTeamChange} 
                        required 
                        placeholder="Введіть назву команди"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logo">Логотип (необов'язково)</Label>
                      <Input 
                        id="logo" 
                        type="file" 
                        name="logo" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setTeamForm(f => ({ ...f, logoFile: file }));
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coach">Тренер</Label>
                      <AsyncSelect
                        cacheOptions
                        loadOptions={loadCoaches}
                        defaultOptions
                        isClearable
                        value={teamForm.coach
                          ? { value: teamForm.coach, label: users.find(u => u._id === teamForm.coach)?.name || teamForm.coach }
                          : null
                        }
                        onChange={(selected) =>
                          setTeamForm(f => ({ ...f, coach: selected ? selected.value : '' }))
                        }
                        styles={selectStyles}
                        placeholder="Виберіть тренера"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tournament">Турнір (необов'язково)</Label>
                      <AsyncSelect
                        cacheOptions
                        loadOptions={loadTournaments}
                        defaultOptions
                        isClearable
                        value={teamForm.tournament
                          ? { value: teamForm.tournament, label: tournaments.find(t => t._id === teamForm.tournament)?.name || teamForm.tournament }
                          : null
                        }
                        onChange={(selected) =>
                          setTeamForm(f => ({ ...f, tournament: selected ? selected.value : '' }))
                        }
                        styles={selectStyles}
                        placeholder="Виберіть турнір"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="players">Гравці</Label>
                    <AsyncSelect
                      isMulti
                      cacheOptions
                      loadOptions={loadPlayers}
                      defaultOptions
                      value={teamForm.players.map(pid => {
                        const player = users.find(u => u._id === pid);
                        return player
                          ? { value: player._id, label: player.name }
                          : { value: pid, label: pid };
                      })}
                      onChange={(selected) =>
                        setTeamForm(f => ({ ...f, players: selected.map(s => s.value) }))
                      }
                      styles={selectStyles}
                      placeholder="Виберіть гравців"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">
                      {editingTeamId ? 'Зберегти зміни' : 'Створити команду'}
                    </Button>
                    {editingTeamId && (
                      <Button type="button" variant="outline" onClick={resetTeamForm}>
                        Скасувати
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Teams Table */}
            <Card>
              <CardHeader>
                <CardTitle>Список команд</CardTitle>
                <CardDescription>
                  Всього команд: {teams.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Назва</th>
                        <th className="text-left p-4">Турнір</th>
                        <th className="text-left p-4">Тренер</th>
                        <th className="text-left p-4">Гравці</th>
                        <th className="text-left p-4">Дії</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamPageData.map(team => (
                        <tr key={team._id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {team.logoUrl && (
                                <img
                                  src={team.logoUrl}
                                  alt="logo"
                                  className="w-8 h-8 object-cover rounded-full"
                                />
                              )}
                              <span className="font-medium">{team.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            {team.tournament?.name || '-'}
                          </td>
                          <td className="p-4">
                            {team.coach ? team.coach.name : '-'}
                          </td>
                          <td className="p-4">
                            {team.players && team.players.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {team.players.slice(0, 3).map(p => (
                                  <Badge key={p._id} variant="outline" className="text-xs">
                                    {p.name}
                                  </Badge>
                                ))}
                                {team.players.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{team.players.length - 3}
                                  </Badge>
                                )}
                              </div>
                            ) : '-'}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => startEditTeam(team)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={async () => {
                                  if (!window.confirm('Видалити команду?')) return;
                                  try {
                                    await api.delete(`/teams/${team._id}`);
                                    toast({
                                      title: "Успішно",
                                      description: "Команду видалено",
                                    });
                                    fetchTeams();
                                  } catch (err: any) {
                                    toast({
                                      title: "Помилка",
                                      description: err.response?.data?.message || 'Помилка при видаленні',
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {teamPageData.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-muted-foreground">
                            Немає команд
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-4 mt-6">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setTeamPage(p => Math.max(1, p - 1))} 
                    disabled={teamPage === 1}
                  >
                    Попередня
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Сторінка {teamPage} з {teamTotalPages}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setTeamPage(p => Math.min(teamTotalPages, p + 1))} 
                    disabled={teamPage === teamTotalPages}
                  >
                    Наступна
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {message && (
          <div className="fixed bottom-4 right-4">
            <Badge variant="secondary" className="text-sm py-2 px-4">
              {message}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;