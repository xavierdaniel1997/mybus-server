import express from 'express';
import { upload } from '../middleware/multer';
import { addLocationController } from '../controller/locationController';
import { isAdmin, isAuth } from '../middleware/isAuth';

const router = express.Router();

router.post("/create-location", isAuth, isAdmin, upload.single("locationImage"), addLocationController);

export default router;