const CompletionScreen = require("../../models/completionScreen");

const addCompleteScreen = async (req,res) => {
    try {
    const screens = req.body;
     console.log('screens',screens);
      if (!screens) return res.status(400).json({ status: "Failure", message: "Bad request" });
      const data = await CompletionScreen.bulkCreate(screens);
      return res.status(200).json({status: "Success",message: "Data Stored into the DataBase",data: data,});
    } catch (err) {
        return res.status(500).json({status: "Failure",message: "oops! something went wrong",err: err});
    }
}

module.exports = {addCompleteScreen};