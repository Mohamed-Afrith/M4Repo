const { generateToken } = require("../../lib/authentication/auth");
const { Sequelize, Op, where } = require('sequelize');
const transporter = require("../../lib/mails/mailService");
const { adminRegisterSchema, adminLoginSchema } = require("../../lib/validation/admin.validation");
const ReflectionAnswer = require("../../models/reflectionanswer");
const bcrypt = require('bcrypt');

const sequelize = require("../../lib/config/database");

const Activity =require("../../models/gameActivityLog")

const getReflectionAnswer = async (req, res) => {
    try {
      const data = req.body;
      const gameId = data.gameId;
      const questNo = data.questNo;
      const learnerId = req.user.user.id;
      const answers = data.answers;
      const gameMode = data.refansGameMode;
  
      const collectdata = [];
      // Using Promise.all to wait for all asynchronous operations to complete
      await Promise.all(answers.map(async (key, index) => {
        const storeAnswer = await ReflectionAnswer.create({
          refansLeanerId: learnerId,
          refansGameId: gameId,
          refansQuestNo: questNo,
          refansQuesId: key.refid,
          refansAnswer: key.ans,
          refansGameMode: gameMode,
          refansDeleteStatus: 'No',
          refansIpAddress: req.connection.remoteAddress,
          refansDeviceType: req.device.type, 
          refansUserAgent: req.headers["user-agent"],
          refansCreatedDate: Date.now(),
        });
        collectdata.push(key.ans);
      }));
  
      // Check if all answers are successfully stored
      if (answers.length === collectdata.length) {
        return res.status(200).json({ status: 'Success', message: collectdata });
      } else {
        return res.status(500).json({ status: 'Failure', message: collectdata });
      }
  
    } catch (error) {
      return res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error.message });
    }
  }
  


 


module.exports = { getReflectionAnswer }