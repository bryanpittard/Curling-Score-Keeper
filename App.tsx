import React, { useState, useEffect } from 'react';
import { Game } from './types';
import { db } from './firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import GameList from './components/GameList';
import GameView from './components/GameView';
import Header from './components/Header';
import GameHistory from './components/GameHistory';
import ShareScore from './components/ShareScore';

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

const App: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [view, setView] = useState<'active' | 'history'>('active');
  const [sharedGame, setSharedGame] = useState<Game | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/')) {
        const gameId = hash.substring(2);
        const gameRef = ref(db, `games/${gameId}`);
        onValue(gameRef, (snapshot) => {
          if (snapshot.exists()) {
            setSharedGame(snapshot.val() as Game);
          } else {
            setSharedGame(null);
            window.location.hash = '';
          }
        });
      } else {
        setSharedGame(null);
      }
    };

    const gamesRef = ref(db, 'games');
    onValue(gamesRef, (snapshot) => {
      const data = snapshot.val();
      const gamesArray = data && typeof data === 'object' ? Object.values(data) : [];
      const sanitizedGames = gamesArray.map((game: any) => ({
        ...game,
        ends: game.ends || [],
      }));
      setGames(sanitizedGames as Game[]);
    });

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleNewGame = () => {
    const teamAName = prompt("Enter name for Team A (e.g., Red)", "Team Red") || "Team A";
    const teamBName = prompt("Enter name for Team B (e.g., Yellow)", "Team Yellow") || "Team B";
    
    let sheetNumberInput = prompt("Enter sheet number (1-5)", "1");
    let sheetNumber = parseInt(sheetNumberInput || '1', 10);

    if (isNaN(sheetNumber) || sheetNumber < 1 || sheetNumber > 5) {
      alert("Invalid sheet number. Defaulting to 1.");
      sheetNumber = 1;
    }

    const leaguePromptText = `Select a league:\n${leagues.map((l, i) => `${i + 1}. ${l}`).join('\n')}`;
    const leagueIndexInput = prompt(leaguePromptText, "1");
    const leagueIndex = parseInt(leagueIndexInput || '1', 10) - 1;
    const league = leagues[leagueIndex] || leagues[0];

    const hammerPromptText = `Who has the hammer for the first end?\n1: ${teamAName}\n2: ${teamBName}`;
    const hammerChoice = prompt(hammerPromptText, "1");
    const initialHammer = hammerChoice === '2' ? 'B' : 'A';

    const newGameId = new Date().toISOString().replace(/[.#$\[\]]/g, '-');

    const newGame: Game = {
      id: newGameId,
      league,
      teamAName,
      teamBName,
      sheetNumber,
      ends: [],
      totalAScore: 0,
      totalBScore: 0,
      date: new Date().toISOString(),
      isComplete: false,
      initialHammer,
      currentHammer: initialHammer,
    };
    const gameRef = ref(db, `games/${newGame.id}`);
    set(gameRef, newGame);
    setActiveGameId(newGame.id);
  };

  const handleUpdateGame = (updatedGame: Game) => {
    const gameRef = ref(db, `games/${updatedGame.id}`);
    set(gameRef, updatedGame);
  };
  
  const handleDeleteGame = (gameId: string) => {
    const gameRef = ref(db, `games/${gameId}`);
    remove(gameRef);
    if (activeGameId === gameId) {
      setActiveGameId(null);
    }
  };

  const handleShareGame = (gameToShare: Game) => {
    const shareUrl = `${window.location.origin}/#/${gameToShare.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Shareable URL copied to clipboard!');
    });
  };

  const activeGame = games.find((game) => game.id === activeGameId);
  const activeGames = games.filter((game) => !game.isComplete);
  const completedGames = games.filter((game) => game.isComplete);

  if (sharedGame) {
    return (
      <div className="bg-gray-900 flex items-center justify-center min-h-screen">
          <ShareScore game={sharedGame} />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        {activeGame ? (
          <GameView
            game={activeGame}
            onUpdateGame={handleUpdateGame}
            onBack={() => {
              setActiveGameId(null);
              window.location.hash = '';
            }}
          />
        ) : view === 'active' ? (
          <GameList
            games={activeGames}
            onNewGame={handleNewGame}
            onSelectGame={(game) => setActiveGameId(game.id)}
            onDeleteGame={handleDeleteGame}
            onShowHistory={() => setView('history')}
            onShareGame={handleShareGame}
          />
        ) : (
          <GameHistory
            games={completedGames}
            onViewGame={(game) => setActiveGameId(game.id)}
            onDeleteGame={handleDeleteGame}
            onShowActive={() => setView('active')}
            onShareGame={handleShareGame}
          />
        )}
      </main>
    </div>
  );
};

export default App;
