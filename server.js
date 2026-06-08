// in the name of allah 
// BaackEnd Team to this Project 
// Abdelrahman Goda
//Abdelhamed Mohamed
//Abdelrahman Osama



import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import {db , DBconnection}  from "./config/database.js";


import auth_user_router from "./modules/auth/user_auth/auth_user.router.js"
import auth_pharmacy_router from "./modules/auth/pharmacy_auth/auth_pharmacy.router.js"
import user_router from "./modules/user/user.router.js"
import order_router_user from "./modules/order/order_user/order_user.router.js"
import order_router_pharmacy from "./modules/order/order_pharmacy/order_pharmacy.router.js"
import pharmacy_router from "./modules/pharmacy/pharmacy.router.js"


 
await DBconnection()
dotenv.config()
const app = express();

app.use(express.json());
app.use(cors());

///////////////////////////////////////////
app.use("/auth/user" , auth_user_router)
app.use("/auth/pharmacy" ,auth_pharmacy_router)
app.use("/user/order" , order_router_user)
app.use("/pharmacy/Mangeorder" , order_router_pharmacy)
app.use("/user" , user_router)
app.use ("/pharmacy" , pharmacy_router)
//////////////////////////////////////////
app.get('/', (req, res) => {
  res.send('Server working')
})
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
