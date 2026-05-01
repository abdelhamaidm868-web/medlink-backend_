import { Router } from "express";
import * as phar_router from "./pharmacy.service.js" 
const router = Router()


router.delete("/del_medicine", phar_router.deletemedicine );



////////////////////////////////////////////////


router.get("/getall_medcine/:pharmacy_id", phar_router.getall_medicine );
/////////////////////////////////////////////////////

router.get("/search_medicine/:pharmacy_id",phar_router.search_medicine );

////////////////////////////////////////////////////////////



router.post("/medicine", phar_router.addMedicineToPharmacy );
router.post("/newMedicine", phar_router.addNewMedicine  );

router.put("/update_profile",phar_router.updatePharmacy );
router.get("/PharmacyOrders/:pharmacyId", phar_router.getPharmacyOrders );

router.get("/profile/:pharmacy_id",phar_router.profile_pharmcy)

export default router
///////////////////////////////////////////////////////////////////
  