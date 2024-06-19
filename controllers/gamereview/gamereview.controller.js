const LmsGame = require("../../models/game");
const { Sequelize, Op } = require("sequelize");
const LmsBlocks = require("../../models/blocks");
const GameReviewers = require("../../models/gameReviewers");
const GameReviews = require("../../models/gameReviews");
const ReviewersGame = require("../../models/reviewersGame");
const Creators = require("../../models/Creator");
const { validateEmail } = require("../../common/common");
const { v4: uuidv4 } = require("uuid");
const gamecontroller = require('../../controllers/game/game.controller');

const handlebars = require("handlebars");
const fs = require("fs");
const transporter = require("../../lib/mails/mailService");
const { sendMail } = require("../../lib/mails/mailFunctions");

/**
 * addGameReviewers()
 * @param {*} req.body =>{"data" : {
*"creatorIds": [2,3,4,5] ,
*"emailIds" : ["rama@gamail.com", "testyht@gmail.com"],
*"activeStatus": "YES",
*"gameId" : 1
}
*/

const addGameReviewers = async (req, res) => {
  try{
  if (!req.body) {
    return res
      .status(400)
      .json({ status: "Failure", message: "Bad request11" });
  }
  if (req.body?.data) {
    //default values
    const reqData = req.body.data;

    const result = [];
    //if it has creator Ids,
    for (const cId of reqData?.creatorIds || []) {
      //to check the existence of an creator as a reviewer in gameReviewer Table, if exists then the gameId if current request and existing reviewGameId in gameReview

      const getReviewerIdCreator = await GameReviewers.findOne({
        attributes: ["gameReviewerId"],
        where: { creatorId: { [Op.eq]: cId } },
      });
      const creatorEmailId = await Creators.findOne({
        where: {
          ctId: { [Op.eq]: cId },
          ctDeleteStatus: { [Op.eq]: "NO" },
          ctStatus: { [Op.eq]: "Active" },
        },
        attributes: ["ctMail"],
      });

      /** creatorEmailId is null if creator is not active or deleted */
      if (!creatorEmailId) {
        result.push({
          creatorId: cId,
          emailId: null,
          ReviewerId: null,
          gameReviewId: null,
          message: "This Creator Not had Email address or not In Active",
          gameUuid: null,
        });
        continue;
      }
      //Is the Creator already exist in reviewer table.
      if (getReviewerIdCreator?.gameReviewerId) {
        const getReviewersGame = await ReviewersGame.findOne({
          where: {
            gameId: { [Op.eq]: reqData.gameId },
            reviewerId: { [Op.eq]: getReviewerIdCreator?.gameReviewerId },
          },
        });
        const insertData = {
          gameUuid: uuidv4(),
          gameId: reqData.gameId,
          reviewerId: getReviewerIdCreator?.gameReviewerId,
        };

        if (!getReviewersGame) {
          const insertReviewersGames = await ReviewersGame.create(insertData);
        }

        const reviewerGameId = await GameReviews.findOne({
          where: {
            gameReviewerId: { [Op.eq]: getReviewerIdCreator?.gameReviewerId },
            reviewGameId: { [Op.eq]: reqData.gameId },
          },
        });

        //Is the Creator already exist then already a reviewer for the game.
        if (reviewerGameId) {
          getReviewersGame.update({ mailStatus: "queued" });
          result.push({
            creatorId: cId,
            emailId: creatorEmailId?.ctMail,
            ReviewerId: getReviewerIdCreator?.gameReviewerId,
            gameReviewId: reviewerGameId.reviewId,
            message: "Creator Already a Reviewer for this Game",
            gameUuid: getReviewersGame.gameUuid,
          });
          continue;
        } else {
          const insertrReviewData = {
            gameReviewerId: getReviewerIdCreator.gameReviewerId,
            reviewGameId: parseInt(reqData.gameId),
          };
          const gameReview = await GameReviews.create(insertrReviewData);
          result.push({
            creatorId: cId,
            emailId: creatorEmailId?.ctMail,
            ReviewerId: getReviewerIdCreator.gameReviewerId,
            gameReviewId: gameReview.reviewId,
            message: "Creator is already a Reviewer, So Added for this Game",
            gameUuid: insertData.gameUuid,
          });
          continue;
        }
      }

      const insertReviewerData = {
        creatorId: cId,
        activeStatus: reqData.activeStatus || "YES",
        // reviewerUuid: uuidv4(),
        reviewerIpAddress: req.connection.remoteAddress,
        reviewerUserAgent: req.headers["user-agent"],
        reviewerDeviceType: req.device.type,
        createdBy: req?.user?.user?.id,
        createdAt: Date.now(),
      };

      const gameReviewer = await GameReviewers.create(insertReviewerData);

      if (gameReviewer.gameReviewerId && reqData.gameId) {
        const insertrReviewData = {
          gameReviewerId: gameReviewer.gameReviewerId,
          reviewGameId: parseInt(reqData.gameId),
        };

        const NewInsertreviewerData = {
          gameUuid: uuidv4(),
          gameId: reqData.gameId,
          reviewerId: gameReviewer?.gameReviewerId,
        };
        const NewInsertReviewersGames = await ReviewersGame.create(
          NewInsertreviewerData
        );

        const gameReview = await GameReviews.create(insertrReviewData);
        result.push({
          creatorId: cId,
          emailId: creatorEmailId?.ctMail,
          ReviewerId: gameReviewer.gameReviewerId,
          gameReviewId: gameReview.reviewId,
          message: "Creator is added as Reviewer for this Game",
          gameUuid: NewInsertreviewerData.gameUuid,
        });
      }
    }

    //For Emailids
    for (const eId of reqData?.emailIds || []) {
      /** Validate Email Id */
      if (!validateEmail(eId)) {
        result.push({
          emailId: eId,
          ReviewerId: null,
          gameReviewId: null,
          message: "Invalid Email Id",
          gameUuid: null,
        });
        continue;
      }

      const getReviewerIdEmail = await GameReviewers.findOne({
        attributes: ["gameReviewerId"],
        where: { emailId: { [Op.eq]: eId } },
      });
      /** CHeck the current Email id is already a reviewer for the game */
      if (getReviewerIdEmail?.gameReviewerId) {
        const reviewerGameIdEmail = await GameReviews.findOne({
          where: {
            gameReviewerId: { [Op.eq]: getReviewerIdEmail?.gameReviewerId },
            reviewGameId: { [Op.eq]: reqData.gameId },
          },
        });
        if (reviewerGameIdEmail) {
          const getUuidForEmail = await ReviewersGame.findOne({
            where: {
              reviewerId: { [Op.eq]: getReviewerIdEmail?.gameReviewerId },
              gameId: { [Op.eq]: reqData.gameId },
            },
          });

          result.push({
            emailId: eId,
            ReviewerId: getReviewerIdEmail?.gameReviewerId,
            gameReviewId: reviewerGameIdEmail.reviewId,
            message: "Email Id Already a Reviewer for this Game",
            gameUuid: getUuidForEmail?.gameUuid,
          });
          continue;
        } else {
          const insertrReviewData = {
            gameReviewerId: getReviewerIdEmail.gameReviewerId,
            reviewGameId: parseInt(reqData.gameId),
          };
          const gameReview = await GameReviews.create(insertrReviewData);

          const InsertreviewerEmailIdData = {
            gameUuid: uuidv4(),
            gameId: reqData.gameId,
            reviewerId: getReviewerIdEmail?.gameReviewerId,
          };
          const InsertReviewersGamesEmail = await ReviewersGame.create(
            InsertreviewerEmailIdData
          );
          result.push({
            emailId: eId,
            ReviewerId: getReviewerIdEmail.gameReviewerId,
            gameReviewId: gameReview.reviewId,
            message: "Email ID is already a Reviewer ,So Added for this Game",
            gameUuid: InsertreviewerEmailIdData.gameUuid,
          });
          continue;
        }
      }
      
      const insertReviewerData = {
        emailId: eId,
        activeStatus: reqData.activeStatus || "YES",
        // reviewerUuid: uuidv4(),
        reviewerIpAddress: req.connection.remoteAddress,
        reviewerUserAgent: req.headers["user-agent"],
        reviewerDeviceType: req.device.type,
        createdBy: req?.user?.user?.id,
        createdAt: Date.now(),
      };
      const gameReviewer = await GameReviewers.create(insertReviewerData);
      if (gameReviewer.gameReviewerId && reqData.gameId) {
        const insertrReviewData = {
          gameReviewerId: gameReviewer.gameReviewerId,
          reviewGameId: parseInt(reqData.gameId),
        };

        const NewInsertreviewerEmailIdData = {
          gameUuid: uuidv4(),
          gameId: reqData.gameId,
          reviewerId: gameReviewer?.gameReviewerId,
        };
        const NewInsertReviewersGamesEmail = await ReviewersGame.create(
          NewInsertreviewerEmailIdData
        );

        const gameReview = await GameReviews.create(insertrReviewData);

        result.push({
          emailId: eId,
          ReviewerId: gameReviewer.gameReviewerId,
          gameReviewId: gameReview.reviewId,
          message: "Email ID is added as Reviewer for this Game",
          gameUuid: NewInsertreviewerEmailIdData.gameUuid,
        });
      }
    }
    let url =`${req.get("Origin")}/game/demoplay/`;
    console.log("***url",url)
    sendReviewInvitationMails(result, url);

    return res.status(200).json({
      status: "Success",
      message: "Stored Successfully",
      result: result,
    });
  }
  }catch(error){
    res
    .status(500)
    .json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};

/**
 * addGameReview()
 *@param req.body.data={
 * reviewerId: id,
 * reviewGameId: gameid,
 * tabId: {1-5}
 * tabAttribute: ENUM(['blockSeqId','screenId', 'filedName']) | null for background & characters
 * tabAttributeValue: tabAttribute == blockSeqId => "2.1" |  screenId => [0: "Completion", 1: "Leaderboard", 2: "Reflection", 3: "Takeaway", 4":"Welcome", 5: "Thanks"], fieldName => "Title|Skill|Storyline|Outcomes|Category|Author"
 * review: "textAboutCurrentBlockBytheReviewerInAGame"
 * }
 */
const addGameReview = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ status: "Failure", message: "Bad request" });
    }
    const reqData = req.body.data;
    const gameReviewerData = await GameReviewers.findOne({
      where: {
        gameReviewerId: { [Op.eq]: reqData.reviewerId },
        activeStatus: { [Op.eq]: "YES" },
      },
    });
    if (gameReviewerData) {
      /*Extract the first row record, which was created during Game-Reviewer creation,
       * if it not has any review for any blocks of this game, then update the current review into it
       * else create a new record in gameReviews Table
       */
      const gameReviewData = await GameReviews.findOne({
        where: {
          gameReviewerId: { [Op.eq]: reqData.reviewerId },
          reviewGameId: { [Op.eq]: reqData.reviewGameId },
          tabId: { [Op.eq]: reqData.tabId},
          tabAttribute: { [Op.like]: `%${reqData?.tabAttribute}%`},
          tabAttributeValue: { [Op.like]: `%${reqData?.tabAttributeValue}%`},
          review: null,
        },
      });

      const reviewData = {
        review: reqData.review ? reqData.review : null,
        reviewIpAddress: req.connection.remoteAddress,
        reviewUserAgent: req.headers["user-agent"],
        reviewDeviceType: req.device.type,
        updatedAt: Date.now(),
      };

      if (gameReviewData) {
        const updateFirstReview = await gameReviewData.update(reviewData);
        if (updateFirstReview) {
          // req.body.data $$$
        //  const gamedata = await gamecontroller.getGameCollections(id);
          return res.status(200).json({
            status: "Success",
            message: "Review Submitted Successfully",
            // result: gamedata
          });
        } else {
          return res.status(200).json({
            status: "Failure",
            message: "Failed to Submit the Review",
          });
        }
      } else {
        const reviewDataCreate = {
          gameReviewerId: reqData.reviewerId,
          reviewGameId: reqData.reviewGameId,
          tabId: reqData.tabId,
          tabAttribute:
            reqData.tabId == 4 || reqData.tabId == 5 || reqData.tabId == 3
              ? reqData?.tabAttribute
              : null,
          tabAttributeValue:
            reqData.tabId == 4 || reqData.tabId == 5 || reqData.tabId == 3
              ? reqData?.tabAttributeValue
              : null,
          createddAt: Date.now(),
          updatedAt: null,
          ...reviewData,
        };
        const CreateGameReview = await GameReviews.create(reviewDataCreate);
        if (CreateGameReview) {
          // const gamedata = await gamecontroller.getGameCollections(req.body.id);
          return res.status(200).json({
            status: "Success",
            message: "Review Submitted Successfully",
            // result : gamedata
          });
        } else {
          return res.status(200).json({
            status: "Failure",
            message: "Failed to Submit the Review",
          });
        }
      }
    }
    return res
      .status(404)
      .json({ status: "Failure", message: "Invalid request" });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};

