import jwt from "jsonwebtoken"

export const authMiddleware = (req,res,next)=>{
    try {
        const {authorization } = req.headers;

        if(!authorization ){
            return res.status(401).json({message:"no token provided"})
        }

        if(!authorization .startsWith("Bearer ")){
          return  res.status(401).json({message:"invalid token format"})
        }

        const token = authorization .split(" ")[1];

        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        req.user = decoded;

        next();

    } catch (error) {
          return res.status(401).json({
      message: "Invalid or expired token"
    });
    }
}
