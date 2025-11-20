import BusModel from "../models/busModel";
import BusRouteModel from "../models/busrouteModel";
import BusScheduleModel from "../models/busScheduleModel";
import BusTripModel from "../models/bustripModel";
import { getSeatLayoutById } from "./seatLayoutService";

interface CreateBusInput {
  name: string;
  registrationNo: string;
  brand: string;
  busType: "seater" | "sleeper" | "seater+sleeper";
  layoutId: string;
  information?: string;
  features: Record<string, boolean>;
  images: string[];
}

/**
 * Create a new bus by cloning an existing seat layout
 */
export const createBusService = async (input: CreateBusInput) => {
  const { name, registrationNo, brand, busType, layoutId, information, features, images } = input;

  // Get layout template
  const layout = await getSeatLayoutById(layoutId);
  if (!layout) throw new Error("Invalid seat layout ID");

  // Deep copy seats and initialize with price, priority, etc.
  const mapSeats = (deck: any[][]) =>
    deck.map(row =>
      row.map(seat => ({
        id: seat.id,
        type: seat.type,
        seatNumber: seat.seatNumber,
        price: 0,
        priority: "general",
        isAvailable: true,
      }))
    );

  // Create new bus document
  const bus = new BusModel({
    name,
    registrationNo,
    brand,
    busType,
    layoutName: layout.name,
    information,
    features,
    images,
    leftCols: layout.leftCols,
    leftRows: layout.leftRows,
    rightCols: layout.rightCols,
    rightRows: layout.rightRows,
    extraRows: layout.extraRows,
    lowerDeck: { seats: mapSeats(layout.lowerDeck) },
    upperDeck: layout.upperDeck ? { seats: mapSeats(layout.upperDeck) } : undefined,
  });

  await bus.save();
  return bus;
};


/**
 * Get bus detail
 */

export const getBusDetail = async (busId: string) => {
    return BusModel.findById(busId)
}

export const getFullBusDetails = async (busId: string) => {
  // Fetch main bus details
  const bus = await BusModel.findById(busId);
  if (!bus) throw new Error("Bus not found");

  // Fetch routes linked to this bus
  const routes = await BusRouteModel.find({ bus: busId }).lean();

  // Fetch schedules linked to this bus
  const schedules = await BusScheduleModel.find({ bus: busId }).lean();

  // Fetch all upcoming trips (>= today)
  const today = new Date();
  const upcomingTrips = await BusTripModel.find({
    bus: busId,
    travelDate: { $gte: today },
  })
    .select("travelDate departureTime arrivalTime status")
    .lean();

  return {
    bus,
    routes,
    schedules,
    upcomingTrips,
  };
};


/**
 * Get all buses
 */
// export const getAllBusesService = async () => {
//   return BusModel.find().sort({ createdAt: -1 });
// };

export const getAllBusesService = async (search?: string) => {
  const match: any = {};

  if (search) {
    const regex = new RegExp(search, "i");

    match.$or = [
      { name: regex },
      { registrationNo: regex },
      { brand: regex },
    ];
  }

  return BusModel.aggregate([
    // Join route collection
    {
      $lookup: {
        from: "busroutes",
        localField: "_id",
        foreignField: "bus",
        as: "routes",
      },
    },

    // Match bus OR route fields
    ...(search
      ? [
          {
            $match: {
              $or: [
                { name: new RegExp(search, "i") },
                { registrationNo: new RegExp(search, "i") },
                { brand: new RegExp(search, "i") },
                { "routes.routeName": new RegExp(search, "i") },
                { "routes.source.name": new RegExp(search, "i") },
                { "routes.destination.name": new RegExp(search, "i") },
              ],
            },
          },
        ]
      : []),

    { $sort: { createdAt: -1 } },
  ]);
};


/**
 * Update bus details
 */
export const updateBusService = async (id: string, updateData: Partial<CreateBusInput>) => {
  const bus = await BusModel.findByIdAndUpdate(id, updateData, { new: true });
  if (!bus) throw new Error("Bus not found");
  return bus;
};

/**
 * Delete a bus
 */
export const deleteBusService = async (id: string) => {
  const bus = await BusModel.findByIdAndDelete(id);
  if (!bus) throw new Error("Bus not found");
  return bus;
};

