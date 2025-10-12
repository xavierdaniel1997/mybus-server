import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/generateToken";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1]
    const decoded = verifyAccessToken(token!) 
    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try{
    if(!req.user){
       return res.status(401).json({ message: "Unauthorized" });
    }
    if(req.user.role !== "ADMIN"){
       return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next()
  }catch(error: any){
    res.status(500).json({ message: "Server error in isAdmin middleware" });
  }
}