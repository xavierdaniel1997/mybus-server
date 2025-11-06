import mongoose, { Mongoose, Schema } from "mongoose";
import { ILocation, ILocationStatus } from "../types/location";

const locationSchema: Schema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    stationCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    latitude: {
      type: String,
      required: true,
    },
    longitude: {
      type: String,
      required: true,
    },
    locationImage: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: Object.values(ILocationStatus),
      default: ILocationStatus.ACTIVE,
    },
  },
  { timestamps: true }
);

const LocationModel = mongoose.model<ILocation>('location', locationSchema)
export default LocationModel