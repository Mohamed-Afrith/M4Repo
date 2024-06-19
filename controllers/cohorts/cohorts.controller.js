
const sequelize = require('sequelize');
const { Op ,literal} = sequelize; // Import the `Op` object from Sequelize
const LmsCohorts = require("../../models/cohorts");
const learner = require("../../models/learner");
const Game=require("../../models/game");
const Company=require("../../models/companies.js");
const LmsCreator=require("../../models/Creator.js");

const addcohorts = async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      res.status(400).json({ status: "Failure", message: "Bad request" });
    } else {
      req.body.chCreatedDate = Date.now();
      req.body.chCreatedUserId = req.user.user.id;
      req.body.chDeleteStatus = "NO";
      req.body.chIpAddress = req.connection.remoteAddress;
      req.body.chUserAgent = req.headers["user-agent"];
      req.body.chDeviceType = req.device.type;
      req.body.chStatus = 'Active';
      req.body.chTimeStamp = Date.now();




      const result = await LmsCohorts.create(data);
      res.status(200).json({
        status: "Success",
        message: "Data stored in the database",
        data: result,
      });
    }

  } catch (err) {
    console.error("Error in addlearner:", err.message); // Log the error for debugging

    res.status(500).json({
      status: "Failure",
      message: "Oops! Something went wrong",
      error: err || "Internal Server Error",
    });
  }
};
const getcohorts = async (req, res) => {
  try {
    const { count, rows: allData } = await LmsCohorts.findAndCountAll({
      attributes: ['chId', 'chCohortsName'], // Remove the extra space in 'chId'
      where: {
        [Op.and]: [
          {
            chDeleteStatus: {
              [Op.or]: {
                [Op.not]: "Yes",
                [Op.is]: null,
              },
            },
          },
        ],
        chCreatedUserId :req.user.user.id,
      },
    });
    
    if (count === 0) {
      return res.status(404).json({ status: 'Failure', message: "No records found" });
    }
    else {
      return res.status(200).json({
        status: 'Success',
        message: "All Data Retrieved Successfully",
        data: allData,
        count: count,
      });
    }

  } catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
  }
};
const updatecohorts = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
   console.log('....',id );
    const record = await LmsCohorts.findByPk(id);
    if (!record) {
      return res.status(404).json({ status: 'Failure', message: "Record not found" });
    }
    req.body.chEditedDate = Date.now();
    req.body.chEditedUserId = req.user.user.id;
    const updatedRecord = await record.update(data);

    res
      .status(200)
      .json({ status: "Success", message: "Data Updated Successfully", data: updatedRecord });
  } catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
  }

}
const checkCohorts = async (req, res) => {
  try {
    const { id } = req.params;
    const LoginUserRole = req.user.user.role;
    const LoginUserId = req.user.user.id;

    if (!id) {
      return res.status(400).json({ status: 'Failure', message: 'Bad Request' });
    }

    // Fetch data for the specific cohort based on the provided ID
    const specificData = await LmsCohorts.findByPk(id);

    if (!specificData) {
      return res.status(404).json({ error: "Record not found" });
    }

    const cohortshId = specificData.chId;
    const chCohortsName = specificData.chCohortsName;

    // Fetch learners associated with the cohort
    const Nooflearners = await learner.findAll({
      where: {
        [Op.and]: [
          // Check if chId is in lenCohorts JSON array
          literal(`JSON_CONTAINS(lenCohorts, '[${cohortshId}]')`),
        ],
        ...(LoginUserRole === 'Creator' ? {
          lenCreatorId: LoginUserId,
          lenDeleteStatus: {
            [Op.or]: {
              [Op.not]: 'Yes',
              [Op.is]: null,
            },
          },
        } : {}),
        ...(LoginUserRole === 'Admin' ? {
          lenDeleteStatus: {
            [Op.or]: {
              [Op.not]: 'Yes',
              [Op.is]: null,
            },
          },
        } : {}),
      },
    });
    const Noofgames = await Game.findAll({
      where: {
        [Op.and]: [
          // Check if chId is in lenCohorts JSON array
          sequelize.literal(`JSON_CONTAINS(gameCohorts, '[${cohortshId}]')`),
        ],
        ...(LoginUserRole === 'Creator' ? {
          gameCreatorUserId: LoginUserId,
          gameDeleteStatus: {
            [Op.or]: {
              [Op.not]: 'Yes',
              [Op.is]: null,
            },
          },
        } : {}),
        ...(LoginUserRole === 'Admin' ? {
          gameDeleteStatus: {
            [Op.or]: {
              [Op.not]: 'Yes',
              [Op.is]: null,
            },
          },
        } : {}),
      },
    });
    let gameListAssigned = [];
    let learnersListAssigned = [];
    if (Nooflearners.length > 0) {
      learnersListAssigned = Nooflearners.map(learner => ({
        lenId: learner.lenId,
        lenUserName: learner.lenUserName,
        lenMail: learner.lenMail,
        lenDesignation: learner.lenDesignation,
        // Add other fields as necessary
      }));
    }
    if (Noofgames.length > 0) {
      gameListAssigned = Noofgames.map(game => ({
        gameId: game.gameId,
        gameTitle: game.gameTitle,
        // Add other fields as necessary
      }));
    }

    const data = {
      chId: cohortshId,
      chCohortsName: chCohortsName,
      learnersListAssigned: learnersListAssigned,
      gameListAssigned:gameListAssigned,
    };

    return res.status(200).json({ status: 'Success', message: "Data Retrieved Successfully", data: data });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", err: error.message });
  }
};
/*
const checkCohorts = async (req, res) => {
  try {
    const { id } = req.params;
    const LoginUserRole =req.user.user.role;
    const LoginUserId =req.user.user.id;
    if (!id) {
      return res.status(400).json({ status: 'Failure', message: 'Bad Request' });
    }

    // Fetch data for the specific item based on the provided ID
    const specificData = await LmsCohorts.findByPk(id);

    if (!specificData) {
      return res.status(404).json({ error: "Record not found" });
    }
      
        // await Promise.all(specificData.map(async (value) => {
          const cohortshId = specificData.chId;
          const Nooflearners = await learner.findAll({
            where: {
              [Op.and]: [
                // Check if chId is in lenCohorts JSON array
                literal(`JSON_CONTAINS(lenCohorts, '[${cohortshId}]')`),
              ],
              ...(LoginUserRole === 'Creator' ? {
                lenCreatorId: LoginUserId,
                lenDeleteStatus: {
                  [Op.or]: {
                    [Op.not]: 'Yes',
                    [Op.is]: null,
                  },
                },
              } : {}),
              ...(LoginUserRole === 'Admin' ? {
                lenDeleteStatus: {
                  [Op.or]: {
                    [Op.not]: 'Yes',
                    [Op.is]: null,
                  },
                },
              } : {}),
            },
          });
          let listLearner;
          if(Nooflearners.length > 0)
            {
              const chId = specificData.chId;
              const CohortsName = specificData.chCohortsName;
                listLearner = Nooflearners.map(learner => ({
                  lenId: learner.lenId,
                  lenUserName: learner.lenUserName,
                  lenMail: learner.lenMail,
                  lenDesignation: learner.lenDesignation,
                  // Add other fields as necessary
                }));
                const data ={chId:chId ,chCohortsName :CohortsName,learnersListAssigned:listLearner}
                res.status(200).json({ status: 'Success', message: "Data Retrieved Successfully ", data: data });
            }
            else{
              const data ={chId:chId ,chCohortsName :CohortsName,learnersListAssigned:[]}
              res.status(200).json({ status: 'Success', message: "Data Retrieved Successfully ", data: data });
            }
      res
      .status(200)
      .json({ status: 'Success', message: "Data Retrieved Successfully", data: specificData });
    
/*
    const checkCohorts = await learner.count({
      where: {
        lenCohorts:id, // Use the `Op` object with the `like` operator
       
      },
    });
console.log('.......',checkCohorts);
    if (checkCohorts === 0) {
      const data = await LmsCohorts.findOne({ where: { chId: id } });

      if (!data) {
        res.status(404).json({ status: 'Failure', message: 'Company Not Found' });
      } else {
        data.set({ chDeleteStatus: 'YES' });
        await data.save();

        res.status(200).json({ status: 'Success', message: 'Data deleted from the Database' });
      }
    }
    
     else {
      res
        .status(200)
        .json({ status: 'Waring', message: "Data Retrieved Successfully", data: checkCohorts });
    }*/
 /* } catch (error) {
    res.status(500).json({ error: "Internal Server Error", err: error.message });
  }
};

*/

