import express from "express";
import cors from "cors";
import {db , DBconnection}  from "./config/database.js";


import auth_router from "./middleware/auth/auth.router.js"
import user_router from "./modules/user/user.router.js"
import order_router from "./modules/order/order.router.js"
import pharmacy_router from "./modules/pharmacy/pharmacy.router.js"



await DBconnection()

const app = express();

app.use(express.json());
app.use(cors());

///////////////////////////////////////////
app.use("/auth" , auth_router)
app.use("/order" , order_router)
app.use("/user" , user_router)
app.use ("/pharmcy" , pharmacy_router)
//////////////////////////////////////////
app.get('/', (req, res) => {
  res.send('Server working')
})
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});