const Company = require("../../models/companies");
const Creator = require("../../models/Creator");
const Learner =require("../../models/learner");
const Games =require("../../models/game");
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const moment = require('moment');
const Assigned =require("../../models/gameassinged");
const lmsGameActivityLog = require("../../models/gameActivityLog");
const loginHistory = require("../../models/loginHistory");

const noOfCompanys = async (req, res) => {
  try {

    
    const startDate = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss.SSSSSS');
    const endDate = moment().endOf('month').format('YYYY-MM-DD HH:mm:ss.SSSSSS');

    // vb 05.01.2024
    const weekEndDate = moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS');
    const weekStartDate = moment(weekEndDate).subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss.SSSSSS');
    // vb 05.01.2024

    /**************Company details*************** */

    const companyCount = await Company.count({
      where: {
        cpStatus: 'Active',
        cpDeleteStatus: 'NO',
      }
    });

    const newCompany = await Company.count({
      where: {
        cpStatus: 'Active',
        cpDeleteStatus: 'NO',
        cpCreatedDate: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    // vb 05.01.2024
    // Initialize an array to store the counts for each date
    const countsByDate = [];

    // Iterate through each date within the range
    for (let date = moment(weekStartDate); date.isSameOrBefore(moment(weekEndDate)); date.add(1, 'days')) {
      const currentDateStartOfDay = date.startOf('day').format('YYYY-MM-DD HH:mm:ss.SSSSSS');
      const currentDateEndOfDay = date.endOf('day').format('YYYY-MM-DD HH:mm:ss.SSSSSS');

      // Make a query for the current date and get the count
      const count = await Company.count({
        where: {
          cpStatus: 'Active',
          cpDeleteStatus: 'NO',
          cpCreatedDate: {
            [Op.between]: [currentDateStartOfDay, currentDateEndOfDay],
          },
        },
      });

      // Store the count for the current date
      countsByDate.push({
        date: currentDateStartOfDay,
        count: count,
      });
    }
    // vb 05.01.2024

     /*******Creator Details*************** */
     const CreatorCount = await Creator.count({
      where: {
        ctDeleteStatus: 'NO',
      },
    });

    const newCreator = await Creator.count({
      where: {
        ctStatus: 'Active',
        ctDeleteStatus: 'NO',
      },
    });
    /*************Learner**************** */
    const LearnerCount = await Learner.count({
      where: {
        lenDeleteStatus : 'NO',
      },
    });

    const newLearner = await Learner.count({
      where: {
        lenStatus: 'Active',
        lenDeleteStatus : 'NO'
      },
    });

    const Learners = await Learner.findAll();
    /**********Learners Accessed,Progress,Completion********************* */
    const LearnersAccessed = await Assigned.count({
      distinct: true,
      col: 'gaLearnerId',
      where: {
        gaDeleteStatus: 'NO'
      }
    });
    
    const LearnersProgress = await lmsGameActivityLog.count({
      where: {
        galQuestionState : 'Start'
      }
    });

    const LearnersCompletion = await lmsGameActivityLog.count({
      where: {
        galQuestionState : 'Complete'
      }
    });

    /**********Learners Accessed,Progress,Completio********************* */

    const GameList = await Games.findAll({
      attributes: [
        'gameId', 
        'gameTitle', 
        'gameTotalScore',
        [Sequelize.literal('DATE_FORMAT(createdAt, "%Y-%m-%d")'), 'createdAt']
      ],
      order: [
        [Sequelize.literal('COALESCE(gameTotalScore, 0)'), 'DESC']
      ],
      limit: 5
    });

    /************Games**************** */
    // const GamesCount = await Games.count({
    //   where: {
    //     gameStatus: 'Active'
    //   }
    // });

    // const newGames = await Games.count({
    //   where: {
    //     gameStatus: 'Active',
    //    gameCreatedDate: {
    //       [Op.between]: [startDate, endDate],
    //     },
    //   },
    // });
/************timeSpentLearning and  timeSpentCreating start******************** */
//SELECT SEC_TO_TIME(SUM(TIME_TO_SEC(lgTotalTime))) as creator_total FROM lmsloginhistory where lgUserRole='Creator';
const timeSpentCreating = await loginHistory.findAll({
  attributes: [
    [Sequelize.literal('SUM(TIME_TO_SEC(lgTotalTime))'), 'creator_total']
  ],
  where: {
    lgUserRole: 'Creator'
  }
});

const totalCreatorSeconds = timeSpentCreating[0].dataValues.creator_total;
let totalCreatorHours;

if (totalCreatorSeconds < 3600) {
  totalCreatorHours = (totalCreatorSeconds / 3600).toFixed(2); // Convert to hours and keep two decimal places for minutes
} else {
  const hours = Math.floor(totalCreatorSeconds / 3600);
  const minutes = ((totalCreatorSeconds % 3600) / 3600).toFixed(2).slice(2); // Get minutes part as decimal
  totalCreatorHours = `${hours}.${minutes}`;
}

const timeSpentLearning  = await loginHistory.findAll({
  attributes: [
    [Sequelize.literal('SUM(TIME_TO_SEC(lgTotalTime))'), 'learner_total']
  ],
  where: {
    lgUserRole: 'Learner'
  }
});
const totalLearningSeconds = timeSpentLearning[0].dataValues.learner_total;
let totalLearningHours;

if (totalLearningSeconds < 3600) {
  totalLearningHours = (totalLearningSeconds / 3600).toFixed(2); // Convert to hours and keep two decimal places for minutes
} else {
  const hours = Math.floor(totalLearningSeconds / 3600);
  const minutes = ((totalLearningSeconds % 3600) / 3600).toFixed(2).slice(2); // Get minutes part as decimal
  totalLearningHours = `${hours}.${minutes}`;
}

/************timeSpentLearning and  timeSpentCreating end******************** */

    const GamesCount = await Games.count();

    const GamesLaunched = await Games.count({
      where: {
        gameActiveStatus: 'Active',
        gameGameStage: 'Review',

      },
    });

    if (!companyCount) {
      res.status(404).json({ status: 'Failure', message: 'Bad request', err: 'Company count not available' });
    } else {
      let data = {
        companyCount: companyCount,
        newCompany: newCompany,
        CreatorCount: CreatorCount,
        newCreator: newCreator,
        LearnerCount: LearnerCount,
        newLearner: newLearner,
        learnerListAll: Learners,
        getGameList:GameList,
        // GamesCount:9,
        // newGames:5,
        GamesCount: GamesCount,
        newGames: GamesLaunched,
        countsByDate: countsByDate,
        weekEndDate: weekEndDate,
        weekStartDate: weekStartDate,
        LearnersAccessed: LearnersAccessed,
        LearnersProgress: LearnersProgress,
        LearnersCompletion: LearnersCompletion,
        timeSpentCreating:totalCreatorHours,
        timeSpentLearning:totalLearningHours,
      }
      res.status(200).json({ status: 'Success', message: 'Data getted Successfully!', data: data });
    }
  } catch (err) {
    res.status(500).json({ status: 'Failure', message: 'Oops! something went wrong', err: err.message });
  }
};

// const noOfCompanys = async (req, res) => {
//   try {
//     const startDate = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss.SSSSSS');
//     const endDate = moment().endOf('month').format('YYYY-MM-DD HH:mm:ss.SSSSSS');

//     // vb 05.01.2024
//     const weekEndDate = moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS');
//     const weekStartDate = moment(weekEndDate).subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss.SSSSSS');
//     // vb 05.01.2024

//     /**************Company details*************** */
//     const companyCount = await Company.count({
//       where: {
//         cpStatus: 'Active',
//         cpDeleteStatus: 'NO',
//       }
//     });

//     const newCompany = await Company.count({
//       where: {
//         cpStatus: 'Active',
//         cpDeleteStatus: 'NO',
//         cpCreatedDate: {
//           [Op.between]: [startDate, endDate],
//         },
//       },
//     });

//     // vb 05.01.2024
//     // Initialize an array to store the counts for each date
//     const countsByDate = [];

//     // Iterate through each date within the range
//     for (let date = moment(weekStartDate); date.isSameOrBefore(moment(weekEndDate)); date.add(1, 'days')) {
//       const currentDateStartOfDay = date.startOf('day').format('YYYY-MM-DD HH:mm:ss.SSSSSS');
//       const currentDateEndOfDay = date.endOf('day').format('YYYY-MM-DD HH:mm:ss.SSSSSS');

//       // Make a query for the current date and get the count
//       const count = await Company.count({
//         where: {
//           cpStatus: 'Active',
//           cpDeleteStatus: 'NO',
//           cpCreatedDate: {
//             [Op.between]: [currentDateStartOfDay, currentDateEndOfDay],
//           },
//         },
//       });

//       // Store the count for the current date
//       countsByDate.push({
//         date: currentDateStartOfDay,
//         count: count,
//       });
//     }
//     // vb 05.01.2024

//     /*******Creator Details*************** */
//     const CreatorCount = await Creator.count({
//       where: {
//         ctStatus: 'Active'
//       }
//     });

//     const newCreator = await Creator.count({
//       where: {
//         ctStatus: 'Active',
//         ctCreatedDate: {
//           [Op.between]: [startDate, endDate],
//         },
//       },
//     });
//     /*************Learner**************** */
//     const LearnerCount = await Learner.count({
//       where: {
//         lenStatus: 'Active'
//       }
//     });

//     const newLearner = await Learner.count({
//       where: {
//         lenStatus: 'Active',
//        lenCreatedDate: {
//           [Op.between]: [startDate, endDate],
//         },
//       },
//     });
//     /************Games**************** */
//     // const GamesCount = await Games.count({
//     //   where: {
//     //     gameStatus: 'Active'
//     //   }
//     // });

//     // const newGames = await Games.count({
//     //   where: {
//     //     gameStatus: 'Active',
//     //    gameCreatedDate: {
//     //       [Op.between]: [startDate, endDate],
//     //     },
//     //   },
//     // });
    
//     if (!companyCount) {
//       res.status(404).json({ status: 'Failure', message: 'Bad request', err: 'Company count not available' });
//     } else {
//       let data ={
//         companyCount:companyCount,
//         newCompany:newCompany,
//         CreatorCount:CreatorCount,
//         newCreator:newCreator,
//         LearnerCount:LearnerCount,
//         newLearner:newLearner,
//         GamesCount:9,
//         newGames:5,
//         countsByDate:countsByDate,
//         weekEndDate:weekEndDate,
//         weekStartDate:weekStartDate,
//       }
//       res.status(200).json({ status: 'Success', message: 'Data getted Successfully!', data:data });
//     }
//   } catch (err) {
//     res.status(500).json({ status: 'Failure', message: 'Oops! something went wrong', err: err.message });
//   }
// };

// const noOfCreators = async (req, res) => {
//   try {
//     const { currentYear, currentMonth } = getCurrentDate();

//     const count = await Creator.count({
//       where: {
//         ctStatus: 'Active'
//       }
//     });

//     const thisMonthCount = await Creator.count({
//       where: {
//         ctStatus: 'Active',
//         ctCreatedDate: {
//           [Op.like]: '%' + currentYear + '-' + currentMonth + '%',
//         },
//       },
//     });

//     if (!count) {
//       res.status(404).json({ status: 'Failure', message: 'Bad request', err: err });
//     } else {
//       res.status(200).json({ status: 'Success', message: 'Data getted Successfully!', count: count, monthwise: thisMonthCount });
//     }
//   } catch (err) {
//     res.status(500).json({ status: 'Failure', message: 'Oops! something went wrong', err: err });
//   }
// };

const noOfCreators = async (req, res) => {
  
  try {
    const getCreatorCount = async (startDate, endDate) => {
      
      const dateCondition = startDate && endDate ? { [Op.between]: [startDate, endDate] } : {};
      const whereCondition = {
        ctDeleteStatus: 'NO',
      };
    
      if (dateCondition[Op.between]) {
        whereCondition.ctCreateAdminDate = dateCondition;
      }
    
      return await Creator.count({
        where: whereCondition,
        logging: (sql) => {
            console.log(sql); // Log the generated SQL query
          },
      });
      
    };
    const getActiveCreatorCount = async (startDate, endDate) => {
      
      const dateCondition = startDate && endDate ? { [Op.between]: [startDate, endDate] } : {};
      const whereCondition = {
        ctStatus: 'Active',
        ctDeleteStatus: 'NO',
      };
    
      if (dateCondition[Op.between]) {
        whereCondition.ctCreateAdminDate = dateCondition;
      }
    
      return await Creator.count({
        where: whereCondition,
      });
      
    };
    
    const totalCreatorCount = await Creator.count({
      where: {
        ctDeleteStatus: 'NO',
      },
    });

    const ActiveCreatorCount = await Creator.count({
      where: {
        ctStatus: 'Active',
        ctDeleteStatus: 'NO',

      },
    });
    const yearCreatorCount = await getCreatorCount(moment().startOf('year').format('YYYY-MM-DD HH:mm:ss'), moment().endOf('year').format('YYYY-MM-DD HH:mm:ss'));
    const yearActiveCreatorCount = await getActiveCreatorCount(moment().startOf('year').format('YYYY-MM-DD HH:mm:ss'), moment().endOf('year').format('YYYY-MM-DD HH:mm:ss'));
    const monthCreatorCount = await getCreatorCount(moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'), moment().endOf('month').format('YYYY-MM-DD HH:mm:ss'));
    const monthActiveCreatorCount = await getActiveCreatorCount(moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'), moment().endOf('month').format('YYYY-MM-DD HH:mm:ss'));
    const weekCreatorCount = await getActiveCreatorCount(moment().subtract(7, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'), moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'));
    const todayCreatorCount = await getCreatorCount(moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'), moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'));
    const todayActiveCreatorCount = await getActiveCreatorCount(moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'), moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'));

    const getDateRangeCounts = async (unit, count) => {
      const dateRangeCounts = [];
      for (let i = 0; i < count; i++) {
        const startDate = moment().subtract(i, unit).startOf(unit);//changes moment instead of today
        const endDate = moment().subtract(i, unit).endOf(unit);//changes moment instead of today
        const count = await getCreatorCount(startDate, endDate); 
        const Activecount = await getActiveCreatorCount(startDate, endDate); 
        dateRangeCounts.push({ [unit.toLowerCase()]: startDate.format('YYYY-MM-DD'), count ,Activecount });
      }
      return dateRangeCounts; //new added
    };
console.log('yearCreatorCount',yearCreatorCount)

    const monthlyCreatorCount = await getDateRangeCounts('Month', 6);
    const dailyCreatorCount = await getDateRangeCounts('Day', 7);

    const data = {
      totalCreatorCount: totalCreatorCount,
      yearCreatorCount: yearCreatorCount,
      monthCreatorCount: monthCreatorCount,
      weekCreatorCount: weekCreatorCount,
      todayCreatorCount: todayCreatorCount,
      monthlyCreatorCount: monthlyCreatorCount,
      dailyCreatorCount: dailyCreatorCount,
      ActiveCreatorCount:ActiveCreatorCount,
      todayActiveCreatorCount:todayActiveCreatorCount,
      monthActiveCreatorCount:monthActiveCreatorCount,
      yearActiveCreatorCountL:yearActiveCreatorCount,
    };

    if (!totalCreatorCount) {
      res.status(404).json({ status: 'Failure', message: 'Bad request', err: err });
    } else {
      return res.status(200).json({ status: 'Success', message: 'Data received successfully!', data });
    }
  } catch (err) {
    res.status(500).json({ status: 'Failure', message: 'Oops! something went wrong', err: err });
  }
};


// --------------
const getLearnerCount = async (whereCondition) => {
  return await Learner.count({ where: whereCondition });
};

const getDateRangeCounts = async (unit, count, getLearnerCountFunction) => {
  const dateRangeCounts = [];
  for (let i = 0; i < count; i++) {
    const startDate = moment().subtract(i, unit).startOf(unit);
    const endDate = moment().subtract(i, unit).endOf(unit);
    const count = await getLearnerCountFunction({ lenDeleteStatus: 'NO', lenCreatedDate: { [Op.between]: [startDate, endDate] } });
    dateRangeCounts.push({ [unit.toLowerCase()]: startDate.format('YYYY-MM-DD'), count });
  }
  return dateRangeCounts;
};

const noOfLeaners = async (req, res) => {
  try {
    const getActiveLearnerCount = async (startDate, endDate) => {
      const dateCondition = startDate && endDate ? { [Op.between]: [startDate, endDate] } : {};
      const whereCondition = {
        lenStatus: 'Active',
        lenDeleteStatus: 'NO',
      };

      if (dateCondition[Op.between]) {
        whereCondition.lenCreatedDate = dateCondition;
      }

      return await Learner.count({
        where: whereCondition,
      });
    };
    const getLearnerCount = async (startDate, endDate) => {
      const dateCondition = startDate && endDate ? { [Op.between]: [startDate, endDate] } : {};
      const whereCondition = {
        lenDeleteStatus: 'NO',
      };

      if (dateCondition[Op.between]) {
        whereCondition.lenCreatedDate = dateCondition;
      }

      return await Learner.count({
        where: whereCondition,
      });
    };
  //  const totalLearnerCount = await getLearnerCount();
    const totalLearnerCount = await Learner.count({
      where: {
        lenDeleteStatus: 'NO',

      },
    });

    const Activelearnercount = await Learner.count({
      where: {
        lenStatus: 'Active',
        lenDeleteStatus: 'NO',

      },
    });
    const yearLearnerCount = await getLearnerCount(moment().startOf('year'), moment().endOf('year'));
    const yearActiveLearnerCount = await getActiveLearnerCount(moment().startOf('year'), moment().endOf('year'));
    const monthLearnerCount = await getLearnerCount(moment().startOf('month'), moment().endOf('month'));
    const monthActiveLearnerCount = await getActiveLearnerCount(moment().startOf('month'), moment().endOf('month'));
    const weekLearnerCount = await getActiveLearnerCount(moment().subtract(7, 'days').startOf('day'), moment().endOf('day'));
    const todayLearnerCount = await getLearnerCount(moment().startOf('day'), moment().endOf('day'));
    const todayActiveLearnerCount = await getActiveLearnerCount(moment().startOf('day'), moment().endOf('day'));

    const getDateRangeCounts = async (unit, count) => {
      const dateRangeCounts = [];
      for (let i = 0; i < count; i++) {
        const startDate = moment().subtract(i, unit).startOf(unit);
        const endDate = moment().subtract(i, unit).endOf(unit);
        const count = await getLearnerCount(startDate, endDate);
        const Activecount = await getActiveLearnerCount(startDate, endDate);
        dateRangeCounts.push({ [unit.toLowerCase()]: startDate.format('YYYY-MM-DD'), count,Activecount });
      }
      return dateRangeCounts;
    };

    const monthlyLearnerCount = await getDateRangeCounts('Month', 6);
    const dailyLearnerCount = await getDateRangeCounts('Day', 7);

    const data = {
      totalLearnerCount: totalLearnerCount,
      Activelearnercount:Activelearnercount,
      yearLearnerCount: yearLearnerCount,
      monthLearnerCount: monthLearnerCount,
      weekLearnerCount: weekLearnerCount,
      todayLearnerCount: todayLearnerCount,
      monthlyLearnerCount: monthlyLearnerCount,
      dailyLearnerCount: dailyLearnerCount,
      todayActiveLearnerCount:todayActiveLearnerCount,
      monthActiveLearnerCount:monthActiveLearnerCount,
      yearActiveLearnerCount:yearActiveLearnerCount,
    };

    if (!totalLearnerCount) {
      res.status(404).json({ status: 'Failure', message: 'Bad request', err: err });
    } else {
      return res.status(200).json({ status: 'Success', message: 'Data received successfully!', data });
    }
  } catch (err) {
    res.status(500).json({ status: 'Failure', message: 'Oops! something went wrong', err: err });
  }
};

const noOfGames = async (req, res) => {
  try {
    const getGameCount = async (startDate, endDate) => {
      const dateCondition = startDate && endDate ? { [Op.between]: [startDate, endDate] } : {};
      const whereCondition = {
        gameActiveStatus: 'Active',
        gameDeleteStatus: 'NO',
        
      };

      // Add date condition only if startDate and endDate are provided
      if (Object.keys(dateCondition).length > 0) {
        whereCondition.createdAt = dateCondition;
      }

      return await Games.count({
        where: whereCondition,
      });
    };
   
    const getGameLaunchedCount = async (startDate, endDate) => {
      const dateCondition = startDate && endDate ? { [Op.between]: [startDate, endDate] } : {};
      return await Games.count({
        where: {
          gameActiveStatus: 'Active',
          gameDeleteStatus: 'NO',
          gameGameStage: 'Launched',
          createdAt: dateCondition,
        },
        
      });
    };
    
      const getGameCount1 = async (startDate, endDate) => {
        const dateCondition = startDate && endDate ? { [Op.between]: [startDate, endDate] } : {};
        const whereCondition = {
          gameDeleteStatus: 'NO',
          createdAt: dateCondition,
        };
  
  
        return await Games.count({
          where: whereCondition,
        });
      };
    
   
    const totalGameCount = await getGameCount();
    const yearGameCount = await getGameCount(moment().startOf('year'), moment().endOf('year'));
    const monthGameCount = await getGameCount(moment().startOf('month'), moment().endOf('month'));
    const weekGameCount = await getGameCount(moment().subtract(7, 'days').startOf('day'), moment().endOf('day'));
    const dailyGameCount = await getGameCount(moment().startOf('day'), moment().endOf('day'));

    const weekGameCounts = [];
    const currentday = moment().startOf('day');

    for (let day = 0; day < 6; day++) {
      const startOfday = moment(currentday).subtract(day, 'day').startOf('day');
      const endOfday = moment(startOfday).endOf('day');
      const weekGameCount1 = await getGameCount1(startOfday, endOfday);
      const weekGameLaunchedCount = await getGameLaunchedCount(startOfday, endOfday);

      weekGameCounts.push({
        day: startOfday.format('YYYY-MM-DD'),
        totalgamecount: weekGameCount1,
        totalgamelaunchcount: weekGameLaunchedCount
      });
    }
    if (!totalGameCount) {
      return res.status(404).json({ status: 'Failure', message: 'Bad request', err: 'Game count not available' });
    }

    const monthlyGameCounts = [];
    const monthlyGameLaunchedCounts = [];
    const currentMonth = moment().startOf('month');
    for (let month = 0; month < 6; month++) {
      const startOfMonth = moment(currentMonth).subtract(month, 'months').startOf('month');
      const endOfMonth = moment(startOfMonth).endOf('month');

      const monthGameCount = await getGameCount(startOfMonth, endOfMonth);
      monthlyGameCounts.push({ month: startOfMonth.format('MMMM'), count: monthGameCount });

      const monthGameLaunchedCount = await getGameLaunchedCount(startOfMonth, endOfMonth);
      monthlyGameLaunchedCounts.push({ month: startOfMonth.format('MMMM'), count: monthGameLaunchedCount });
    }

    const data = {
      totalGameCount: totalGameCount,
      yearGameCount: yearGameCount,
      monthGameCount: monthGameCount,
      weekGameCount: weekGameCount,
      dailyGameCount: dailyGameCount,
      monthlyGameCounts: monthlyGameCounts,
      monthlyGameLaunchedCounts: monthlyGameLaunchedCounts,
      weekGameCounts: weekGameCounts,
    };

    return res.status(200).json({ status: 'Success', message: 'Data received successfully!', data });
  } catch (err) {
    return res.status(500).json({ status: 'Failure', message: 'Oops! Something went wrong', err });
  }
};

module.exports = { noOfCompanys, noOfCreators, noOfLeaners, noOfGames };
