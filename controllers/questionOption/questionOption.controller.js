const Questionoption = require("../../models/questionOptions");

//  create route
const createQuesOption = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({ status: "Failure", message: "Bad request" });
    } else {
      req.body.qpCreatedDatetime = Date.now();
      // req.body.plEditedDate = Date.now();
      req.body.qpDeleteStatus = "No";
      req.body.qpActiveStatus = "Yes";
      req.body.qpIpAddress = req.connection.remoteAddress;
      req.body.qpUserAgent = req.headers["user-agent"];
      req.body.qpDeviceType = req.device.type;

      const data = await Questionoption.create(req.body);
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

//  edit route
const updateQuesOption = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    req.body.qpEditedDatetime = Date.now();
    req.body.qpIpAddress = req.connection.remoteAddress;
    req.body.qpUserAgent = req.headers["user-agent"];
    req.body.qpDeviceType = req.device.type;

    const record = await Questionoption.findByPk(id);
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
        err: error,
      });
  }
};

// Example delete route
const deleteQuesOption = async (req, res) => {
  try {
    const id = req.params.id;
    const data = { qpDeleteStatus: "YES" }; // Define the data to update plDeleteStatus
    const record = await Questionoption.findByPk(id);
    if (!record) {
      return res
        .status(404)
        .json({ status: "Failure", message: "Record not found" });
    }
    const updatedRecord = await record.update(data);
    res.status(200).json({
      status: "Success",
      message: "Record Successfully Marked as Deleted",
      data: updatedRecord,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "Failure",
        message: "Internal Server Error",
        err: error,
      });
  }
};

const { Op } = require("sequelize");

const getQuesOption = async (req, res) => {
  try {
    const { count, rows: allData } = await Questionoption.findAndCountAll({
      where: {
        [Op.and]: [
          {
            qpDeleteStatus: {
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
      return res
        .status(404)
        .json({ status: "Failure", message: "No records found" });
    }

    res
      .status(200)
      .json({
        status: "Success",
        message: "All Data Retrieved Successfully",
        data: allData,
        count: count,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "Failure",
        message: "Internal Server Error",
        err: error,
      });
  }
};

const getQuesOptionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ status: "Failure", message: "Bad Request" });
    }

    // Fetch data for the specific item based on the provided ID
    const specificData = await Questionoption.findByPk(id);

    if (!specificData) {
      return res.status(404).json({ error: "Record not found" });
    }

    res
      .status(200)
      .json({
        status: "Success",
        message: "Data Retrieved Successfully",
        data: specificData,
      });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", err: error });
  }
};

module.exports = {
  createQuesOption,
  updateQuesOption,
  getQuesOption,
  getQuesOptionById,
  deleteQuesOption,
};
