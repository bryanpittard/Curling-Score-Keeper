import React from 'react';
import { Game } from '../types';
import HammerIcon from './HammerIcon';

interface ScoreboardProps {
  game: Game;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ game }) => {
  // Set the number of score columns to a fixed 14.
  const maxDisplayScore = 14;
  const possibleScores = Array.from({ length: maxDisplayScore }, (_, i) => i + 1);

  // Helper function to calculate the cumulative score for a team for ends where they scored.
  const getCumulativeScores = (team: 'A' | 'B') => {
    const cumulativeScores: { end: number; score: number }[] = [];
    let runningTotal = 0;
    game.ends.forEach((end) => {
      const scoreInEnd = team === 'A' ? end.teamAScore : end.teamBScore;
      // The running total must always be updated to reflect the team's actual cumulative score.
      runningTotal += scoreInEnd;
      
      // However, we only add a marker to the board if this team actually scored points in this end.
      // This prevents adding a marker for a team when the other team scores.
      if (scoreInEnd > 0) {
        cumulativeScores.push({ end: end.end, score: runningTotal });
      }
    });
    return cumulativeScores;
  };

  const teamACumulative = getCumulativeScores('A');
  const teamBCumulative = getCumulativeScores('B');
  const hammerTeam = game.isComplete ? null : game.currentHammer;

  const renderScoreRow = (
    teamName: string,
    totalScore: number,
    cumulativeScores: { end: number; score: number }[],
    teamColor: 'red' | 'yellow',
    isFirstRow: boolean,
    hasHammer: boolean
  ) => {
    return (
      <tr className={`bg-white dark:bg-slate-800 ${isFirstRow ? 'border-b dark:border-slate-700' : ''}`}>
        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white text-lg">
          <div className="flex items-center gap-x-3">
            <span className={`w-5 h-5 bg-${teamColor}-500 rounded-md`}></span>
            <span>{teamName}</span>
            {hasHammer && <HammerIcon />}
          </div>
        </td>
        {possibleScores.map((score) => {
          const endsForScore = cumulativeScores
            .filter((cs) => cs.score === score)
            .map((cs) => cs.end);
          return (
            <td key={score} className="px-1 py-3 text-center text-sm font-medium">
              {endsForScore.length > 0 && (
                <div className="flex items-center justify-center flex-wrap gap-1">
                  {endsForScore.map(endNum => (
                    <span key={endNum} className="bg-slate-200 dark:bg-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 shadow">
                      {endNum}
                    </span>
                  ))}
                </div>
              )}
            </td>
          );
        })}
        <td className={`px-4 py-3 text-center text-2xl font-extrabold text-${teamColor}-500`}>
          {totalScore}
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto p-2">
      <table className="w-full min-w-max text-sm text-left text-slate-500 dark:text-slate-400">
        <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
          <tr>
            <th scope="col" className="px-4 py-3 rounded-l-lg font-semibold w-48">Team</th>
            {possibleScores.map((score) => (
              <th key={score} scope="col" className="px-1 py-3 text-center font-semibold w-9">{score}</th>
            ))}
            <th scope="col" className="px-4 py-3 rounded-r-lg text-center font-bold">Total</th>
          </tr>
        </thead>
        <tbody>
          {renderScoreRow(game.teamAName, game.totalAScore, teamACumulative, 'red', true, hammerTeam === 'A')}
          {renderScoreRow(game.teamBName, game.totalBScore, teamBCumulative, 'yellow', false, hammerTeam === 'B')}
        </tbody>
      </table>
    </div>
  );
};

export default Scoreboard;
