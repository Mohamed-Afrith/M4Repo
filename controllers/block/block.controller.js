const Block = require("../../models/blocks");

//  create route
const createBlocks = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({ status: "Failure", message: "Bad request" });
    } else {
      req.body.blockCreatedDatetime = Date.now();
      // req.body.plEditedDate = Date.now();
      req.body.blockDeleteStatus = "No";
      req.body.blockActiveStatus = "Yes";
      req.body.blockIpAddress = req.connection.remoteAddress;
      req.body.blockUserAgent = req.headers["user-agent"];
      req.body.blockDeviceType = req.device.type;

      const data = await Block.create(req.body);
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
const updateBlock = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    req.body.blockEditedDatetime = Date.now();
    req.body.blockIpAddress = req.connection.remoteAddress;
    req.body.blockUserAgent = req.headers["user-agent"];
    req.body.blockDeviceType = req.device.type;

    const record = await Block.findByPk(id);
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
const deleteBlock = async (req, res) => {
  try {
    const id = req.params.id;
    const data = { blockDeleteStatus: "YES" }; // Define the data to update plDeleteStatus
    const record = await Block.findByPk(id);
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

const getBlock = async (req, res) => {
  try {
    const { count, rows: allData } = await Block.findAndCountAll({
      where: {
        [Op.and]: [
          {
            blockDeleteStatus: {
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

const getBlockById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ status: "Failure", message: "Bad Request" });
    }

    // Fetch data for the specific item based on the provided ID
    const specificData = await Block.findByPk(id);

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
  createBlocks,
  updateBlock,
  getBlockById,
  getBlock,
  deleteBlock,
};
