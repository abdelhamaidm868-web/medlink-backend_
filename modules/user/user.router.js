import { Router } from "express";
import * as user from "./user.service.js"
import auth from "../../middleware/auth.middleware.js"
import loc from "../../middleware/loction_middleware.js"
const router = Router();

router.get("/get_profile", auth ,user.get_profile);

router.put("/update_profile",auth, user.update_profile);

///
// router.get("/home/getall_medicine", user.home_getall_medicine)
router.get("/home/getall_medicine", user.home_getall_medicine)

// router.get("/home/search", user.home_search)

router.get("/home/search",user.home_search)

router.post("/comment" ,auth, user.add_comment)

router.put("/comment/:id" ,auth, user.updateComment)

router.delete("/comment/:id",auth , user.deleteComment)



//////////////////////////////////////////////////////////////////////////////


router.post("/medicine" ,auth, user.add_medicine);


router.get("/medicine" ,auth, user.get_medicine_user )


router.delete("/medicine",auth, user.del_medicine);


router.get("/disease" ,auth , user.get_desise_user )

router.post("/disease" , auth, user.add_disease)

router.delete("/disease" ,auth, user.del_disease)

router.patch("/medicine_status",auth,user.update_status_medicine)

export default router;  
