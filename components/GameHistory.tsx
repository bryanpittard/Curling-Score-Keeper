
import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { Game } from '../types';
import Scoreboard from './Scoreboard';

// Declare html2canvas for TypeScript since it's loaded from a script tag
declare const html2canvas: any;

interface GameHistoryProps {
  games: Game[];
  onViewGame: (game: Game) => void;
  onDeleteGame: (gameId: string) => void;
  onShowActive: () => void;
  onShareGame: (game: Game) => void;
}

type SortableKey = 'league' | 'date' | 'teamName';

// Helper function to format the date for the PNG header
const formatDateForDisplay = (isoString: string): string => {
  const date = new Date(isoString);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const datePart = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${weekday}, ${datePart} ${time}`;
};

// Helper function to generate a consistent, file-safe name for exports
const generateFilename = (game: Game) => {
    const date = new Date(game.date);
    const pad = (num: number) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const timestamp = `${year}-${month}-${day}_${hours}${minutes}`;

    const saneLeague = (game.league || "League").replace(/[\\s/\\?%*:|"<>]/g, '_');
    const saneTeamA = (game.teamAName || "TeamA").replace(/[\\s/\\?%*:|"<>]/g, '_');
    const saneTeamB = (game.teamBName || "TeamB").replace(/[\\s/\\?%*:|"<>]/g, '_');

    return `${saneLeague}_Sheet-${game.sheetNumber}_${saneTeamA}_vs_${saneTeamB}_${timestamp}`;
}

const GameHistory: React.FC<GameHistoryProps> = ({ games, onViewGame, onDeleteGame, onShowActive, onShareGame }) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [downloadingPngId, setDownloadingPngId] = useState<string | null>(null);

  const sortedGames = useMemo(() => {
    let sortableGames = [...games];
    sortableGames.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        if (sortConfig.key === 'teamName') {
            aValue = `${a.teamAName} vs ${a.teamBName}`;
            bValue = `${b.teamAName} vs ${b.teamBName}`;
        } else {
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }

        if (sortConfig.key === 'date') {
            const dateA = new Date(aValue).getTime();
            const dateB = new Date(bValue).getTime();
            if (dateA < dateB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (dateA > dateB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        }
        
        if (String(aValue).toLowerCase() < String(bValue).toLowerCase()) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (String(aValue).toLowerCase() > String(bValue).toLowerCase()) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
    return sortableGames;
  }, [games, sortConfig]);

  const requestSort = (key: SortableKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const handleExportGame = (game: Game) => {
    const filename = `${generateFilename(game)}.json`;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(game, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = filename;
    link.click();
  };
  
  const handleDownloadPng = async (game: Game) => {
    setDownloadingPngId(game.id);

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '1024px';
    
    if (document.documentElement.classList.contains('dark')) {
      container.classList.add('dark');
    }
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 md:p-6 font-sans">
          <div className="mb-4 text-center">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white pt-4">Game Score</h3>
              <p className="text-md text-slate-600 dark:text-slate-300">
                  {game.league} &bull; Sheet {game.sheetNumber}
              </p>
               <p className="text-sm text-slate-500 dark:text-slate-400">{formatDateForDisplay(game.date)}</p>
          </div>
          <Scoreboard game={game} />
        </div>
      </React.StrictMode>
    );

    setTimeout(() => {
        const scoreboardElement = container.firstChild as HTMLElement;
        if (scoreboardElement) {
             html2canvas(scoreboardElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: null,
            }).then((canvas: HTMLCanvasElement) => {
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = image;
                link.download = `${generateFilename(game)}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }).catch((err: any) => {
                console.error("Failed to generate PNG:", err);
            }).finally(() => {
                root.unmount();
                document.body.removeChild(container);
                setDownloadingPngId(null);
            });
        } else {
            root.unmount();
            document.body.removeChild(container);
            setDownloadingPngId(null);
            console.error("Failed to find scoreboard element for screenshot.");
        }
    }, 200);
  };

  const SortableHeader: React.FC<{ sortKey: SortableKey; children: React.ReactNode }> = ({ sortKey, children }) => {
    const isSorted = sortConfig.key === sortKey;
    return (
        <th scope="col" className="px-4 py-3 cursor-pointer" onClick={() => requestSort(sortKey)}>
            <div className="flex items-center gap-1">
                {children}
                {isSorted && (
                    <span className="text-slate-500 dark:text-slate-400">
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                )}
            </div>
        </th>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-3xl font-bold">Game History</h2>
        <button
          onClick={onShowActive}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
            &larr; Back to Active Games
        </button>
      </div>
      
      {sortedGames.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
              <tr>
                <SortableHeader sortKey="league">League</SortableHeader>
                <SortableHeader sortKey="teamName">Teams</SortableHeader>
                <th scope="col" className="px-4 py-3">Final Score</th>
                <SortableHeader sortKey="date">Date</SortableHeader>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedGames.map((game) => (
                <tr key={game.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{game.league}</td>
                  <td className="px-4 py-3">{game.teamAName} vs {game.teamBName}</td>
                  <td className="px-4 py-3 font-bold">
                    <span className="text-red-500">{game.totalAScore}</span> - <span className="text-yellow-500">{game.totalBScore}</span>
                  </td>
                  <td className="px-4 py-3">{new Date(game.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 flex justify-end items-center gap-2 flex-wrap">
                    <button onClick={() => onViewGame(game)} className="font-semibold text-blue-500 hover:text-blue-700">View</button>
                    <button onClick={() => onShareGame(game)} className="font-semibold text-purple-500 hover:text-purple-700">Share</button>
                    <button 
                      onClick={() => handleDownloadPng(game)}
                      disabled={downloadingPngId === game.id}
                      className="font-semibold text-green-500 hover:text-green-700 disabled:text-slate-400 disabled:cursor-wait"
                    >
                        {downloadingPngId === game.id ? '...' : 'PNG'}
                    </button>
                    <button onClick={() => handleExportGame(game)} className="font-semibold text-gray-500 hover:text-gray-700">JSON</button>
                    <button onClick={() => onDeleteGame(game.id)} className="font-semibold text-red-500 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 px-6">
          <h3 className="text-xl font-semibold">No completed games</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Finish a game to see it appear in your history.</p>
        </div>
      )}
    </div>
  );
};

export default GameHistory;