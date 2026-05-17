// in the name of allah 

const auth_role = (req,res,next)=>{

   const {result}= req

   if(!result.role =="admin")
    return res.status(400).json({sucess:false , msg : "you don't have access on it process"})

return next()

}

export default auth_role