require("dotenv").config();
const learnerMailOptions ={
    "enableMailToSetPassword" : true, 
    "subject" : "Atlantis-Set Learner Account Password",
    "body":"",
    "navLink" : "/auth/setPassword/learner/", //front end view file route 
}


module.exports = {learnerMailOptions};

