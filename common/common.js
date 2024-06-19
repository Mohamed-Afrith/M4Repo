// common.js
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  const generateRandomNumber = () => {
    return Math.floor(Math.random() * 1000);
  };
  
  const validateEmail = (emailId) =>{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailId);
  };



  module.exports=  {
    capitalize,
    generateRandomNumber,
    validateEmail
  };