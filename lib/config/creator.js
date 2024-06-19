require("dotenv").config();
const creatorMailOptions ={
    "enableMailToSetPassword" : true, 
    "subject" : "Atlantis-Set Creator Account Password",
    "body":"",
    "navLink" : "/auth/setPassword/creator/", //front end view file route 
}


module.exports = {creatorMailOptions};

