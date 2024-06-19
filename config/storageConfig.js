const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storageLocations = {
  background: "uploads/background/",
  badges: "uploads/badges/",
  nonPlayer: "uploads/nonPlayer/",
  player: "uploads/player/",
  poses: "uploads/poses/",
  Welcome: "uploads/Welcome/",
  Reflection: "uploads/Reflection/",
  audios:'uploads/audios/'
};


const fileFilters = {
  imageFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Please upload an image file"));
    }
    cb(null, true);
  },
  audioFilter :(req, file, cb) => {
    if (!file.originalname.match(/\.(mp3)$/)) {
      return cb(new Error("Please upload an MP3 audio file"));
    }
    cb(null, true);
  },
};

const fileLimits = {
  background: { size: 1024 * 1024 * 10, maxNoOfFiles: 1 },
  badges: { size: 1024 * 1024 * 10, maxNoOfFiles: 1 },
  nonPlayer: { size: 1024 * 1024 * 10, maxNoOfFiles: 1 },
  player: { size: 1024 * 1024 * 10, maxNoOfFiles: 1 },
  game: { size: 1024 * 1024 * 10, maxNoOfFiles: 10 },
  default: { size: 1024 * 1024 * 5, maxNoOfFiles: 1 }, 
};


const uploadSettings = (location, filter, fileFieldName,folder) => {
  const fileLimit = fileLimits[location] || fileLimits.default;
  const isMultiple = fileLimit.maxNoOfFiles > 1;
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const location = folder;
      fs.access(location, (err) => {
        if (err) {
          fs.mkdir(location, { recursive: true }, (error) => {
            if (error) {
              console.error("Error creating directory:", error);
              cb(error, null);
            } else {
              cb(null, location);
            }
          });
        } else {
          cb(null, location);
        }
      });
    },
    filename: function (req, file, cb) {
      const originalname = file.originalname;
      const extension = originalname.split(".").pop();
      const filenameWithoutExtension = originalname.slice(
        0,
        -(extension.length + 1)
      );
      const timestamp = Date.now();
      const newFilename = `${filenameWithoutExtension}_${timestamp}.${extension}`;
      cb(null, newFilename);
    },
  });

  const upload = multer({
    storage,
    fileFilter: filter,
    limits: {
      fileSize: fileLimit.size,
      files: isMultiple ? fileLimit.maxNoOfFiles : 1,
    },
  });

  return isMultiple
    ? upload.array(fileFieldName, fileLimit.maxNoOfFiles)
    : upload.single(fileFieldName);
};

module.exports = { storageLocations, fileFilters, uploadSettings };
