import React, { useState, useEffect, useRef } from 'react';
import { Game, EndScore } from '../types';
import Scoreboard from './Scoreboard';
import ScoreInput from './ScoreInput';

// Declare html2canvas for TypeScript since it's loaded from a script tag
declare const html2canvas: any;

// FIX: Define the props interface for the GameView component.
interface GameViewProps {
  game: Game;
  onUpdateGame: (game: Game) => void;
  onBack: () => void;
}

const leagues = [
  'Monday Night Open',
  'Tuesday Supper',
  'Tuesday Super',
  'Wednesday Advance Juniors',
  'Wednesday Women\'s',
  'Thursday Morning',
  'Thursday Doubles',
  'Thursday Men\'s',
  'Friday Juniors',
  'Friday Night Open',
  'Sunday Afternoon Open',
  'Sunday Doubles',
  'Sunday Semi-Competitive',
];

// Helper function to format the date for the PNG header
const formatDateForDisplay = (isoString: string): string => {
  const date = new Date(isoString);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const datePart = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${weekday}, ${datePart} ${time}`;
};

// Helper function to format an ISO date string for a datetime-local input
const toLocalISOString = (isoString: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    // Pad numbers to two digits
    const pad = (num: number) => (num < 10 ? '0' : '') + num;
    // Format to YYYY-MM-DDTHH:mm, which is required by datetime-local input
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const GameView: React.FC<GameViewProps> = ({ game, onUpdateGame, onBack }) => {
  const currentEnd = game.ends.length + 1;
  const scoreboardRef = useRef<HTMLDivElement>(null);

  const [teamAName, setTeamAName] = useState(game.teamAName);
  const [teamBName, setTeamBName] = useState(game.teamBName);
  const [sheetNumber, setSheetNumber] = useState(game.sheetNumber);
  const [gameDate, setGameDate] = useState(game.date);
  const [league, setLeague] = useState(game.league);


  useEffect(() => {
    setTeamAName(game.teamAName);
    setTeamBName(game.teamBName);
    setSheetNumber(game.sheetNumber);
    setGameDate(game.date);
    setLeague(game.league);
  }, [game.teamAName, game.teamBName, game.sheetNumber, game.date, game.league]);

  const handleDetailsChange = () => {
    if (game.teamAName !== teamAName || game.teamBName !== teamBName || game.sheetNumber !== sheetNumber || game.date !== gameDate || game.league !== league) {
      onUpdateGame({
        ...game,
        teamAName,
        teamBName,
        sheetNumber,
        date: gameDate,
        league,
      });
    }
  };

  const handleSwitchInitialHammer = () => {
    // 1. Determine the new initial hammer
    const newInitialHammer = game.initialHammer === 'A' ? 'B' : 'A';

    // 2. Recalculate hammer for all existing ends and the next current hammer
    let hammerForNextEnd: 'A' | 'B' = newInitialHammer;
    const recalculatedEnds: EndScore[] = game.ends.map(end => {
        const hammerForThisEnd = hammerForNextEnd;

        // Determine hammer for the end after this one
        if (end.teamAScore === 0 && end.teamBScore === 0) { // Blank end
            // Hammer stays with the same team
            hammerForNextEnd = hammerForThisEnd;
        } else if (end.teamAScore > 0) { // Team A scored
            hammerForNextEnd = 'B';
        } else { // Team B scored
            hammerForNextEnd = 'A';
        }

        return {
            ...end,
            hammer: hammerForThisEnd,
        };
    });

    // 3. Update the game state
    onUpdateGame({
      ...game,
      initialHammer: newInitialHammer,
      ends: recalculatedEnds,
      currentHammer: hammerForNextEnd,
    });
  };
  
  const generateFilenameBase = () => {
    const date = new Date(gameDate);
    const pad = (num: number) => num.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    const timestamp = `${year}-${month}-${day}_${hours}${minutes}`;

    // Sanitize names to be filesystem-friendly
    const saneLeague = (league || "League").replace(/[\s/\\?%*:|"<>]/g, '_');
    const saneTeamA = (teamAName || "TeamA").replace(/[\s/\\?%*:|"<>]/g, '_');
    const saneTeamB = (teamBName || "TeamB").replace(/[\s/\\?%*:|"<>]/g, '_');

    return `${saneLeague}_Sheet-${sheetNumber}_${saneTeamA}_vs_${saneTeamB}_${timestamp}`;
  };

  const handleAddEnd = (scoringTeam: 'A' | 'B' | 'BLANK', points: number) => {
    if (game.isComplete) return;

    let nextHammer: 'A' | 'B';
    if (scoringTeam === 'BLANK') {
      nextHammer = game.currentHammer;
    } else if (scoringTeam === 'A') {
      nextHammer = 'B';
    } else { // scoringTeam === 'B'
      nextHammer = 'A';
    }

    const newEnd: EndScore = {
      end: currentEnd,
      teamAScore: scoringTeam === 'A' ? points : 0,
      teamBScore: scoringTeam === 'B' ? points : 0,
      hammer: game.currentHammer,
    };

    const updatedEnds = [...game.ends, newEnd];
    const totalAScore = updatedEnds.reduce((sum, end) => sum + end.teamAScore, 0);
    const totalBScore = updatedEnds.reduce((sum, end) => sum + end.teamBScore, 0);

    const isComplete = updatedEnds.length >= 10;

    onUpdateGame({
      ...game,
      ends: updatedEnds,
      totalAScore,
      totalBScore,
      isComplete,
      currentHammer: nextHammer,
    });
  };

  const handleToggleComplete = () => {
    onUpdateGame({ ...game, isComplete: !game.isComplete });
  };
  
  const handleExport = () => {
    const filename = `${generateFilenameBase()}.json`;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(game, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = filename;
    link.click();
  };

  const handleUndoLastEnd = () => {
    if (game.ends.length === 0) return;

    const lastEndBeforeUndo = game.ends[game.ends.length - 1];
    const updatedEnds = game.ends.slice(0, -1);
    const totalAScore = updatedEnds.reduce((sum, end) => sum + end.teamAScore, 0);
    const totalBScore = updatedEnds.reduce((sum, end) => sum + end.teamBScore, 0);

    onUpdateGame({
      ...game,
      ends: updatedEnds,
      totalAScore,
      totalBScore,
      isComplete: false,
      currentHammer: lastEndBeforeUndo.hammer,
    });
  };

  const handleDownloadPng = () => {
    if (scoreboardRef.current) {
      html2canvas(scoreboardRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        backgroundColor: null, // Transparent background to capture the actual one
      }).then((canvas: HTMLCanvasElement) => {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `${generateFilenameBase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }).catch((err: any) => {
          console.error("Failed to generate PNG:", err);
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <button onClick={onBack} className="text-blue-500 hover:text-blue-700 font-semibold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Back to Games
        </button>
        <div className="flex items-center space-x-2 flex-wrap gap-2">
            {game.ends.length > 0 && (
              <button
                onClick={handleUndoLastEnd}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                aria-label="Undo Last End"
              >
                Undo Last End
              </button>
            )}
            <button onClick={handleExport} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
                Export JSON
            </button>
            <button 
              onClick={handleDownloadPng} 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              Download PNG
            </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 md:p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Game Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <label htmlFor="teamAName" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Team A Name</label>
                <input type="text" id="teamAName" value={teamAName} onChange={(e) => setTeamAName(e.target.value)} onBlur={handleDetailsChange} className="w-full text-lg p-2 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
                <label htmlFor="teamBName" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Team B Name</label>
                <input type="text" id="teamBName" value={teamBName} onChange={(e) => setTeamBName(e.target.value)} onBlur={handleDetailsChange} className="w-full text-lg p-2 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
                <label htmlFor="sheetNumber" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Sheet</label>
                <select id="sheetNumber" value={sheetNumber} onChange={(e) => setSheetNumber(parseInt(e.target.value, 10))} onBlur={handleDetailsChange} className="w-full text-lg p-2 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            </div>
            <div>
                <label htmlFor="league" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">League</label>
                <select id="league" value={league} onChange={(e) => setLeague(e.target.value)} onBlur={handleDetailsChange} className="w-full text-lg p-2 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {leagues.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="gameDate" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Date & Time</label>
                <input
                    type="datetime-local"
                    id="gameDate"
                    value={toLocalISOString(gameDate)}
                    onChange={(e) => setGameDate(new Date(e.target.value).toISOString())}
                    onBlur={handleDetailsChange}
                    className="w-full text-lg p-2 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label htmlFor="hammerControl" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">First End Hammer</label>
                <div id="hammerControl" className="flex items-center justify-between w-full text-lg p-2 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg h-[52px]">
                    <span className="font-semibold">{game.initialHammer === 'A' ? teamAName : teamBName}</span>
                    <button 
                        onClick={handleSwitchInitialHammer}
                        className="text-sm font-semibold text-blue-500 hover:text-blue-700 px-2"
                        aria-label="Switch team with hammer for the first end"
                    >
                        Switch
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div ref={scoreboardRef} className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 md:p-6">
        <div className="mb-4 text-center">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white pt-4">Game Score</h3>
            <p className="text-md text-slate-600 dark:text-slate-300">
                {game.league} &bull; Sheet {game.sheetNumber}
            </p>
             <p className="text-sm text-slate-500 dark:text-slate-400">{formatDateForDisplay(game.date)}</p>
        </div>
        <Scoreboard game={game} />
      </div>
      
      {!game.isComplete ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 md:p-6">
            <ScoreInput
                teamAName={game.teamAName}
                teamBName={game.teamBName}
                currentEnd={currentEnd}
                hammerTeam={game.currentHammer}
                onAddEnd={handleAddEnd}
            />
        </div>
      ) : (
        <div className="text-center py-8 px-4 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded-lg">
          <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">Game Over!</h3>
          <p className="text-green-600 dark:text-green-300 mt-1">This game has been marked as complete.</p>
        </div>
      )}

      <div className="flex justify-center mt-4">
        <button 
          onClick={handleToggleComplete} 
          className={`font-bold py-2 px-6 rounded-lg shadow-md transition-colors ${game.isComplete ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
        >
          {game.isComplete ? 'Re-open Game' : 'End Game'}
        </button>
      </div>
    </div>
  );
};

export default GameView;