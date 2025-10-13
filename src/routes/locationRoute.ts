import express from 'express';
import { upload } from '../middleware/multer';
import { addLocationController, deleteLocation, getLocations } from '../controller/locationController';
import { isAdmin, isAuth } from '../middleware/isAuth';

const router = express.Router();

router.post("/create-location", isAuth, isAdmin, upload.single("locationImage"), addLocationController);

router.get("/all-locations", getLocations)
router.delete("/delete-location/:locationId", isAuth, isAdmin, deleteLocation)

export default router;