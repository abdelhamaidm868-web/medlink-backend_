import { Router } from "express";
import * as auth from "./auth_user.service.js"
const router = Router()

// User 
router.post("/login",auth.userLogin );
router.post("/register",auth.userRegister );
router.get("/acctivate/:token" ,auth.acctivate )
export default router;
