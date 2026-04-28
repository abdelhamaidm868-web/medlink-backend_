import { Router } from "express";
import * as order from "./order.service.js"
const router = Router() 


router.post("/orders", order.createOrder );


// router.get("/orders",order.getOrders );


router.get("/get_orders" , order.getOrderById );

router.delete("/orders/:id", order.cancelOrder );

router.put("/orders/:id/status",order.updateOrderStatus );
router.put("/orders/:id/",order.editOrder );
// router.put("/:id/status", updateOrderStatus);


// router.delete("/:id", deleteOrder);


export default router;


