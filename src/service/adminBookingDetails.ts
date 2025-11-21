import mongoose from "mongoose";
import BusModel from "../models/busModel"



export const getBookingDetailService = async (busId: string) => {
    const objectId = new mongoose.Types.ObjectId(busId);

    const result = await BusModel.aggregate([
        // 1) Match bus
        { $match: { _id: objectId } },

        // 2) Lookup routes
        {
            $lookup: {
                from: "busroutes",
                localField: "_id",
                foreignField: "bus",
                as: "routes"
            }
        },

        // 3) Lookup trips for these routes
        {
            $lookup: {
                from: "bustrips",
                let: { busId: "$_id", routeIds: "$routes._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$bus", "$$busId"] },
                                    { $in: ["$route", "$$routeIds"] }
                                ]
                            }
                        }
                    }
                ],
                as: "allTrips"
            }
        },

        // 4) Lookup bookings for all trips
        {
            $lookup: {
                from: "bookings",
                let: { tripIds: "$allTrips._id" },
                 pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$trip", "$$tripIds"] }
                        }
                    },
                    {
                        $project: {
                            user: 0,        
                            payment: 0,    
                            __v: 0
                        }
                    }
                ],
                as: "allBookings"
            }
        },

        // 5) Attach bookings to correct trip
        {
            $addFields: {
                allTrips: {
                    $map: {
                        input: "$allTrips",
                        as: "trip",
                        in: {
                            $mergeObjects: [
                                "$$trip",
                                {
                                    bookings: {
                                        $filter: {
                                            input: "$allBookings",
                                            as: "b",
                                            cond: { $eq: ["$$b.trip", "$$trip._id"] }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },

        // 6) Group trips under each route
        {
            $addFields: {
                routes: {
                    $map: {
                        input: "$routes",
                        as: "r",
                        in: {
                            route: "$$r",
                            trips: {
                                $filter: {
                                    input: "$allTrips",
                                    as: "t",
                                    cond: { $eq: ["$$t.route", "$$r._id"] }
                                }
                            }
                        }
                    }
                }
            }
        },

        // 7) Remove helper arrays
        {
            $project: {
                allTrips: 0,
                allBookings: 0
            }
        },

        {
  $project: {
    bus: {
      _id: "$_id",
      name: "$name",
      registrationNo: "$registrationNo",
      brand: "$brand",
      busType: "$busType",
      layoutName: "$layoutName",
      information: "$information",
      features: "$features",
      images: "$images",
      leftCols: "$leftCols",
      leftRows: "$leftRows",
      rightCols: "$rightCols",
      rightRows: "$rightRows",
      extraRows: "$extraRows",
      lowerDeck: "$lowerDeck",
      upperDeck: "$upperDeck",
      createdAt: "$createdAt",
      updatedAt: "$updatedAt"
    },
    routes: 1
  }
}

    ]);

    return result.length ? result[0] : null;
};
