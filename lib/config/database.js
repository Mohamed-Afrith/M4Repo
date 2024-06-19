// const Sequelize = require("sequelize");
// require("dotenv").config();
// const sequelize = new Sequelize(
//   'lms',
//   'root',
//   'atlantis#587',
//   {
//     host:'0.0.0.0',
//     dialect: 'mysql'
//   }
// );
// sequelize
// .authenticate()
// .then(() => {
//   console.log('Connection has been established successfully.');
// })
//  .catch(err => {
//  console.error('Unable to connect to the database:', err);
// });

// module.exports = sequelize;

const Sequelize = require("sequelize");
require("dotenv").config();
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD || "",
  {
    host:process.env.HOST,
    dialect: process.env.DIALECT,
    logging: false,
  }
);
sequelize
.authenticate()
.then(() => {
  console.log('Connection has been established successfully.');
})
 .catch(err => {
 console.error('Unable to connect to the database:', err);
});

module.exports = sequelize;
