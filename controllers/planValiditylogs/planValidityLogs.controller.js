const LmsPlanValidity = require("../../models/planvaliditylogs");
const { Sequelize, Op } = require('sequelize');
//  create route
const creatPlanValidity = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({ status: "Failure", message: "Bad request" });
    } else {
      req.body.phCreatedDate = Date.now();
      req.body.phIpAddress = req.connection.remoteAddress;
      req.body.phUserAgent = req.headers["user-agent"];
      req.body.phDeviceType = req.device.type;
      const data = await LmsPlanValidity.create(req.body);
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
      err: err,
    });
  }
};
const updatePlanValidity1 = async (req, res) => {
  try {
    if (!req.body || !req.params.id) {
      return res.status(400).json({ status: "Failure", message: "Bad request" });
    }

    const  id  = req.params.id

    // Check if the record exists
    const existingRecord = await LmsPlanValidity.findOne({
      where: { phCreatorId: id },
    });

    if (!existingRecord) {
      return res.status(404).json({ status: "Failure", message: "Record not found" });
    }

    // Update the record
    const updatedRecord = await existingRecord.update(req.body);

    res.status(200).json({
      status: "Success",
      message: "Data updated successfully",
      data: updatedRecord,
    });
  } catch (err) {
    res.status(500).json({
      status: "Failure",
      message: "Oops! Something went wrong",
      error: err,
    });
  }
};

const updatePlanValidity = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    // req.body.qusEditedDatetime = Date.now();
    // req.body.qusIpAddress = req.connection.remoteAddress;
    // req.body.qusUserAgent = req.headers["user-agent"];
    // req.body.qusDeviceType = req.device.type;

    const record = await LmsPlanValidity.findOne({
      where: { phCreatorId: id },
    });
    
    if (!record) {
      return res
        .status(404)
        .json({ status: "Failure", message: "Record not found" });
    }

    const updatedRecord = await record.update(data);

    res
      .status(200)
      .json({
        status: "Success",
        message: "Data Updated Successfully",
        data: updatedRecord,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "Failure",
        message: "Internal Server Error",
        err: error.message,
      });
  }
};


const getPlanValidity = async (req, res) => {
  try {
    const { count, rows: allData } = await LmsPlanValidity.findAndCountAll();

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

const getEndDateById = async (req, res) => {
  try {
    const id = req.params.id;
    const whereCondition = id ? { phPlanId: id } : {};
    const { count, rows: allData } = await LmsPlanValidity.findAndCountAll({
      attributes: ['phId', 'phPlanValidityTo'],
      where: whereCondition,
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
const getValidityPeriod = async (req, res) => {
  try {
    const id = req.params.id;
    const whereCondition = id ? { phPlanId: id } : {};
    
    const latestRecords = await LmsPlanValidity.findAll({
      attributes: [ 'phCreatorId', 'phValidityDays'],
      where: whereCondition,
      order: [['phCreatedDate', 'DESC']],
      group: ['phCreatorId'],
    });

    if (latestRecords.length === 0) {
      return res.status(404).json({ status: 'Failure', message: "No records found" });
    }

    res.status(200).json({
      status: 'Success',
      message: "All Data Retrieved Successfully",
      data: latestRecords,
      count: latestRecords.length,
    });
  } catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
  }
};
const getEndDate = async (req, res) => {
  try {
    const id = req.params.id;
    const whereCondition = id ? { phCreatorId: id } : {};
    
    const latestRecords = await LmsPlanValidity.findAll({
      attributes: [
        [Sequelize.fn('MAX', Sequelize.col('phPlanValidityTo')), 'maxPlanValidityTo'],
        'phCreatorId'
      ],
       where: whereCondition,
      group: ['phCreatorId'],
    });
//  where: whereCondition,
    if (latestRecords.length === 0) {
      return res.status(404).json({ status: 'Failure', message: latestRecords });
    }

    res.status(200).json({
      status: 'Success',
      message: "All Data Retrieved Successfully",
      data: latestRecords,
      count: latestRecords.length,
    });
  } catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
  }
};
const getPlanTypeInCreator = async (req, res) => {
  try {
    const phCreatorId = req.params.id;
    // const phCreatorId = 25; // Specify the desired phCreatorId

    const { count, rows: allData } = await LmsPlanValidity.findAndCountAll({
      attributes: ['phId','phPlanId','phCreatorId', 'phValidityDays','phPlanValidityFrom','phPlanValidityTo','phPlanValidityTo','phRenewalPlanId','phRenewalValidityDays','phRenewalPlanValidityFrom','phRenewalPlanValidityTo'],
      where: {
        phCreatorId: phCreatorId,
        // phPlanId: id, // Additional condition based on phPlanId if id is provided
      },
    });

    if (count === 0) {
      return res.status(404).json({ status: 'Failure', message: "No records found" });
    }

    res.status(200).json({
      status: 'Success',
      message: "Data Retrieved Successfully",
      data: allData[0], // Assuming you only want one record, access the first element
    });
  } catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
  }
};

module.exports = { creatPlanValidity,getPlanValidity,getEndDateById,getValidityPeriod,getEndDate,updatePlanValidity,getPlanTypeInCreator};