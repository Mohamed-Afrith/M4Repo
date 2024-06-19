const { generateToken } = require("../../lib/authentication/auth");
const transporter = require("../../lib/mails/mailService");
const { adminRegisterSchema, adminLoginSchema } = require("../../lib/validation/admin.validation");
const LmsCreator = require("../../models/Creator");
const LmsSuperAdmin = require("../../models/admin");
const LoginHistory = require("../../models/loginHistory");
const bcrypt = require('bcrypt');

const adminLogin = async (req,res) => {
    try{
        if(!req.body) return res.status(404).json({status:'Failure',message:'Bad Request'});
        const {email,password} = req.body;
        const data = req.body;
        // const { error } = adminLoginSchema.validate(data);
        // if (error) return res.status(400).json({status:'Failure',message:'Bad Request',error: error.details[0].message });
         let role ;
        let admin = await LmsSuperAdmin.findOne({where:{sdMailId:email}});
                if(!admin)
                {
                  let user = await LmsCreator.findOne({where:{ctMail:email}})
                  if(!user)
                  {
                    res.status(400).json({status:'Failure',message:'admin Incorrect username or password'});
                  }
                  else{
                    // let userValid = await bcrypt.compare(password,user.ctPassword);
                    if(user.ctPassword !== password)
                    {
                      res.status(400).json({status:'Failure',message:'user Incorrect username or password'})
                    }
                    else{
                      let creatorUser = await LmsCreator.findOne({attributes:['ctId','ctCompanyId','ctName','ctMail'],where:{ctMail:email}});
                      const currentTimeInIndia = new Intl.DateTimeFormat('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      }).formatToParts(new Date()).filter(part => part.type === 'hour' || part.type === 'minute' || part.type === 'second')
                        .map(part => part.value).join(':');
            
                      console.log('Current time in India:', currentTimeInIndia);
                      // Add By Lokie
            
                      const result = await LoginHistory.create(
                        {
                          lgUserId: creatorUser?.ctId,
                          lgUserRole: "Creator",
                          lgLoginTime: currentTimeInIndia,
                          lgStatus:'login',
                          lgIpAddress: req.connection.remoteAddress,
                          lgDeviceType: req.device.type,
                          lgUserAgent: req.headers["user-agent"],
                        }
                      );

                      let credential ={
                        id: creatorUser?.ctId,
                        name:creatorUser?.ctName,
                        mail:creatorUser?.ctMail,
                        role: 'Creator'
                      }
                      let token = await generateToken(credential);
                      res.status(200).json({status:'Success',message:'Login Successfully',data:credential,token:token});
                    }
                  }
                }
                else{
                   let valid = await bcrypt.compare(password,admin.sdPassword)
                   if(!valid)
                   {
                    res.status(400).json({status:'Failure',message:'Incorrect username or password'})
                   }
                   else
                   {
                      let adminUser = await LmsSuperAdmin.findOne({attributes:['sdId','sdnNme','sdMailId'],where:{sdMailId:email}});
                       const currentTimeInIndia = new Intl.DateTimeFormat('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      }).formatToParts(new Date()).filter(part => part.type === 'hour' || part.type === 'minute' || part.type === 'second')
                        .map(part => part.value).join(':');
            
                      console.log('Current time in India:', currentTimeInIndia);
                      // Add By Lokie
            
                      const result = await LoginHistory.create(
                        {
                          lgUserId: adminUser?.sdId,
                          lgUserRole: "Admin",
                          lgLoginTime: currentTimeInIndia,
                          lgStatus:'login',
                          lgIpAddress: req.connection.remoteAddress,
                          lgDeviceType: req.device.type,
                          lgUserAgent: req.headers["user-agent"],
                        }
                      );


                      let credentialAdmin ={
                        id: adminUser?.sdId,
                        name:adminUser?.sdnNme,
                        mail:adminUser?.sdMailId,
                        role: 'Admin'
                      }
                      let token = await generateToken(credentialAdmin);
                      if(!token) console.log('error Found');
                      let mailOptions ={
                        from:'santhilamobiledev@gmail.com',
                        to:'navinivan298@gmail.com',
                        subject: 'Regarding For Your Work',
                        text: 'Hi Indhu!',
                        html: '<div><h1>Welcome</h1><p>Hello Guys</p><button>Click Me...!</button></div>'
                      }
                      transporter.sendMail(mailOptions, (error, info)=>{
                        if (error) return res.status(400).json({status:'Failure',message:'Email Not Send',error:error.message})
                        console.log('Email sent: ' + info.response);
                        
                        res.status(200).json({status:'Success',message:'Login Successfully',data:credentialAdmin,token:token});                         
                      });
                   }
                }
          
    }
    catch(err)
    {
        res.status(500).json({status:'Failure',message:'oops..! somethingwent wrong',error:err.message});
    }
}

const adminRegister = async (req,res) => {
    try{
        if(!req.body)
        {
            res.status(404).json({status:'Failure',message:'Bad Request'})
        }   
        else 
        {
            const data = req.body;
            const { error } = adminRegisterSchema.validate(data);
            if (error) {
              res.status(400).json({status:'Failure',message:'Bad Request',error: error.details[0].message });
            } else {
                const salt =await bcrypt.genSalt(10);
                data.sdPassword = await bcrypt.hash(data.sdPassword, salt);
              let result = await LmsSuperAdmin.create(data);
              if(!result)
              {
                res.status(500).json({status:'Failure',message:'oops..! somethingwent wrong'});
              }
              else{
                res.status(200).json({status:'Success',message:'Admin Created SuccessFully',data:result});
              }
            }  
        }
    }
    catch(err)
    {
        res.status(500).json({status:'Failure',message:'oops..! somethingwent wrong',error:err});
    }
}
const logoutAuto = async (req, res) => {
  try {
    const data = req.body;


    const currentTimeInIndia = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(new Date()).filter(part => part.type === 'hour' || part.type === 'minute' || part.type === 'second')
      .map(part => part.value).join(':');

    console.log('Current time in India:', currentTimeInIndia);
    const getData = await LoginHistory.findOne({
      attribute: ["lgLoginTime"],
      where: { lgUserId: data.userid, lgUserRole:data.userrole,lgStatus:'login'},
      order: [['lgId', 'DESC']]
    });

    function timeToSeconds(timeStr) {
      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      return hours * 3600 + minutes * 60 + seconds;
  }
  
  // Convert login time and current time to total seconds
  const loginTimeSeconds = timeToSeconds(getData.lgLoginTime);
  const currentTimeSeconds = timeToSeconds(currentTimeInIndia);
  
  // Calculate the difference in seconds
  const timeDifferenceSeconds = Math.abs(currentTimeSeconds - loginTimeSeconds);
  
  // Convert difference back to hours, minutes, and seconds
  const hoursDiff = Math.floor(timeDifferenceSeconds / 3600);
  const minutesDiff = Math.floor((timeDifferenceSeconds % 3600) / 60);
  const secondsDiff = timeDifferenceSeconds % 60;
  

const timeser = `${hoursDiff}:${minutesDiff}:${secondsDiff}`;
  
    // return res.status(400).json({ status: 'Failure', message: 'Bad Request', error: timeser });
    const update = await LoginHistory.update({
      lgLogoutTime:currentTimeInIndia,
      lgTotalTime:timeser,
      lgStatus:'logout'
    }, 
      {
      where: {
        lgUserId: data.userid,
        lgUserRole:data.userrole,
        lgStatus:'login',
      },
    });
    if(update){
      return res.status(200).json({ status: 'success', message: 'Updated Success' })
    }else{
      return res.status(400).json({ status: 'Failure', message: 'Bad Request'});
    }
  }
  catch (err) {
    res.status(500).json({ status: 'Failure', message: 'oops..! somethingwent wrong', error: err });
  }

}

module.exports = { adminRegister, adminLogin,logoutAuto}