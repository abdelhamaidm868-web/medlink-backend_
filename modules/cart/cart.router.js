import { Router } from "express";
import * as cartService from "./cart.service.js";
import authMiddleware from "../../middleware/auth.middleware.js";
const router = Router();

// ================= Add To Cart =================
router.post("/add",authMiddleware,cartService.addToCart);

// ================= Get Cart =================
router.get("/",authMiddleware,cartService.getCart);

// ================= Update Quantity =================
router.put("/item",authMiddleware,cartService.updateCartItem);

// ================= Remove Item =================
router.delete("/item",authMiddleware,cartService.removeCartItem);

// ================= Clear Cart =================
router.delete("/clear",authMiddleware,cartService.clearCart);

// ================= Checkout =================
router.post("/checkout",authMiddleware,cartService.checkoutCart);

export default router;
