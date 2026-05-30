import { Router } from "express";
import * as phar_router from "./order_pharmacy.service.js" 
import auth_pharmacy from "../../../middleware/auth_middleware_pharamcy.js"
const router = Router()



// router.get("/PharmacyOrders/:pharmacyId", phar_router.getPharmacyOrders );


router.post("/offline_order/do_order" , auth_pharmacy , phar_router.do_order_offline)
router.post("/offline_order/reseat" , auth_pharmacy , phar_router.reaset_order_offline)




export default router