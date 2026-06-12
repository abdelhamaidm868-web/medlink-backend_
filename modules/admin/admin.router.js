import { Router } from "express";
import * as admin from "./admin.service.js"
import auth_user from "../../middleware/auth.middleware.js";
import auth_admin from "../../middleware/autherization.js"

const router = Router() 

router.get("/all_pharmacy" ,auth_user ,auth_admin , admin.home_getall_medicine )

router.post("/newMedicine",auth_user , auth_admin ,  admin.addNewMedicine  );

router.delete("/delete_pharmacy/:id" , auth_user, auth_admin , admin.delete_pharmacy)

router.put("/acctive_phaarmacy/:id" , auth_user , auth_admin , admin.update_acctive_pharmacy)


export default router 