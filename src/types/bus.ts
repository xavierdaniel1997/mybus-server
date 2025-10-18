export interface IBusSeat {
  id: string;
  type: "seater" | "sleeper" | "Aisle";
  seatNumber: string;
  price: number;
  priority: "general" | "ladies" | "reserved";
  isAvailable: boolean;
}

interface IBusDeck {
  seats: IBusSeat[][];
}

export interface IBus{
  name: string;
  registrationNo: string;
  brand: string;
  busType: "seater" | "sleeper" | "seater+sleeper";
  layoutName: string;
  information?: string;
  features: Record<string, boolean>;
  images: string[];
  leftCols: number;
  leftRows: number;
  rightCols: number;
  rightRows: number;
  extraRows: number;
  lowerDeck: IBusDeck;
  upperDeck?: IBusDeck;
  createdAt: Date;
}