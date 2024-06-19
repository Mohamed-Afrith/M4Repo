const { generateToken } = require("../../lib/authentication/auth");

const transporter = require("../../lib/mails/mailService");
const { adminRegisterSchema, adminLoginSchema } = require("../../lib/validation/admin.validation");
const Learnerprofile =require("../../models/learner")
const bcrypt = require('bcrypt');

const Login = async (req,res) => {
    try{
        if(!req.body) return res.status(404).json({status:'Failure',message:'Bad Request'});
        const {email,password} = req.body;
        const data = req.body;
        // const { error } = adminLoginSchema.validate(data);
        // if (error) return res.status(400).json({status:'Failure',message:'Bad Request',error: error.details[0].message });
         let role ;
        
       
        let siteUser = await Learnerprofile.findOne({ where: { lenMail: email,lenPassword:password } });

        if (!siteUser) {
          return res.status(400).json({ status: 'Failure', message: 'User not found with the provided email' });
      }
               
      // let valid = await bcrypt.compare(password.trim(), siteUser.lenPassword.trim());
      // return res.status(400).json({ status: 'Failure', message: valid });
                  
                   
                      let learnerDetails = await Learnerprofile.findOne({attributes:['lenId','lenUserName','lenMail'],where:{lenMail:email}});
                      let credentialAdmin ={
                        id: learnerDetails?.lenId ,
                         name:learnerDetails?.lenUserName,
                        mail:learnerDetails?.lenMail,
                        role: 'Learner'
                      }
                      // return res.status(400).json({status:'Failure',message:credentialAdmin})
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
                        
                      return  res.status(200).json({status:'Success',message:'Login Successfully',data:credentialAdmin,token:token});                         
                      });
                   
                  
                  
                  
          
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
const changePassword = async (req,res) =>{
  try {
      const id = req.params.id;
      const data = req.body;
      const isInLeaner = await Learnerprofile.findOne({ 
        where: { lenId: id },
      });   
      if (!isInLeaner || isInLeaner.lenPassword !== data.oldPassword) {
        return res.status(400).json({ status: "Failure", message: "Incorrect old password" });
      } 
      isInLeaner.lenPassword = data.confirmed;
    await isInLeaner.save();
   return res.status(200).json({ status: "Success", message: "password changed succesfully", });   
  } catch (e) {
  return res
      .status(500)
      .json({
        status: "Failure",
        message: "Oops!, Not able verify the usage of entered Email id",
        err: e.message,
      });
  }
}

module.exports = { adminRegister, Login,changePassword}