// const reomvecohorts = async (req, res) => {
//   try {
//     const id = req.params.id;
//     if (!id) {
//       res.status(404).json({ status: 'Failure', message: 'Bad Request' })
//     }
//     else {
//       const data = await LmsCohorts.findOne({ where: { chId: id } });
//       if (!data) {
//         res.status(404).json({ status: 'Failure', message: 'Company Not Found' })
//       }
//       else {
//         data.set({
//           chDeleteStatus: "YES"
//         });
//         await data.save();
       


//        const whereClause = {
//   [Op.or]: [
//     { lenCohorts: { [Op.like]: `%,${id},%` } },
//     { lenCohorts: { [Op.like]: `${id},%` } },
//     { lenCohorts: { [Op.like]: `%,${id}` } },
//     { lenCohorts: `${id}` },
//   ],
// };

// const result = await learner.update(
//   {
//     lenCohorts: sequelize.fn('TRIM', sequelize.literal(`BOTH ',' FROM REPLACE(CONCAT(',', lenCohorts, ','), ',${id},', ',')`)),
//   },
//   {
//     where: whereClause,
//   }
// );

//         if (result) {
//           res.status(200).json({ status: 'Success', message: 'Data deleted from the Database',results:result});
//         } else {
//           res.status(404).json({ status: 'Failure', message: 'something went wrong' })
//         }



