import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const nav = useNavigate();
  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">403 — Доступ заборонено</h1>
      <p className="mb-6">У вас немає прав для перегляду цієї сторінки.</p>
      <Button onClick={() => nav(-1)}>← Назад</Button>
    </div>
  );
}
