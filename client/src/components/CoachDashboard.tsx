import React from 'react';
import LogoutButton from '@/components/LogoutButton';

const CoachDashboard = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Coach Dashboard</h1>
            <p>Тут тренер керує командою, переглядає своїх гравців та їх статистику.</p>
            <div className="flex justify-end mb-4">
                <LogoutButton />
            </div>
        </div>
    );
};

export default CoachDashboard;
