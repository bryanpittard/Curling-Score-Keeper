import React from 'react';
import { Game } from '../types';

interface GameListProps {
  games: Game[];
  onNewGame: () => void;
  onSelectGame: (game: Game) => void;
  onDeleteGame: (gameId: string) => void;
  onShowHistory: () => void;
  onShareGame: (game: Game) => void;
}

const GameList: React.FC<GameListProps> = ({ games, onNewGame, onSelectGame, onDeleteGame, onShowHistory, onShareGame }) => {
  const sortedGames = [...games].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getLastEndDescription = (game: Game): string => {
    if (game.ends.length === 0) {
      return 'N/A';
    }
    const lastEnd = game.ends[game.ends.length - 1];
    if (lastEnd.teamAScore > 0) {
      return `${game.teamAName} scored ${lastEnd.teamAScore}`;
    }
    if (lastEnd.teamBScore > 0) {
      return `${game.teamBName} scored ${lastEnd.teamBScore}`;
    }
    return 'Blank End';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-3xl font-bold">Active Games</h2>
        <div className="flex items-center gap-2">
            <button
                onClick={onShowHistory}
                className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                >
                View Game History
            </button>
            <button
                onClick={onNewGame}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
                + New Game
            </button>
        </div>
      </div>
      {sortedGames.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
              <tr>
                <th scope="col" className="px-6 py-3">League / Sheet</th>
                <th scope="col" className="px-6 py-3">Matchup</th>
                <th scope="col" className="px-6 py-3 text-center">Current End</th>
                <th scope="col" className="px-6 py-3">Last End Score</th>
                <th scope="col" className="px-6 py-3 text-center">Total Score</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedGames.map((game) => (
                <tr key={game.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    <div>{game.league}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Sheet {game.sheetNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-sm shrink-0"></div>
                        <span className="font-semibold">{game.teamAName}</span>
                    </div>
                     <div className="flex items-center gap-x-2 mt-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded-sm shrink-0"></div>
                        <span className="font-semibold">{game.teamBName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {game.ends.length + 1}
                  </td>
                  <td className="px-6 py-4">{getLastEndDescription(game)}</td>
                   <td className="px-6 py-4 text-center font-bold text-lg">
                    <span className="text-red-500">{game.totalAScore}</span>
                    <span className="mx-1">-</span>
                    <span className="text-yellow-500">{game.totalBScore}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex justify-end items-center gap-4 whitespace-nowrap">
                        <button onClick={() => onShareGame(game)} className="font-semibold text-green-500 hover:text-green-700">Share</button>
                        <button onClick={() => onSelectGame(game)} className="font-semibold text-blue-500 hover:text-blue-700">View</button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteGame(game.id); }} className="font-semibold text-red-500 hover:text-red-700">
                          Delete
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">No active games</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Click "New Game" to get started or check the Game History for completed matches.</p>
        </div>
      )}
    </div>
  );
};

export default GameList;