import React, { useState } from 'react';
import HammerIcon from './HammerIcon';

interface ScoreInputProps {
  currentEnd: number;
  teamAName: string;
  teamBName: string;
  onAddEnd: (scoringTeam: 'A' | 'B' | 'BLANK', points: number) => void;
  hammerTeam: 'A' | 'B';
}

const ScoreInput: React.FC<ScoreInputProps> = ({ currentEnd, teamAName, teamBName, onAddEnd, hammerTeam }) => {
  const [scoringTeam, setScoringTeam] = useState<'A' | 'B' | null>(null);
  const [points, setPoints] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scoringTeam && points > 0) {
      onAddEnd(scoringTeam, points);
      setScoringTeam(null);
      setPoints(1);
    }
  };

  const handleBlankEnd = () => {
    onAddEnd('BLANK', 0);
    setScoringTeam(null);
    setPoints(1);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-2xl font-bold text-center">End {currentEnd > 10 ? 'Extra End' : currentEnd}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <fieldset>
          <legend className="text-lg font-semibold mb-2 text-center">Scoring Team</legend>
          <div className="flex justify-center items-stretch space-x-4">
            
            {/* Team A Radio Button */}
            <div className="w-full">
              <input
                type="radio"
                id="teamA"
                name="scoringTeam"
                value="A"
                checked={scoringTeam === 'A'}
                onChange={() => setScoringTeam('A')}
                className="sr-only peer"
              />
              <label
                htmlFor="teamA"
                className="p-4 border-2 rounded-lg w-full h-full text-center transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer border-slate-300 dark:border-slate-600 hover:border-red-400 peer-checked:border-red-500 peer-checked:bg-red-50 dark:peer-checked:bg-red-900/50 peer-checked:ring-4 peer-checked:ring-offset-2 dark:peer-checked:ring-offset-slate-800 peer-checked:ring-red-500"
                aria-label={`Select ${teamAName}`}
              >
                <div className="w-20 h-20 bg-red-500 rounded-lg"></div>
                <span className="font-bold text-lg flex items-center">
                  {teamAName}
                  {hammerTeam === 'A' && <HammerIcon />}
                </span>
              </label>
            </div>

            {/* Team B Radio Button */}
            <div className="w-full">
              <input
                type="radio"
                id="teamB"
                name="scoringTeam"
                value="B"
                checked={scoringTeam === 'B'}
                onChange={() => setScoringTeam('B')}
                className="sr-only peer"
              />
              <label
                htmlFor="teamB"
                className="p-4 border-2 rounded-lg w-full h-full text-center transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer border-slate-300 dark:border-slate-600 hover:border-yellow-400 peer-checked:border-yellow-500 peer-checked:bg-yellow-50 dark:peer-checked:bg-yellow-900/50 peer-checked:ring-4 peer-checked:ring-offset-2 dark:peer-checked:ring-offset-slate-800 peer-checked:ring-yellow-500"
                aria-label={`Select ${teamBName}`}
              >
                <div className="w-20 h-20 bg-yellow-500 rounded-lg"></div>
                <span className="font-bold text-lg flex items-center">
                  {teamBName}
                  {hammerTeam === 'B' && <HammerIcon />}
                </span>
              </label>
            </div>

          </div>
        </fieldset>
        
        <fieldset>
          <legend className="text-lg font-semibold mb-2 text-center">Points Scored</legend>
          <div className="flex items-center justify-center space-x-2">
            <input
              type="number"
              min="1"
              max="8"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value, 10))}
              className="w-24 text-center text-xl font-bold p-2 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </fieldset>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={handleBlankEnd}
          className="w-full sm:w-auto bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all transform hover:scale-105"
        >
          Blank End
        </button>
        <button
          type="submit"
          disabled={!scoringTeam}
          className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
        >
          Add End Score
        </button>
      </div>
    </form>
  );
};

export default ScoreInput;
