const LmsCategory = require("../../models/category");

const createCategory = async (req, res) => {
  try {
    const data= req.body;
    console.log(data);
    if (!data) {
      res.status(400).json({ status: "Failure", message: "Bad request" });
    } else {
      req.body.catCreatedDate = Date.now();
      // req.body.plEidtedDate = Date.now();
      req.body.itCreatedUserId = 1;
      req.body.catIpAddress = req.connection.remoteAddress;
      req.body.catUserAgent = req.headers["user-agent"];
      req.body.catDeviceType = req.device.type;
      req.body.catDeleteStatus= "NO";
      req.body.catStatus="Active";
      req.body.catTimeStamp= Date.now();


      // const newdata = await LmsCategory.create(data);
      const newData = await LmsCategory.create({
        catName: data.itCategoryName, // Assuming icategoryname is the column name for catName
        ctCreatedUserId: req.body.itCreatedUserId,
        catCreatedDate: req.body.catCreatedDate,
        catIpAddress: req.body.catIpAddress,
        catUserAgent: req.body.catUserAgent,
        catDeviceType: req.body.catDeviceType,
        catDeleteStatus: req.body.catDeleteStatus,
        catStatus: data.itStatus
      }
      );
      const sortedData = await LmsCategory.findAll({
        order: [['catId', 'DESC']]
      });
      
      res.status(200).json({
        status: "Success",
        message: "Data Stored into the DataBase",
        data: sortedData,
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
const getCategory = async (req, res) => {
  try {
    const data = await LmsCategory.findAll({
      where: {
        catDeleteStatus: "NO",
      },
    });
    if (data.length === 0) {
      res.status(404).json({ status: "Failure", message: "Bad request" });
    } else {
      res.status(200).json({
        status: "Success",
        message: "Data getted from the DataBase",
        data: data,
      });
    }
  } catch (err) {
    console.error('Error in getCategory:', err);
    res.status(500).json({
      status: "Failure",
      message: "Oops! Something went wrong",
      err: err.message, // or err.stack for the full stack trace
    });
  }
};
const getOneCategory = async (req, res) => {
  try {
    let id = req.params.id;
    if (!id) {
      res.status(404).json({ status: "Failure", message: "Bad request" });
    } else {
      const data = await LmsCategory.findByPk(id);
      if (data.length === 0) {
        res.status(404).json({ status: "Failure", message: "User Not Found" });
      } else {
        res.status(200).json({
          status: "Success",
          message: "Data getted from the DataBase",
          data: data,
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      status: "Failure",
      message: "oops! something went wrong",
      err: err,
    });
  }
};
const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    // req.body.itEditedDate = Date.now();
    const record = await LmsCategory.findByPk(id);
    if (!record) {
      return res.status(404).json({ status: "Failure", message: "Record not found" });
    } else {
      req.body.catCreatedDate = Date.now();
      // req.body.plEidtedDate = Date.now();
      req.body.itCreatedUserId = 1;
      req.body.catIpAddress = req.connection.remoteAddress;
      req.body.catUserAgent = req.headers["user-agent"];
      req.body.catDeviceType = req.device.type;
      req.body.catDeleteStatus = "NO";
      req.body.catStatus = "Active";
      req.body.catTimeStamp = Date.now();

      // Update the record using the update() method
      const [affectedRowsCount, affectedRows] = await LmsCategory.update({
        catName: data.itCategoryName, // Assuming 'icategoryname' is the column name for category name
        ctCreatedUserId: req.body.itCreatedUserId, // Assuming 'ctCreatedUserId' is the column name for created user ID
        catCreatedDate: req.body.catCreatedDate, // Assuming 'catCreatedDate' is the column name for created date
        catIpAddress: req.body.catIpAddress, // Assuming 'catIpAddress' is the column name for IP address
        catUserAgent: req.body.catUserAgent, // Assuming 'catUserAgent' is the column name for user agent
        catDeviceType: req.body.catDeviceType, // Assuming 'catDeviceType' is the column name for device type
        catDeleteStatus: req.body.catDeleteStatus, // Assuming 'catDeleteStatus' is the column name for delete status
        catStatus: data.itStatus // Assuming 'catStatus' is the column name for category status
        // Add other fields as necessary based on your schema
      }, {
        where: { catId: id } // Assuming 'id' is the primary key of the LmsCategory table
      });

      if (affectedRowsCount === 0) {
        return res.status(404).json({ status: "Failure", message: "Record not found" });
      }

      // Fetch the updated record to send it in the response
      const updatedRecord = await LmsCategory.findByPk(id);

      res.status(200).json({
        status: "Success",
        message: "Data Updated Successfully",
        data: updatedRecord
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error
    });
  }
};


const reomveCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const data = { catDeleteStatus: "YES" }; // Define the data to update plDeleteStatus
    const record = await LmsCategory.findByPk(id);
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
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error,
    });
  }
};
// const getCategoryList = async (req, res) => {
//   try {
//     let data = await LmsCategory.findAll({
//       attributes: [
//         ["catId", "id"],
//         ["catName", "CategoryName"],
//         ["catStatus","itStatus"]
//       ],
//       where: { catDeleteStatus: "NO" },
//       order: [["catId", "DESC"]] // Order by catId in descending order
//     });
//     if (data.length === 0) {
//       res.status(404).json({ status: "Failure", message: "Bad request" });
//     } else {
//       res.status(200).json({
//         status: "Success",
//         message: "Data getted from the DataBase",
//         data: data,
//       });
//     }
//   } catch (err) {
//     res.status(500).json({
//       status: "Failure",
//       message: "Oops! Something went wrong",
//       err: err,
//     });
//   }
// };


const getCategoryList = async (req, res) => {
  try {
    let data = await LmsCategory.findAll({
      attributes: [
        ["catId", "value"],
        ["catName", "label"],
      ],
      where: { catDeleteStatus: "NO" },
    });
    if (data.length === 0) {
      res.status(404).json({ status: "Failure", message: "Bad request" });
    } else {
      res.status(200).json({
        status: "Success",
        message: "Data getted from the DataBase",
        data: data,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "Failure",
      message: "Oops! Something went wrong",
      err: err,
    });
  }
};

const updatecatStatus = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ status: 'Failure', message: "ID not provided" });
    }

    // Find the current status
    const existingRecord = await LmsCategory.findByPk(id);
    
    if (!existingRecord) {
      return res.status(404).json({ status: 'Failure', message: "Record not found" });
    }

    // Toggle the status
    const newStatus = existingRecord.catStatus === 'Active' ? 'Inactive' : 'Active';

    // Update the status
    const updatedCount = await LmsCategory.update(
      { catStatus: newStatus },
      { where: { catId: id } }
    );

    return res.status(200).json({ status: "Success", message: "Data Updated Successfully", data: { updatedCount, newStatus } });
  } catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
  }
};
const CategoryDataGet = async (req, res) => {
    try {
        let data = await LmsCategory.findAll({
          attributes: [
            ["catId", "id"],
            ["catName", "CategoryName"],
            ["catStatus","itStatus"]
          ],
          where: { catDeleteStatus: "NO" },
          order: [["catId", "DESC"]] // Order by catId in descending order
        });
        if (data.length === 0) {
          res.status(404).json({ status: "Failure", message: "Bad request" });
        } else {
          res.status(200).json({
            status: "Success",
            message: "Data getted from the DataBase",
            data: data,
          });
        }
      } catch (err) {
        res.status(500).json({
          status: "Failure",
          message: "Oops! Something went wrong",
          err: err,
        });
      }
};


module.exports = {
  createCategory,
  getCategory,
  updateCategory,
  reomveCategory,
  getOneCategory,
  getCategoryList,
  updatecatStatus,
  CategoryDataGet
};
