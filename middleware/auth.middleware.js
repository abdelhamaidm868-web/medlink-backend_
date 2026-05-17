import user from "../Db/model/user.model.js";
import jwt from "jsonwebtoken";

const auth_middleware = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("bearer")) {
    return res.status(400).json({ msg: "the token require" });
  }

  //brear token
  const token = authorization.split(" ")[1];

  const payload = jwt.verify(token, process.env.secret_token);

  const values = [payload.id];
  const query_check_find_user = `SELECT Name, Email, Phone, Location, ProfileImagePath FROM users WHERE id = ?`;

  const result = db.execute(query_check_find_user, values, (error, result) => {
    if (error) return res.status(500).json({ msg: error.message });

    if (result.length == 0) {
      res.status(404).json({ message: "User not found" });
    }
  });

  req.user_data = result;

  return next();
};

export default auth_middleware;
