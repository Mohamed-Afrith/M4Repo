const LmsPlanValidity = require("../../models/planvalidity");
const { Sequelize, Op } = require('sequelize');
//  create route
const creatPlanValidity = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({ status: "Failure", message: "Bad request" });
    } else {
      req.body.phCreatedDate = Date.now();
      // req.body.plEditedDate = Date.now();
    //   req.body.plDeleteStatus = 'NO';
      req.body.phIpAddress = req.connection.remoteAddress;
      req.body.phUserAgent = req.headers["user-agent"];
      req.body.phDeviceType = req.device.type;
    //   req.body.plCreatedUserId=2;
    //   req.body.plTimeStamp = Date.now();
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
module.exports = { creatPlanValidity,getPlanValidity,getEndDateById,getValidityPeriod,getEndDate};