//       }
//     }
//   }
//   catch (err) {
//     res.status(500).json({ status: "Failure", message: "oops! something went wrong", err: err.message });
//   }
// }

const reomvecohorts = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    console.log("id", id);

    if (!id) {
      return res.status(400).json({ status: 'Failure', message: 'Bad Request' });
    }

    const data = await LmsCohorts.findOne({ where: { chId: id } });

    if (!data) {
      return res.status(404).json({ status: 'Failure', message: 'Cohort Not Found' });
    }

    data.set({ chDeleteStatus: "YES" });
    console.log("datafromdelete", data);
    await data.save();

    const games = await Game.findAll({
      where: sequelize.literal(`JSON_CONTAINS(gameCohorts, '${id}')`)
    });

    // if (games.length === 0) {
    //   return res.status(404).json({ status: 'Failure', message: 'No game found with the specified cohort ID' });
    // }

    const updateGames = games.map(async (game) => {
      let gameCohorts = game.gameCohorts;

      // Ensure gameCohorts is an array of numbers
      if (!Array.isArray(gameCohorts)) {
        gameCohorts = JSON.parse(gameCohorts);
      }

      // Filter out the cohort ID
      const updatedCohorts = gameCohorts.filter(value => value !== id);

      // Update the game with the new array
      await game.update({ gameCohorts: updatedCohorts });
    });

    await Promise.all(updateGames);

    const learners = await learner.findAll({
      where: sequelize.literal(`JSON_CONTAINS(lenCohorts, '${id}')`)
    });

    // if (learners.length === 0) {
    //   return res.status(404).json({ status: 'Failure', message: 'No learner found with the specified cohort ID' });
    // }

    const updateLearners = learners.map(async (learner) => {
      let lenCohorts = learner.lenCohorts;

      // Ensure lenCohorts is an array of numbers
      if (!Array.isArray(lenCohorts)) {
        lenCohorts = JSON.parse(lenCohorts);
      }

      // Filter out the cohort ID
      const updatedCohorts = lenCohorts.filter(value => value !== id);

      // Update the learner with the new array
      await learner.update({ lenCohorts: updatedCohorts });
    });

    await Promise.all(updateLearners);

    return res.status(200).json({ status: 'Success', message: 'Cohort removed from games and learners', data: { games, learners } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Failure", message: "Oops! Something went wrong", err: err.message });
  }
};


