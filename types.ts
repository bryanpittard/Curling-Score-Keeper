export interface EndScore {
  end: number;
  teamAScore: number;
  teamBScore: number;
  hammer: 'A' | 'B';
}

export interface Game {
  id: string;
  league: string;
  teamAName: string;
  teamBName: string;
  sheetNumber: number;
  ends: EndScore[];
  totalAScore: number;
  totalBScore: number;
  date: string;
  isComplete: boolean;
  initialHammer: 'A' | 'B';
  currentHammer: 'A' | 'B';
}
