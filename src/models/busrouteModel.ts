import mongoose, { Schema } from "mongoose";
import { IBusRoute } from "../types/busroute";

const GeoPointSchema = new Schema({
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  time: { type: String },
  landmark: { type: String },
});

const BusRouteSchema = new Schema<IBusRoute>(
  {
    bus: { type: Schema.Types.ObjectId, ref: "Bus", required: true },
    routeName: { type: String, required: true },
    routeDescription: {type: String},
    source: { type: GeoPointSchema, required: true },
    destination: { type: GeoPointSchema, required: true },
    distance: { type: Number, required: true},
    duration: { type: String, required: true},
    boardingPoints: [GeoPointSchema],
    droppingPoints: [GeoPointSchema],
    stops: [GeoPointSchema],
  },
  { timestamps: true }
);

const BusRouteModel = mongoose.model<IBusRoute>("BusRoute", BusRouteSchema);
export default BusRouteModel;
