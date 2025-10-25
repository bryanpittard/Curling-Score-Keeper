
import React from 'react';
import { Game } from '../types';

interface ShareScoreProps {
  game: Game;
}

const ShareScore: React.FC<ShareScoreProps> = ({ game }) => {
  const isFinal = game.isComplete;
  const endDisplay = isFinal ? 'Final' : game.ends.length + 1;
  const labelDisplay = isFinal ? 'Status' : 'Current End';

  return (
    <div id={`share-score-${game.id}`} className="bg-gray-800 text-white p-8 rounded-lg shadow-xl flex flex-col items-center">
      <div className="text-center mb-8">
        <p className="text-xl text-slate-400 font-semibold">{labelDisplay}</p>
        <p className="text-5xl font-bold text-white">{endDisplay}</p>
      </div>
      <div className="flex justify-around items-center gap-8 w-full">
        <div className="text-center">
          <p className="text-6xl font-bold text-red-500">{game.totalAScore}</p>
          <p className="text-2xl mt-2">{game.teamAName}</p>
        </div>
        <div className="text-center">
          <p className="text-6xl font-bold text-yellow-500">{game.totalBScore}</p>
          <p className="text-2xl mt-2">{game.teamBName}</p>
        </div>
      </div>
    </div>
  );
};

export default ShareScore;