/**
 * getGameAllReviews()
 * @param {*} req => req.body.data =>{
 *  "gameReviewerId": 1,
 *  "reviewGameId": 1,
 *  "tabId": 4,
 *  "tabAttribute": "blockSeq",
 *  "tabAttributeValue": "10.2"
 * }
 * @param {*} res
 */

const getGameAllReviews = async (req, res) => {
  try {
    if (!req?.body) {
      return res
        .status(400)
        .json({ status: "Failure", message: "Bad Request" });
    }
    const reqData = req.body.data;
    const blockReview = await GameReviews.findAll({
      where: {
        gameReviewerId: { [Op.eq]: reqData.gameReviewerId },
        reviewGameId: { [Op.eq]: reqData.reviewGameId },
        tabId: { [Op.eq]: reqData.tabId },
        tabAttribute: { [Op.like]: `%${reqData.tabAttribute}%` },
        tabAttributeValue: { [Op.like]: `%${reqData.tabAttributeValue}%` },
      },
    });
    if (blockReview) {
      return res.status(200).json({
        status: "Success",
        message: "Record Found",
        result: blockReview,
      });
    }
    return res
      .status(400)
      .json({ status: "Failure", message: "No Record Found" });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};

/**
 * getGameBlockReview()
 * @param {*} req => req.body.data =>{
 *  "gameReviewerId": 1,
 *  "reviewGameId": 1,
 *  "tabId": 4,
 *  "tabAttribute": "blockSeq",
 *  "tabAttributeValue": "10.2"
 * }
 * @param {*} res
 */

const getGameReviewById = async (req, res) => {
  try {
    if (!req?.body) {
      return res
        .status(400)
        .json({ status: "Failure", message: "Bad Request" });
    }
    const reviewId = req?.params?.id;
    if (!reviewId) {
      return res
        .status(400)
        .json({ status: "Failure", message: "Invalid Request" });
    }

    const Review = await GameReviews.findOne({
      where: { reviewId: { [Op.eq]: reviewId } },
    });
    if (Review) {
      return res
        .status(200)
        .json({ status: "Success", message: "Record Found", result: Review });
    }
    return res
      .status(400)
      .json({ status: "Failure", message: "No Record Found" });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};
const getGameBlockReview = async (req, res) => {
  try {
    if (!req?.body) {
      return res
        .status(400)
        .json({ status: "Failure", message: "Bad Request" });
    }
    const reqData = req.body.data;
    const blockReview = await GameReviews.findOne({
      where: {
        gameReviewerId: { [Op.eq]: reqData.gameReviewerId },
        reviewGameId: { [Op.eq]: reqData.reviewGameId },
        tabId: { [Op.eq]: reqData.tabId },
        tabAttribute: { [Op.like]: `%${reqData.tabAttribute}%` },
        tabAttributeValue: { [Op.like]: `%${reqData.tabAttributeValue}%` },
        readStatus:{ [Op.eq]: reqData.readStatus }
      },
    });
    if (blockReview) {
      return res.status(200).json({
        status: "Success",
        message: "Record Found",
        result: blockReview,
      });
    }
    return res
      .status(400)
      .json({ status: "Failure", message: "No Record Found" });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};

/**
 * getGameBlockReview()
 * @param {*} req => req.body.data =>{
 * reviewId: id
 * review: "String"
 * }
 * @param {*} res
 */
const updateGameBlockReview = async (req, res) => {
  try {
    if (!req?.body) {
      return res
        .status(400)
        .json({ status: "Failure", message: "Bad Request" });
    }
    const reqData = req.body.data;

    const blockReview = await GameReviews.findOne({
      where: { reviewId: { [Op.eq]: reqData.reviewId } },
    });
    if (blockReview) {
      const updateResult = await blockReview.update({ review: reqData.review });
      if (updateResult)
        return res
          .status(200)
          .json({ status: "Success", message: "Game Block Review updated" });

      return res.status(400).json({
        status: "Failure",
        message: "Game Block Review updation Failed",
      });
    }
    return res
      .status(400)
      .json({ status: "Failure", message: "No Record Found" });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};

/**
 * deleteGameBlockReview()
 * @param => reviewId
 * @param {*} res
 */
const deleteGameBlockReview = async (req, res) => {
  try {
    const reviewId = req?.params?.id;
    if (!reviewId) {
      return res
        .status(400)
        .json({ status: "Failure", message: "Bad Request" });
    }
    // const blockReview = await GameReviews.findOne({where: {gameReviewerId: {[Op.eq]: reqData.gameReviewerId}, reviewGameId : {[Op.eq]: reqData.reviewGameId}, reviewGameBlockId: {[Op.like]: `%${reqData.reviewGameBlockId}%` } }})
    const blockReview = await GameReviews.destroy({
      where: { reviewId: { [Op.eq]: reviewId } },
    });
    if (blockReview)
      return res
        .status(200)
        .json({ status: "Success", message: "Game Block Review removed" });
    // return res.status(400).json({status:"Failure",message:"Game Block Review delete Failed"});
    return res
      .status(400)
      .json({ status: "Failure", message: "No Record Found" });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};

/**
 * getGameBlockReviewList()
 * @param {*} req => req.body.data =>{
 *  "reviewGameId": 1,
 *  "tabId": 4,
 *  "tabAttribute": "blockSeqId",
 *  "tabAttributeValue": "10.3"
 * }
 * @param {*} res
 */
const getGameBlockReviewList = async (req, res) => {
  try {
    if (!req?.body) {
      return res
        .status(400)
        .json({ status: "Failure", message: "Bad Request" });
    }
    const reqData = req.body.data;
    const gameReviewlist = await GameReviews.findAll({
      where: {
        reviewGameId: { [Op.eq]: reqData.reviewGameId },
        tabId: { [Op.eq]: reqData.tabId },
        tabAttribute: { [Op.like]: `%${reqData.tabAttribute}%` },
        tabAttributeValue: { [Op.like]: `%${reqData.tabAttributeValue}%` },
        readStatus: { [Op.eq]: reqData.readStatus },
      },
    });
    if (gameReviewlist) {
      return res.status(200).json({
        status: "Success",
        message: "Record Found",
        result: gameReviewlist,
      });
    }
    return res
      .status(400)
      .json({ status: "Failure", message: "No Record Found" });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};

const getGameReviewList = async (req, res) => {
  try {
    const gameId = req?.params?.gameId;
    if (gameId) {
      const tabReviewSets = [];
      let reviewerIdArray = [];
      for (let i = 1; i <= 5; i++) {
        let reviewlist = await GameReviews.findAll({
          where: { reviewGameId: { [Op.eq]: gameId }, tabId: { [Op.eq]: i } },
          attributes: {
            exclude: [
              "reviewIpAddress",
              "reviewIpAddress",
              "reviewDeviceType",
              "deletedAt",
              "reviewUserAgent",
              
            ],
          },
          // include: [
          //   {
          //     model: GameReviewers,
          //     attributes: ['gameReviewerId', 'creatorId', 'emailId', 'activeStatus'],
          //     // include: [
          //     //   {
          //     //     model: Creators,
          //     //     attributes: ['ctName'], // Add the attributes you want to include from the Creator model
          //     //     required: false,
          //     //   },
          //     // ],
          //     // where: {
          //     //   gameReviewerId: Sequelize.col('lmsgamereviewers.gameReviewerId'),
          //     // },

          //   },
          // ],
        });

        tabReviewSets[i] = reviewlist;
        Object.values(reviewlist).forEach((item) => {
          reviewerIdArray.push(item.gameReviewerId);
        });
      }
      const uniqueReviewerIdArray = [...new Set(reviewerIdArray)];

      /**get the reviewers details */
      const reviewerdetailPromiseAll = uniqueReviewerIdArray.map(
        async (item) => {
          let result = await GameReviewers.findByPk(item, {
            attributes: [
              "gameReviewerId",
              "creatorId",
              "emailId",
              "activeStatus",
              // "readStatus",
            ],
            include: [
              {
                model: Creators,
                attributes: ["ctId", "ctName", "ctMail"],
                as: "ReviewingCreator",
              },
            ],
          });
          return result;
        }
      );
      const reviewerdetail = await Promise.all(reviewerdetailPromiseAll);

      return res.status(200).json({
        status: "Success",
        message: "Record Found",
        reviewlist: tabReviewSets,
        reviewerDetails: reviewerdetail,
      });
    }
    return res.status(400).json({
      status: "Failure",
      message: "Invalid request",
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Internal Server Error",
      err: error.message,
    });
  }
};


const sendReviewInvitationMails = async (result, url) => {
  if (Array.isArray(result) && result?.length > 0) {
    /** Adding the Email ids in the queue to send Emails $$$*/
    result.forEach(async (item) => {
      if (item?.emailId && item.gameUuid) {
        const reviewer = await ReviewersGame.findOne({
          where: { gameUuid: { [Op.like]: `%${item.gameUuid}%` } },
        });
        const data = {
          to: item.emailId,
          subject: "Invitation for my Game Review",
          templateData: {
            gameCreatorName: "gameCreatorName",
            gameUuid: item.gameUuid,
            gameReviewLink:url+item.gameUuid,
            recipientName: "recipientName",
          },
          templateFile: "reviewInvitation",
        };
        try {
          //Handle Mail response
          const mailStatus = await sendMail(data);
     
          if (mailStatus.error) {
            console.log("has error");
            const updateResult = await reviewer.update({
              mailStatus: "failed",
              statusMessage: mailStatus.error?.message,
            });
          } else {
            const updateResult = await reviewer.update({ mailStatus: "sent", statusMessage: mailStatus?.info?.response, mailMessageId: mailStatus?.info?.messageId});
            console.log("updateResult sent", updateResult);
          }
        } catch (error) {
          const updateResult = await reviewer.update({
            mailStatus: "failed",
            statusMessage: mailStatus.error.message,
          });
          console.log("updateResult catch", updateResult);
        }
      }
    });
  }
};


const updateReadStatus = async (req, res) => {
  try {
    // Extract data from request body
    const { gameReviewerId, reviewId ,tabAttribute} = req.body;
    console.log("reviewId",gameReviewerId);
        console.log("reviewId",reviewId);
        console.log("reviewId",tabAttribute);
      
    // Perform the update operation
    const updateResult = await GameReviews.update(
      { readStatus: 1 }, // Update readStatus to 1 (read)
      {
        where: {
          reviewId: reviewId,
          gameReviewerId: gameReviewerId,
          tabAttribute:tabAttribute
        }
      }
    );

    // Check if update was successful
    if (updateResult[0] === 1) { // updateResult is an array with number of affected rows
      return res.status(200).json({ status: "Success", message: "Read status updated successfully" });
    } else {
      return res.status(400).json({ status: "Failure", message: "Failed to update read status" });
    }
  } catch (error) {
    console.error("Error updating read status:", error);
    return res.status(500).json({ status: "Failure", message: "Internal Server Error" });
  }
};


module.exports = {
  addGameReview,
  addGameReviewers,
  getGameBlockReview,
  updateGameBlockReview,
  deleteGameBlockReview,
  getGameBlockReviewList,
  getGameAllReviews,
  getGameReviewById,
  getGameReviewList,
  updateReadStatus,//... readStatus code update ..kishore
};
