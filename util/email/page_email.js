export const html =(link)=>{
  return  `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 550px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        
        <tr>
            <td style="padding: 30px; text-align: center; background: linear-gradient(135deg, #2c3e50, #4ca1af);">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">Saraha</h1>
                <p style="color: rgba(255,255,255,0.8); margin-top: 5px; font-size: 14px;">Anonymous Feedback Tool</p>
            </td>
        </tr>

        <tr>
            <td style="padding: 40px 30px; text-align: center;">
                <h2 style="color: #333333; font-size: 22px; margin-bottom: 15px;">Confirm Your Email</h2>
                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    Welcome to <strong>Saraha</strong>! To start receiving honest feedback and anonymous messages from your friends, please verify your account by clicking the button below.
                </p>

                <table align="center" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="border-radius: 50px;" bgcolor="#4ca1af">
                            <a href="${link}" target="_blank" style="font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; padding: 16px 40px; display: inline-block; border-radius: 50px;">
                                Verify My Account
                            </a>
                        </td>
                    </tr>
                </table>

                <p style="color: #999999; font-size: 13px; margin-top: 35px;">
                    If you didn't create an account on Saraha, you can safely ignore this email. This link will expire in 12 hours.
                </p>
            </td>
        </tr>

        <tr>
            <td style="padding: 20px; background-color: #fafafa; text-align: center; color: #bdc3c7; font-size: 12px; border-top: 1px solid #eeeeee;">
                &copy; 2026 Saraha App by A.G. All rights reserved.
            </td>
        </tr>
    </table>
</body>
</html>`
}