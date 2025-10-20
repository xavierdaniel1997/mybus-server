import express from 'express';
import { upload } from '../middleware/multer';
import { isAdmin, isAuth } from '../middleware/isAuth';
import { createRouteController } from '../controller/busrouteController';
;

const router = express.Router();

router.post("/create-new-busroute", isAdmin, isAuth, createRouteController)            


export default router;