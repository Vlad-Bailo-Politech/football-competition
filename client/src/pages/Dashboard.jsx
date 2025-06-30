import React from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminDashboard from '@/components/AdminDashboard.tsx';
import OrganizerDashboard from '@/components/OrganizerDashboard';
import CoachDashboard from '@/components/CoachDashboard';
import PlayerDashboard from '@/components/PlayerDashboard';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/'); // Перенаправлення, якщо користувач не авторизований
    return null;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'organizer':
      return <OrganizerDashboard />;
    case 'coach':
      return <CoachDashboard />;
    // case 'player':
    //   return <PlayerDashboard />;
    default:
      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold">No Dashboard for this role</h1>
        </div>
      );
  }
};

export default Dashboard;