const getAllCohorts = async (req, res) => {
  try {
    const LoginUserRole =req.user.user.role;
      const LoginUserId =req.user.user.id;
    // const { count, rows: data } = await LmsCohorts.findAndCountAll({
    //   attributes: [['chId','value'], ['chCohortsName','label']], 
    //   where: {
    //     [Op.and]: [
    //       {
    //         chDeleteStatus: {
    //           [Op.or]: {
    //             [Op.not]: "Yes",
    //             [Op.is]: null,
    //           },
    //         },
            
    //       },
    //     ],
    //   },
    // });
    const AllCohorts = await LmsCohorts.findAll({
      where: {
        [Op.and]: [
          {
            chDeleteStatus: {
              [Op.or]: {
                [Op.not]: "Yes",
                [Op.is]: null,
              },
            },
            
          },
        ],
      },
      orderBy :[['chId','Desc']]
    });
    const count  = AllCohorts.length;
    console.log('..........',count)
    let rows = [];
    if (AllCohorts.length > 0) {
      await Promise.all(AllCohorts.map(async (value) => {
        const chId = value.chId;
        const chCohortsName = value.chCohortsName;
        const Nooflearners = await learner.count({
          where: {
            [Op.and]: [
              // Check if chId is in lenCohorts JSON array
              literal(`JSON_CONTAINS(lenCohorts, '[${chId}]')`),
            ],
            ...(LoginUserRole === 'Creator' ? {
              lenCreatorId: LoginUserId,
              lenDeleteStatus: {
                [Op.or]: {
                  [Op.not]: 'Yes',
                  [Op.is]: null,
                },
              },
            } : {}),
            ...(LoginUserRole === 'Admin' ? {
              lenDeleteStatus: {
                [Op.or]: {
                  [Op.not]: 'Yes',
                  [Op.is]: null,
                },
              },
            } : {}),
          },
          
        });
        const Noofgames = await Game.count({
          where: {
            [Op.and]: [
              // Check if chId is in lenCohorts JSON array
              sequelize.literal(`JSON_CONTAINS(gameCohorts, '[${chId}]')`),
            ],
            ...(LoginUserRole === 'Creator' ? {
              gameCreatorUserId: LoginUserId,
              gameDeleteStatus: {
                [Op.or]: {
                  [Op.not]: 'Yes',
                  [Op.is]: null,
                },
              },
            } : {}),
            ...(LoginUserRole === 'Admin' ? {
              gameDeleteStatus: {
                [Op.or]: {
                  [Op.not]: 'Yes',
                  [Op.is]: null,
                },
              },
            } : {}),
          },
        });
        
        const data ={value:chId ,label :chCohortsName, Nooflearners : Nooflearners, NoGames:Noofgames}
        rows.push(data);
      }));
    }
    rows.sort((a, b) => b.value - a.value);
    if (count === 0) {
      return res.status(404).json({ status: 'Failure', message: "No records found" });
    }

    res.status(200).json({
      status: 'Success',
      message: "All Data Retrieved Successfully",
      data: rows,
      count: count,
    });
  } catch (error) {
    res.status(500).json({ status: 'Failure', message: "Internal Server Error", err: error });
  }
};

// const cohortsLearnerDatas = async (req, res) => {
//   const CohortsId = req.params.id;
//   console.log('id', CohortsId);

//   try {
//     // Find learner details based on cohort ID
//     const learnerCohortsDetails = await learner.findAll({
//       where: literal(`JSON_CONTAINS(lenCohorts, '[${CohortsId}]', '$')`),
//       include: [
//         {
//           model: Company, // Include the Company model for learner's company details
//           attributes: ['cpCompanyName'], // Select only the company name
//           as: 'company' // Alias for the included Company model
//         }
//       ],
//       attributes: ['lenMail', 'lenUserName', 'lenCompanyId'], // Select only the learner email, username, and company ID
//     });

