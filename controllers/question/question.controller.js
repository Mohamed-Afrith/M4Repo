const Question = require("../../models/question");
const { Op } = require("sequelize");
const ReflectionQuestion = require("../../models/reflectionQuestions");
//  create route
const createQuestions = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({ status: "Failure", message: "Bad request" });
    } else {
      req.body.qusCreatedDatetime = Date.now();
      // req.body.plEditedDate = Date.now();
      req.body.qusDeleteStatus = "No";
      req.body.qusActiveStatus = "Yes";
      req.body.qusIpAddress = req.connection.remoteAddress;
      req.body.qusUserAgent = req.headers["user-agent"];
      req.body.qusDeviceType = req.device.type;

      const data = await Question.create(req.body);
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
const updateQUestion = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    req.body.qusEditedDatetime = Date.now();
    req.body.qusIpAddress = req.connection.remoteAddress;
    req.body.qusUserAgent = req.headers["user-agent"];
    req.body.qusDeviceType = req.device.type;

    const record = await Question.findByPk(id);
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
const deleteQUestion = async (req, res) => {
  try {
    const id = req.params.id;
    const data = { qusDeleteStatus: "YES" }; // Define the data to update plDeleteStatus
    const record = await Question.findByPk(id);
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


const getQUestion = async (req, res) => {
  try {
    const { count, rows: allData } = await Question.findAndCountAll({
      where: {
        [Op.and]: [
          {
            qusDeleteStatus: {
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

const getQUestionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ status: "Failure", message: "Bad Request" });
    }

    // Fetch data for the specific item based on the provided ID
    const specificData = await Question.findByPk(id);

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
const createReflection = async (req,res)=>{
  try{
     const refs = req.body;
     const user = req.user.user;
    let loopNumber=refs.gameReflectionQuestion;
const gameId=refs.gameId;
//added by nivetha
const translationId=refs.translationId;
console.log("receievedREFS",refs)
// nivetha end


let setrefkey = [];
     for (let i = 0; i < loopNumber; i++) {
  const checkref=await ReflectionQuestion.findOne({
    where: { refGameId: gameId,
      refKey:`ref${i+1}`,
    translationId:translationId //added by nivetha
   }
  });
     if(checkref){
        const updateref= await ReflectionQuestion.update(
          { refQuestion: refs.reflectionQuestions[`ref${i+1}`] },
          {
            where: {
              refGameId: gameId,refKey:`ref${i+1}`,
              translationId:translationId //added by nivetha
            },
          }
        );
     }else{
      const result = await ReflectionQuestion.create({
        refGameId: gameId,
        refQuestion : refs.reflectionQuestions[`ref${i+1}`],
        refKey:`ref${i+1}`,
        refCreatedUserId : user.id,
        refCreatedDatetime : Date.now(),
        refDeleteStatus : 'No',
        refActiveStatus : 'Yes',
        refIpAddress :  req.connection.remoteAddress,
        refUserAgent : req.headers["user-agent"],
        refDeviceType : req.device.type,
        translationId:translationId //added by nivetha
      });

     }
     setrefkey.push(`ref${i+1}`);
    
    }
    await ReflectionQuestion.update(
      { refDeleteStatus: 'NO' },
      {
        where: {
          refGameId: gameId,
          refKey: {
            [Op.in]: setrefkey ,
          },
        },
      }
    );

    const countaplNotIn = await ReflectionQuestion.count({
      where: {
        refGameId: gameId,
        refKey: {
          [Op.notIn]: setrefkey ,
        },
      },
    });
    
        if (countaplNotIn > 0) {
        await ReflectionQuestion.update(
          { refDeleteStatus: 'YES' },
          {
            where: {
              refGameId: gameId,
              refKey: {
                [Op.notIn]: setrefkey ,
              },
            },
          }
        );
        }

      
    
     
     return res.status(200).json({status:'Success',message:'Created Successfully',});
  }
  catch(err){
    return res.status(500).json({ error: "Internal Server Error", err: err.message });
  }
}
//getReflection
const getReflection = async (req, res) => {
  try {
    let id = req.params.id;
     //added by nivetha
     const translationId=req.body.translationId
     console.log("translationId",translationId)
     //nivetha end 
    let refdataObject = {};
    const refarray = [];
    const sendreflection = await ReflectionQuestion.findAll({
      where: {
        refGameId: id,
        refDeleteStatus: 'NO',
        translationId:translationId //added by nivetha
      },
      order: [['refKey', 'ASC']]
    });

    for (let i = 0; i < sendreflection.length; i++) {
      let value = {
        text: sendreflection[i].refQuestion,
        keyvalue: sendreflection[i].refKey,
      };
      refarray.push(value);
    }

    for (let i = 0; i < refarray.length; i++) {
      const row = refarray[i];
      refdataObject[row.keyvalue] = row.text;
    }

    return res.status(200).json({ status: "Success", data: refdataObject });
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error", err: err.message });
  }
}

module.exports = {
  createQuestions,
  updateQUestion,
  getQUestionById,
  getQUestion,
  deleteQUestion,
  createReflection,
  getReflection
};
