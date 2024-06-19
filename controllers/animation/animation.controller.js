const animation = require("../../models/animation");
// const multer = require('multer');
const { Sequelize, Op } = require('sequelize');
const Template=require('../../models/templates');

// const createAnimation = async (req, res) => {
//   try {
//     if (!req.body) {
//       return res.status(400).json({ status: "Failure", message: "Bad request" });
//     }

//     const storageConfig = {
//       destination: function (req, file, cb) {
//         let uploadPath = 'uploads/animation/';
//         if (req.body.aniType === 'Background') {
//           uploadPath += 'background/';
//         } else if (req.body.aniType === 'Non-playing Character') {
//           uploadPath += 'nonplayer/';
//         } else if (req.body.aniType === 'Playing Character') {
//           uploadPath += 'player/';
//         } else if (req.body.aniType === 'Badges') {
//           uploadPath += 'badges/';
//         }
//         cb(null, uploadPath);
//       },
//       filename: function (req, file, cb) {
//         cb(null, file.originalname); // Use the original name of the file
//       }
//     };

//     const upload = multer({ storage: multer.diskStorage(storageConfig) }).single('file'); // Adjust 'file' to match the field name in your form

//     upload(req, res, async function (err) {
//       if (err) {
//         return res.status(500).json({ status: "Failure", message: "Error uploading file" });
//       }

//       // File has been uploaded successfully, proceed to store its path in the database
//       const uploadedFile = req.file;

//       const animationData = await animation.create({
//         aniCreatedDate: Date.now(),
//         aniDeleteStatus: false,
//         aniIpAdderss: req.connection.remoteAddress,
//         aniUserAgent: req.headers["user-agent"],
//         aniDeviceType: req.device.type,
//         filePath: uploadedFile.path, // Store the path to the file in the database
//         // other animation data from req.body
//         ...req.body
//       });

//       res.status(200).json({
//         status: "Success",
//         message: "Data Stored into the DataBase",
//         data: animationData,
//       });
//     });

//   } catch (err) {
//     res.status(500).json({
//       status: "Failure",
//       message: "Oops! Something went wrong",
//       err: err,
//     });
//   }
// };

//  edit route
const updateAnimation = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const record = await animation.findByPk(id);
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

// Examanie delete route
const reomveAnimation = async (req, res) => {
  try {
    const id = req.params.id;
    const data = { aniDeleteStatus: "YES" }; // Define the data to update aniDeleteStatus
    const record = await animation.findByPk(id);
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


const LmsAnimationType = require("../../models/animationType");
const LmsGameAssets = require("../../models/gameAsset");

const getAnimationList = async (req, res) => {
  try {
    const { count, rows: allData } = await animation.findAndCountAll({
      where: {
        [Op.and]: [
          {
            aniDeleteStatus: {
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

const getOneAnimation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ status:'Failure',message:'Bad Request'});
    }

    // Fetch data for the specific item based on the provided ID
    const specificData = await animation.findByPk(id);

    if (!specificData) {
      return res.status(404).json({ error: "Record not found" });
    }

    res
      .status(200)
      .json({ status:'Success',message: "Data Retrieved Successfully", data: specificData });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", err: error });
  }
};
// , , , , , ,,,,

const getNonplayer = async (req, res) => {
  try {
    let {count,rows:data} = await LmsGameAssets.findAndCountAll({attributes:['gasId','gasAssetImage','gasAssetName'],
    where: {
      [Op.and]: [
        {
          gasDeleteStatus: {
            [Op.or]: {
              [Op.not]: "Yes",
              [Op.is]: null,
            },
          },
          gasAssetType:2,
          gasStatus:'Active'
        },
      ],
    },
  });
  
      if (count === 0) {
        return res.status(404).json({ status:'Failure', message: "No records found" });
      }
      for(let x in data)
      {
       data[x].gasAssetImage = `${req.protocol}://${req.get('host')}${data[x].gasAssetImage}`
      }
      res.status(200).json({ status:'Success',
        message: "All Data Retrieved Successfully",
        data: data,
        count: count,
      });
    } catch (error) {
      res.status(500).json({status:'Failure', message: "Internal Server Error", err: error });
    }
};

const getPlayer = async (req, res) => {
    try {
        const { count, rows: allData } = await animation.findAndCountAll({
          where: {
            [Op.and]: [
              {
                aniDeleteStatus: {
                  [Op.or]: {
                    [Op.not]: "Yes",
                    [Op.is]: null,
                  },
                },
                aniType:'aniaying Character',
                aniStatus:'Active'
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
const getBackground = async (req, res) => {
      try {
        const id = req.params.id;
          let {count,rows:data} = await LmsGameAssets.findAndCountAll({attributes:['gasId','gasAssetImage','gasAssetName'],
          include: [
            {
              model: Template,
              as: 'temp',
              attributes: [
                'tempTitle','tempStoryLine'
              ],
              required: false,
            }
          ],
            where: {
              [Op.and]: [
                {
                  gasDeleteStatus: {
                    [Op.or]: {
                      [Op.not]: "Yes",
                      [Op.is]: null,
                    },
                  },
                  gasAssetType:`${id}`,
                  gasStatus:'Active'
                },
              ],
            },
          });
        
          if (count === 0) {
            return res.status(404).json({ status:'Failure', message: "No records found" });
          }
          for(let x in data)
          {
           data[x].gasAssetImage = `${req.protocol}://${req.get('host')}/${data[x].gasAssetImage}`
          }
           res.status(200).json({ status:'Success',
            message: "All Data Retrieved Successfully",
            data: data,
            count: count,
           
          });
        } catch (error) {
          res.status(500).json({status:'Failure', message: "Internal Server Error", err: error });
        }
  };
const getBadges = async (req, res) => {
    try {
        const { count, rows: allData } = await animation.findAndCountAll({
          where: {
            [Op.and]: [
              {
                aniDeleteStatus: {
                  [Op.or]: {
                    [Op.not]: "Yes",
                    [Op.is]: null,
                  },
                },
                aniType:'Badges',
                aniStatus:'Active'
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

module.exports = { updateAnimation, reomveAnimation, getOneAnimation, getAnimationList,getNonplayer,getPlayer,getBackground,getBadges};