//     // Log learner details
//     learnerCohortsDetails.forEach(learner => {
//       const companyName = learner.company ? learner.company.cpCompanyName : 'N/A';
//       console.log(`Username: ${learner.lenUserName}, Email: ${learner.lenMail}, Company Name: ${companyName}`);
//     });

//     const cohorts = await LmsCohorts.findOne({
//       where: { chId: CohortsId },
//       attributes: ['chCohortsName']
//     });

//     // If cohort not found, return error
//     if (!cohorts) {
//       return res.status(404).json({ error: 'Cohorts not found' });
//     }
//     console.log('Cohorts Name:', cohorts.chCohortsName);

//     // Extract relevant data from learner details
//     const formattedData = learnerCohortsDetails.map(learner => ({
//       username: learner.lenUserName,
//       email: learner.lenMail,
//       companyName: learner.company ? learner.company.cpCompanyName : 'N/A',
//     }));

//     // Return the formatted data
//     return res.status(200).json({
//       cohortsName: cohorts.chCohortsName,
//       learners: formattedData
//     });
//   } catch (error) {
//     console.error('Error fetching learner data:', error);
//     return res.status(500).json({ error: error.message });
//   }
// };

// const cohortsGamesData = async (req, res) => {
//   try {
//     // const cohortsId = 88; // Replace with req.params.id if dynamic input is needed
//     const cohortsId = req.params.id;
//     console.log('Received id:', cohortsId);

//     // Fetch game titles and gameCreatorUserId where gameCohorts array contains the given cohortsId
//     const games = await Game.findAll({
//       attributes: ['gameTitle', 'gameCreatorUserId'],
//       where: sequelize.literal(`JSON_CONTAINS(gameCohorts, '[${cohortsId}]', '$')`)
//     });

//     const gameDetailsPromises = games.map(async (game) => {
//       try {
        
//         // Get creator details from LmsCreator table
//         const creator = await LmsCreator.findOne({
//           where: { ctId: game.gameCreatorUserId },
//           attributes: ['ctId', 'ctCompanyId', 'ctName']
//         });

//         if (!creator) {
//           return null;
//         }

//         // Get company details from Company table
//         const company = await Company.findOne({
//           where: { cpId: creator.ctCompanyId },
//           attributes: ['cpCompanyName']
//         });

//         if (!company) {
//           return null;
//         }

//         // Construct the desired object
//         return {
//           gameTitle: game.gameTitle,
//           creatorName: creator.ctName,
//           companyName: company.cpCompanyName
//         };

//       } catch (error) {
//         console.error(`Error fetching details for game: ${game.gameTitle}`, error);
//         return null;
//       }
//     });
//     const cohorts = await LmsCohorts.findOne({
//       where: { chId: cohortsId },
//       attributes: ['chCohortsName']
//     });
//     // Wait for all promises to resolve
//     const cohortsDetails = await Promise.all(gameDetailsPromises);

//     // // Filter out any null results
//     // const filteredCohortsDetails = cohortsDetails.filter(detail => detail !== null);

//     res.status(200).json({
//       status: 'success',
//       cohortsDetails: cohortsDetails,
//       cohortsName: cohorts.chCohortsName
//     });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ message: 'An error occurred', error });
//   }
// };

// const cohortsGamesData = async (req, res) => {
//   try {
//     const cohortsId = req.params.id;
//     console.log('Received id:', cohortsId);

//     const games = await Game.findAll({
//       attributes: ['gameTitle'],
//       where: sequelize.literal(`JSON_CONTAINS(gameCohorts, '[${cohortsId}]', '$')`),
//       include: [{
//         model: LmsCreator,
//         as: 'creator',
//         attributes: ['ctId', 'ctCompanyId', 'ctName'],
//         include: [{
//           model: Company,
//           as: 'company',
//           attributes: ['cpCompanyName']
//         }]
//       }]
//     });

