const LmsCategory = require("../../models/category");
const LmsGame = require("../../models/game");
const LmsCreatorSkills = require("../../models/skills");


const createSkills = async (req,res) =>{
    try{
         const id = req.params.id;
         const skills = req.body;
        if (!skills  && !id) return res.status(400).json({ status: "Failure", message: "Bad request" });
        const user = req.user.user;
        for(let x in skills)
        {
          skills[x].crSkillName=skills[x].name; 
          skills[x].crIpAddress = req.connection.remoteAddress;
          skills[x].crUserAgent = req.headers["user-agent"];
          skills[x].crDeviceType = req.device.type;
          skills[x].crCreatedDate = Date.now(); 
          skills[x].crDeleteStatus = 'NO' ;
          skills[x].crSkillStatus = 'Active' ;
          skills[x].crDefaultStatus = skills[x].crDefaultStatus || 'NO';
          if(user?.role === 'Creator')
          {
            skills[x].crCreatedCreatorId = user?.id;
          }         
          else {
             skills[x].crCreatedAdminId = user?.id;
          }
        }
        const data = await LmsCreatorSkills.bulkCreate(skills);
        let ids=[];
        for(let d in data)
        {
           ids.push(data[d].crSkillId)
        }
        let skill = JSON.stringify(ids);
        const upd = await LmsGame.findByPk(id);
        if (!upd) return res.status(404).json({ status: "Failure", message: "Game not found" });
        await upd.update({gameSkills:skill});       
        return res.status(200).json({ status: "Success", message: "Created Successfully",data:ids});
    }
    catch (err) {
        res.status(500).json({ status: 'Failure', message: 'Internal server error', error: err.message });
    }
}
const createCategory = async (req,res) =>{
    try{
        const id = req.params.id;
         const category = req.body;
        if (!category && !id) return res.status(400).json({ status: "Failure", message: "Bad request" });
        const user = req.user.user;
        for(let x in category)
        {
          category[x].catName= category[x].name;
          category[x].catIpAddress = req.connection.remoteAddress;
          category[x].catUserAgent = req.headers["user-agent"];
          category[x].catDeviceType = req.device.type;
          category[x].catCreatedDate = Date.now(); 
          category[x].catDeleteStatus = 'NO' ;
          category[x].catStatus = 'Active' ;
          category[x].ctCreatedUserId = user?.id;
        }
        const data = await LmsCategory.bulkCreate(category);
        let ids=[];
        for(let d in data)
        {
           ids.push(data[d].catId)
        }
        let cats = JSON.stringify(ids); 
        const upd = await LmsGame.findByPk(id);
        if (!upd) return res.status(404).json({ status: "Failure", message: "Game not found" });
        await upd.update({gameCategoryId:cats});
        return res.status(200).json({ status: "Success", message: "Created Successfully",data:ids});
    }
    catch (err) {
        res.status(500).json({ status: 'Failure', message: 'Internal server error', error: err.message });
    }
}
const getSkills = async (req,res) => {
    try{
        const data = await LmsCreatorSkills.findAll({attributes:[['crSkillName','name'],['crSkillId','id']],where:{crDeleteStatus:'NO',crSkillStatus:'Active'}});
        if (data?.length === 0) return res.status(400).json({ status: "Failure", message: "Bad request" });
        return res.status(200).json({ status: "Success", message: "Created Successfully",data:data});
    }
    catch (err) {
        res.status(500).json({ status: 'Failure', message: 'Internal server error', error: err.message });
    }
}
const getSkillsS = async (req,res) => {
    try{
        const data = await LmsCreatorSkills.findAll({attributes:[['crSkillName','name'],['crSkillId','id']],where:{crDefaultStatus:'YES',crDeleteStatus:'NO',crSkillStatus:'Active'}});
        if (data?.length === 0) return res.status(400).json({ status: "Failure", message: "Bad request" });
        return res.status(200).json({ status: "Success", message: "Created Successfully",data:data});
    }
    catch (err) {
        res.status(500).json({ status: 'Failure', message: 'Internal server error', error: err.message });
    }
}

module.exports = { createSkills,getSkills,createCategory};