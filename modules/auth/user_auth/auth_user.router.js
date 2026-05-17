import { Router } from "express";
import * as auth from "./auth_user.service.js"
const router = Router()

// User 
router.post("/login",auth.userLogin );
router.post("/register",auth.userRegister );


export default router;
