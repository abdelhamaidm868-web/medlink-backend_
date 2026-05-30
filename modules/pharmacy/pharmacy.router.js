import { Router } from "express";
import * as phar_router from "./pharmacy.service.js" 
import auth_middleware from "../../middleware/auth_middleware_pharamcy.js"
const router = Router()


router.delete("/del_medicine",auth_middleware, phar_router.deletemedicine );



////////////////////////////////////////////////


router.get("/getall_medcine",auth_middleware,phar_router.getall_medicine );
/////////////////////////////////////////////////////

router.get("/search_medicine",auth_middleware,phar_router.search_medicine );

////////////////////////////////////////////////////////////



router.post("/medicine", auth_middleware ,phar_router.addMedicineToPharmacy );
router.post("/newMedicine",auth_middleware, phar_router.addNewMedicine  );

router.put("/update_profile",auth_middleware,phar_router.updatePharmacy );
router.get("/PharmacyOrders",auth_middleware, phar_router.getPharmacyOrders );

router.get("/profile",auth_middleware,phar_router.profile_pharmcy)

export default router
///////////////////////////////////////////////////////////////////
  