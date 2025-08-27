// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import LogoutButton from '@/components/LogoutButton';

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
}

const PAGE_SIZE = 10;
const ROLES: ('all' | User['role'])[] = ['all', 'organizer', 'coach', 'player', 'referee'];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
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
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // filtering & pagination
  const [roleFilter, setRoleFilter] = useState<'all' | User['role']>('all');
  const [page, setPage] = useState(1);

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/admin',
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await api.get<Team[]>('/teams');
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'organizer', birthDate: '', team: '' });
    setEditingId(null);
    setMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
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
        setMessage('Користувача оновлено');
      } else {
        await api.post('/users', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage('Користувача створено');
      }

      resetForm();
      fetchUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Помилка');
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
      team: u.team?._id || '',
    });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Видалити користувача?')) return;
    try {
      await api.delete(`/users/${id}`);
      setMessage('Користувача видалено');
      fetchUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Помилка');
    }
  };

  // apply filter & pagination
  const filtered = roleFilter === 'all'
    ? users
    : users.filter(u => u.role === roleFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="container mx-auto py-8">
      {/* header buttons */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Назад
        </Button>
        <LogoutButton />
      </div>

      {/* create/edit form */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          {editingId ? 'Редагувати користувача' : 'Створити користувача'}
        </h2>
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          <div>
            <Label htmlFor="name">Ім’я</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="password">
              {editingId ? 'Новий пароль (залиште порожнім, якщо без змін)' : 'Пароль'}
            </Label>
            <Input id="password" type="password" name="password" value={formData.password} onChange={handleChange} required={!editingId} />
          </div>
          <div>
            <Label htmlFor="role">Роль</Label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full border rounded p-2">
              <option value="organizer">Organizer</option>
              <option value="coach">Coach</option>
              <option value="player">Player</option>
              <option value="referee">Referee</option>
            </select>
          </div>
          <div>
            <Label htmlFor="birthDate">Дата народження (необов'язково)</Label>
            <Input id="birthDate" type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="team">Команда (необов'язково)</Label>
            <select id="team" name="team" value={formData.team} onChange={handleChange} className="w-full border rounded p-2">
              <option value="">Немає</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="photo">Фото (необов'язково)</Label>
            <Input id="photo" type="file" name="photo" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setFormData(f => ({ ...f, photo: file }));
            }} />
          </div>
          <div className="flex space-x-2">
            <Button type="submit" className="bg-football-gradient text-white">
              {editingId ? 'Зберегти' : 'Створити'}
            </Button>
            {editingId && (
              <Button variant="ghost" onClick={resetForm}>Скасувати</Button>
            )}
          </div>
        </form>
        {message && <p className="mt-2 text-blue-600">{message}</p>}
      </div>

      {/* role filter tabs */}
      <div className="flex space-x-4 mb-4">
        {ROLES.map(r => (
          <button
            key={r}
            onClick={() => { setRoleFilter(r); setPage(1); }}
            className={`px-3 py-1 rounded ${roleFilter === r ? 'bg-football-green text-white' : 'bg-gray-200'}`}
          >
            {r === 'all' ? 'Усі' : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {/* users table */}
      <table className="w-full table-auto border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Ім’я</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Дата народження</th>
            <th className="p-2">Команда</th>
            <th className="p-2">Дії</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map(u => (
            <tr key={u._id} className="even:bg-gray-50">
              <td className="p-2">{u.name}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.birthDate ? new Date(u.birthDate).toLocaleDateString() : '-'}</td>
              <td className="p-2">{u.team?.name || '-'}</td>
              <td className="p-2 space-x-2">
                <Button size="sm" onClick={() => startEdit(u)}>Редагувати</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(u._id)}>Видалити</Button>
              </td>
            </tr>
          ))}
          {pageData.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-4">Немає користувачів</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* pagination */}
      <div className="flex justify-center space-x-4">
        <Button size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Попередня</Button>
        <span className="self-center">Сторінка {page} з {totalPages}</span>
        <Button size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Наступна</Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
