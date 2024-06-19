const express = require('express');
const multer  = require('multer');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Set the destination folder for uploaded files

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

// Define a model for your database table (adjust according to your table structure)
const Image = sequelize.define('image', {
  path: {
    type: DataTypes.STRING
  }
});

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path; // The path to the uploaded file
    const savedImage = await Image.create({ path: imagePath }); // Save the file path to the database
    res.status(200).json({ message: 'File uploaded and path stored in the database' });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading file' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
