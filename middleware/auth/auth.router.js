import { Router } from "express";
import * as auth from "./auth.service.js"
const router = Router()
// Pharmacy 
router.post("/pharmacy/login", auth.pharmecyLogin );
router.post("/pharmacy/register", auth.pharmecyRegister );

// User 
router.post("/user/login",auth.userLogin );
router.post("/user/register",auth.userRegister );




export default router;
