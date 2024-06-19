const LmsPlan = require("../../models/plan");
const LmsSubscriptionPlan = require("../../models/subscriptionvalidityplans");

const createplan = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({ status: "Failure", message: "Bad request" });
    } else {
      req.body.plCreatedDate = Date.now();
      req.body.plDeleteStatus = 'NO';
      req.body.plIpAdderss = req.connection.remoteAddress;
      req.body.plUserAgent = req.headers["user-agent"];
      req.body.plDeviceType = req.device.type;
       req.body.plCreatedUserId=req.user.user.id;
            // req.body.plCreatedUserId=2;

      req.body.plTimeStamp = Date.now();
      const data = await LmsPlan.create(req.body);
      res.status(200).json({
        status: "Success",
        message: "Data Stored into the DataBase",
        data: data,
      });
    }
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      console.error("Validation error:", err.errors);
      res.status(400).json({
        status: "Failure",
        message: "Validation error",
        errors: err.errors,
      });
    } else {
      console.error("Error creating LmsSubscriptionPlan:", err);
      res.status(500).json({
        status: "Failure",
        message: "Oops! Something went wrong",
        err: err.message,
      });
    }
  }
  
};
//  edit route
const updatePlan = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    req.body.plEditedUserId=2;
      req.body.plEditedDate = Date.now();

    const record = await LmsPlan.findByPk(id);
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
const deletePlan = async (req, res) => {
  try {
    const id = req.params.id;
    const data = { plDeleteStatus: "YES" }; // Define the data to update plDeleteStatus
    const record = await LmsPlan.findByPk(id);
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

const getPlan = async (req, res) => {
  try {
    const { count, rows: allData } = await LmsPlan.findAndCountAll({
      where: {
        [Op.and]: [
          {
            plDeleteStatus: {
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

const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ status: 'Failure', message: 'Bad Request' });
    }

    // Fetch data for the specific item based on the provided ID
    const specificData = await LmsSubscriptionPlan.findAll({
      where: {
        psId: id,
      },
      include: [
        {
          model: LmsPlan,
          as: 'someAlias', // Make sure to use the correct alias you defined in the association
          where: {
            plId:psPlanId
          },
        },
      ],
    });
    
    if (specificData && specificData.length > 0) {
      // Data found based on the conditions
      console.log(specificData.map(data => data.toJSON()));
    } else {
      // No data found based on the conditions
      console.log('Data not found');
    }
    

    res.status(200).json({ status: 'Success', message: "Data Retrieved Successfully", data: specificData });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
  }
};


const getPlanName = async (req, res) => {
  try {
    const { count, rows: allData } = await LmsPlan.findAndCountAll({
      attributes: ['plId', 'plPlanName'], // Remove the extra space in 'chId'
      where: {
        [Op.and]: [
          {
            plDeleteStatus: {
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
module.exports = { createplan, updatePlan, deletePlan, getPlan, getPlanById ,getPlanName};
