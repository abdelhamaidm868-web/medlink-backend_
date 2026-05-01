import { Router } from "express";
import * as user from "./user.service.js"

const router = Router();

router.get("/get_profile/:id_user", user.get_profile);

router.put("/update_profile", user.update_profile);


router.get("/home/getall_medicine", user.home_getall_medicine)

router.get("/home/search", user.home_search)


router.post("/comment" , user.add_comment)
router.put("/comment/:id" , user.updateComment)
router.delete("/comment/:id" , user.deleteComment)
//////////////////////////////////////////////////////////////////////////////

router.post("/medicine/:id", user.add_medicine);

router.delete("/medicine/:id", user.del_medicine);

router.get("/medicine/:user_id" , user.get_medicine_user )

router.get("/disease/:user_id" , user.get_desise_user )

router.post("/disease" , user.add_disease)

router.delete("/disease" , user.del_disease)
router.patch("/medicine_status",user.update_status_medicine)

export default router;  