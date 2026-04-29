import { Router } from "express";
import * as auth from "./auth.service.js"
const router = Router()
// Pharmacy 
router.post("/pharmacy/login", auth.pharmacyLogin );
router.post("/pharmacy/register", auth.pharmacyRegister );

// User 
router.post("/user/login",auth.userLogin );
router.post("/user/register",auth.userRegister );




export default router;
