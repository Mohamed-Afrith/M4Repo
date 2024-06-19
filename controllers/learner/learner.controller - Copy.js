
const LmsLearner = require("../../models/learner");
const Creator =require("../../models/Creator")

const { Sequelize, DataTypes, Op } = require('sequelize');
//  create route
const addlearner = async (req, res) => {
    try {
      const data= req.body;
      if (!data) {
        res.status(400).json({ status: "Failure", message: "Bad request" });
      } else {
       
        const defaultData = data.defaultData || {}; // Handle the case when defaultData is not provided

        // Set default values for the fields if they are empty
        defaultData.lenDeleteStatus = defaultData.lenDeleteStatus || "NO";
        defaultData.lenIpAddress = defaultData.lenIpAddress || req.connection.remoteAddress;
        defaultData.lenUserAgent = defaultData.lenUserAgent || req.headers["user-agent"];
        defaultData.lenDeviceType = defaultData.lenDeviceType || req.device.type;
        defaultData.lenCreatedDate = defaultData.lenCreatedDate || Date.now();
        defaultData.lenStatus = defaultData.lenStatus ||'Active';
        const learnerDataObject = data.learnerData;
   
        if (typeof learnerDataObject === 'object' && learnerDataObject !== null) {
          const results = []; // Array to store results

          for (const key in learnerDataObject) {
            if (learnerDataObject.hasOwnProperty(key)) {
              // Access the value for the current key
              const value = learnerDataObject[key];
          
              // Check if value.lenGender is an object and replace it with an empty string
              if (value && typeof value.lenGender === 'object') {
                value.lenGender = '';
              }
          
              const mergedData = { ...defaultData, ...value };
          
              try {
                // Perform LmsLearner.create and store the result in the array
                const result = await LmsLearner.create(mergedData);
                results.push(result.lenId);
              } catch (error) {
                console.error('Error creating learner data:', error);
                // Handle the error, e.g., return an error response
                res.status(500).json({ error: error.message });
                return;
              }
            }
          }
          
         
          
          res.status(200).json({
            status: "Success",
            message: "Data stored in the database",
            data: results,
          });
          // Respond with success after all iterations
         
        } else {
          // If learnerDataObject is not an object
          res.status(500).json({
            status: "Failure",
            message: "Oops! Something went wrong",
            error: err || "Internal Server Error",
          });
        }

       
      }
      
    } catch (err) {
      console.error("Error in addlearner:", err.message); // Log the error for debugging
  
      res.status(500).json({
        status: "Failure",
        message: "Oops! Something went wrong",
        error:error.message,
      });
    }
  };
  const updatelearner = async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;
  
      const record = await LmsLearner.findByPk(id);
      if (!record) {
        return res.status(404).json({ status:'Failure',message: "Record not found" });
      }
      // const existingLearner = await LmsLearner.findOne({ lenMail: data.lenMail });
      // if (existingLearner) {
      //     return res.status(400).json({ status: "MailFailure", message: "Email already exists" });
      // }
      const updatedRecord = await record.update(data);
  
      res
        .status(200)
        .json({ status: "Success", message: "Data Updated Successfully", data: updatedRecord });
    } catch (error) {
      res.status(500).json({ status:'Failure', message: "Internal Server Error", err: error });
    }
  };
  const deletelearner = async (req, res) => {
    try {
      const id = req.params.id;
      const data = { lenDeleteStatus: "YES" }; // Define the data to update plDeleteStatus
      const record = await LmsLearner.findByPk(id);
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
  };
  const getlearner = async (req, res) => {
    try {
      
      const { count, rows: allData } = await LmsLearner.findAndCountAll({
        include: [
          {
            model: Creator,
            as: 'creator',
            attributes: ['ctName'],
            required: false,
          }
        ],
        order: [
          ['lenId', 'ASC'], // Sort the results by `lenLearnerId` in ascending order
        ],
        where: {
          [Op.and]: [
            {
              lenDeleteStatus: {
                [Op.or]: {
                  [Op.not]: "Yes",
                  [Op.is]: null,
                },
              },
            },
          ],
           lenCreatedUserId :req.user.user.id,

        },
        
      });
    
      if (count === 0) {
        return res.status(404).json({ status: 'Failure', message: "No records found" });
      }
    
      res.status(200).json({
        status: 'Success',
        message: "All Data Retrieved Successfully",
        data: allData,
        count: count,
      });
    } catch (error) {
      res.status(500).json({ status: 'Failure', message: "Internal Server Error", error: error.message });
    }
    };
    
  
  const getlearnerById = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({ status:'Failure',message:'Bad Request'});
      }
  
      // Fetch data for the specific item based on the provided ID
      const specificData = await LmsLearner.findByPk(id);
  
      if (!specificData) {
        return res.status(404).json({ error: "Record not found" });
      }
  
      res
        .status(200)
        .json({ status:'Success',message: "Data Retrieved Successfully", data: specificData });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error", err: error });
    }
  };
  const updateStatus = async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;
  
      // const record = await LmsLearner.findByPk(id);
      if (!data && !id) {
        return res.status(404).json({ status: 'Failure', message: "Record not found" });
      }
  
      const updatedCount = await LmsLearner.update(
        { lenStatus: data.lenStatus }, // Set the field and its value to update
        { where: { lenId: id } } // Define the condition to match the record
      );
      return res.status(200).json({ status: "Success", message: "Data Updated Successfully", data: updatedCount });
      // if (updatedCount > 0) {
      //   // If at least one record was updated
      //   const updatedRecord = await LmsLearner.findByPk(id);
      //   return res.status(200).json({ status: "Success", message: "Data Updated Successfully", data: updatedRecord });
      // } else {
      //   return res.status(404).json({ status: 'Failure', message: "Record not found" });
      // }
    } catch (error) {
      res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
    }
  };
  
  
  module.exports = { addlearner ,updatelearner,deletelearner,getlearner,getlearnerById,updateStatus};
  