import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Game } from '../types';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import Scoreboard from './Scoreboard';

const PublicGameView: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (gameId) {
      const gameRef = ref(db, `games/${gameId}`);
      const unsubscribe = onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setGame({ ...data, ends: data.ends || [] });
        } else {
          setGame(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [gameId]);

  if (loading) {
    return <div className="text-center p-4">Loading game...</div>;
  }

  if (!game) {
    return <div className="text-center p-4">Game not found.</div>;
  }

  return (
    <div className="min-h-screen font-sans">
      <main className="container mx-auto p-4 md:p-6">
        <Scoreboard game={game} />
      </main>
    </div>
  );
};

export default PublicGameView;
