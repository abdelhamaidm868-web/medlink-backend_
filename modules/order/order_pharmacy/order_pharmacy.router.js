import { Router } from "express";
import * as phar_router from "./order_pharmacy.service.js" 
const router = Router()



router.get("/PharmacyOrders/:pharmacyId", phar_router.getPharmacyOrders );


export default router