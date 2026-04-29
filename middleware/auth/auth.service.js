import bcrypt from "bcrypt";
import { db } from "../../config/database.js";
import jwt from "jsonwebtoken";


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
export const userLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  const checkQuery = "SELECT * FROM users WHERE Email = ?";

  db.query(checkQuery, [email], async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "user doesn't exist" });
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
        role: "user"
      },
      process.env.JWT_SECRET, 
      {
        expiresIn: "7d"
      }
    );

    return res.status(200).json({
      message: "successful login",
      token, // 👈 ده اللي انت عايزه
      user: {
        id: user.Id,
        email: user.Email,
        name: user.Name,
        role: "user"
      }
    });
  });
};
//--------------------------------pharmecy register-------------------------------------------
export const pharmacyRegister =  (req, res) => {

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
export const pharmacyLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  const checkQuery = "SELECT * FROM pharmacy WHERE Email = ?";

  db.query(checkQuery, [email], async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "pharmacy doesn't exist" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: "invalid password" });
    }

    // ✅ إنشاء التوكن
    const token = jwt.sign(
      {
        id: user.Id,
        email: user.Email,
        role: "pharmacy"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.status(200).json({
      message: "successful login",
      token,
      user: {
        id: user.Id,
        email: user.Email,
        name: user.Name,
        role: "pharmacy"
      }
    });
  });
};