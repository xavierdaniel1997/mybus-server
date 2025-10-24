import express from 'express';
import { upload } from '../middleware/multer';
import { isAdmin, isAuth } from '../middleware/isAuth';
import { createRouteController, updateRouteController } from '../controller/busrouteController';
;

const router = express.Router();

router.post("/create-new-busroute", isAuth, isAdmin, createRouteController);
router.put("/update-busroute/:routeId", isAuth, isAdmin, updateRouteController)          


export default router;