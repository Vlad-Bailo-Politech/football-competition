import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Tournaments from "./pages/Tournaments";
import Matches from "./pages/Matches";
import Teams from "./pages/Teams";
import Participants from "./pages/Participants";
import Contacts from "./pages/Contacts";
import NotFound from "./pages/NotFound";
import Dashboard from '@/pages/Dashboard';
import AdminDashboard from '@/components/AdminDashboard.tsx';
import OrganizerDashboard from '@/components/OrganizerDashboard';
import CoachDashboard from '@/components/CoachDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProtectedByRole from '@/components/ProtectedByRole';
import NewTournament from '@/pages/organizer/NewTournament';
import EditTournament from '@/pages/organizer/EditTournament';
import SetupTournament from '@/pages/organizer/SetupTournament';
import MatchesList from '@/pages/organizer/MatchesList';
import Unauthorized from '@/pages/Unauthorized';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/contacts" element={<Contacts />} />

          {/* Доступ для всіх авторизованих */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizer/tournaments/new"
            element={
              <ProtectedByRole allowedRoles={['organizer']}>
                <NewTournament />
              </ProtectedByRole>
            }
          />
          <Route
            path="/organizer/tournaments/:id/setup"
            element={
              <ProtectedByRole allowedRoles={['organizer']}>
                <SetupTournament />
              </ProtectedByRole>
            }
          />
          <Route
            path="/organizer/tournaments/:id/matches"
            element={
              <ProtectedByRole allowedRoles={['organizer']}>
                <MatchesList />
              </ProtectedByRole>
            }
          />

          {/* Тільки для адміністратора */}
          {/* <Route
            path="/admin-panel"
            element={
              <ProtectedByRole allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedByRole>
            }
          /> */}

          {/* Тільки для організатора */}
          {/* <Route
            path="/organizer-dashboard"
            element={
              <ProtectedByRole allowedRoles={['organizer']}>
                <OrganizerDashboard />
              </ProtectedByRole>
            }
          /> */}

          {/* Тільки для тренера */}
          {/* <Route
            path="/coach-dashboard"
            element={
              <ProtectedByRole allowedRoles={['coach']}>
                <CoachDashboard />
              </ProtectedByRole>
            }
          /> */}

          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
