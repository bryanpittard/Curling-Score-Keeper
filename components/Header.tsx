
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Curling Scorekeeper
            </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;