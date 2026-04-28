import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();
//---------------------------------------------------
 
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
}
)

function DBconnection() {
  db.connect((error) => {
    if (error) {
      return console.log(error.message);
      console.log("Database connection failed:", error.message);
    } else {
      return console.log("server connected with Database success");
      console.log("Server connected with Database successfully");
    }
  });
}

export { db, DBconnection };
