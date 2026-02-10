import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
     let token = req.headers.token;
     
     // Handle "Bearer <token>" format
     if(token && token.startsWith("Bearer ")){
       token = token.slice(7);
     }
     
    if(!token){
       return res.json({
        success:false,
        message:"No authorized login again"
       })
    }
    try{
        const token_decode=jwt.verify(token,process.env.JWT_SECRET);
        req.user = {_id: token_decode.id};
        req.userId=token_decode.id;
        next();
    }
    catch(error){
        console.log("JWT Error:", error.message);
        return res.json({
            success:false,
            message:"Error"
           })
    }


}


export default authMiddleware;