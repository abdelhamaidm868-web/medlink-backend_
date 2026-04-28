import { Router } from "express";
import * as auth from "./auth.service.js"
const router = Router()
// Pharmacy 
router.post("/pharmecy/login", auth.pharmecyLogin );
router.post("/pharmecy/register", auth.pharmecyRegister );

// User 
router.post("/user/login",auth.userLogin );
router.post("/user/register",auth.userRegister );




export default router;