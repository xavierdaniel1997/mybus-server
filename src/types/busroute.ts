import { Types } from "mongoose";

export interface IGeoPoint {
  name: string;
  lat: number;
  lng: number;
  time?: string;
  landmark?: string;
}

export interface IBusRoute{
  bus: Types.ObjectId;            // Reference to Bus
  routeName: string;              // e.g. "Bangalore - Ernakulam"
  source: IGeoPoint;              // Start point
  destination: IGeoPoint;         // End point
  distance: number;               // in km
  duration: string;               // e.g. "10h 30m"
  boardingPoints: IGeoPoint[];    // e.g. Madiwala, E-City
  droppingPoints: IGeoPoint[];    // e.g. Vyttila, KSRTC
  stops?: IGeoPoint[];            // optional mid points
  createdAt?: Date;
  updatedAt?: Date;
}
