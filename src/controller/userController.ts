import { Request, Response } from "express";
import { getAllUsers } from "../service/userService";

const getUsersController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const { users, totalCount } = await getAllUsers(skip, limit);
    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json({
      message: "Successfully fetch users",
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to fetch all users" });
  }
};

export { getUsersController };
