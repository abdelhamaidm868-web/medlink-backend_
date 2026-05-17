import { Router } from "express";
import * as auth from "./auth_pharmacy.service.js"
const router = Router()
// Pharmacy 
router.post("/login", auth.pharmacyLogin );
router.post("/register", auth.pharmacyRegister );



export default router;