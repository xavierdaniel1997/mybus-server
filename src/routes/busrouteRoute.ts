import express from 'express';
import { upload } from '../middleware/multer';
import { isAdmin, isAuth } from '../middleware/isAuth';
import { createRouteController, getBusRouteByIdController, updateRouteController } from '../controller/busrouteController';
;

const router = express.Router();

router.post("/create-new-busroute", isAuth, isAdmin, createRouteController);
router.put("/update-busroute/:routeId", isAuth, isAdmin, updateRouteController)   
router.get("/route-detail/:routeId", isAuth, isAdmin, getBusRouteByIdController)       


export default router;