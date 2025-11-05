import express from 'express';
import { isAdmin, isAuth } from '../middleware/isAuth';
import { completBusDetailsController } from '../controller/confrimBusController';

const route = express.Router();

route.get("/get-bus-details/:scheduleId", isAuth, isAdmin, completBusDetailsController)

export default route;