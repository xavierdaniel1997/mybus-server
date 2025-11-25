import { Request, Response } from "express";
import { getDashboardStats } from "../service/dashboardService";

const getDashboardController = async (req: Request, res: Response) => {
  try {
    const rangeParam = (req.query.range as string) || "month";
    const range = ["today", "week", "month", "year"].includes(rangeParam)
      ? (rangeParam as any)
      : "month";

    const data = await getDashboardStats(range);

    res.json({
      success: true,
      range,
      data,
    });
  } catch (err: any) {
    console.error("Dashboard error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};

export {getDashboardController}
