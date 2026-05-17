//  const Handeler =(fn)=>{
// return (req,res,next)=>{
//     try {
//         fn (req,res,next)
//     } catch (error) {
//         next(error)
//     }
// }
// }

// export default Handeler


///////////////////////

 const Handeler =(fn)=>{
return async(req,res,next)=>{
    try {
       await fn (req,res,next)
    } catch (error) {
        next(error)
    }
}
}

export default Handeler