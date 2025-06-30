import React from 'react';
import LogoutButton from '@/components/LogoutButton';

const PlayerDashboard = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Player Dashboard</h1>
            <p>Тут гравець переглядає власну статистику, розклад матчів своєї команди.</p>
            <div className="flex justify-end mb-4">
                <LogoutButton />
            </div>
        </div>
    );
};

export default PlayerDashboard;
