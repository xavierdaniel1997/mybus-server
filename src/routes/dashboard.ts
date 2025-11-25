import { Router } from "express";
import { getDashboardController } from "../controller/dashboardController";
import { isAdmin, isAuth } from "../middleware/isAuth";
const router = Router();

router.get("/overview", isAuth, isAdmin, getDashboardController);

export default router;
