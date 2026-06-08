import bcrypt from "bcrypt";
import { db } from "../../../config/database.js";
import sendEmail from "../../../util/email/send_email.js";
import {html} from "../../../util/email/page_email.js"
import jwt from "jsonwebtoken";


// -----------------------------user register-------------------------------------------------
export const userRegister = (req, res) => {

try {
    const { name, email,phone ,location, password, confirmPassword  } = req.body;

  if (!name || !email || !phone || !location || !password || !confirmPassword ) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }



  if(password !== confirmPassword)
  {
    return res.status(400).json({message : "Passwords do not match"})
  }

  const checkQuery = "SELECT * FROM users WHERE email = ?";

  db.execute(checkQuery, [email], async (err, results) => {

    
    
    try {
      
          if (results.length > 0 ) {
            return res.status(400).json({
              message: "Email already exists"
            });
          }



      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery =
        "INSERT INTO users (name, email , location , phone, password ) VALUES (? , ? , ? , ? , ? )";

      db.execute(
        insertQuery,
        [name , email , location , phone , hashedPassword , role ] ,
        (err, result) => {

          if (err) {
            console.log(err);
            return res.status(500).json({
              message: "Server error"
            });
          }

 const token = jwt.sign({ email }, process.env.JWT_SECRET);
const send = sendEmail({to:email , html: html(`http://localhost:5000/auth/user/acctivate/${token}`)})


          res.status(201).json({ 
            msg : "registeration done ", 
            message: "Please confirm email "
          });

        }
      );

    } catch (error) {

      console.log(error);
    
        res.status(500).json({sucess:false , error : error.message})

    }

  });
} catch (error) {
  res.status(500).json({sucess:false , error : error.message})
}

};
// --------------------------------user login-------------------------------------------------
export const userLogin = (req, res) => {

  try {
    
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }


  const checkQuery = "SELECT * FROM users WHERE Email = ?";

  db.query(checkQuery, [email], async (err, result) => {
   

    if (result.length === 0) {
      return res.status(404).json({ message: "user doesn't exist" });
    }

    

    if (result[0].IsActive == false){
      return res.status(401).json({msg:"this account not acctivate"})
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: "invalid password" });
    }

    const token = jwt.sign(
      {
        id: user.Id,
        email: user.Email,
      },
      process.env.JWT_SECRET, 
      {
        expiresIn: "7d"
      }
    );

    return res.status(200).json({
      message: "successful login",
      token
    });
  });
  } catch (error) {
  
      return res.status(500).json({ message: error.message});
    
  }
};

// --------------------------------user acctivate-------------------------------------------------

export const acctivate = (req,res)=>{
try {
  
const {token} = req.params 

const payload = jwt.verify(token , process.env.JWT_SECRET)


const query = `update users set IsActive = 1 where Email = ?  `
const values = [payload.email]

db.execute(query , values , (error , result ) =>{
  if (error)
    return res.status(500).json({msg:error.message})

 res.status(200).json({msg:"email is acctivate" , eml:payload.email})
  
})

} catch (error) {
  res.status(500).json({sucess:false , errro : error.message , stack :error.stack})
}

}