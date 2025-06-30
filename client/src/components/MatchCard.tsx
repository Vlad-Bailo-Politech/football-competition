import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  logo?: string;
  score?: number;
}

interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  status: 'upcoming' | 'live' | 'finished';
  startTime: string;
  venue?: string;
  tournament: string;
  minute?: number;
}

interface MatchCardProps {
  match: Match;
  onClick?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick }) => {
  const navigate = useNavigate();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
  };

  const getStatusColor = () => {
    switch (match.status) {
      case 'live': return 'bg-red-500';
      case 'finished': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusText = () => {
    switch (match.status) {
      case 'live': return `${match.minute}'`;
      case 'finished': return 'Завершено';
      default: return formatTime(match.startTime);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/matches/${match.id}`);
    }
  };

  return (
    <div
      className="football-card p-6 cursor-pointer hover:scale-[1.02] transition-all duration-300 overflow-hidden"
      onClick={handleClick}
    >
      {/* Tournament and Status */}
      <div className="flex justify-between items-center mb-4 overflow-hidden">
        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate max-w-[70%]">
          {match.tournament}
        </span>
        <div className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor()} ${match.status === 'live' ? 'animate-pulse' : ''}`}>
          {match.status === 'live' ? 'НАЖИВО' : match.status === 'finished' ? 'ЗАВЕРШЕНО' : 'СКОРО'}
        </div>
      </div>

      {/* Teams and Score */}
      <div className="flex items-center justify-between mb-4">
        {/* Home Team */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className="team-logo flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
            {match.homeTeam.logo ? (
              <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-xs text-gray-600">
                {match.homeTeam.name.charAt(0)}
              </div>
            )}
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {match.homeTeam.name}
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center space-x-4 px-4">
          {match.status !== 'upcoming' ? (
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {match.homeTeam.score ?? 0} : {match.awayTeam.score ?? 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {getStatusText()}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">{formatTime(match.startTime)}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(match.startTime)}
              </div>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center space-x-2 flex-1 justify-end min-w-0">
          <span className="font-semibold text-gray-900 dark:text-white text-sm truncate text-right">
            {match.awayTeam.name}
          </span>
          <div className="team-logo flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
            {match.awayTeam.logo ? (
              <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-xs text-gray-600">
                {match.awayTeam.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match Details */}
      {match.venue && (
        <div className="flex items-center justify-center text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="truncate">{match.venue}</span>
        </div>
      )}
    </div>
  );
};

export default MatchCard;
