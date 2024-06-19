const Company = require("../../models/companies");
const Country = require("../../models/country");

const createCompanies = async (req, res) => {
    try {
      if (!req.body) return res.status(400).json({ status: "Failure", message: "Bad request" });
      let mail = req?.body?.cpAdminMail;
      let exist = await Company.findOne({where:{cpAdminMail:mail}});
      if(exist) return res.status(400).json({ status: "Failure", message: "Email Exist" });
        req.body.cpCreatedDate = Date.now();
        req.body.cpDeleteStatus = 'NO';
        req.body.cpIpAddress = req.connection.remoteAddress;
        req.body.cpUserAgent = req.headers["user-agent"];
        req.body.cpDeviceType = req.device.type;
        req.body.cpTimeStamp = Date.now();
        req.body.cpCreatedUserId = req.user.user.id;
        const data = await Company.create(req.body);
        res.status(200).json({status: "Success",message: "Data Stored into the DataBase",data: data});
    } catch (err) {
      res.status(500).json({status: "Failure", message: "oops! something went wrong",err: err});
    }
  };
const getCompanies = async (req,res) => {
    try{
        let data = await Company.findAll({attributes:['cpId','cpCompanyName','cpAdminName','cpAdminMail','cpCountry','cpStatus'],where:{cpDeleteStatus:'NO'}});
        if(data.length === 0)
        {
            res.status(404).json({status: "Failure", message: "Bad request"});
        }
        else{
            res.status(200).json({status: "Success",message: "Data getted from the DataBase",data: data});
        }
    }
    catch(err)
    {
        res.status(500).json({status: "Failure", message: "oops! something went wrong",err: err});
    }
}
const getOneCompany = async (req,res) => {
    try{
        let id = req.params.id;
        if(!id){
            res.status(404).json({status: "Failure", message: "Bad request"});
        }
        else{
        let data = await Company.findAll({attributes:['cpCompanyName','cpAdminName','cpAdminMail','cpCountry','cpIndustry','cpStatus','cpCreatedUserId'],where:{cpId:id}});
        if(data.length === 0)
        {
            res.status(404).json({status: "Failure", message: "User Not Found"});
        }
        else{
            res.status(200).json({status: "Success",message: "Data getted from the DataBase",data: data});
        }
    }
    }
    catch(err)
    {
        res.status(500).json({status: "Failure", message: "oops! something went wrong",err: err});
    }
}
const updateCompany = async (req,res) => {
    try{
        const id = req.params.id;
        if(!id && !req.body)
        {
            res.status(404).json({status:'Failure',message:'Bad Request'})
        }
        else{
            req.body.cpEditedUserId = req.user.user.id;
            req.body.cpEditedDate = Date.now(); 


            const data = await Company.findOne({ where:{cpId:id}});
            if(!data)
            {
                res.status(404).json({status:'Failure',message:'Company Not Found'})  
            }
            else{
                data.set({
                    cpCompanyName:req.body.cpCompanyName,
                    cpAdminName:req.body.cpAdminName,
                    cpAdminMail:req.body.cpAdminMail,
                    cpIndustry:req.body.cpIndustry,
                    cpCountry:req.body.cpCountry,
                    cpCreatedUserId:req.body.cpCreatedUserId,
                    cpEditedUserId:req.body.cpEditedUserId,
                    cpStatus:req.body.cpStatus,
                    
                });
                await data.save();
                res.status(200).json({status: "Success",message: "Data updated in the DataBase"}); 
            }
        }
    }   
    catch(err)
    {
        res.status(500).json({status: "Failure", message: "oops! something went wrong",err: err});
    }
}

const reomveCompany = async (req,res) => {
    try{
       const id = req.params.id;
       if(!id)
       {
           res.status(404).json({status:'Failure',message:'Bad Request'})
       }
       else{
           const data = await Company.findOne({ where:{cpId:id}});
           if(!data)
           {
               res.status(404).json({status:'Failure',message:'Company Not Found'})  
           }
           else{
               data.set({
                cpDeleteStatus:"YES"
               });
               await data.save();
               res.status(200).json({status: "Success",message: "Data deleted from the DataBase"}); 
           }
       }
    }
    catch(err)
    {
      res.status(500).json({status: "Failure", message: "oops! something went wrong",err: err});   
    }
}
const getCompaniesList = async (req,res) => {
    try{
        let data = await Company.findAll({attributes:[['cpId','value'],['cpCompanyName','label']],where:{cpDeleteStatus:'NO',cpStatus:'Active'}});
        if(data.length === 0)
        {
            res.status(404).json({status: "Failure", message: "Bad request"});
        }
        else{
            res.status(200).json({status: "Success",message: "Data getted from the DataBase",data: data});
        }
    }
    catch(err)
    {
        res.status(500).json({status: "Failure", message: "oops! something went wrong",err: err});
    }
}
const updateStatus = async (req, res) => {
    try {
      const id = req.params.id;
  
      if (!id) {
        return res.status(400).json({ status: 'Failure', message: "ID not provided" });
      }
  
      // Find the current status
      const existingRecord = await Company.findByPk(id);
      
      if (!existingRecord) {
        return res.status(404).json({ status: 'Failure', message: "Record not found" });
      }
  
      // Toggle the status
      const newStatus = existingRecord.cpStatus === 'Active' ? 'Inactive' : 'Active';
  
      // Update the status
      const updatedCount = await Company.update(
        { cpStatus: newStatus },
        { where: {cpId: id } }
      );
  
      return res.status(200).json({ status: "Success", message: "Data Updated Successfully", data: { updatedCount, newStatus } });
    } catch (error) {
      res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
    }
  };

module.exports = { createCompanies, getCompanies, updateCompany, reomveCompany, getOneCompany,getCompaniesList,updateStatus };
