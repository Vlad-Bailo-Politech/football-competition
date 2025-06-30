// src/pages/organizer/NewTournament.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function NewTournament() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    gender: 'male',
    season: '',
    location: '',
    startDate: '',
    groupStage: false,
    groupLegs: 1,
    playoff: false
  });
  const [error, setError] = useState('');

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/organizer',
    headers: { Authorization: `Bearer ${token}` }
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/tournaments', form);
      const newId = res.data._id as string;
      navigate(`/organizer/tournaments/${newId}/setup`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Помилка створення');
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-lg">
      <h1 className="text-2xl mb-4">Створити турнір</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Назва</Label>
          <Input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <Label>Стать</Label>
          <select name="gender" value={form.gender} onChange={handleChange} className="w-full border p-2">
            <option value="male">Чоловіча</option>
            <option value="female">Жіноча</option>
          </select>
        </div>
        <div>
          <Label>Сезон</Label>
          <Input name="season" value={form.season} onChange={handleChange} placeholder="2024/2025" required />
        </div>
        <div>
          <Label>Локація</Label>
          <Input name="location" value={form.location} onChange={handleChange} required />
        </div>
        <div>
          <Label>Дата початку</Label>
          <Input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" name="groupStage" checked={form.groupStage} onChange={handleChange} />
          <Label>Груповий етап</Label>
        </div>
        {form.groupStage && (
          <div>
            <Label>Кількість кіл</Label>
            <select name="groupLegs" value={form.groupLegs} onChange={handleChange} className="w-full border p-2">
              <option value={1}>1 коло</option>
              <option value={2}>2 кола</option>
            </select>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input type="checkbox" name="playoff" checked={form.playoff} onChange={handleChange} />
          <Label>Плей-офф</Label>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>← Назад</Button>
          <Button type="submit">Створити та продовжити</Button>
        </div>
      </form>
    </div>
  );
}
