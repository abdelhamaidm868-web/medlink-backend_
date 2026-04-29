import bcrypt from "bcrypt";
import { db } from "../../config/database.js";



// -----------------------------user register-------------------------------------------------
export const userRegister = (req, res) => {

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
 
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error"
      });
    }

    if (results.length > 0 ) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    
    try {



      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery =
        "INSERT INTO users (name, email , location , phone, password) VALUES (? , ? , ? , ? , ?)";

      db.execute(
        insertQuery,
        [name , email , location , phone , hashedPassword],
        (err, result) => {

          if (err) {
            console.log(err);
            return res.status(500).json({
              message: "Server error"
            });
          }

          res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
          });

        }
      );

    } catch (error) {

      console.log(error);
      res.status(500).json({
        message: "Server error"
      });

    }

  });

};
// --------------------------------user login-------------------------------------------------
export const userLogin = (req,res)=>{
  const {email , password} = req.body
  
  if ( !email || !password) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  const checkQuery = "SELECT * FROM users WHERE email = ?";

  db.query(checkQuery,[email],async (err,result)=>{
    if (err) {
      console.log(err)
      return res.status(500).json({message : "server error"})
    }
    if(result.length===0){
    return  res.status(404).json({message : "user dosen't exists"})
    }
  const user = result[0]
  const isMatch = await bcrypt.compare(password,user.Password)
  if(!isMatch){
    return res.status(400).json({message : "invalid password"})
  }
  res.status(201).json({message : "successful login ", user: {
        id: user.Id,
        email: user.Email,
        name: user.Name,
        role : "user"
      }})

  })

}
//--------------------------------pharmecy register-------------------------------------------
export const pharmecyRegister =  (req, res) => {

  const { name, email, phone , location, password ,confirmPassword} = req.body;

  if (!name || !email || !phone || !location || !password || !confirmPassword ) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  
    if (password !== confirmPassword)
    {
      return res.status(400).json({message : "passeord do not match"})
    }
    
  const checkQuery = "SELECT * FROM pharmacy WHERE email = ?";

  db.execute(checkQuery, [email], async (err, results) => {

    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error"
      });
    }

    if (results.length > 0) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }


    try {

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery =
        "INSERT INTO pharmacy (Name, Email, Password , Phone , Location) VALUES (?, ?, ?, ?, ?)";

      db.execute(
        insertQuery,
        [name, email, hashedPassword,phone, location],
        (err, result) => {

          if (err) {
            console.log(err);
            return res.status(500).json({
              message: "Server error"
            });
          }

          res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
          });

        }
      );

    } catch (error) {

      console.log(error);
      res.status(500).json({
        message: "Server error"
      });

    }

  });

};
// -------------------------------phermecy login----------------------------------------------
export const pharmecyLogin = (req,res)=>{
  const {email , password} = req.body
  
  if ( !email || !password) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  const checkQuery = "SELECT * FROM pharmacy WHERE email = ? ";

  db.query(checkQuery,[email],async (err,result)=>{
    if (err) {
      console.log(err)
      return res.status(500).json({message : "server error"})
    }
    if(result.length===0){
    return  res.status(404).json({message : "pharmacy dosen't exists"})
    }
  const user = result[0]
  const isMatch = await bcrypt.compare(password,user.Password)
  if(!isMatch){
    return res.status(400).json({message : "invalid password"})
  }
  res.status(201).json({message : "successful login ", user: {
        id: user.Id,
        email: user.Email,
        name: user.Name,
        role : "pharmacy"
      }})

  })

}