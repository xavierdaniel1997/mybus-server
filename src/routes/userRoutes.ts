import express from 'express';
import { upload } from '../middleware/multer';
import { isAdmin, isAuth } from '../middleware/isAuth';
import { getUsersController } from '../controller/userController';

const router = express.Router();

              
router.get("/all-users", isAuth, isAdmin, getUsersController)


export default router;