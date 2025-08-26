import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function EditTournament() {
    const { token } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [form, setForm] = useState<any>(null);
    const [error, setError] = useState('');

    const api = axios.create({
        baseURL: 'http://localhost:5000/api/organizer',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        api.get(`/tournaments`)
            .then(res => {
                const t = res.data.find((x: any) => x._id === id);
                if (t) {
                    setForm({ ...t, startDate: t.startDate ? t.startDate.slice(0, 10) : '' });
                }
            })
            .catch(() => setForm(null));
    }, [id]);

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({
            ...f,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await api.put(`/tournaments/${id}`, form);
            navigate('/dashboard'); // або куди потрібно
        } catch (err: any) {
            setError(err.response?.data?.message || 'Помилка оновлення');
        }
    };

    if (!form) return <p>Завантаження…</p>;

    return (
        <div className="container mx-auto py-8 max-w-lg">
            <h1 className="text-2xl mb-4">Редагувати турнір</h1>
            <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                    <Label>Назва</Label>
                    <Input name="name" value={form.name} onChange={handleChange} required />
                </div>

                <div>
                    <Label>Стать</Label>
                    <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    >
                        <option value="">Оберіть стать</option>
                        <option value="male">Чоловіча</option>
                        <option value="female">Жіноча</option>
                    </select>
                </div>

                <div>
                    <Label>Сезон</Label>
                    <Input name="season" value={form.season} onChange={handleChange} />
                </div>

                <div>
                    <Label>Локація</Label>
                    <Input name="location" value={form.location} onChange={handleChange} />
                </div>

                <div>
                    <Label>Дата початку</Label>
                    <Input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox id="groupStage" checked={form.groupStage} onCheckedChange={() => setForm(f => ({ ...f, groupStage: !f.groupStage }))} />
                    <Label htmlFor="groupStage">Груповий етап</Label>
                </div>

                <div>
                    <Label>Кількість кіл у групі</Label>
                    <Input type="number" name="groupLegs" value={form.groupLegs} onChange={handleChange} />
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox id="playoff" checked={form.playoff} onCheckedChange={() => setForm(f => ({ ...f, playoff: !f.playoff }))} />
                    <Label htmlFor="playoff">Плей-оф</Label>
                </div>

                {error && <p className="text-red-500">{error}</p>}

                <div className="flex justify-between">
                    <Button variant="outline" onClick={() => navigate(-1)}>← Назад</Button>
                    <Button type="submit">Зберегти</Button>
                </div>
            </form>
        </div>
    );
}
