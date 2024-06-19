const Country = require("../../models/country");


const addCountry = async (req,res) => {
    try{
        if(!req.body)
        {
            res.status(400).json({status:'Failure',message:'Bad request'});
        }
        else{
            const data = await Country.create({
                countryCode: req.body.countryCode,
                countryName: req.body.countryName,
                isEnable: true,
                dialCode: req.body.dialCode    
            });
            res.status(200).json({status:'Success',message:'Data Stored into the DataBase'});
        }
    }
    catch(err)
    {
        res.status(500).json({status:'Failure',message:'oops! something went wrong',err: err});
    }
}

const getAllCountry = async(req,res) => {
    try{
        const data = await Country.findAll({attributes: [['id','value'],['countryName','label']]});
        if(!data)
        {
            res.status(404).json({status:'Failure',message:'Bad request',err: err});  
        }
        else{
            res.status(200).json({status:'Success',message:'Data getted SuccessFully...!',data:data});
        }
    }
    catch(err)
    {
        res.status(500).json({status:'Failure',message:'oops! something went wrong',err: err});
    }
}
module.exports = {addCountry ,getAllCountry};

