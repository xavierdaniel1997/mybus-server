import express from 'express';
import { upload } from '../middleware/multer';
import { isAdmin, isAuth } from '../middleware/isAuth';
import { createBusController, getBusDetailController } from '../controller/busController';

const router = express.Router();

router.post("/add-new-bus", isAuth, isAdmin, upload.array("images", 5), createBusController);
router.get("/get-bus/:busId", getBusDetailController)               



export default router;