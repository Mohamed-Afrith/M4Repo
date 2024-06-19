const GameAssing = require("../../models/gameassinged");
const { Op } = require('sequelize');

const createAssign = async (req, res) => {
  try {
    const LoginUserRole = req.user.user.role;
    const LoginUserId = req.user.user.id;
    
  // return console.log('****************',req.body);
    if (!req.body) {
      res.status(400).json({ status: "Failure", message: "Bad request" });
    } else {
    

const learnerGroup = req.body.learnerId;


const countIN = await GameAssing.count({
    where: {
      gaLearnerId:{ [Op.in]: learnerGroup },
      gaGameId: req.body.gameid,
      
    },
  });
  

  if (countIN > 0) {
      await GameAssing.update(
        { gaDeleteStatus: 'NO' },
        {
          where: {
            gaLearnerId:{ [Op.in]: learnerGroup },
            gaGameId: req.body.gameid,
          },
        }
      );
    }

    const countNotIn = await GameAssing.count({
      where: {
        gaLearnerId:{ [Op.notIn]: learnerGroup },
        gaGameId: req.body.gameid,
       
      },
    });
    
    if (countNotIn > 0) {
      await GameAssing.update(
        { gaDeleteStatus: 'YES' },
        {
          where: {
            gaLearnerId:{ [Op.notIn]: learnerGroup },
            gaGameId: req.body.gameid,
          },
        }
      );
    }






      // Check if gameGroup is an array
      if (!Array.isArray(learnerGroup)) {
        res.status(400).json({ status: "Failure", message: "gameGroup must be an array" });
        return;
      }

      const data = []; // Declare an empty array

      for (let i = 0; i < learnerGroup.length; i++) {

        const instartdata = {}; // Create a new object in each iteration
        instartdata.gaGameId= req.body.gameid;
          instartdata.gaDate= Date.now();
          instartdata.gaCreatedDate= Date.now();
          instartdata.gaDeleteStatus= 'NO';
          instartdata.gaIpAddress= req.connection.remoteAddress;
          instartdata.gaUserAgent= req.headers["user-agent"];
          instartdata.gaDeviceType= req.device.type;
          instartdata.gaTimeStamp= Date.now();
          instartdata.gaCancelledDate=Date.now();
          instartdata.gaVolumeAdjust=1;
          instartdata.gaCreatedUserId=LoginUserId;
          instartdata.gaLearnerId=learnerGroup[i];
          instartdata.gaStatus='Active';

          const count = await GameAssing.count({
            where: {
              gaLearnerId: learnerGroup[i],
              gaGameId: req.body.gameid,
            },
          });
          // res.status(400).json({ status: "Failure", message: instartdata });
          if (count === 0) {

            const gameAssign = await GameAssing.create(instartdata);
            data.push(gameAssign); // Push the created record to the array
          }
      
      }




     
      res.status(200).json({
        status: "Success",
        message: "Data Stored into the DataBase",
        data: data,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "Failure",
      message: "oops! something went wrong",
      err: err.message,
    });
  }
};

const createAssign1 = async (req, res) => {
  try {
    
  // return console.log('****************',req.body);
    if (!req.body) {
      res.status(400).json({ status: "Failure", message: "Bad request" });
    } else {


const gameGroup = req.body.games;

// const gameGroupString = gameGroup.join(",");
const gamesString =req.body.gamesString
// const gameGroupJSON = JSON.parse(gamesString);
 

// Convert game IDs to numbers if necessary
// if (typeof gameGrouparray[0] === 'string') {
  //  gameGrouparrays = gamesString.map(key => parseInt(key));
// }
const countIN = await GameAssing.count({
    where: {
      gaGameId: { [Op.in]: gameGroup },
      gaLearnerId:req.body.data.gaLearnerId
    },
  });
  

  if (countIN > 0) {
      await GameAssing.update(
        { gaDeleteStatus: 'NO' },
        {
          where: {
            gaGameId: { [Op.in]: gameGroup },
            gaLearnerId: req.body.data.gaLearnerId,
          },
        }
      );
    }

    const countNotIn = await GameAssing.count({
      where: {
        gaGameId: { [Op.notIn]: gameGroup },
        gaLearnerId: req.body.data.gaLearnerId,
      },
    });
    
    if (countNotIn > 0) {
      await GameAssing.update(
        { gaDeleteStatus: 'YES' },
        {
          where: {
            gaGameId: { [Op.notIn]: gameGroup },
            gaLearnerId: req.body.data.gaLearnerId,
          },
        }
      );
    }






      // Check if gameGroup is an array
      if (!Array.isArray(gameGroup)) {
        res.status(400).json({ status: "Failure", message: "gameGroup must be an array" });
        return;
      }

      const data = []; // Declare an empty array

      for (let i = 0; i < gameGroup.length; i++) {

     
          req.body.data.gaGameId= gameGroup[i];
          req.body.data.gaCreatedDate= Date.now();
          req.body.data.gaDeleteStatus= 'NO';
          req.body.data.gaIpAddress= req.connection.remoteAddress;
          req.body.data.gaUserAgent= req.headers["user-agent"];
          req.body.data.gaDeviceType= req.device.type;
          req.body.data.gaTimeStamp= Date.now();
          req.body.data.gaCancelledDate=Date.now();
          req.body.data.gaVolumeAdjust=1;
          req.body.data.gaEditedDate=Date.now();
       
          const count = await GameAssing.count({
            where: {
              gaGameId: gameGroup[i],
              gaLearnerId: req.body.data.gaLearnerId,
            },
          });
    
          if (count === 0) {
            const gameAssign = await GameAssing.create(req.body.data);
            data.push(gameAssign); // Push the created record to the array
          }
      
      }




     
      res.status(200).json({
        status: "Success",
        message: "Data Stored into the DataBase",
        data: data,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "Failure",
      message: "oops! something went wrong",
      err: err.message,
    });
  }
};
const getAssign = async (req,res) => {
    try{
        let data = await GameAssing.findAll({attributes:['cpId','cpCompanyName','cpAdminName','cpAdminMail','cpCountry','cpStatus'],where:{cpDeleteStatus:'NO'}});
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
const getOneAssign = async (req,res) => {
    try {
        const { id } = req.params;
    
        if (!id) {
          return res.status(400).json({ status:'Failure',message:'Bad Request'});
        }
    
        // Fetch data for the specific item based on the provided ID
        // const specificData = await GameAssing.findByPk(id);
        const specificData = await GameAssing.findAll({attributes:['gaGameId'],
          where: {
            gaDeleteStatus:'NO',
            gaLearnerId:id,
          },
        });
        const gameIds = specificData.map(record => record.gaGameId);
        // return res.status(404).json({ error: specificData });
        if (!specificData) {
          return res.status(404).json({ error: "Record not found" });
        }
    
        res
          .status(200)
          .json({ status:'Success',message: "Data Retrieved Successfully", data: gameIds });
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error", err: error });
      }
}
const updateAssign = async (req,res) => {
    try {
      const id = req.params.id;
      const data = req.body;
  
      const record = await GameAssing.findByPk(id);
      if (!record) {
        return res.status(404).json({ status:'Failure',message: "Record not found" });
      }
  
      const updatedRecord = await record.update(data);
  
      res
        .status(200)
        .json({ status: "Success", message: "Data Updated Successfully", data: updatedRecord });
    } catch (error) {
      res.status(500).json({ status:'Failure', message: "Internal Server Error", err: error });
    }
}

const reomveAssign = async (req,res) => {
    try {
        const id = req.params.id;
        const data = { gaDeleteStatus: "YES" }; // Define the data to update gaDeleteStatus
        const record = await GameAssing.findByPk(id);
        if (!record) {
          return res.status(404).json({status:'Failure',message: "Record not found" });
        }
        const updatedRecord = await record.update(data);
        res.status(200).json({
          status:'Success',
          message: "Record Successfully Marked as Deleted",
          data: updatedRecord,
        });
      } catch (error) {
        res.status(500).json({ status:'Failure',message: "Internal Server Error", err: error });
      }
}
const getAssignList = async (req,res) => {
   
  try {
    const { count, rows: allData } = await GameAssing.findAndCountAll({
      where: {
        [Op.and]: [
          {
            gaDeleteStatus: {
              [Op.or]: {
                [Op.not]: "Yes",
                [Op.is]: null,
              },
            },
          },
        ],
      },
    });

    if (count === 0) {
      return res.status(404).json({ status:'Failure', message: "No records found" });
    }

    res.status(200).json({ status:'Success',
      message: "All Data Retrieved Successfully",
      data: allData,
      count: count,
    });
  } catch (error) {
    res.status(500).json({status:'Failure', message: "Internal Server Error", err: error });
  }
}

module.exports = { createAssign, getAssign, updateAssign, reomveAssign, getOneAssign, getAssignList };
