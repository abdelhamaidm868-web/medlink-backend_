import { Router } from "express";
import * as phar_router from "./pharmacy.service.js" 
const router = Router()


router.delete("/del_medicine", phar_router.deletemedicine );



////////////////////////////////////////////////


router.get("/getall_medcine", phar_router.getall_medicine );
/////////////////////////////////////////////////////

router.get("/search_medicine",phar_router.search_medicine );

////////////////////////////////////////////////////////////



router.post("/add_medicine", phar_router.addMedicineToPharmacy );
router.post("/addNewMedicine", phar_router.addNewMedicine  );

router.put("/profile_update",phar_router.updatePharmacy );
router.get("/get_PharmacyOrders", phar_router.getPharmacyOrders );

router.get("/profile",phar_router.profile_pharmcy)

export default router

///////////////////////////////////////////////////////////////////
