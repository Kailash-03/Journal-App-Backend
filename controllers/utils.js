export const getStartOfTodayDate = ()=>{
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function normalizeToStartOfDay(inputDate) {
  const d = new Date(inputDate);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}



    const sendCookie = (res,statusCode,cookieName,cookieVal,exp,statusval,messageval) =>{
        try {
            return res.status(statusCode).cookie(cookieName,cookieVal,{
                httpOnly:true,
                maxAge: exp*60*1000,
            }).json({
                status:statusval,
                message:messageval
            })
        } catch (error) {
            return res.status(500).json({
                status:false,
                message:"some error occured while setting cookies"
            })
        }
    }