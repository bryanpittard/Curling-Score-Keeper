import React from 'react';
import { Game } from '../types';

interface SheetViewProps {
  game: Game | null;
  sheetNumber: number;
}

const SheetView: React.FC<SheetViewProps> = ({ game, sheetNumber }) => {
    if (!game) {
        return (
            <div className="bg-gray-900 flex items-center justify-center min-h-screen">
                <div className="text-center text-white">
                    <h1 className="text-4xl font-bold mb-4">Sheet {sheetNumber}</h1>
                    <p className="text-2xl">No active game on this sheet.</p>
                </div>
            </div>
        );
    }

    const isFinal = game.isComplete;
    const endDisplay = isFinal ? 'Final' : game.ends.length + 1;
    const labelDisplay = isFinal ? 'Status' : 'Current End';

  return (
    <div className="bg-gray-900 flex items-center justify-center min-h-screen">
        <div id={`sheet-view-${game.id}`} className="bg-gray-800 text-white p-8 rounded-lg shadow-xl flex flex-col items-center">
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
    </div>
  );
};

export default SheetView;
