const Joi = require('joi');

const adminRegisterSchema = Joi.object({
    sdnNme: Joi.string().min(3).max(30).alphanum() .regex(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{4,20}$/).required(),
    sdMailId: Joi.string().email().required(),
    sdPassword: Joi.string().min(8).max(20).regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/).required(),
    sdStatus: Joi.string().valid('Active', 'Inactive').required(),
});
const adminLoginSchema = Joi.object({
    email: Joi.string().email().required(), 
    password: Joi.string().min(8).max(20).regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/).required(),
});
module.exports = { adminRegisterSchema, adminLoginSchema };