//     const gameDetails = games.map(game => {
//       const { gameTitle, creator } = game;
//       const { ctName: creatorName, company } = creator;
//       const { cpCompanyName: companyName } = company;

//       return {
//         gameTitle,
//         creatorName,
//         companyName
//       };
//     });

//     const cohorts = await LmsCohorts.findOne({
//       where: { chId: cohortsId },
//       attributes: ['chCohortsName']
//     });

//     res.status(200).json({
//       message: 'success',
//       cohortsDetails: gameDetails,
//       cohortsName: cohorts ? cohorts.chCohortsName : null
//     });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ message: 'An error occurred', error });
//   }
// };


const getSelectCohortsNames = async (req, res) => {
  try {


    let data = await LmsCohorts.findAll({
      attributes: [['chId', 'value'], ['chCohortsName', 'label']],
      
    });

    if (data.length > 0) {
      data.forEach(item => {
        console.log(`Retrieved chCohortsName: ${item.get('label')}`);
        console.log(`Retrieved chId: ${item.get('value')}, chCohortsName: ${item.get('label')}`);
      });
    }
console.log('data',data)
    return res.status(200).json({ status: "Success", message: "Data retrieved from the database", data: data });
  } catch (err) {
    return res.status(500).json({ status: "Failure", message: "Oops! Something went wrong", err: err });
  }
};



// const getCohortsByCreatorId = async (req, res) => {
//   const creatorId=req.params.id;
//   console.log("creatorId",creatorId)
//   try {


//      const Creator = await LmsCreator.findAll({
//       where: { ctId: creatorId },
//       attributes: ['ctId'],
//       group:['ctId'],
//     });
// console.log("Creator",Creator);
// const CreatorbyId = Creator.map((al) => al.ctId);
// console.log("CreatorbyId",CreatorbyId);
// const getcreatorId = await LmsCohorts.findAll({
//   where: { chCreatedUserId: CreatorbyId },
//   // attributes: ['chCohortsName','chId']
//   attributes: [['chId', 'value'], ['chCohortsName', 'label']],
// });
// if (CreatorbyId.length > 0) {
//   CreatorbyId.forEach(item => {
//     console.log(`Retrieved chCohortsName: ${item.get('label')}`);
//     console.log(`Retrieved chId: ${item.get('value')}, chCohortsName: ${item.get('label')}`);
//   });
// }
// // console.log('data',CreatorbyId)
// // console.log("Creator",Creator);

//     return res.status(200).json({ status: "Success", message: "Data retrieved from the database" ,data:getcreatorId });
//   } catch (err) {
//     return res.status(500).json({ status: "Failure", message: "Oops! Something went wrong",err: err.message});
//   }
// };

const getCohortsByCreatorId = async (req, res) => {
  const creatorId = req.params.id;
  console.log("creatorId", creatorId);
  try {
    const Creator = await LmsCreator.findAll({
      where: { ctId: creatorId },
      attributes: ['ctId'],
      group: ['ctId'],
    });

    console.log("Creator", Creator);
    const CreatorbyId = Creator.map((al) => al.ctId);
    console.log("CreatorbyId", CreatorbyId);

    const getcreatorId = await LmsCohorts.findAll({
      where: { chCreatedUserId: CreatorbyId },
      attributes: [['chId', 'value'], ['chCohortsName', 'label']],
    });

    if (getcreatorId.length > 0) {
      getcreatorId.forEach(item => {
        console.log(`Retrieved chId: ${item.value}, chCohortsName: ${item.label}`);
      });
    }

    return res.status(200).json({ status: "Success", message: "Data retrieved from the database", data: getcreatorId });
  } catch (err) {
    return res.status(500).json({ status: "Failure", message: "Oops! Something went wrong", err: err.message });
  }
};


module.exports = { addcohorts, getcohorts, updatecohorts, reomvecohorts, checkCohorts ,getAllCohorts,getSelectCohortsNames,getCohortsByCreatorId};
