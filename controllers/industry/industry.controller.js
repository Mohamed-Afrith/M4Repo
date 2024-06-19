const LmsIndustry = require("../../models/industry");
const addIndustry = async (req, res) => {
    try {
      const data= req.body;
      console.log(data);
      if (!data) {
        res.status(400).json({ status: "Failure", message: "Bad request" });
      } else {
        req.body.itCreatedDate = Date.now();
        req.body.itDeleteStatus = "NO"; 
        req.body.itIpAddress = req.connection.remoteAddress;
        req.body.itUserAgent = req.headers["user-agent"];
        req.body.itDeviceType = req.device.type;
        req.body.itStatus='Active';
        req.body.itTimeStamp= Date.now();

 

        
        const result = await LmsIndustry.create(data);
        res.status(200).json({
          status: "Success",
          message: "Data stored in the database",
          data: result,
        });
      }
      
    } catch (err) {
      console.error("Error in addlearner:", err.message); // Log the error for debugging
  
      res.status(500).json({
        status: "Failure",
        message: "Oops! Something went wrong",
        error: err || "Internal Server Error",
      });
    }
  };
  //  edit route
const updateIndustry = async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;
      req.body.itEditedDate = Date.now();

      const record = await LmsIndustry.findByPk(id);
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
  };
  
  // Example delete route
  const deleteIndustry = async (req, res) => {
    try {
      const id = req.params.id;
      const data = { itDeleteStatus: "YES" }; // Define the data to update plDeleteStatus
      const record = await LmsIndustry.findByPk(id);
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
  
  const { Op } = require("sequelize");
  
  const getIndustry = async (req, res) => {
    try {
      const { count, rows: allData } = await LmsIndustry.findAndCountAll({
        where: {
          [Op.and]: [
            {
                itDeleteStatus: {
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
  };
  
  const getIndustryById = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({ status:'Failure',message:'Bad Request'});
      }
  
      // Fetch data for the specific item based on the provided ID
      const specificData = await LmsIndustry.findByPk(id);
  
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
  const getIndustryName = async (req, res) => {
    try {
      const { count, rows: allData } = await LmsIndustry.findAndCountAll({
        attributes: ['itId', 'itIndustryName'], // Remove the extra space in 'chId'
        where: {
          [Op.and]: [
            {
              itDeleteStatus: {
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
        return res.status(404).json({ status: 'Failure', message: "No records found" });
      }
  
      res.status(200).json({
        status: 'Success',
        message: "All Data Retrieved Successfully",
        data: allData,
        count: count,
      });
    } catch (error) {
      res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
    }
  };
  const updateStatus = async (req, res) => {
    try {
      const id = req.params.id;
  
      if (!id) {
        return res.status(400).json({ status: 'Failure', message: "ID not provided" });
      }
  
      // Find the current status
      const existingRecord = await LmsIndustry.findByPk(id);
      
      if (!existingRecord) {
        return res.status(404).json({ status: 'Failure', message: "Record not found" });
      }
  
      // Toggle the status
      const newStatus = existingRecord.itStatus === 'Active' ? 'Inactive' : 'Active';
  
      // Update the status
      const updatedCount = await LmsIndustry.update(
        { itStatus: newStatus },
        { where: { itId: id } }
      );
  
      return res.status(200).json({ status: "Success", message: "Data Updated Successfully", data: { updatedCount, newStatus } });
    } catch (error) {
      res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
    }
  };

  module.exports = { addIndustry,getIndustryById,getIndustry,deleteIndustry,updateIndustry,getIndustryName,updateStatus};
