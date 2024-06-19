const express = require('express');
const router = express.Router();
const axios = require('axios');
const Country = require("../../models/country");

const geoLocation = async (req,res,next) =>{
    try {

    // const ipAddress = req.ip || req.socket.remoteAddress;
    const ipAddress = await axios.get('https://api64.ipify.org?format=json');
    const response = await axios.get(`https://ipinfo.io/${ipAddress.data.ip}/json`);
    const locationData = response.data;
    
    if(!locationData)
    {
        res.status(404).json({status: "Failure", message: "geoLocation Not Found"});
    }else{
        console.log('data',locationData);
        const id = locationData.country;
        console.log('id',id);
        let countryData  = await Country.findAll({
            attributes: ['id'],
            where: { countryCode: id },
        });

        res.status(200).json({status: "Success",message: "Data getted from geoLocation",data: countryData });
    }
   
        
    } catch (error) {
        res.status(500).json({status:' Failure',message:'cannot get geo location',error:error.message});
    }
    
};

router.get('/geoLocation',geoLocation);

module.exports = router;