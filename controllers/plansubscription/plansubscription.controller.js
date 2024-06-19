const LmsSubscriptionPlan = require("../../models/subscriptionvalidityplans");
const Sequelize = require('sequelize');
const LmsPlan = require("../../models/plan");
//  create route
const createplansubscription = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({ status: "Failure", message: "Bad request" });
    } else {
      req.body.psCreatedDate = Date.now();
      req.body.psDeleteStatus = "NO";
      req.body.psIpAdderss = req.connection.remoteAddress;
      req.body.psUserAgent = req.headers["user-agent"];
      req.body.psDeviceType = req.device.type;
      req.body.psCreatedUserId = 2;
      req.body.psTimeStamp = Date.now();
      const data = await LmsSubscriptionPlan.create(req.body);
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

const updateplansubscription = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    req.body.psEditedUserId = 2;
    req.body.psEditedDate = Date.now();

    const record = await LmsSubscriptionPlan.findByPk(id);
    if (!record) {
      return res
        .status(404)
        .json({ status: "Failure", message: "Record not found" });
    }

    const updatedRecord = await record.update(data);

    res.status(200).json({
      status: "Success",
      message: "Data Updated Successfully",
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

// const getSubscriptionPlanById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({ status: 'Failure', message: 'Bad Request' });
//     }

//     // Fetch data for the specific item based on the provided psPlanId
//     const specificData = await LmsSubscriptionPlan.findAll({
//       where: { psPlanId: id },
//     });

//     if (!specificData) {
//       return res.status(404).json({ status: 'Failure', message: 'Record not found' });
//     }

//     res.status(200).json({ status: 'Success', message: 'Data Retrieved Successfully', data: specificData });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ status: 'Failure', message: 'Internal Server Error', error: error.message });
//   }
// };
// const LmsPlan = require("../../models/plan");
// const { Op } = require('sequelize');

const { Op } = require('sequelize');


const getSubscriptionPlanById1 = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ status: 'Failure', message: 'Bad Request' });
    }

    // Fetch data for the specific item based on the provided ID
    const specificData = await LmsSubscriptionPlan.findAll({
      attributes: ['psId', 'psPlanId', 'psPlanType', 'psPrice',  'psStatus', 'psDeleteStatus', 'psIpAdderss', 'psDeviceType', 'psUserAgent', 'psPlanDuration'],
      where: {
        psId: id,
      },
      include: [
        {
          model: LmsPlan,
          as: 'someAlias', // Make sure to use the correct alias you defined in the association
          attributes: ['plId','plStatus', 'plDeleteStatus', 'plPlanName', 'plMaxLearner', 'plMaxGame', 'plMaxBackgrounds', 'plMaxCharacters', 'plMaxAnalyticsDashboard', 'plMAxGameHours'],
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
const getSubscriptionPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ status: 'Failure', message: 'Bad Request' });
    }

    // Fetch data for the specific item based on the provided ID
    const specificData = await LmsPlan.findAll({
     
      where: {
        plId: id,
      },
      include: [
        {
          model: LmsSubscriptionPlan,
          as: 'someAlias', // Make sure to use the correct alias you defined in the association
          // attributes: ['plId','plStatus', 'plDeleteStatus', 'plPlanName', 'plMaxLearner', 'plMaxGame', 'plMaxBackgrounds', 'plMaxCharacters', 'plMaxAnalyticsDashboard', 'plMAxGameHours'],
				  
																		
								 
			
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

const getSubscriptionPlan1 = async (req, res) => {
  try {
    // Fetch all data without any specific condition

    const data=req.body;
     
    const allData = await LmsSubscriptionPlan.findAll({
      attributes: ['psId', 'psPlanId', 'psPlanType', 'psPrice', 'psStatus', 'psDeleteStatus', 'psIpAdderss', 'psDeviceType', 'psUserAgent', 'psPlanDuration'],
      include: [
        {
          model: LmsPlan,
          as: 'someAlias', // Make sure to use the correct alias you defined in the association
          attributes: ['plId', 'plStatus', 'plDeleteStatus', 'plPlanName', 'plMaxLearner', 'plMaxGame', 'plMaxBackgrounds', 'plMaxCharacters', 'plMaxAnalyticsDashboard', 'plMAxGameHours'],
        },
      ],

      where: {

      ...(data.planId
        ? { '$someAlias.plId$' : data.planId }
        : {}),
        
        ...(data.psPlanType
          ? { psPlanType: data.psPlanType }
          : {}),
        },
    });

    if (allData && allData.length > 0) {
      // Data found based on the conditions
      console.log(allData.map(data => data.toJSON()));
    } else {
      // No data found based on the conditions
      console.log('Data not found');
    }

    res.status(200).json({ status: 'Success', message: "Data Retrieved Successfully", data: allData });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
  }
};
const getSubscriptionPlan = async (req, res) => {
  try {
    const data = req.body;

    const allData = await LmsPlan.findAll({
      // attributes: ['plId'],
      include: [
        {
          model: LmsSubscriptionPlan,
          as: 'someAlias', // Make sure to use the correct alias you defined in the association
          // attributes: ['psId', 'psPlanId', 'psPlanType'],
          where: {
            ...(data.psPlanType ? { psPlanType: data.psPlanType } : {}),
            psdeletestatus: 'NO',
          },
        },
      ],
      where: {
        ...(data.planId ? { plId: data.planId } : {}),
        pldeletestatus: 'NO',
      },
    });

    if (allData && allData.length > 0) {
      // Data found based on the conditions
      console.log(allData.map(data => data.toJSON()));
      res.status(200).json({ status: 'Success', message: 'Data Retrieved Successfully', data: allData });
    } else {
      // No data found based on the conditions
      console.log('Data not found');
      res.status(404).json({ status: 'Failure', message: 'Data not found' });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ status: 'Failure', message: 'Internal Server Error', err: error.message });
  }
};

const getPlanType = async (req, res) => {
  const { id } = req.params; // Assuming the ID is passed in the request parameters

  try {
    // Fetch all data with a left join and group by clause
    const allData = await LmsSubscriptionPlan.findAll({
      attributes: [
        'psPlanType',"psPlanDuration",
        // [Sequelize.fn('GROUP_CONCAT', Sequelize.literal('DISTINCT psPlanId')), 'psPlanId'],
        // [Sequelize.fn('GROUP_CONCAT', Sequelize.literal('DISTINCT plId')), 'plId'],
      ],
      include: [
        {
          model: LmsPlan,
          as: 'someAlias', // Make sure to use the correct alias you defined in the association
          attributes: [],
        },
      ],
      where: {
        psPlanId: id, // Use the dynamic ID from the request parameters
      }
      // group: ['psPlanType'], // Add your desired group by columns to this array
    });

    if (allData && allData.length > 0) {
      // Data found based on the conditions
      console.log(allData.map((data) => data.toJSON()));
    } else {
      // No data found based on the conditions
      console.log('Data not found');
    }

    res.status(200).json({ status: 'Success', message: 'Data Retrieved Successfully', data: allData });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ status: 'Failure', message: 'Internal Server Error', err: error.message });
  }
};
const deletePlanValidity = async (req, res) => {
  try {
    const id = req.params.id;
    const data = { psDeleteStatus: "YES" }; // Define the data to update plDeleteStatus
    const record = await LmsSubscriptionPlan.findByPk(id);
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


module.exports = { deletePlanValidity,createplansubscription, updateplansubscription,getSubscriptionPlanById,getSubscriptionPlanById1,getSubscriptionPlan,getPlanType,getSubscriptionPlan1};
