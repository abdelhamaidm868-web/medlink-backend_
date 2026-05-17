import nodemailer from "nodemailer"

const sendEmail=async( {to, html  })=>{
const transport =nodemailer.createTransport({
    host:"smtp.gmail.com" ,  // الجزء الى هبعت عليه هنا مستخدم جيميل الخاص ب جوجل
    port : 465
    , secure : true ,
    auth:{   // الجهة الى هتبعت
        user: "abdulrahmen1.lap@gmail.com",
pass:"rtxn dlsb xnze cjlm"
    }
})

//resever
const info =  await transport.sendMail({
    from: "abdulrahmen1.lap@gmail.com" , 
    to  , 
    subject:"welcome to verifiy",
    text:"WELCOEME to saraha app",
    html
     

})

// console.log(info);
return info.rejected.length==0? true :false

}
export default  sendEmail