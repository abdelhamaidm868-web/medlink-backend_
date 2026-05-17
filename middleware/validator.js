
//  in the name of allah 
const valid_joi = (schema)=>{
return (req,res, next)=>{
    
    const result = schema.validate(req.body , {abortEarly:false}) // حتى القبول لو مش موجود 

if (result.error){

    const messagelist = result.error.details.map((ele)=>ele.message)
    return next(new Error (messagelist , {cause:500}))
}

return next()
}



}

export default valid_joi