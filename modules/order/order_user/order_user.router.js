import { Router } from "express";
import * as order from "./order_user.service.js"
import auth from "../../../middleware/auth.middleware.js"
const router = Router() 


router.post("/add_orders", auth , order.createOrder );

router.get("/get_orders" , auth , order.getOrderById );

router.delete("/cancel_orders", auth ,order.cancelOrder );

router.put("/edit_orders" ,auth,order.editOrder );






export default router;


