export type SeatType = "seater" | "sleeper" | "Aisle";

export interface ISeat {
  id: string;
  type: SeatType;
}

export type DeckLayout = ISeat[][];

export interface ISeatLayout {
  name: string;
  busType: "seater" | "sleeper" | "seater+sleeper";
  leftCols: number;
  leftRows: number;
  rightCols: number;
  rightRows: number;
  extraRows?: number;
  lowerDeck: DeckLayout;
  upperDeck: DeckLayout;
  createdAt?: Date;
}
